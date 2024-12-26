// src/services/agentService.ts

/**
 * agentService.ts
 * 
 * Handles API interactions for Custom AI Agents, including communication with AI Microservices
 * and the dedicated IPFS pinning service. Ensures all data transmissions utilize hybrid encryption
 * for security and privacy.
 */

import axios, { AxiosResponse } from 'axios';
import { encryptData, decryptData } from '../utils/crypto';
import { getAuthToken } from '../utils/helpers';
import store from '../store';
import { logout } from '../store/auth/authSlice';
import { Agent } from '../store/agents/agentsSlice';

const AI_MICROSERVICE_URL: string = process.env.REACT_APP_AI_MICROSERVICE_URL || 'http://localhost:5000';
const IPFS_PINNING_SERVICE_URL: string = process.env.REACT_APP_IPFS_PINNING_SERVICE_URL || 'http://localhost:6000';

interface EncryptedAgentData {
  encryptedData: string;
  iv: string;
  authTag: string;
  encryptedKeys: {
    publicKey: string;
    encryptedKey: string;
  }[];
}

interface IPFSUploadResponse {
  ipfsHash: string;
}

async function encryptAndPinAgentData(agentData: Agent): Promise<string> {
  // 1) Hybrid-encrypt the agentData
  // 2) Upload to IPFS
  // 3) Return IPFS hash
  const authorizedMembers = agentData.settings?.secrets
    ? Object.keys(agentData.settings?.secrets)
    : [];
  return await agentService.uploadDataToIPFS(agentData, authorizedMembers);
}

const agentService = {
  /**
   * Fetch all AI agents from the AI Microservice.
   * @returns {Promise<Agent[]>} List of agents.
   */
  fetchAgents: async (): Promise<Agent[]> => {
    try {
      const response: AxiosResponse<Agent[]> = await axios.get(`${AI_MICROSERVICE_URL}/agents`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        store.dispatch(logout());
      }
      throw error;
    }
  },

  /**
   * Create a new AI agent via the AI Microservice.
   * @param {Agent} agentData - Data of the agent to be created.
   * @returns {Promise<Agent>} Created agent data.
   */
  createAgent: async (agentData: Agent): Promise<Agent> => {
    try {
      // Pin the agent data to IPFS first
      const ipfsHash = await encryptAndPinAgentData(agentData);
      
      // Then call AI microservice with minimal data or just the IPFS hash
      const response: AxiosResponse<Agent> = await axios.post(`${AI_MICROSERVICE_URL}/agents`, {
        ipfsHash,
        // Possibly additional direct fields
      }, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        store.dispatch(logout());
      }
      throw error;
    }
  },

  /**
   * Delete an AI agent via the AI Microservice.
   * @param {string} agentId - ID of the agent to delete.
   * @returns {Promise<void>}
   */
  deleteAgent: async (agentId: string): Promise<void> => {
    try {
      await axios.delete(`${AI_MICROSERVICE_URL}/agents/${agentId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        store.dispatch(logout());
      }
      throw error;
    }
  },

  /**
   * Retrieve data from the IPFS pinning service.
   * @param {string} ipfsHash - The IPFS hash of the data.
   * @param {string} encryptedKey - The encrypted symmetric key for decryption.
   * @returns {Promise<any>} Retrieved and decrypted data.
   */
  retrieveDataFromIPFS: async (ipfsHash: string, encryptedKey: string): Promise<any> => {
    try {
      const response: AxiosResponse<{
        encryptedData: string;
        iv: string;
        authTag: string;
      }> = await axios.get(`${IPFS_PINNING_SERVICE_URL}/data/${ipfsHash}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      // Decrypt the symmetric key (assuming server provides a method or key management system)
      // Here, we assume that the client has access to the private keys to decrypt the symmetric key
      // This is a placeholder and should be implemented according to your key management strategy

      // Example: Decrypt symmetric key using the client's private key
      // const symmetricKey = decryptSymmetricKey(encryptedKey, privateKey);

      // For demonstration, assuming symmetricKey is obtained
      const symmetricKey: Buffer = Buffer.from('your-decrypted-symmetric-key', 'hex'); // Replace with actual decryption

      const decryptedData = decryptData(response.data.encryptedData, response.data.iv, response.data.authTag, symmetricKey);
      return decryptedData;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        store.dispatch(logout());
      }
      throw error;
    }
  },

  /**
   * Upload data to the IPFS pinning service.
   * @param {any} data - Data to upload.
   * @param {string[]} authorizedMembers - List of public keys authorized to access the data.
   * @returns {Promise<string>} IPFS hash of the uploaded data.
   */
  uploadDataToIPFS: async (data: any, authorizedMembers: string[]): Promise<string> => {
    try {
      // Encrypt data using hybrid encryption
      const { encryptedData, iv, authTag, encryptedKeys } = encryptData(data, authorizedMembers);

      const payload = {
        encryptedData,
        iv,
        authTag,
        encryptedKeys,
      };

      const response: AxiosResponse<IPFSUploadResponse> = await axios.post(`${IPFS_PINNING_SERVICE_URL}/upload`, payload, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.ipfsHash;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        store.dispatch(logout());
      }
      throw error;
    }
  },
};

export default agentService;
