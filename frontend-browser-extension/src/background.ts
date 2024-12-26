import { DataIdentifier } from '../localCache/dataIdentification';
import { BrowserEvents } from './browserEvents';

const dataIdentifier = new DataIdentifier();
const browserEvents = new BrowserEvents(dataIdentifier);
browserEvents.initListeners();