#!/usr/bin/env node

// Dependency: This script requires Nodejs.
// Install Node: https://nodejs.org/en/download/

// Required parameters:
// @raycast.schemaVersion 1
// @raycast.title ntfy
// @raycast.mode silent

// Optional parameters:
// @raycast.icon 💬
// @raycast.argument1 { "type": "text", "placeholder": "Message" }
// @raycast.argument2 { "type": "text", "placeholder": "URL", "optional": true }
// @raycast.argument3 { "type": "text", "placeholder": "Topic", "optional": true }
// @raycast.packageName ntfy.sh

// Documentation:
// @raycast.description Notification via ntfy.sh!
// @raycast.author wesleycoder
// @raycast.authorURL https://raycast.com/wesleycoder

import process from 'node:process'
import { parseArgs } from 'node:util'

// !IMPORTANT: Replace the default values with your own values or set the environment variables before running the script
const DEFAULT_TOPIC = process.env.NTFY_TOPIC || 'example-raycast-ntfy-topic'
const SHOULD_CACHE = process.env.NTFY_CACHE === 'true' || false
const DEFAULT_SERVER = process.env.NTFY_SERVER || 'https://ntfy.sh'

const parseMessage = ({ url, message }) => {
  // Is message only
  if (!!message && !url) {
    return { msgType: 'message', body: { topic, title: 'Your Message', message, tags: ['speech_balloon'] } }
  }

  const isUrl = URL.canParse(url || message)

  // Is link
  if (isUrl) {
    const link = url || message
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
            label: message || 'Open Link',
            url: link,
          },
        ],
      },
    }
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
  }
}

async function main(props) {
  try {
    const topic = props.arguments.topic || DEFAULT_TOPIC

    const { headers, msgType, body } = parseMessage(props.arguments, topic)
    const response = await fetch(DEFAULT_SERVER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SHOULD_CACHE ? { Cache: 'no-cache' } : {}),
        ...headers,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(response.status, response.statusText, error)
      throw new Error(`HTTP error! Status: ${response.status} - ${error}`)
    }

    await closeMainWindow({ clearRootSearch: true })
    showToast({
      style: Toast.Style.Success,
      title: `Sent ${msgType} to: ${topic}`,
    })
  } catch (error) {
    showToast({
      style: Toast.Style.Failure,
      title: 'Failed to Send Notification',
      message: error instanceof Error ? error.message : String(error),
    })
  }
}

const rawArgs = process.argv.slice(2)
let message, url, topic

try {
  const { positionals, values } = parseArgs({
    args: rawArgs,
    options: {
      message: {
        type: 'string',
        short: 'm',
      },
      url: {
        type: 'string',
        short: 'u',
      },
      topic: {
        type: 'string',
        short: 't',
      },
    },
    allowPositionals: true,
    strict: false,
  })

  message = values.message
  url = values.url
  topic = values.topic

  if (positionals.length > 0) {
    if (!message) message = positionals[0]

    if (positionals.length === 2) {
      // Positional 1: Could be URL or Topic if not set by flags
      const arg2 = positionals[1]
      if (!url && !topic) {
        // Neither URL nor Topic flags were used
        if (URL.canParse(arg2)) {
          url = arg2
        } else {
          topic = arg2
        }
      } else if (!url) {
        // Topic flag was used, so arg2 must be URL
        url = arg2
      } else if (!topic) {
        // URL flag was used, so arg2 must be Topic
        topic = arg2
      }
    } else if (positionals.length >= 3) {
      // Positional 1: URL if not set by flag
      if (!url) url = positionals[1]
      // Positional 2: Topic if not set by flag
      if (!topic) topic = positionals[2]
    }
  }

  if (!message) throw new Error('Message is required.')
  if (!topic) topic = DEFAULT_TOPIC
} catch (error) {
  console.error(`Error: ${error.message}\n`)
  console.error('Usage:')
  console.error('  node ntfy.js <message> [<url_or_topic>] [<topic>]')
  console.error('  node ntfy.js -m <message> [-u <url>] [-t <topic>]')
  console.error('  node ntfy.js --message <message> [--url <url>] [--topic <topic>]\n')

  console.error('Arguments:')
  console.error('  <message>          The notification message (required).')
  console.error('  <url_or_topic>     (Positional only) URL (if starts with http(s)://) or Topic.')
  console.error('  <topic>            (Positional only if URL provided) The topic.\n')

  console.error('Options:')
  console.error('  -m, --message MSG  Set the message.')
  console.error('  -u, --url URL      Set the click-through URL.')
  console.error(`  -t, --topic TOPIC  Set the topic (default: "${DEFAULT_TOPIC}").`)
  process.exit(1)
}

main({ arguments: { url, message, topic } })
