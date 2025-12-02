from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field("user", pattern="^(system|user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    message: str
    orderConfirmed: bool = False
    orderId: Optional[str] = None
    order: Optional[OrderSummary] = None


class OrderConfirmRequest(BaseModel):
    history: List[ChatMessage]
    finalMessage: Optional[str] = None


class OrderChangeRequest(OrderConfirmRequest):
    orderId: str


class OrderSummary(BaseModel):
    customerName: Optional[str] = None
    customerAddress: Optional[str] = None
    menuName: Optional[str] = None
    menuStyle: Optional[str] = None
    menuItems: Optional[str] = None
    deliveryTime: Optional[str] = None
    orderId: Optional[str] = None
    orderTime: Optional[str] = None
    quantity: Optional[int] = None
    couponCode: Optional[str] = None
    useCoupon: Optional[bool] = None


class OrderConfirmResponse(BaseModel):
    orderId: str
    confirmedAt: str
    order: OrderSummary
