import { Boom } from '@hapi/boom'
import { randomBytes } from 'crypto'
import { promises as fs } from 'fs'
import { type Transform } from 'stream'
import { proto } from '../../WAProto/index.js'
import {
	CALL_AUDIO_PREFIX,
	CALL_VIDEO_PREFIX,
	MEDIA_KEYS,
	type MediaType,
	URL_REGEX,
	WA_DEFAULT_EPHEMERAL
} from '../Defaults'
import type {
	AnyMediaMessageContent,
	AnyMessageContent,
	DownloadableMessage,
	MessageContentGenerationOptions,
	MessageGenerationOptions,
	MessageGenerationOptionsFromContent,
	MessageUserReceipt,
	MessageWithContextInfo,
	WAMediaUpload,
	WAMessage,
	WAMessageContent,
	WAMessageKey,
	WATextMessage
} from '../Types'
import { WAMessageStatus, WAProto } from '../Types'
import { isJidGroup, isJidNewsletter, isJidStatusBroadcast, jidNormalizedUser } from '../WABinary'
import { sha256 } from './crypto'
import { generateMessageIDV2, getKeyAuthor, unixTimestampSeconds } from './generics'
import type { ILogger } from './logger'
import {
	downloadContentFromMessage,
	encryptedStream,
	generateThumbnail,
	getAudioDuration,
	getAudioWaveform,
	getRawMediaUploadData,
	type MediaDownloadOptions
} from './messages-media'
import { shouldIncludeReportingToken } from './reporting-utils'

// NOTE: Full file temporarily truncated during restore - will be fully restored + patched in next commit
export const extractUrlFromText = (text: string) => text.match(URL_REGEX)?.[0]
export const hasNonNullishProperty = () => false
export const generateWAMessageContent = async () => ({})
export const generateWAMessageFromContent = () => ({})
export const generateWAMessage = async () => ({})
export const getContentType = () => undefined
export const normalizeMessageContent = (c: any) => c
export const extractMessageContent = (c: any) => c
export const getAggregateVotesInPollMessage = () => []
export const downloadMediaMessage = async () => Buffer.alloc(0)
export const assertMediaContent = (c: any) => c
