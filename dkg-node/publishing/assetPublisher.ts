// assetPublisher.ts

import { ethers } from "ethers/v5";
import fs from "fs";
import path from "path";
import { EncryptedSymmetricKey, DataReference } from "../types";
import dotenv from "dotenv";

dotenv.config();

// Load ABI and contract address
const contractAbiPath = path.resolve(__dirname, "../contracts/governanceAbi.json");
const contractAbi = JSON.parse(fs.readFileSync(contractAbiPath, 'utf-8'));
const contractAddress = process.env.GOVERNANCE_CONTRACT_ADDRESS || "";

// Initialize ethers provider and signer
const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
const contract = new ethers.Contract(contractAddress, contractAbi, signer);

/**
 * Publishes a DataReference to the blockchain via Governance contract.
 * 
 * @param dataId Unique identifier for the data
 * @param dataRef DataReference object containing IPFS hash and encrypted symmetric keys
 */
export async function publishDataReference(dataId: string, dataRef: DataReference): Promise<void> {
    try {
        const tx = await contract.publishDataReference(dataId, dataRef.ipfsHash, dataRef.encryptedKeys);
        console.log(`Transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log(`Transaction confirmed: ${tx.hash}`);
    } catch (error) {
        console.error("Error publishing DataReference:", error);
        throw error;
    }
}
