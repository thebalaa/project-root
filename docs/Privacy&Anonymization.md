# Anonymization:
- 2 step raw data and blockchain publishing anonymization process
  - Raw data is anonymized on the client machine.
  - The data is tokenized and published to the DKG. Future enhancements will include differential privacy to enhance user data security and zero knowledge proofs to ensure data being submitted meets a certain criteria.
  - When publishing to the DKG blockchain an ephemeral address system will be implemented.
- A tor integration will be built into the backend to handle asynchronous publishing of anonymized data to the blockchain. 
- A quantum secure cryptography implementation will be built into the backend to ensure user data is well protected.
- All data including user data and model information will be encrypted when published to the blockchain. Only users who are a participant or have sufficient privileges as defined by governance are able to access and decrypt to view and use.
- Governance model will need to be pseudonymous. TBD exact structure. 
