import os
import yaml
from typing import Dict, Any
from .logger import get_logger

logger = get_logger(__name__)

class ConfigManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConfigManager, cls).__new__(cls)
            cls._instance._config = {}
            cls._instance._init_config()
        return cls._instance

    def _init_config(self):
        """
        Loads configuration from the three main config files in ai-ml/config:
          - config.yaml
          - ai_config.yaml
          - dkg_config.yaml
        Then merges them into a single dictionary. Environment variables can override what’s in these configs.
        """
        base_path = os.path.dirname(os.path.abspath(__file__))
        config_files = [
            os.path.join(base_path, "../../config/config.yaml"),
            os.path.join(base_path, "../../config/ai_config.yaml"),
            os.path.join(base_path, "../../config/dkg_config.yaml"),
        ]

        merged_config = {}
        for cf in config_files:
            if os.path.exists(cf):
                with open(cf, "r", encoding="utf-8") as f:
                    file_config = yaml.safe_load(f) or {}
                    merged_config = {**merged_config, **file_config}

        # Optionally load environment variables to override certain fields
        # e.g., if you want to override keys in merged_config with environment variables
        # We'll just do a few examples:
        # merged_config["server"]["port"] = int(os.getenv("AI_ML_SERVICE_PORT", merged_config["server"]["port"]))
        
        self._config = merged_config
        logger.info(f"Configuration loaded and merged successfully.\nMerged config: {self._config}")

    @property
    def config(self) -> Dict[str, Any]:
        return self._config 