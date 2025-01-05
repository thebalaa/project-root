import os
from dotenv import load_dotenv

# Load environment variables from a .env file in the project root
load_dotenv()

API_KEY = os.getenv("API_KEY", "")
os.environ["OPENAI_API_KEY"] = API_KEY  # crawl4ai needs this

# DeepSeek's OpenAI-compatible endpoint
DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"

# You could include other config items here as well 