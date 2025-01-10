import os
from dotenv import load_dotenv
import pathlib
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Debug: Print current working directory
logger.debug(f"Current working directory: {os.getcwd()}")

# Debug: Check if .env file exists
env_path = "companion_app/.env"
print(f"DEBUG: .env file exists at {env_path}? {pathlib.Path(env_path).exists()}")

load_dotenv(dotenv_path=env_path)

# Switch to OpenAI key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

print(f"DEBUG: OpenAI key found? {repr(OPENAI_API_KEY)}") 
# Optionally, define a BASE_URL if you want, but for most OpenAI usage,
# you can rely on the default endpoint. For example:
# OPENAI_BASE_URL = "https://api.openai.com"  # Typically default

# You can include other config items below as well 

# Debug: Print all environment variables (be careful with sensitive data)
print("DEBUG: All environment variables:")
for key in ["OPENAI_API_KEY", "PATH", "PWD"]:
    print(f"  {key}: {'[exists]' if os.getenv(key) else '[missing]'}") 