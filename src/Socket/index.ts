import { DEFAULT_CONNECTION_CONFIG } from '../Defaults'
import type { UserFacingSocketConfig } from '../Types'
import { attachNihilum } from '../Nihilum/index'
import { makeCommunitiesSocket } from './communities'

// export the last socket layer
const makeWASocket = (config: UserFacingSocketConfig) => {
	const newConfig = {
		...DEFAULT_CONNECTION_CONFIG,
		...config
	}

	const sock = makeCommunitiesSocket(newConfig)
	// Opt-in foundation for Nihilum / advanced menus — does not change stock send paths
	try {
		attachNihilum(sock as any)
	} catch {
		// never break normal bots if nihilum attach fails
	}
	return sock
}

export default makeWASocket
