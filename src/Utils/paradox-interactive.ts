/**
 * Paradox Overlord Interactive Layer
 * Hard-baked branding + nested list-in-button + carousel helpers
 * Powered by: 𝕻𝖆𝖗𝖆𝖉𝖔𝖝 𝕺𝖛𝖊𝖗𝖑𝖔𝖗𝖉
 */

import { proto } from '../../WAProto/index.js'
import type { WAMessageContent } from '../Types'

export const PARADOX_BRAND = 'Powered by: 𝕻𝖆𝖗𝖆𝖉𝖔𝖝 𝕺𝖛𝖊𝖗𝖑𝖔𝖗𝖉'
export const PARADOX_FOOTER = '𝕻𝖆𝖗𝖆𝖉𝖔𝖝 𝕺𝖛𝖊𝖗𝖑𝖔𝖗𝖉'

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

/** Simple button shorthand used inside carousel cards */
export type ParadoxCardButton = {
	text: string
	id?: string
	url?: string
	call?: string
	copy?: string
	useWebview?: boolean
}

export type ParadoxCarouselCard = {
	/** Card title (header) */
	title?: string
	/** Card body / caption text */
	body?: string
	caption?: string
	/** Card footer (defaults to Paradox brand) */
	footer?: string
	/**
	 * Optional image for the card header.
	 * Pass a proto imageMessage object (after prepareWAMessageMedia) for real media,
	 * or a simple { url: string } placeholder.
	 */
	image?: { url: string } | Buffer | proto.Message.IImageMessage
	/** Native-flow buttons for this card (quick_reply / url / call / copy) */
	buttons?: ParadoxCardButton[]
	/** Alias for buttons */
	nativeFlow?: ParadoxCardButton[]
}

export type ParadoxCarouselOptions = {
	/** Main body text above the carousel */
	text?: string
	body?: string
	/** Footer under the carousel (defaults to Paradox brand) */
	footer?: string
	/** 2–10 cards */
	cards: ParadoxCarouselCard[]
}

/**
 * Build a classic list message (opens the bottom-sheet style list)
 */
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

/**
 * Build interactive message with native flow buttons
 * Supports nested single_select (list inside a button)
 */
export function buildParadoxInteractive(opts: ParadoxInteractiveOptions): WAMessageContent {
	const footer = opts.footer ?? PARADOX_BRAND
	return {
		interactiveMessage: {
			body: { text: opts.text },
			header: opts.title ? { title: opts.title, hasMediaAttachment: false } : undefined,
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

/**
 * Convert shorthand card buttons → nativeFlowButton entries
 */
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

/**
 * Build a single carousel card as InteractiveMessage
 */
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

	// Header with optional media
	const hasImage = !!card.image
	if (hasImage) {
		const img = card.image as any
		// Already a prepared imageMessage (has url + mediaKey or directPath)
		if (img && (img.mediaKey || img.directPath || img.url) && (img.mimetype || img.fileLength)) {
			interactive.header = {
				title: card.title || '',
				hasMediaAttachment: true,
				imageMessage: img as proto.Message.IImageMessage
			}
		} else if (img?.url || Buffer.isBuffer(img)) {
			// Placeholder — real upload should use prepareWAMessageMedia before send
			interactive.header = {
				title: card.title || '',
				hasMediaAttachment: false
			}
		} else {
			interactive.header = {
				title: card.title || '',
				hasMediaAttachment: false
			}
		}
	} else if (card.title) {
		interactive.header = {
			title: card.title,
			hasMediaAttachment: false
		}
	}

	return interactive
}

/**
 * Build carousel message (swipeable cards)
 * Matches the "Bug menu" / product-card style from screenshots
 *
 * Usage:
 *   const content = buildParadoxCarousel({
 *     text: 'Bug menu cmd',
 *     cards: [
 *       { title: 'Beta Bug', body: 'Fc-beta', buttons: [{ text: 'Run', id: 'fc_beta' }] },
 *       { title: 'Group Bug', body: 'Fc-group', buttons: [{ text: 'Run', id: 'fc_group' }] }
 *     ]
 *   })
 *   await sock.relayMessage(jid, content, {})
 *
 * For real images, prepare media first:
 *   const { imageMessage } = await prepareWAMessageMedia({ image: { url } }, { upload: sock.waUploadToServer, ... })
 *   cards: [{ title: '...', image: imageMessage, buttons: [...] }]
 */
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

/**
 * Ready-made "Bug menu" style carousel matching user screenshots
 */
export function buildBugMenuCarousel(options?: {
	title?: string
	footer?: string
}): WAMessageContent {
	return buildParadoxCarousel({
		text: options?.title || 'Bug menu cmd',
		footer: options?.footer ?? PARADOX_BRAND,
		cards: [
			{
				title: 'Beta Bug',
				body: 'Fc-beta · Betai · Crash-beta · Delay-beta',
				footer: PARADOX_FOOTER,
				buttons: [
					{ text: 'Fc-beta', id: 'fc_beta' },
					{ text: 'Crash-beta', id: 'crash_beta' }
				]
			},
			{
				title: 'Group Bug',
				body: 'Fc-group · Xgroup · Delay-all',
				footer: PARADOX_FOOTER,
				buttons: [
					{ text: 'Fc-group', id: 'fc_group' },
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
	})
}

/**
 * Helper to create a single_select (list-in-button) payload
 */
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

/**
 * Quick reply button
 */
export function makeQuickReply(displayText: string, id: string): ParadoxNativeFlowButton {
	return {
		name: 'quick_reply',
		buttonParamsJson: JSON.stringify({
			display_text: displayText,
			id
		})
	}
}

/**
 * CTA URL button
 */
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

/**
 * CTA call button
 */
export function makeCallButton(displayText: string, phoneNumber: string): ParadoxNativeFlowButton {
	return {
		name: 'cta_call',
		buttonParamsJson: JSON.stringify({
			display_text: displayText,
			phone_number: phoneNumber
		})
	}
}

/**
 * CTA copy button
 */
export function makeCopyButton(displayText: string, code: string): ParadoxNativeFlowButton {
	return {
		name: 'cta_copy',
		buttonParamsJson: JSON.stringify({
			display_text: displayText,
			copy_code: code
		})
	}
}

/**
 * Build a simple "AVAILABLE MENUS" style message that opens nested list
 * Matches the screenshot style the user showed
 */
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

/**
 * Convenience export for the brand string
 */
export const ParadoxBrand = {
	text: PARADOX_BRAND,
	footer: PARADOX_FOOTER,
	full: 'Powered by: 𝕻𝖆𝖗𝖆𝖉𝖔𝖝 𝕺𝖛𝖊𝖗𝖑𝖔𝖗𝖉'
}
