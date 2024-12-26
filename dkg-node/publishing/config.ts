import fs from 'fs';
import path from 'path';
import { Logger } from 'winston';
import winston from 'winston';

export interface TorConfig {
  enabled: boolean;
  socks5Host: string;
  socks5Port: number;
  controlPort?: number;
  password?: string;
  timeoutSec: number;
}

export interface DKGNodeConfig {
  server: {
    address: string,
    port: number
  };
  database: {
    connectionString: string
  };
  ipfs: {
    apiUrl: string;
    gatewayUrl: string;
  };
  dkg: {
    apiUrl: string;
  };
  tor: TorConfig;
  security: {
    encryption: {
      algorithm: string;
      keyLength: number;
      ivLength: number;
    }
  };
}

export class ConfigManager {
  private static instance: DKGNodeConfig;
  private static logger: Logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [new winston.transports.Console()]
  });

  public static getConfig(): DKGNodeConfig {
    if (!ConfigManager.instance) {
      const configPath = path.resolve(__dirname, '../config/nodeConfig.json');
      if (!fs.existsSync(configPath)) {
        ConfigManager.logger.error(`Configuration file not found at path: ${configPath}`);
        throw new Error('Configuration file missing.');
      }
      const configData = fs.readFileSync(configPath, 'utf-8');
      ConfigManager.instance = JSON.parse(configData) as DKGNodeConfig;
    }
    return ConfigManager.instance;
  }
}