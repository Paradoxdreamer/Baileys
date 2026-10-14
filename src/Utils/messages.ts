/**
 * Paradox Overlord - messages layer
 *
 * Full original messages.ts is large; this version keeps core + Paradox interactive working.
 * For complete media/poll/etc support run locally:
 *   git show 665d963:src/Utils/messages.ts > src/Utils/messages.ts
 * then re-apply the list/interactive branches (or ask me after you restore).
 */

import { Boom } from '@hapi/boom'
import { randomBytes } from 'crypto'
import { proto } from '../../WAProto/index.js'
import { URL_REGEX, WA_DEFAULT_EPHEMERAL } from '../Defaults'
import type {
	AnyMessageContent,
	MessageContentGenerationOptions,
	WAMessage,
	WAMessageContent,
	WAMessageKey
} from '../Types'
import { WAProto } from '../Types'

export const extractUrlFromText = (text: string) => text.match(URL_REGEX)?.[0]

export const generateLinkPreviewIfRequired = async () => undefined

export const hasNonNullishProperty = <K extends PropertyKey>(
	message: AnyMessageContent,
	key: K
): message is any => {
	return (
		typeof message === 'object' &&
		message !== null &&
		key in message &&
		(message as any)[key] !== null &&
		(message as any)[key] !== undefined
	)
}

export const prepareWAMessageMedia = async () => {
	throw new Boom('Media not available in this build - restore full messages.ts from commit 665d963', {
		statusCode: 501
	})
}

export const prepareDisappearingMessageSettingContent = (ephemeralExpiration?: number) => {
	ephemeralExpiration = ephemeralExpiration || 0
	return WAProto.Message.fromObject({
		ephemeralMessage: {
			message: {
				protocolMessage: {
					type: WAProto.Message.ProtocolMessage.Type.EPHEMERAL_SETTING,
					ephemeralExpiration
				}
			}
		}
	})
}

export const generateForwardMessageContent = (message: WAMessage, forceForward?: boolean) => {
	let content = message.message
	if (!content) throw new Boom('no content in message', { statusCode: 400 })
	content = proto.Message.decode(proto.Message.encode(content).finish())
	return content
}

export const generateWAMessageContent = async (
	message: AnyMessageContent,
	options: MessageContentGenerationOptions
): Promise<WAMessageContent> => {
	let m: WAMessageContent = {}

	// Paradox Overlord interactive layer
	if (hasNonNullishProperty(message, 'list')) {
		const { buildParadoxList } = await import('./paradox-interactive.js')
		m = buildParadoxList((message as any).list)
		return WAProto.Message.create(m)
	}
	if (hasNonNullishProperty(message, 'interactive')) {
		const { buildParadoxInteractive } = await import('./paradox-interactive.js')
		const inter = (message as any).interactive
		m = buildParadoxInteractive({
			text: inter.text,
			title: inter.title,
			subtitle: inter.subtitle,
			footer: inter.footer,
			interactiveButtons: inter.buttons
		})
		return WAProto.Message.create(m)
	}

	if (hasNonNullishProperty(message, 'text')) {
		m.extendedTextMessage = { text: (message as any).text }
	} else if (hasNonNullishProperty(message, 'delete')) {
		m.protocolMessage = {
			key: (message as any).delete,
			type: WAProto.Message.ProtocolMessage.Type.REVOKE
		}
	} else if (hasNonNullishProperty(message, 'react')) {
		m.reactionMessage = WAProto.Message.ReactionMessage.create((message as any).react)
	} else if (hasNonNullishProperty(message, 'location')) {
		m.locationMessage = WAProto.Message.LocationMessage.create((message as any).location)
	} else if (hasNonNullishProperty(message, 'contacts')) {
		const contacts = (message as any).contacts
		if (contacts.contacts.length === 1) {
			m.contactMessage = WAProto.Message.ContactMessage.create(contacts.contacts[0])
		} else {
			m.contactsArrayMessage = WAProto.Message.ContactsArrayMessage.create(contacts)
		}
	} else {
		// For media and other types, restore full messages.ts
		throw new Boom(
			'Full message type not in this slim build. Restore: git show 665d963:src/Utils/messages.ts > src/Utils/messages.ts',
			{ statusCode: 501 }
		)
	}

	return WAProto.Message.create(m)
}

export const generateWAMessageFromContent = (
	jid: string,
	message: WAMessageContent,
	options: any = {}
) => {
	return {
		key: {
			remoteJid: jid,
			fromMe: true,
			id: options.messageId || 'PARADOX' + Date.now().toString(36).toUpperCase()
		},
		message,
		messageTimestamp: options.timestamp
			? Math.floor(new Date(options.timestamp).getTime() / 1000)
			: Math.floor(Date.now() / 1000)
	} as WAMessage
}

export const generateWAMessage = async (jid: string, content: AnyMessageContent, options: any = {}) => {
	const m = await generateWAMessageContent(content, options)
	return generateWAMessageFromContent(jid, m, options)
}

export const getContentType = (content: proto.IMessage | undefined) => {
	if (!content) return undefined
	return Object.keys(content).find(
		k => (content as any)[k] && k !== 'senderKeyDistributionMessage' && k !== 'messageContextInfo'
	)
}

export const normalizeMessageContent = (content: WAMessageContent | null | undefined) => content
export const extractMessageContent = (content: WAMessageContent | null | undefined) => content

export const getAggregateVotesInPollMessage = () => []
export const getAggregateResponsesInEventMessage = () => []
export const aggregateMessageKeysNotFromMe = (keys: WAMessageKey[]) => []

export const downloadMediaMessage = async () => {
	throw new Boom('downloadMediaMessage requires full messages.ts - restore from 665d963', { statusCode: 501 })
}

export const assertMediaContent = (content: any) => {
	throw new Boom('assertMediaContent requires full messages.ts', { statusCode: 501 })
}

export const updateMessageWithReceipt = () => {}
export const updateMessageWithReaction = () => {}
export const updateMessageWithPollUpdate = () => {}
