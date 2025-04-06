import { assign, fromPromise, setup } from 'xstate';
import { db$ } from '../db';
import { messagesTable } from '../db/schema';
import { fetchMessages } from '../lib/ntfy-api';

export type FetchMachineContext = {
  status?: 'idle' | 'loading' | 'fetching' | 'ready' | 'error';
  servers: string[];
  topics: string[];
  messages: NtfyMessage[];
  error?: string | null;
};
export type FetchMachineEvents = { type: 'dbLoaded' } | { type: 'fetchDone' } | { type: 'fetchError' };

export const fetchMachine = setup({
  types: {
    context: {} as FetchMachineContext,
    events: {} as FetchMachineEvents,
  },
  actors: {
    loadFromDB: fromPromise(async () => {
      const db = await db$;
      const messages = await db.select().from(messagesTable);
      return messages.map((m) => m.message);
    }),
    fetchMessages: fromPromise(fetchMessages),
  },
}).createMachine({
  id: 'ntfy-fetch',
  context: {
    servers: [],
    topics: [],
    messages: [],
  },
  initial: 'loading',
  states: {
    loading: {
      initial: 'loadingDB',
      invoke: {
        src: 'loadFromDB',
        onDone: {
          target: '.fetchMessages',
          actions: assign({ messages: ({ event }) => event.output }),
        },
        onError: { target: '#ntfy-fetch.error' },
      },
      on: {},
      states: {
        loadingDB: {},
        fetchMessages: {
          invoke: {
            src: 'fetchMessages',
            onDone: {
              target: '#ntfy-fetch.ready',
              actions: assign({ messages: ({ event }) => event.output }),
            },
            onError: { target: '#ntfy-fetch.error' },
          },
        },
      },
    },
    ready: {},
    error: {},
  },
});
