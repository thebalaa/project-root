import aioredis
import json
from typing import Any, Optional, List
from ..core.config import get_settings
from ..api.schemas import Message
from datetime import datetime

class MessageBroker:
    def __init__(self):
        self.settings = get_settings()
        self.redis: Optional[aioredis.Redis] = None
        
    async def connect(self) -> None:
        """Initialize Redis connection"""
        if not self.redis:
            self.redis = await aioredis.from_url(self.settings.REDIS_URL)
            
    async def disconnect(self) -> None:
        """Close Redis connection"""
        if self.redis:
            await self.redis.close()
            
    async def publish_message(self, channel: str, message: Message) -> bool:
        """Publish message to a specific channel"""
        try:
            await self.connect()
            message_data = message.model_dump_json()
            await self.redis.publish(channel, message_data)
            # Store message in history
            await self.store_message_history(channel, message)
            return True
        except Exception as e:
            print(f"Error publishing message: {e}")
            return False
            
    async def store_message_history(self, channel: str, message: Message) -> None:
        """Store message in channel history"""
        history_key = f"history:{channel}"
        message_data = {
            **message.model_dump(),
            "timestamp": message.timestamp.isoformat()
        }
        await self.redis.lpush(history_key, json.dumps(message_data))
        # Keep only last 100 messages
        await self.redis.ltrim(history_key, 0, 99)
        
    async def get_message_history(self, channel: str, limit: int = 50) -> List[Message]:
        """Retrieve message history for a channel"""
        history_key = f"history:{channel}"
        messages = await self.redis.lrange(history_key, 0, limit - 1)
        return [
            Message(**json.loads(msg))
            for msg in messages
        ] 