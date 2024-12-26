// type.ts

/**
 * type.ts
 * 
 * Defines TypeScript interfaces and types for the DKG node.
 */

export interface DataReference {
    data_id: string;
    ipfs_hash: string;
    encrypted_keys: EncryptedSymmetricKey[];
  }
  
  export interface EncryptedSymmetricKey {
    member_id: string;
    encrypted_key: string;
  }
  
  export interface TorConfig {
    enabled: boolean;
    socks5Host: string;
    socks5Port: number;
    controlPort?: number;
    password?: string;
    timeoutSec: number;
  }
  
  export interface ZKPPayload {
    data_reference: string;
    zk_proof: string;
  }
  
  export interface PublishResponse {
    success: boolean;
    message: string;
  }
  