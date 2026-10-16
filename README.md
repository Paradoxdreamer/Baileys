# Paradox Overlord Baileys

**Fork of [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys)** with a full interactive layer for ParadoxGPT and related bots.

**Powered by: 𝕻𝖆𝖗𝖆𝖉𝖔𝖝 𝕺𝖛𝖊𝖗𝖑𝖔𝖗𝖉**

> Upstream docs: [baileys.wiki](https://baileys.wiki)

## Install

```bash
yarn add github:Paradoxdreamer/Baileys
# or
npm install github:Paradoxdreamer/Baileys
```

```json
{
  "dependencies": {
    "@whiskeysockets/baileys": "github:Paradoxdreamer/Baileys"
  }
}
```

## Features

| Feature | Status |
|---------|--------|
| `interactiveButtons` + media header via `sendMessage` | ✅ |
| Nested list-in-button / `single_select` | ✅ |
| Carousel cards (any custom names) | ✅ |
| Carousel with image upload | ✅ |
| `cards` alias on `sendMessage` | ✅ |
| Biz / `native_flow` relay helper | ✅ |
| Paradox Overlord branding (baked in) | ✅ |
| Anti-ban hardening | 🔜 |

## Usage

### Interactive buttons (with optional image header)

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
        sections: [
          {
            title: 'Main',
            rows: [{ title: 'Owner menu', id: 'owner' }]
          }
        ]
      })
    }
  ]
})
```

`text` + `interactiveButtons` on the same object works — interactive handlers run before plain text.

### Carousel with images

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
      },
      {
        title: 'Group Bug',
        buttons: [
          { text: 'Fc-group', id: 'fc_group' },
          { text: 'Xgroup', id: 'xgroup' }
        ]
      }
    ]
  },
  { upload: sock.waUploadToServer }
)

await relayParadoxMessage(sock, jid, content)
```

Or via `sendMessage`:

```ts
await sock.sendMessage(jid, {
  text: 'Menus',
  cards: [
    {
      title: 'Beta Bug',
      buttons: [{ text: 'Fc-beta', id: 'fc_beta' }]
    }
  ]
})
```

Card titles and button labels are fully custom — pass whatever you use in ParadoxGPT.

### Nested menus (available menus style)

```ts
import { buildAvailableMenusMessage, relayParadoxMessage } from 'baileys'

await relayParadoxMessage(
  sock,
  jid,
  buildAvailableMenusMessage({ botName: 'ParadoxGPT', version: '2.0.0' })
)
```

### Helpers

```ts
import {
  buildParadoxList,
  buildParadoxInteractive,
  buildParadoxCarousel,
  buildParadoxCarouselAsync,
  buildBugMenuCarousel,
  buildAvailableMenusMessage,
  makeSingleSelectButton,
  makeQuickReply,
  makeUrlButton,
  makeCallButton,
  makeCopyButton,
  getParadoxBizNode,
  relayParadoxMessage,
  ParadoxBrand,
  PARADOX_BRAND
} from 'baileys'
```

Default footer on interactive menus and carousels:

**Powered by: 𝕻𝖆𝖗𝖆𝖉𝖔𝖝 𝕺𝖛𝖊𝖗𝖑𝖔𝖗𝖉**

## Notes

- This is an **ESM** package (`"type": "module"`). Use `import`, not `require`.
- Depends on `whatsapp-rust-bridge` for the noise handshake — needs a matching native binary on the host.
- Prefer `relayParadoxMessage` (or `additionalNodes` from `getParadoxBizNode`) when sending interactive / carousel content for reliable client rendering.
