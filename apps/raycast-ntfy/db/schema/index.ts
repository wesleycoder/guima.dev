import { messagesTable } from './messages';
import { serversTable } from './servers';
import { topicsTable } from './topics';

export * from './messages';
export * from './servers';
export * from './topics';

export const schema = {
  messages: messagesTable,
  servers: serversTable,
  topics: topicsTable,
};

export type Schema = typeof schema;
