import { getPreferenceValues, getSelectedText, showHUD } from '@raycast/api';
import { eq, sql } from 'drizzle-orm';
import { db$ } from '../db';
import { messagesTable, serversTable, topicsTable } from '../db/schema';

export async function fetchMessages() {
  const { defaultServer, defaultTopic } = getPreferenceValues<Preferences>();

  const url = `${defaultServer}/${defaultTopic}/json?poll=1&since=5h`;
  const res = await fetch(url);

  if (!res.ok) {
    showHUD(`Failed to fetch notifications: ${res.status}`);
    throw new Error(`Failed to fetch notifications: ${res.status}`);
  }

  const responseText = await res.text();
  const lines = responseText.split('\n').filter((l) => l.trim());

  const messages = lines.map((line) => JSON.parse(line) as NtfyMessage);

  if (messages.length) {
    let serverId: string, topicId: string;
    const db = await db$;
    const serverResult = await db
      .select({ id: serversTable.id })
      .from(serversTable)
      .where(eq(serversTable.url, new URL(defaultServer)));
    serverId = serverResult[0]?.id;

    if (!serverResult.length) {
      const [{ id }] = await db
        .insert(serversTable)
        .values({ name: 'Default', url: new URL(defaultServer) })
        .onConflictDoUpdate({
          target: [serversTable.id],
          set: { name: sql`excluded.name` },
        })
        .returning({ id: serversTable.id });
      serverId = id;
    }
    const topicResult = await db
      .select({ id: topicsTable.id })
      .from(topicsTable)
      .where(eq(topicsTable.topic, defaultTopic));
    topicId = topicResult[0]?.id;

    if (!topicResult.length) {
      const [{ id }] = await db
        .insert(topicsTable)
        .values({ topic: defaultTopic, serverId })
        .onConflictDoUpdate({
          target: [topicsTable.id],
          set: { topic: sql`excluded.topic` },
        })
        .returning({ id: topicsTable.id });
      topicId = id;
    }

    console.log('messages', messages);

    await db
      .insert(messagesTable)
      .values(messages.map((message) => ({ id: message.id, serverId, topicId, message })))
      .onConflictDoUpdate({
        target: [messagesTable.id],
        set: { message: sql`excluded.message` },
      });
  }

  return messages;
}

async function prepareMessage(
  { url = '', message = '' }: { url?: string; message?: string },
  topic: string,
): Promise<NtfyMessagePayload> {
  const selectedText = await getSelectedText().catch(() => '');
  const normalizedUrl = url?.startsWith('http') ? url : `https://${url}`;
  const isUrl = URL.canParse(normalizedUrl || message || selectedText.trim());

  // Is link
  if (isUrl) {
    const link = normalizedUrl || message || selectedText;
    return {
      msgType: 'link',
      body: {
        topic,
        title: 'Your Link',
        message,
        tags: ['link'],
        actions: [
          {
            action: 'view',
            label: 'Open Link',
            url: link,
          },
        ],
      },
    };
  }

  // Is selected text
  if (!message && !url && selectedText.trim()) {
    return {
      msgType: 'clipboard',
      body: {
        topic,
        title: 'Your Selected Text',
        message: selectedText,
        tags: ['clipboard'],
      },
    };
  }

  // Is message only
  if (message) {
    return { msgType: 'message', body: { topic, title: 'Your Message', message, tags: ['speech_balloon'] } };
  }

  // Is ping
  return {
    msgType: 'ping',
    body: {
      topic,
      title: 'Your Ping',
      message: 'Pong!',
      tags: ['ping_pong'],
    },
  };
}

export async function sendNotification(
  topic: string,
  { url, message }: { url?: string; message?: string },
  cache = false,
) {
  const { defaultServer, defaultTopic } = getPreferenceValues<Preferences>();
  const currentTopic = topic || defaultTopic;
  const { headers, msgType, body } = await prepareMessage({ url, message }, currentTopic);

  const res = await fetch(`${defaultServer}/${currentTopic}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cache ? {} : { Cache: 'no-cache' }),
      ...headers,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Failed to send notification: ${res.status}`);

  const responseText = await res.text();
  console.log('responseText', msgType, responseText);

  return body;
}

export default {
  fetchMessages,
  sendNotification,
};
