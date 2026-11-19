import {
  generateWAMessageFromContent,
  proto
} from '@whiskeysockets/baileys';

import {
  buildQuickReplyButtons,
  buildListButton
} from './button-utils.js';

function interactiveNodes(jid) {
  const nodes = [{
    tag: 'biz',
    attrs: {},
    content: [{
      tag: 'interactive',
      attrs: { type: 'native_flow', v: '1' },
      content: [{
        tag: 'native_flow',
        attrs: { v: '9', name: 'mixed' }
      }]
    }]
  }];

  if (!String(jid).endsWith('@g.us')) {
    nodes.push({ tag: 'bot', attrs: { biz_bot: '1' } });
  }

  return nodes;
}

async function sendNativeFlow(sock, jid, {
  text,
  title = '',
  footer = '',
  buttons,
  quoted
}) {
  if (!text || !Array.isArray(buttons) || buttons.length === 0) {
    throw new Error('Text und mindestens ein Button sind erforderlich.');
  }

  const message = generateWAMessageFromContent(
    jid,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            header: proto.Message.InteractiveMessage.Header.create({
              title,
              hasMediaAttachment: false
            }),
            body: proto.Message.InteractiveMessage.Body.create({ text }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: footer }),
            nativeFlowMessage:
              proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons
              })
          })
        }
      }
    },
    {
      quoted,
      userJid: sock.user?.id
    }
  );

  await sock.relayMessage(jid, message.message, {
    messageId: message.key.id,
    additionalNodes: interactiveNodes(jid)
  });

  return message.key;
}

export function sendInteractiveButtons(sock, jid, options) {
  return sendNativeFlow(sock, jid, {
    ...options,
    buttons: buildQuickReplyButtons(options.buttons)
  });
}

export function sendInteractiveList(sock, jid, options) {
  return sendNativeFlow(sock, jid, {
    ...options,
    buttons: [buildListButton(options.buttonText, options.rows)]
  });
}
