from __future__ import annotations

import csv
from collections import OrderedDict, defaultdict
from functools import lru_cache
from pathlib import Path
from typing import Iterable, List, Dict, NamedTuple

from app.config import settings, APP_DIR


BASE_SYSTEM_PROMPT = f"""당신은 "Mr.Daeback 디너"의 전담 책임자이자 주문 챗봇입니다. 고객 언어를 즉시 감지해 같은 언어로만 응답하고, 고객이 다시 전환하기 전까지는 언어를 임의로 바꾸지 마세요. 오늘 날짜는 {settings.VOICE_ORDER_ASSUMED_DELIVERY_DATE}로 간주하고, 상대 날짜 표현을 모두 이 날짜 기준의 실제 달력 날짜·시간으로 적으세요.

[대화 시작 예시]
- 시스템: 안녕하세요, {{이름}} 고객님, 어떤 디너를 주문하시겠습니까?
- 고객: 맛있는 디너 추천해 주세요.
- 시스템: 혹시 어떤 기념일이거나 특별한 이유가 있으실까요?

[핵심 역할]
- 고객은 웹/앱(음성 포함)에서 디너 세트를 예약하며, 당신은 필요한 정보를 수집하고 주문을 완성합니다.
- 메뉴는 고정된 구성품을 기반으로 제공되고 음식·주류·커피는 수량 조정이나 추가/삭제가 가능하지만, 접시·냅킨·장식 등 비식품 항목은 변경할 수 없음을 분명히 알립니다.

[대화 진행 체크리스트]
1. 첫 인사에서는 반드시 고객 이름을 부르고, 기념일/목적을 확인한 뒤에 다른 질문으로 넘어갑니다. 이후에도 한 번의 질문에서는 한 가지 주제(예: 메뉴 추천, 스타일 비교, 일정 확인 등)만 묻습니다. 메뉴를 소개할 때는 **각 후보를 구분된 bullet**으로 나열하고 구성품·분위기를 1문장으로 소개합니다. 고객이 기념일/특별한 이유를 언급하면 그 분위기에 어울리는 메뉴 2개를 먼저 추천한 뒤, 필요하면 추가 질문을 이어갑니다.
2. 메뉴가 정해진 뒤에야 서빙 스타일(심플/그랜드/디럭스)을 각 1문장으로 설명하고, 이때도 스타일 선택과 다른 주제를 섞지 말고 순서대로 확정합니다.
3. 고객 요청에 따라 구성/수량을 조정하되 음식·음료만 변경 가능함을 안내합니다.
   - 음식·음료 수량을 늘려 달라는 요청이 오면 기존 메뉴를 삭제하거나 다른 항목을 줄이도록 강요하지 말고, 요청한 수량만큼 그대로 반영합니다.
4. 배달 날짜와 시간을 반드시 확인합니다. “내일/모레” 같은 상대 날짜를 들으면 실제 달력 날짜·시간으로 변환해 기록하세요.
5. 메뉴·스타일·변경사항·배달 일정·추가 요청 여부를 다시 읽어 준 뒤 “이대로 진행해도 될까요?”라고 확인받고, 동의 후에만 마무리 멘트와 토큰을 사용합니다.

[언어·정보·설명 규칙]
- 고객이 먼저 묻기 전까지 가격을 언급하지 말고, 안내 전 계산을 다시 검증하세요.
- 존재하지 않는 메뉴/스타일이 요청되면 준비되어 있지 않음을 먼저 알리고, 철자나 분위기가 유사한 실제 옵션 1~2가지를 추천합니다. 추천 근거는 데이터(구성품, 인분, 가격 등)에서만 가져오며 임의의 추가 문구를 덧붙이지 마세요.
- 비슷한 이름을 제안할 때도 원래 요청과 다른 메뉴임을 상기시키고, 설명에는 실제 데이터에 있는 항목만 사용합니다.
- 메뉴/스타일/구성과 많이 다른 주문(목록에 없는 항목, 임의 조합 등)이 오면 그대로 진행하지 말고 “준비된 메뉴/스타일과 다르니 다시 선택해 달라”고 안내한 뒤, 실제 메뉴 1~2개를 근거(구성품/분위기)와 함께 재제안하세요.

[주문 확정 규칙]
- 메뉴, 스타일, 배달 날짜·시간, 변경사항, 추가 요청 여부가 모두 확인된 경우에만 주문을 확정합니다.
- 최종 확정 메시지에는 고객이 확인한 일정과 선택 사항을 다시 명시하고, “해당 일정으로 준비하겠습니다”와 함께 <<CONFIRM_ORDER>>를 붙입니다. 이때 상대 표현(“내일”, “모레” 등)은 사용하지 말고, 내부 기준 날짜를 기준으로 계산한 실제 달력 날짜·시간을 명확히 적어 주세요. 토큰은 마지막 메시지에서 단 한 번만 사용하며 뒤에 문장을 이어 쓰지 않습니다.
- 필요한 정보가 빠져 있으면 토큰을 사용하지 말고 추가 질문을 하세요.

아래에는 미스터 대박의 메뉴·스타일·가격 정보가 이어집니다. 가격은 고객이 명시적으로 요청할 때만 공유하고, 안내 전 다시 검증하세요."""



class CatalogData(NamedTuple):
    """Holds all parsed catalog CSV data."""
    menus: List[Dict[str, str]]
    menu_items: List[Dict[str, str]]
    styles: List[Dict[str, str]]


def _data_dir() -> Path:
    override_dir = getattr(settings, "VOICE_ORDER_MENU_DATA_DIR", None)
    if override_dir:
        return Path(override_dir).expanduser().resolve()
    return (APP_DIR / "data").resolve()


def _parse_catalog_csv(path: Path) -> List[Dict[str, str]]:
    """Parse CSV file with error handling and validation."""
    if not path.exists():
        return []

    try:
        with path.open(encoding="utf-8") as fp:
            reader = csv.DictReader(fp)
            return [
                {key: (value or "").strip() for key, value in row.items()}
                for row in reader
                if any((value or "").strip() for value in row.values())
            ]
    except (csv.Error, UnicodeDecodeError, IOError) as e:
        # Log the error but return empty list to allow system to continue
        print(f"Warning: Failed to parse CSV {path}: {e}")
        return []


def _normalize_menu_key(value: str) -> str:
    """Normalize menu identifiers so names/IDs can be matched flexibly."""
    if not value:
        return ""
    return " ".join(value.strip().split()).casefold()


def _extract_menu_key(entry: Dict[str, str], candidate_fields: Iterable[str]) -> str:
    """Return a normalized key from the first non-empty field in candidate_fields."""
    for field in candidate_fields:
        raw_value = entry.get(field)
        if raw_value:
            key = _normalize_menu_key(raw_value)
            if key:
                return key
    return ""


@lru_cache()
def _load_all_catalog_data() -> CatalogData:
    """Load all catalog CSV files once and cache the result."""
    data_dir = _data_dir()
    return CatalogData(
        menus=_parse_catalog_csv(data_dir / "menus.csv"),
        menu_items=_parse_catalog_csv(data_dir / "menu_items.csv"),
        styles=_parse_catalog_csv(data_dir / "styles.csv")
    )


def _format_structured_catalog(
    menus: Iterable[Dict[str, str]],
    menu_items: Iterable[Dict[str, str]],
    styles: Iterable[Dict[str, str]],
) -> str:
    # menus.csv now uses the menu 이름 as the primary key, so we normalize by name.
    components: Dict[str, List[Dict[str, str]]] = defaultdict(list)
    item_catalog: OrderedDict[str, Dict[str, str]] = OrderedDict()

    for item in menu_items:
        menu_name = (item.get("menu_name") or item.get("menu") or item.get("menu_id") or "").strip()
        menu_key = _normalize_menu_key(menu_name)
        if menu_key:
            components[menu_key].append(item)

        comp_name = (item.get("item_name") or "").strip()
        key = comp_name.casefold()
        if comp_name and key not in item_catalog:
            item_catalog[key] = item

    menu_lines: List[str] = []
    for menu in menus:
        name = (menu.get("name") or "").strip()
        menu_key = _normalize_menu_key(name)
        servings = menu.get("servings") or ""
        description = menu.get("description") or ""
        servings_info = f" / 기준 {servings}인분" if servings else ""
        description_info = f": {description}" if description else ""
        menu_lines.append(f"- {name}{servings_info}{description_info}")

        for component in components.get(menu_key, []):
            comp_name = component.get("item_name") or ""
            qty = component.get("default_qty") or "1"
            menu_lines.append(f"  · {comp_name} x {qty}")

    if not menu_lines:
        menu_lines.append("- 등록된 메뉴 정보가 없습니다.")

    style_lines: List[str] = []
    for style in styles:
        name = style.get("name") or ""
        description = style.get("description") or ""
        notes = style.get("notes") or ""
        summary = description or "설명 없음"
        notes_info = f" ({notes})" if notes else ""
        style_lines.append(f"- {name}: {summary}{notes_info}")

    if not style_lines:
        style_lines.append("- 등록된 스타일 정보가 없습니다.")

    item_price_lines: List[str] = []
    for item in item_catalog.values():
        unit_price = item.get("unit_price") or ""
        if not unit_price:
            continue
        item_name = item.get("item_name") or ""
        item_price_lines.append(f"- {item_name}: {unit_price}원")

    if not item_price_lines:
        item_price_lines.append("- 단품 가격 정보가 없습니다.")

    menu_section = "\n".join(menu_lines)
    style_section = "\n".join(style_lines)
    item_section = "\n".join(item_price_lines)

    return (
        f"\n\n[메뉴 목록]\n{menu_section}\n\n"
        f"[서빙 스타일]\n{style_section}\n\n"
        f"[단품 가격]\n{item_section}\n\n"
        "가격은 고객이 요청할 때만 전달하고, 계산 시 신중하게 검증하세요."
    )


@lru_cache()
def get_system_prompt() -> str:
    """Get system prompt with all catalog data loaded once and cached."""
    catalog = _load_all_catalog_data()
    formatted = _format_structured_catalog(catalog.menus, catalog.menu_items, catalog.styles)
    return BASE_SYSTEM_PROMPT + formatted
