/**
 * IDataIngestion.ts
 * 
 * Defines the contract for any data ingestion service or class
 * in the front-end system.
 */
import { CapturedData } from '../localCache/localCache';

export interface IDataIngestion {
  identifyAndProcess(data: CapturedData): void;
  setCallback(callback: (data: CapturedData) => void): void;
}