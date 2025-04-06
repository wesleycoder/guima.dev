import { List } from '@raycast/api';
import { Suspense, use, useMemo } from 'react';
import { db$ } from '../db';
import { messagesTable } from '../db/schema';

export default function Command() {
  return (
    <Suspense fallback={<EmptyView />}>
      <MessageList />
    </Suspense>
  );
}

function EmptyView() {
  return (
    <List>
      <List.EmptyView title="Loading..." />
    </List>
  );
}

function MessageList() {
  const db = use(db$);

  const messagesPromise = useMemo(() => db.select().from(messagesTable), [db]);
  const messages = use(messagesPromise);

  if (messages.length === 0) {
    return (
      <List>
        <List.EmptyView title="No messages found." />
      </List>
    );
  }

  return (
    <List>
      {messages.map(({ id, message: { title, message } }) => (
        <List.Item
          key={id}
          title={title ?? 'Untitled Message'}
          subtitle={{ value: message ?? '<empty>', tooltip: message ?? '<empty>' }}
        />
      ))}
    </List>
  );
}
