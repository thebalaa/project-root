from fastapi import APIRouter, Depends, HTTPException, WebSocket
from typing import List
from ..services.bot_service import BotService
from ..services.message_broker import MessageBroker
from .schemas import Message, BotRequest, BotResponse, WebhookEvent
from ..core.security import verify_api_key

router = APIRouter()
message_broker = MessageBroker()

@router.post("/messages/", response_model=BotResponse)
async def send_message(
    request: BotRequest,
    bot_service: BotService = Depends(),
    api_key: str = Depends(verify_api_key)
):
    """Send message to bot and get response"""
    try:
        response = await bot_service.send_message(request)
        
        # Create and publish message to broker
        message = Message(
            id=response.id,
            type="text",
            content=response.message,
            sender_id="bot",
            recipient_id=request.user_id
        )
        await message_broker.publish_message("bot_messages", message)
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time communication"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            # Process incoming WebSocket messages
            response = await bot_service.send_message(BotRequest(**data))
            await websocket.send_json(response.model_dump())
    except Exception as e:
        await websocket.close(code=1000)

@router.get("/messages/{channel}", response_model=List[Message])
async def get_message_history(
    channel: str,
    limit: int = 50,
    api_key: str = Depends(verify_api_key)
):
    """Get message history for a channel"""
    return await message_broker.get_message_history(channel, limit)

@router.post("/webhook", response_model=WebhookEvent)
async def webhook_handler(
    event: WebhookEvent,
    api_key: str = Depends(verify_api_key)
):
    """Handle incoming webhooks"""
    # Process webhook event
    await message_broker.publish_message("webhooks", event)
    return event 