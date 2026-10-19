/**
 * Official Appwrite Client Initialization
 */

import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';
import { getAppwriteConfig } from './config';

const config = getAppwriteConfig();

export const client = new Client();
client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { ID, Query };

export function updateClientConfig(endpoint: string, projectId: string) {
  client.setEndpoint(endpoint).setProject(projectId);
}
