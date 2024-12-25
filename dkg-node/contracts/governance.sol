// governance.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Governance Contract for DKG
/// @notice This contract manages roles and data references in the DKG network.

contract Governance {
    // Define roles
    enum Role { Admin, DataOwner, DataConsumer }

    // Mapping from address to roles
    mapping(address => Role) public roles;

    // DataReference struct
    struct DataReference {
        string ipfsHash;
        EncryptedSymmetricKey[] encryptedKeys;
    }

    struct EncryptedSymmetricKey {
        string memberId;
        string encryptedKey;
    }

    // Mapping from data ID to DataReference
    mapping(string => DataReference) public dataReferences;

    // Events
    event RoleAssigned(address indexed user, Role role);
    event DataReferencePublished(string dataId, string ipfsHash);

    // Modifiers
    modifier onlyAdmin() {
        require(roles[msg.sender] == Role.Admin, "Not an admin");
        _;
    }

    modifier onlyDataOwner() {
        require(roles[msg.sender] == Role.DataOwner, "Not a data owner");
        _;
    }

    /// @notice Assign a role to a user
    /// @param user Address of the user
    /// @param role Role to assign
    function assignRole(address user, Role role) external onlyAdmin {
        roles[user] = role;
        emit RoleAssigned(user, role);
    }

    /// @notice Publish a DataReference
    /// @param dataId Unique identifier for the data
    /// @param ipfsHash IPFS hash of the encrypted data
    /// @param encryptedKeys Array of EncryptedSymmetricKeys
    function publishDataReference(string memory dataId, string memory ipfsHash, EncryptedSymmetricKey[] memory encryptedKeys) external onlyDataOwner {
        require(bytes(dataReferences[dataId].ipfsHash).length == 0, "Data ID already exists");

        DataReference storage dr = dataReferences[dataId];
        dr.ipfsHash = ipfsHash;

        for(uint i = 0; i < encryptedKeys.length; i++) {
            dr.encryptedKeys.push(encryptedKeys[i]);
        }

        emit DataReferencePublished(dataId, ipfsHash);
    }

    /// @notice Retrieve a DataReference
    /// @param dataId Unique identifier for the data
    /// @return ipfsHash IPFS hash of the encrypted data
    /// @return encryptedKeys Array of EncryptedSymmetricKeys
    function getDataReference(string memory dataId) external view returns (string memory ipfsHash, EncryptedSymmetricKey[] memory encryptedKeys) {
        DataReference storage dr = dataReferences[dataId];
        return (dr.ipfsHash, dr.encryptedKeys);
    }

    // Additional functions for access control, etc., can be added here.
}
