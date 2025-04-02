import { Icon, launchCommand, LaunchType, MenuBarExtra } from '@raycast/api';
import { createStore } from '@xstate/store';
import { useSelector } from '@xstate/store/react';
import { produce } from 'immer';
import { useEffect } from 'react';
import { useDB } from './db';
import { messagesTable } from './db/schema.ts';
import { getNotifications } from './ntfy-api';

type Context = {
  messages: Message[];
  servers: string[];
  topics: string[];
  isFetching: boolean;
};

const store = createStore({
  context: {
    messages: [],
    servers: [],
    topics: [],
    isFetching: true,
  } as Context,
  on: {
    fetch: (ctx, _evt, enq) => {
      enq.effect(async () => {
        const messages = await getNotifications();
        store.send({ type: 'fetchDone', messages });
      });
      return { ...ctx, isFetching: true };
    },
    fetchDone: (ctx, evt: { messages: Message[] }) =>
      produce(ctx, (draft) => {
        draft.messages = evt.messages;
        draft.isFetching = false;
      }),
  },
});

export default function main() {
  const ctx = useSelector(store, ({ context }) => context);
  const [db, isInit] = useDB();

  useEffect(() => {
    if (db) {
      db.select().from(messagesTable).then((messages) => {
        console.log('messages', messages.length);
      });
    }
  }, [db]);

  return (
    <MenuBarExtra
      isLoading={ctx.isFetching || isInit}
      title={`${ctx.isFetching ? '-' : ctx.messages.length}`}
      icon={Icon.SpeechBubbleActive}
    >
      <MenuBarExtra.Item title='Refresh' onAction={() => store.send({ type: 'fetch' })} />
      <MenuBarExtra.Item
        title='View'
        onAction={() =>
          launchCommand({
            name: 'ntfy-list',
            type: LaunchType.UserInitiated,
          })}
      />
    </MenuBarExtra>
  );
}
