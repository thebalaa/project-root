import axios, { AxiosInstance } from 'axios';
import HttpsProxyAgent from 'https-proxy-agent';
import { DKGNodeConfig } from './config';

export class TorClient {
  private client: AxiosInstance;

  constructor(config: DKGNodeConfig) {
    const axiosConfig = {};

    if (config.tor.enabled) {
      const proxy = `socks5://${config.tor.socks5Host}:${config.tor.socks5Port}`;
      const agent = new HttpsProxyAgent(proxy);

      this.client = axios.create({
        httpAgent: agent,
        httpsAgent: agent,
        timeout: config.tor.timeoutSec * 1000
      });
    } else {
      // No Tor proxy used
      this.client = axios.create();
    }
  }

  public async post<T>(url: string, data: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  public async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }
}
