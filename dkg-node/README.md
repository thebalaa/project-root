# Publishing Module

## Overview

The Publishing module is responsible for handling the publishing of assets and data references to the Decentralized Knowledge Graph (DKG). It ensures that all external communications are routed through the Tor network to maintain privacy and anonymity.

## Features

- **Asset Publishing**: Encrypts and publishes assets to the DKG.
- **Privacy Management**: Manages privacy settings and policies.
- **Zero-Knowledge Proofs (ZKP)**: Enhances data integrity and authenticity using ZKPs.
- **Tor Integration**: Routes all external HTTP requests through the Tor network for enhanced privacy.

## Tor Integration

To ensure that all communications are anonymized, the Publishing module integrates with the Tor network. This is achieved by routing all HTTP requests through a SOCKS5 proxy provided by Tor.

### Configuration

Tor settings are defined in the `nodeConfig.json` file located in the `config/` directory. Below is a sample configuration:

```json
"tor": {
  "enabled": true,
  "socks5Host": "127.0.0.1",
  "socks5Port": 9050,
  "controlPort": 9051,
  "password": "your_tor_control_password",
  "timeoutSec": 60
}
