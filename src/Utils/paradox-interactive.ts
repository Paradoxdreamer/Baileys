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

export type ParadoxButton = {
	displayText: string
	id: string
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

export type ParadoxCarouselCard = {
	image?: { url: string } | Buffer
	caption?: string
	footer?: string
	title?: string
	nativeFlow?: Array<{ text: string; id?: string; url?: string; useWebview?: boolean }>
}

export type ParadoxCarouselOptions = {
	text?: string
	footer?: string
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
 * Helper to create a single_select (list-in-button) payload
 * This is the nested list that appears when user taps a button
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
