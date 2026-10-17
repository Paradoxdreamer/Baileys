/**
 * Paradox Overlord Interactive Layer
 * Hard-baked branding + nested list-in-button + carousel (with images)
 * Powered by: 𝕻𝖆𝖗𝖆𝖉𝖔𝖝 𝕺𝖛𝖊𝖗𝖑𝖔𝖗𝖉
 *
 * All card titles, body text, and button labels are fully custom —
 * pass whatever names you want from ParadoxGPT or any other bot.
 */

import { proto } from '../../WAProto/index.js'
import type { WAMessageContent } from '../Types'

export const PARADOX_BRAND = 'Powered by: 𝕻𝖆𝖗𝖆𝖉𝖔𝖝 𝕺𝖛𝖊𝖗𝖑𝖔𝖗𝖉'
export const PARADOX_FOOTER = '𝕻𝖆𝖗𝖆𝖉𝖔𝖝 𝕺𝖛𝖊𝖗𝖑𝖔𝖗𝖉'
/** Green chip on list rows (highlight_label) — same slot as "Powered by : Jimx" */
export const PARADOX_BADGE = 'Powered by: 𝕻𝖆𝖗𝖆𝖉𝖔𝖝 𝕺𝖛𝖊𝖗𝖑𝖔𝖗𝖉'

export type ParadoxListRow = {
	title: string
	rowId: string
	description?: string
	header?: string
}

export type ParadoxListSection = {
	title: string
	rows: ParadoxListRow[]
	highlight_label?: string
}

export type ParadoxListOptions = {
	text: string
	title?: string
	buttonText?: string
	footer?: string
	sections: ParadoxListSection[]
}

export type ParadoxNativeFlowButton = {
	name: 'quick_reply' | 'cta_url' | 'cta_call' | 'cta_copy' | 'single_select'
	buttonParamsJson: string
}

export type ParadoxInteractiveOptions = {
	text: string
	title?: string
	subtitle?: string
	footer?: string
	interactiveButtons: ParadoxNativeFlowButton[]
}

export type ParadoxCardButton = {
	text: string
	id?: string
	url?: string
	call?: string
	copy?: string
	useWebview?: boolean
}

export type ParadoxCarouselCard = {
	title?: string
	body?: string
	caption?: string
	footer?: string
	image?: { url: string } | Buffer | proto.Message.IImageMessage
	buttons?: ParadoxCardButton[]
	nativeFlow?: ParadoxCardButton[]
}

export type ParadoxCarouselOptions = {
	text?: string
	body?: string
	footer?: string
	cards: ParadoxCarouselCard[]
}

export function buildParadoxList(opts: ParadoxListOptions): WAMessageContent {
	const footer = opts.footer ?? PARADOX_BRAND
	return {
		listMessage: {
			title: opts.title || 'Menu',
			description: opts.text,
			buttonText: opts.buttonText || 'All menus',
			listType: proto.Message.ListMessage.ListType.SINGLE_SELECT,
			sections: opts.sections.map(s => ({
				title: s.title,
				highlight_label: s.highlight_label,
				rows: s.rows.map(r => ({
					title: r.title,
					rowId: r.rowId,
					description: r.description || '',
					header: r.header
				}))
			})),
			footerText: footer
		}
	}
}

export function buildParadoxInteractive(opts: ParadoxInteractiveOptions): WAMessageContent {
	const footer = opts.footer ?? PARADOX_BRAND
	return {
		interactiveMessage: {
			body: { text: opts.text },
			header: opts.title
				? { title: opts.title, subtitle: opts.subtitle || '', hasMediaAttachment: false }
				: undefined,
			footer: { text: footer },
			nativeFlowMessage: {
				buttons: opts.interactiveButtons.map(b => ({
					name: b.name,
					buttonParamsJson: b.buttonParamsJson
				})),
				messageParamsJson: JSON.stringify({ from: 'paradox-overlord' })
			}
		}
	}
}

function cardButtonsToNativeFlow(buttons: ParadoxCardButton[] = []): ParadoxNativeFlowButton[] {
	return buttons.map(b => {
		if (b.url) {
			return {
				name: 'cta_url' as const,
				buttonParamsJson: JSON.stringify({
					display_text: b.text,
					url: b.url,
					merchant_url: b.url,
					webview_interaction: !!b.useWebview
				})
			}
		}
		if (b.call) {
			return {
				name: 'cta_call' as const,
				buttonParamsJson: JSON.stringify({
					display_text: b.text,
					phone_number: b.call
				})
			}
		}
		if (b.copy) {
			return {
				name: 'cta_copy' as const,
				buttonParamsJson: JSON.stringify({
					display_text: b.text,
					copy_code: b.copy
				})
			}
		}
		return {
			name: 'quick_reply' as const,
			buttonParamsJson: JSON.stringify({
				display_text: b.text,
				id: b.id || b.text
			})
		}
	})
}

function isPreparedImageMessage(img: any): img is proto.Message.IImageMessage {
	if (!img || typeof img !== 'object') return false
	return !!(img.mediaKey || img.directPath || (img.url && img.mimetype) || img.fileSha256)
}

function buildCarouselCard(card: ParadoxCarouselCard): proto.Message.IInteractiveMessage {
	const bodyText = card.body || card.caption || card.title || ''
	const footerText = card.footer ?? PARADOX_FOOTER
	const btns = card.buttons || card.nativeFlow || []
	const nativeButtons = cardButtonsToNativeFlow(btns)

	const interactive: proto.Message.IInteractiveMessage = {
		body: { text: bodyText },
		footer: { text: footerText },
		nativeFlowMessage: {
			buttons: nativeButtons.map(b => ({
				name: b.name,
				buttonParamsJson: b.buttonParamsJson
			})),
			messageParamsJson: JSON.stringify({ from: 'paradox-overlord' })
		}
	}

	if (card.image && isPreparedImageMessage(card.image)) {
		interactive.header = {
			title: card.title || '',
			hasMediaAttachment: true,
			imageMessage: card.image
		}
	} else if (card.title) {
		interactive.header = {
			title: card.title,
			hasMediaAttachment: false
		}
	}

	return interactive
}

export function buildParadoxCarousel(opts: ParadoxCarouselOptions): WAMessageContent {
	if (!opts.cards?.length) {
		throw new Error('Paradox carousel requires at least 1 card')
	}
	if (opts.cards.length > 10) {
		throw new Error('Paradox carousel supports max 10 cards')
	}

	const bodyText = opts.text || opts.body || ''
	const footer = opts.footer ?? PARADOX_BRAND

	return {
		interactiveMessage: {
			body: bodyText ? { text: bodyText } : undefined,
			footer: { text: footer },
			carouselMessage: {
				cards: opts.cards.map(buildCarouselCard),
				messageVersion: 1
			}
		}
	}
}

export async function buildParadoxCarouselAsync(
	opts: ParadoxCarouselOptions,
	mediaOpts: {
		upload: (encFilePath: string, opts: any) => Promise<{ mediaUrl: string; directPath: string }>
		logger?: any
		mediaUploadTimeoutMs?: number
		options?: RequestInit
	}
): Promise<WAMessageContent> {
	const { prepareWAMessageMedia } = await import('./messages.js')

	const resolvedCards: ParadoxCarouselCard[] = []
	for (const card of opts.cards) {
		const next: ParadoxCarouselCard = { ...card }
		const img = card.image
		if (img && !isPreparedImageMessage(img)) {
			const mediaInput =
				typeof img === 'object' && 'url' in (img as any)
					? { image: img as { url: string } }
					: { image: img as Buffer }
			const prepared = await prepareWAMessageMedia(mediaInput as any, {
				upload: mediaOpts.upload,
				logger: mediaOpts.logger,
				mediaUploadTimeoutMs: mediaOpts.mediaUploadTimeoutMs,
				options: mediaOpts.options
			})
			if (prepared.imageMessage) {
				next.image = prepared.imageMessage
			}
		}
		resolvedCards.push(next)
	}

	return buildParadoxCarousel({
		...opts,
		cards: resolvedCards
	})
}

export function buildBugMenuCarousel(options?: {
	title?: string
	footer?: string
	cards?: ParadoxCarouselCard[]
}): WAMessageContent {
	const defaultCards: ParadoxCarouselCard[] = [
		{
			title: 'Beta Bug',
			body: 'Fc-beta · Betai · Crash-beta · Delay-beta',
			footer: PARADOX_FOOTER,
			buttons: [
				{ text: 'Fc-beta', id: 'fc_beta' },
				{ text: 'Betai', id: 'betai' },
				{ text: 'Crash-beta', id: 'crash_beta' },
				{ text: 'Delay-beta', id: 'delay_beta' }
			]
		},
		{
			title: 'Group Bug',
			body: 'Fc-group · Xgroup · Delay-all',
			footer: PARADOX_FOOTER,
			buttons: [
				{ text: 'Fc-group', id: 'fc_group' },
				{ text: 'Xgroup', id: 'xgroup' },
				{ text: 'Delay-all', id: 'delay_all' }
			]
		},
		{
			title: 'Contact me',
			body: 'Reach the owner',
			footer: PARADOX_FOOTER,
			buttons: [{ text: 'Contact me', id: 'contact_owner' }]
		}
	]

	return buildParadoxCarousel({
		text: options?.title || 'Bug menu cmd',
		footer: options?.footer ?? PARADOX_BRAND,
		cards: options?.cards || defaultCards
	})
}

export function makeSingleSelectButton(
	displayText: string,
	listTitle: string,
	sections: ParadoxListSection[]
): ParadoxNativeFlowButton {
	return {
		name: 'single_select',
		buttonParamsJson: JSON.stringify({
			title: listTitle,
			sections: sections.map(s => ({
				title: s.title,
				highlight_label: s.highlight_label,
				rows: s.rows.map(r => ({
					header: r.header || '',
					title: r.title,
					description: r.description || '',
					id: r.rowId
				}))
			}))
		})
	}
}

export function makeQuickReply(displayText: string, id: string): ParadoxNativeFlowButton {
	return {
		name: 'quick_reply',
		buttonParamsJson: JSON.stringify({ display_text: displayText, id })
	}
}

export function makeUrlButton(displayText: string, url: string): ParadoxNativeFlowButton {
	return {
		name: 'cta_url',
		buttonParamsJson: JSON.stringify({
			display_text: displayText,
			url,
			merchant_url: url
		})
	}
}

export function makeCallButton(displayText: string, phoneNumber: string): ParadoxNativeFlowButton {
	return {
		name: 'cta_call',
		buttonParamsJson: JSON.stringify({
			display_text: displayText,
			phone_number: phoneNumber
		})
	}
}

export function makeCopyButton(displayText: string, code: string): ParadoxNativeFlowButton {
	return {
		name: 'cta_copy',
		buttonParamsJson: JSON.stringify({
			display_text: displayText,
			copy_code: code
		})
	}
}

export function buildAvailableMenusMessage(options?: {
	botName?: string
	version?: string
	sections?: ParadoxListSection[]
}): WAMessageContent {
	const botName = options?.botName || 'ParadoxGPT'
	const version = options?.version || '2.0.0'
	const sections = options?.sections || [
		{
			title: 'Main',
			highlight_label: PARADOX_BADGE,
			rows: [
				{ title: 'All available menus', rowId: 'all_menus', description: 'Show everything' },
				{ title: 'Owner menu', rowId: 'owner_menu', description: 'All owner commands' },
				{ title: 'General Commands Menu', rowId: 'general_menu', description: 'Quick access menu' }
			]
		}
	]

	return buildParadoxInteractive({
		text: `Bot Version: ${version}\n\nSELECT A CATEGORY BELOW:`,
		title: botName,
		footer: PARADOX_BRAND,
		interactiveButtons: [
			makeSingleSelectButton('AVAILABLE MENUS', 'Select a menu', sections),
			makeQuickReply('BOT STATS', 'bot_stats'),
			makeQuickReply('BOT INFO', 'bot_info'),
			makeQuickReply('Menu list', 'menu_list')
		]
	})
}

export const ParadoxBrand = {
	text: PARADOX_BRAND,
	footer: PARADOX_FOOTER,
	badge: PARADOX_BADGE,
	full: 'Powered by: 𝕻𝖆𝖗𝖆𝖉𝖔𝖝 𝕺𝖛𝖊𝖗𝖑𝖔𝖗𝖉'
}

export function getParadoxBizNode(message?: any): {
	tag: string
	attrs: Record<string, string>
	content?: any[]
} {
	const ts = Math.floor(Date.now() / 1000).toString()
	const baseAttrs = {
		actual_actors: '2',
		host_storage: '2',
		privacy_mode_ts: ts
	}

	const im = message?.interactiveMessage || message
	const nativeFlow = im?.nativeFlowMessage
	const firstName = nativeFlow?.buttons?.[0]?.name
	const isCarousel = !!im?.carouselMessage
	const isList = !!message?.listMessage

	if (isCarousel || nativeFlow || isList) {
		return {
			tag: 'biz',
			attrs: baseAttrs,
			content: [
				{
					tag: 'interactive',
					attrs: { type: 'native_flow', v: '1' },
					content: [
						{
							tag: 'native_flow',
							attrs: {
								v: '9',
								name: firstName && !isCarousel ? String(firstName) : 'mixed'
							}
						}
					]
				},
				{
					tag: 'quality_control',
					attrs: { source_type: 'third_party' }
				}
			]
		}
	}

	return { tag: 'biz', attrs: baseAttrs }
}

export async function relayParadoxMessage(
	sock: { relayMessage: (jid: string, content: any, opts?: any) => Promise<any> },
	jid: string,
	content: WAMessageContent,
	opts: any = {}
) {
	const nodes = opts.additionalNodes || []
	const biz = getParadoxBizNode(content)
	return sock.relayMessage(jid, content, {
		...opts,
		additionalNodes: [...nodes, biz]
	})
}
