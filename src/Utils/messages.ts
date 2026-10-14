/**
 * TEMPORARY STUB - messages.ts was truncated during automated patch.
 *
 * TO RESTORE FULLY (run locally):
 *
 *   git checkout 665d96357f488e5a2dd2e32a0fc57b1a4bcd480b -- src/Utils/messages.ts
 *
 * Then the Paradox interactive helpers in paradox-interactive.ts still work via relayMessage.
 *
 * Full generateWAMessageContent list/interactive wiring will be re-applied after restore.
 */

export * from './_messages_restore_note.js'

// Minimal stubs so imports don't crash while restoring
export const extractUrlFromText = (text) => null
export const generateLinkPreviewIfRequired = async () => undefined
export const prepareWAMessageMedia = async () => ({})
export const prepareDisappearingMessageSettingContent = () => ({})
export const generateForwardMessageContent = (m) => m?.message || {}
export const hasNonNullishProperty = (obj, key) => obj != null && key in obj && obj[key] != null
export const generateWAMessageContent = async (message, options) => {
  // Paradox path: if list or interactive, use helpers
  if (message?.list) {
    const { buildParadoxList } = await import('./paradox-interactive.js')
    return buildParadoxList(message.list)
  }
  if (message?.interactive) {
    const { buildParadoxInteractive } = await import('./paradox-interactive.js')
    return buildParadoxInteractive({
      text: message.interactive.text,
      title: message.interactive.title,
      subtitle: message.interactive.subtitle,
      footer: message.interactive.footer,
      interactiveButtons: message.interactive.buttons
    })
  }
  // Fallback - for other types you need the full messages.ts restored
  if (message?.text) {
    return { extendedTextMessage: { text: message.text } }
  }
  return {}
}
export const generateWAMessageFromContent = (jid, message, options = {}) => {
  return {
    key: { remoteJid: jid, fromMe: true, id: options.messageId || 'PARADOX' + Date.now() },
    message,
    messageTimestamp: Math.floor(Date.now() / 1000)
  }
}
export const generateWAMessage = async (jid, content, options) => {
  const m = await generateWAMessageContent(content, options || {})
  return generateWAMessageFromContent(jid, m, options)
}
export const getContentType = (content) => content && Object.keys(content).find(k => k !== 'messageContextInfo' && k !== 'senderKeyDistributionMessage')
export const normalizeMessageContent = (content) => content
export const extractMessageContent = (content) => content
export const getAggregateVotesInPollMessage = () => []
export const getAggregateResponsesInEventMessage = () => []
export const aggregateMessageKeysNotFromMe = () => []
export const downloadMediaMessage = async () => Buffer.alloc(0)
export const assertMediaContent = (c) => c
export const updateMessageWithReceipt = () => {}
export const updateMessageWithReaction = () => {}
export const updateMessageWithPollUpdate = () => {}
