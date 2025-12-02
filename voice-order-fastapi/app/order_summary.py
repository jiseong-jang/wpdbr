from __future__ import annotations

from typing import Iterable

from app.context import _load_all_catalog_data
from app.schemas import ChatMessage, OrderSummary


SUMMARY_KEYS = [
    "customerName",
    "customerAddress",
    "menuName",
    "menuStyle",
    "menuItems",
    "deliveryTime",
    "quantity",
    "couponCode",
    "useCoupon",
]


def _normalize_menu_key(value: str) -> str:
    if not value:
        return ""
    return " ".join(value.strip().split()).casefold()


def _extract_menu_key(entry: dict[str, str], candidate_fields: Iterable[str]) -> str:
    for field in candidate_fields:
        raw_value = entry.get(field)
        if raw_value:
            key = _normalize_menu_key(raw_value)
            if key:
                return key
    return ""


def _build_menu_item_guide() -> str:
    """Build menu item guide dynamically from catalog data."""
    catalog = _load_all_catalog_data()

    # Group menu items by normalized menu identifier (name or ID)
    menu_components = {}
    for item in catalog.menu_items:
        menu_key = _extract_menu_key(item, ("menu_id", "menu_name", "menu"))
        item_name = item.get("item_name", "").strip()

        # Skip non-food items (decorations, napkins, etc.) - only track items with prices
        if not item.get("unit_price"):
            continue

        if not menu_key:
            continue

        if menu_key not in menu_components:
            menu_components[menu_key] = []
        menu_components[menu_key].append(item_name)

    # Build guide text for each menu
    guide_lines = ["For the menuItems line, describe final quantities per component using comma-separated `항목=수량` pairs. Reflect any changes the customer requested. Use these component sets:"]

    for menu in catalog.menus:
        menu_key = _extract_menu_key(menu, ("menu_id", "name"))
        menu_name = menu.get("name", "").strip()

        if menu_key and menu_key in menu_components:
            components = ", ".join(menu_components[menu_key])
            guide_lines.append(f"- {menu_name}: {components}")

    guide_lines.append("If multiple 세트가 함께 주문되면 각 세트에 맞는 항목을 모두 포함하고, 언급되지 않은 항목은 `항목=미확인`으로 남기세요.")

    return "\n".join(guide_lines)


def _build_style_guide() -> str:
    """Provide available style names to encourage consistent menuStyle output."""
    catalog = _load_all_catalog_data()
    lines = ["Use one of these 서빙 스타일 이름(또는 null) for menuStyle:"]
    for style in catalog.styles:
        name = style.get("name", "").strip()
        if not name:
            continue
        description = style.get("description", "").strip() or "설명 없음"
        lines.append(f"- {name}: {description}")
    return "\n".join(lines)


def build_summary_prompt(history: Iterable[ChatMessage], final_message: str, assumed_date: str) -> list[dict]:
    conversation_lines = [
        f"{msg.role.upper()}: {msg.content}"
        for msg in history
    ]
    history_block = "\n".join(conversation_lines)
    menu_guide = _build_menu_item_guide()
    style_guide = _build_style_guide()

    prompt = [
        {
            "role": "system",
            "content": "\n".join(
                [
                    "You are an expert maître d' that produces structured order snapshots for Mr. Daebak Dinner.",
                    "Return plain text with exactly the following nine lines:",
                    "customerName = <value or null>",
                    "customerAddress = <value or null>",
                    "menuName = <value or null>",
                    "menuStyle = <value or null>",
                    "menuItems = <comma separated list of item=quantity>",
                    "deliveryTime = <ISO 8601 datetime or null>",
                    "quantity = <integer number or null>",
                    "couponCode = <coupon code or coupon name mentioned by customer or null>",
                    "useCoupon = <true or false or null>",
                    f"Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss) for deliveryTime. Assume today is {assumed_date} and normalize any inferred delivery date to that day unless the customer explicitly requested another date.",
                    "For quantity: extract the number of menu sets ordered (e.g., '2개' or 'two' means quantity = 2). If not mentioned, use null.",
                    "For couponCode: extract the coupon code or name if the customer mentioned using a coupon (e.g., 'REGULAR10000', '단골 쿠폰', '쿠폰 사용'). If no coupon mentioned, use null.",
                    "For useCoupon: set to true if customer mentioned using a coupon, false if they explicitly said not to use one, null if not mentioned.",
                    "For deliveryTime: if customer mentioned a specific future date/time for delivery, set it here. If they want immediate delivery or didn't specify, use null.",
                    'Do not add extra lines or commentary. Use "null" (without quotes) for missing information. Use "true" or "false" (lowercase, without quotes) for boolean values.',
                    "When the conversation was in Korean, keep the values in Korean; otherwise mirror the customer language.",
                        menu_guide,
                        style_guide,
                ]
            ),
        },
        {
            "role": "user",
            "content": "\n".join(
                [
                    "다음은 고객과의 최종 주문 대화 내용입니다.",
                    "",
                    history_block,
                    "",
                    "최종 안내 메시지:",
                    final_message or "",
                    "",
                    "위 내용을 기준으로 주문 요약을 출력하세요.",
                ]
            ),
        },
    ]
    return prompt


def parse_summary_text(raw_text: str) -> OrderSummary:
    if not isinstance(raw_text, str) or not raw_text.strip():
        raise ValueError("요약 결과가 비어있습니다.")

    values: dict[str, str | int | bool | None] = {key: None for key in SUMMARY_KEYS}

    for line in raw_text.splitlines():
        line = line.strip()
        if not line or "=" not in line:
            continue
        key, raw_value = line.split("=", 1)
        key = key.strip()
        raw_value = raw_value.strip()
        if key not in values:
            continue
        if raw_value.lower() in {"null", "-", "none", ""}:
            values[key] = None
        elif key == "quantity":
            # 정수로 변환 시도
            try:
                values[key] = int(raw_value)
            except ValueError:
                values[key] = None
        elif key == "useCoupon":
            # 불린으로 변환
            if raw_value.lower() == "true":
                values[key] = True
            elif raw_value.lower() == "false":
                values[key] = False
            else:
                values[key] = None
        else:
            values[key] = raw_value

    return OrderSummary(**values)
