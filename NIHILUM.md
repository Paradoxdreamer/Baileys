# Nihilum foundation (Paradox Baileys)

Opt-in layer for **Paradox-Nihilum** attacks and richer menus.
**Default Baileys paths unchanged** — ParadoxGPT and normal bots keep working.

## Import

```ts
import makeWASocket from '@paradoxdreamer/baileys'
import { Nihilum, attachNihilum } from '@paradoxdreamer/baileys/lib/Nihilum'
// after build, path follows your export layout
```

Or attach on connect:

```ts
const sock = makeWASocket({ ... })
attachNihilum(sock)
// sock.nihilum.relayRaw / sendBurst / sendSingleSelect / sendNativeFlow / sendChannelInviteButton
```

## APIs

| helper | use |
|--------|-----|
| `relayRaw` | any WAMessageContent + additionalNodes |
| `sendBurst` | concurrent task runner |
| `sendSingleSelect` | SSL list menus (classic list + native flow fallback) |
| `sendNativeFlow` | quick_reply / cta_url / cta_copy / etc |
| `sendChannelInviteButton` | channel-style CTA + forwardedNewsletterMessageInfo into chat/group |
| `bizInteractiveNodes` | standard biz native_flow nodes |

## Channel admin invite → group crash?

Unverified. Some clients historically mis-rendered channel/newsletter invite CTAs inside groups. Emitting the **shape** is supported; **crash is not guaranteed** and depends on target client build. Server may strip invalid admin invites.

## Publish

After `yarn build`, publish `@paradoxdreamer/baileys@next` so NIHILUM picks it up via:

```json
"@whiskeysockets/baileys": "npm:@paradoxdreamer/baileys@next"
```
