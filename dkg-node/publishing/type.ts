// types.ts

/**
 * EncryptedSymmetricKey represents the structure of an encrypted symmetric key for a member.
 */
export interface EncryptedSymmetricKey {
    memberId: string;
    encryptedKey: string;
}

/**
 * DataReference represents the data stored on the blockchain.
 */
export interface DataReference {
    ipfsHash: string;
    encryptedKeys: EncryptedSymmetricKey[];
}
