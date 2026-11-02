# Nihilum foundation (Paradox Baileys)

Opt-in layer for **Paradox-Nihilum**. Default Baileys behavior unchanged for ParadoxGPT.

## Auto-attach

`makeWASocket()` attaches `sock.nihilum` automatically (safe try/catch).

```ts
const sock = makeWASocket({ ... })
sock.nihilum.relayRaw(jid, content, { additionalNodes })
sock.nihilum.sendBurst(tasks, 8)
sock.nihilum.sendSingleSelect(jid, { text, sections })
sock.nihilum.sendNativeFlow(jid, { body, buttons })
sock.nihilum.sendChannelInviteButton(jid, { newsletterJid, ... })
sock.nihilum.sendCallOffer(jid, { count: 5, video: false })
sock.nihilum.sendNodeRaw(node)
```

Also:

```ts
import { Nihilum, attachNihilum } from '@paradoxdreamer/baileys'
```

## Channel invite crash

Shape supported; crash not guaranteed. Server may drop invalid channel admin invites.

## Publish

```bash
yarn build
# publish @paradoxdreamer/baileys@next
```

NIHILUM depends on `npm:@paradoxdreamer/baileys@next`.
