from typing import Optional, Dict, Any
import httpx
from ..core.config import get_settings
from ..api.schemas import BotRequest, BotResponse
from ..core.exceptions import BotServiceError

class BotService:
    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.BOT_API_URL
        self.api_key = self.settings.BOT_API_KEY
        
    async def send_message(self, request: BotRequest) -> BotResponse:
        """Send message to Discord bot and get response"""
        headers = {
            "Authorization": f"Bot {self.api_key}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/discord/chat",
                    json=request.model_dump(),
                    headers=headers
                )
                response.raise_for_status()
                return BotResponse(**response.json())
            except httpx.HTTPError as e:
                raise BotServiceError(f"Discord bot service error: {str(e)}")
                
    async def get_bot_status(self) -> Dict[str, Any]:
        """Get bot service status"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/status",
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise BotServiceError(f"Failed to get bot status: {str(e)}") 