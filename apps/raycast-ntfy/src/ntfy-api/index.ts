import { getPreferenceValues, getSelectedText, showHUD } from '@raycast/api';

export async function getNotifications() {
  const { defaultServer, defaultTopic } = getPreferenceValues<Preferences>();

  const url = `${defaultServer}/${defaultTopic}/json?poll=1&since=5h`;

  const res = await fetch(url);

  if (!res.ok) {
    showHUD(`Failed to fetch notifications: ${res.status}`);
    throw new Error(`Failed to fetch notifications: ${res.status}`);
  }

  const responseText = await res.text();
  const lines = responseText.split('\n').filter((l) => l.trim());

  return lines.map((line) => JSON.parse(line));
}

export async function prepareMessage(
  { url = '', message = '' }: { url?: string; message?: string },
  topic: string,
): Promise<PayloadForMessage> {
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
  const { headers, msgType: _msgType, body } = await prepareMessage({ url, message }, currentTopic);

  const res = await fetch(`${defaultServer}/${currentTopic}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cache ? {} : { Cache: 'no-cache' }),
      ...headers,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Failed to send notification: ${res.status}`);
  }

  const responseText = await res.text();

  console.log('responseText', responseText);

  return body;
}

export default {
  getNotifications,
  sendNotification,
};
