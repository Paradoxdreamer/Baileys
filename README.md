# Paradox Overlord Baileys (Hybrid)

**Fork of [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys)** + best of **@alannxd/baileys**-style interactive DX.

**Powered by: 𝕻𝖆𝖗𝖆𝖉𝖔𝖝 𝕺𝖛𝖊𝖗𝖑𝖔𝖗𝖉**

> Upstream: [baileys.wiki](https://baileys.wiki)

## Install

```bash
yarn add github:Paradoxdreamer/Baileys
```

```json
{
  "dependencies": {
    "@whiskeysockets/baileys": "github:Paradoxdreamer/Baileys"
  }
}
```

## Hybrid features

| Feature | Source | Status |
|---------|--------|--------|
| `interactiveButtons` + media header via `sendMessage` | alannxd-style | ✅ |
| Nested list-in-button / single_select | Paradox | ✅ |
| Carousel cards (custom names) | Paradox | ✅ |
| Carousel with image upload | Paradox | ✅ |
| `cards` alias on sendMessage | hybrid | ✅ |
| Biz / native_flow nodes helper | hybrid | ✅ |
| Paradox Overlord branding | Paradox | ✅ |
| Anti-ban hardening | — | 🔜 |

### 1) alannxd-style interactiveButtons

```ts
await sock.sendMessage(jid, {
  text: 'Choose an option',
  title: 'ParadoxGPT',
  image: { url: 'https://example.com/header.jpg' },
  interactiveButtons: [
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({ display_text: 'Stats', id: 'bot_stats' })
    },
    {
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: 'All menus',
        sections: [{ title: 'Main', rows: [{ title: 'Owner', id: 'owner' }] }]
      })
    }
  ]
})
```

### 2) Carousel with images

```ts
import { buildParadoxCarouselAsync, relayParadoxMessage } from 'baileys'

const content = await buildParadoxCarouselAsync(
  {
    text: 'Bug menu cmd',
    cards: [
      {
        title: 'Beta Bug',
        image: { url: 'https://example.com/beta.jpg' },
        buttons: [
          { text: 'Fc-beta', id: 'fc_beta' },
          { text: 'Crash-beta', id: 'crash_beta' }
        ]
      }
    ]
  },
  { upload: sock.waUploadToServer }
)
await relayParadoxMessage(sock, jid, content)
```

### 3) Nested menus

```ts
import { buildAvailableMenusMessage, relayParadoxMessage } from 'baileys'
await relayParadoxMessage(sock, jid, buildAvailableMenusMessage({ botName: 'ParadoxGPT' }))
```

Default footer: **Powered by: 𝕻𝖆𝖗𝖆𝖉𝖔𝖝 𝕺𝖛𝖊𝖗𝖑𝖔𝖗𝖉**
