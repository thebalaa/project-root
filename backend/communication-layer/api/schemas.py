from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum

class MessageType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    SYSTEM = "system"

class Message(BaseModel):
    id: str = Field(..., description="Unique message identifier")
    type: MessageType
    content: str
    metadata: Optional[dict] = Field(default=None, description="Additional message metadata")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    sender_id: str
    recipient_id: Optional[str] = None

class BotRequest(BaseModel):
    message: str
    user_id: str
    context: Optional[dict] = None
    
class BotResponse(BaseModel):
    message: str
    status: str
    data: Optional[Any] = None
    error: Optional[str] = None

class WebhookEvent(BaseModel):
    event_type: str
    payload: dict
    timestamp: datetime = Field(default_factory=datetime.utcnow) 