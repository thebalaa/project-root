# Scope and Assumptions

## In-Scope Features: 
- User facing overlay application
    - Browser extension and desktop application to handle storage of data and interaction with the DKG. Basic information will need to be collected at time of installation to ensure data is recorded properly.

- Asynchronous process to handle the data transformation and submission to the DKG.

- Ability to opt out
    - Users need the ability to opt out on data collection based on certain criteria.

- Data management system
   - Data must be stored privatley and securely.
   - A data management system will need to be established to ensure that the system avoids taking up too much space on user devices.

- DKG and OriginTrail integration 
    - OriginTrail edge node for interaction with the DKG and offline secure data storage via IPFS. Hybrid encryption and other procedures will be built to ensure data is properly privatized and anonymized before publishing to the DKG.

- Users will need to retain TRAC tokens to publish to the DKG and will be rewarded with NEURO tokens for meaningful data contributions. 

- Applications will need to be configured to handle the proper use of TRAC as part of network costs. Users should not be directly interacting with the TRAC token.

- AI/LLM integration
    - Retrieval-Augmented Generation (RAG) workflow using symbolic AI to integrate the DKG reference data into an AI model to enforce structured reasoning and consistency. 

- Machine learning
    - ML framework will be put in place to assist with pattern recognition, adaptability and ambiguity in data sets.

- Federated learning
    - Federated learning service will be in place to be able to quickly start training dedicated AI agents.

- Dashboard for analytics insights
    - This will be a separate webpage for personalized analytics that the user can navigate to from the user facing overlay application

- Security and Identity Management
    - zkAuth user authentication system to allow web2 logins and easy management of credentials through zero knowledge proofs.

- Users must also be able to link together device identities if they are part of the same organization. This will be used to provide proper visibility into their systems in the case that multiple platforms or instances of platforms are used. 

- Governance model for ecosystem improvement
    - A governance web page for the ecosystem that allows for participants to shape the community

- DevOps and Deployment Infrastructure
    - Docker container for all services to ensure usability across a wide range of configurations.


## Out of scope (future enhancements):
- Support for data transmission methods that run locally on device
    - Automatic detection of data communicating software.
    - This application will have an ingestion layer to allow for copying of various data inputs via whatever custom data integrations the users may have such as ODBC, XML, CSV, etc. This needs to be extremely low latency to not interfere with the speed of the system currently in place. Data must be immediately handed off to its destination and copied for further transformation. 

- Additional knowledge assets
    - MVP approach will use daily activity in terms of data exchanges as a knowledge asset. Future enhancements will provide robust analytics by including data captured outside of interactions the user has online, by other parties or sources.

- Local custom AI agent
    - A local AI agent trained and dedicated for needs defined by the network. This will likely take time to develop a federated learning service to handle this.

- Additional role support
    - Role support for other actors in the internet ecosystem will be deferred. Additional functionality and application suites can be added down the road to support other players in the ecosystem shown. 
- Integration with operating systems
    - Design packages that directly integrate this functionality into operating systems. 
