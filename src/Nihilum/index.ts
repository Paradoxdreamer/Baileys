/**
 * Paradox Nihilum foundation layer for Baileys
 * Opt-in helpers — normal bots (ParadoxGPT) keep stock behavior.
 * Attacks / advanced menus use these for raw relay, burst, SSL, channel invite shapes.
 */
import type { WASocket } from '../Types'
import { generateWAMessageFromContent, generateMessageID } from '../Utils'

export type BurstTask = () => Promise<unknown>

export interface RelayRawOptions {
  messageId?: string
  additionalNodes?: any[]
  /** skip waiting for server ack when possible */
  fireAndForget?: boolean
}

/** Standard biz + native_flow additional nodes used by interactive menus */
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

/**
 * Relay arbitrary WAMessageContent without going through sendMessage sanitizers.
 * Safe for ParadoxGPT menus and for NIHILUM payloads.
 */
export async function relayRaw(
  sock: WASocket,
  jid: string,
  content: any,
  opts: RelayRawOptions = {}
) {
  const full = generateWAMessageFromContent(jid, content, {})
  const messageId = opts.messageId || full.key.id || generateMessageID()
  await sock.relayMessage(jid, full.message!, {
    messageId,
    additionalNodes: opts.additionalNodes,
  })
  return { key: { ...full.key, id: messageId }, message: full.message }
}

/** Run many async sends with concurrency limit (efficient pressure / menu spam) */
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
          /* swallow per-task */
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

/**
 * Single-select list (SSL) via native flow / list shape.
 * Works for normal bot menus and heavy list bombs.
 */
export async function sendSingleSelect(
  sock: WASocket,
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
  // Prefer classic list message (widely rendered)
  try {
    return await sock.sendMessage(jid, {
      text: opts.text,
      title: opts.title,
      footer: opts.footer,
      buttonText: opts.buttonText || 'Select',
      sections: opts.sections,
    } as any)
  } catch {
    // Fallback: native flow single-select style buttons
    const buttons = opts.sections.flatMap((sec, si) =>
      sec.rows.map((row, ri) => ({
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          title: sec.title || opts.title || 'Menu',
          sections: [
            {
              title: sec.title,
              rows: [
                {
                  header: row.title,
                  id: row.rowId,
                  title: row.title,
                  description: row.description || '',
                },
              ],
            },
          ],
        }),
      }))
    )
    // compact: one single_select with full sections
    const one = [
      {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
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
        }),
      },
    ]
    return relayRaw(
      sock,
      jid,
      {
        interactiveMessage: {
          body: { text: opts.text },
          footer: opts.footer ? { text: opts.footer } : undefined,
          nativeFlowMessage: {
            buttons: one,
            messageParamsJson: '{}',
          },
        },
      },
      { additionalNodes: opts.additionalNodes || bizInteractiveNodes('single_select') }
    )
  }
}

/** Quick reply / CTA URL / copy code interactive */
export async function sendNativeFlow(
  sock: WASocket,
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

/**
 * Channel / newsletter invite-style interactive payload into a chat or group.
 * Research note: clients sometimes mis-handle channel admin / invite CTAs in group
 * context; server may drop invalid invites. This emits the shape — not a guaranteed crash.
 */
export async function sendChannelInviteButton(
  sock: WASocket,
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

  const buttons = [
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
  ]

  return relayRaw(
    sock,
    jid,
    {
      interactiveMessage: {
        body: { text: opts.body || name },
        nativeFlowMessage: {
          buttons,
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

/** Attach nihilum helpers onto a live socket (non-destructive) */
export function attachNihilum(sock: WASocket): WASocket & { nihilum: ReturnType<typeof createNihilumApi> } {
  const api = createNihilumApi(sock)
  ;(sock as any).nihilum = api
  return sock as any
}

function createNihilumApi(sock: WASocket) {
  return {
    relayRaw: (jid: string, content: any, opts?: RelayRawOptions) => relayRaw(sock, jid, content, opts),
    sendBurst: (tasks: BurstTask[], concurrency?: number) => sendBurst(tasks, concurrency),
    sendSingleSelect: (jid: string, opts: Parameters<typeof sendSingleSelect>[2]) =>
      sendSingleSelect(sock, jid, opts),
    sendNativeFlow: (jid: string, opts: Parameters<typeof sendNativeFlow>[2]) =>
      sendNativeFlow(sock, jid, opts),
    sendChannelInviteButton: (jid: string, opts: Parameters<typeof sendChannelInviteButton>[2]) =>
      sendChannelInviteButton(sock, jid, opts),
    bizInteractiveNodes,
  }
}

export const Nihilum = {
  relayRaw,
  sendBurst,
  sendSingleSelect,
  sendNativeFlow,
  sendChannelInviteButton,
  bizInteractiveNodes,
  attachNihilum,
}

export default Nihilum
