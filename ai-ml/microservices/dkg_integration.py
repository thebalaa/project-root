# microservices/dkg_integration.py
import requests
import yaml
import os
from .utils.logger import get_logger

logger = get_logger(__name__)

class DKGIntegration:
    """
    Integrates with the DKG node to fetch or store minimal references to data.
    Typically, data is off-chain, but references/hashes might be stored on-chain.
    """

    def __init__(self, config_path:str = "config/dkg_config.yaml"):
        self.config = self.load_config(config_path)
        self.endpoint = self.config["dkg_node"]["endpoint"]
        self.auth_token = self.config["dkg_node"]["auth_token"]
        self.ipfs_host = self.config["ipfs"]["host"]

    def load_config(self, config_path):
        if not os.path.isfile(config_path):
            raise FileNotFoundError(f"Config file not found: {config_path}")
        with open(config_path, "r") as f:
            data = yaml.safe_load(f)
        return data

    def get_relevant_data(self, context_keys: list) -> dict:
        """
        For each item in context_keys, fetch the relevant data from the DKG or IPFS.
        Return a combined dictionary of content or references.
        """
        if not context_keys:
            return {}
        logger.debug(f"Fetching context from DKG for keys: {context_keys}")
        aggregated_data = {}
        for key in context_keys:
            # Minimal example: fetch data from a hypothetical DKG REST endpoint
            url = f"{self.endpoint}/records/{key}"
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            try:
                resp = requests.get(url, headers=headers, timeout=10)
                if resp.status_code == 200:
                    record = resp.json()
                    # Possibly fetch the actual data from IPFS if record['cid'] is present
                    if "cid" in record:
                        ipfs_data = self.fetch_from_ipfs(record["cid"])
                        aggregated_data[key] = ipfs_data
                    else:
                        aggregated_data[key] = record
                else:
                    logger.warning(f"Failed to fetch {key} from DKG: {resp.text}")
            except Exception as e:
                logger.error(f"Error fetching {key} from DKG: {e}")

        return aggregated_data

    def fetch_from_ipfs(self, cid: str) -> dict:
        """
        Example function to retrieve data from IPFS.
        """
        try:
            url = f"{self.ipfs_host}/ipfs/{cid}"
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                return resp.json()  # assuming the IPFS data is JSON
        except Exception as e:
            logger.error(f"Error fetching from IPFS: {e}")
        return {}

    def publish_insights(self, insights: dict) -> bool:
        """
        Publish aggregated or anonymized results back to the DKG.
        Potentially store them in IPFS first, then record a hash on-chain.
        """
        logger.debug(f"Publishing insights: {insights}")
        # Example or placeholder logic
        return True
