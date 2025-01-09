from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Bot Communication Layer"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Bot Configuration
    BOT_API_URL: str = os.getenv("BOT_API_URL", "http://localhost:3000")
    BOT_API_KEY: str = os.getenv("BOT_API_KEY")
    
    # Web Service Configuration
    WEB_SERVICE_URL: str = os.getenv("WEB_SERVICE_URL", "http://localhost:8000")
    WEB_SERVICE_API_KEY: Optional[str] = os.getenv("WEB_SERVICE_API_KEY")
    
    # Message Broker Configuration
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    class Config:
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings() 