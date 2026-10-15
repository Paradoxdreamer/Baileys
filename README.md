# Paradox Overlord Baileys

**Fork of [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys)** for ParadoxGPT and custom bots.

**Powered by: 𝕻𝖆𝖗𝖆𝖉𝖔𝖝 𝕺𝖛𝖊𝖗𝖑𝖔𝖗𝖉**

> Upstream docs: [baileys.wiki](https://baileys.wiki) · [Migration guide](https://whiskey.so/migrate-latest)

## Install

```bash
yarn add github:Paradoxdreamer/Baileys
# or
npm install github:Paradoxdreamer/Baileys
```

```ts
import makeWASocket, {
  buildParadoxCarousel,
  buildParadoxCarouselAsync,
  buildBugMenuCarousel,
  buildAvailableMenusMessage,
  buildParadoxList,
  buildParadoxInteractive,
  makeSingleSelectButton,
  makeQuickReply,
  ParadoxBrand
} from 'baileys'
```

## Nested menus (list-in-button)

```ts
const content = buildAvailableMenusMessage({
  botName: 'ParadoxGPT',
  version: '2.0.0'
})
await sock.relayMessage(jid, content, {})
```

Fully custom list:

```ts
await sock.sendMessage(jid, {
  list: {
    text: 'Pick a category',
    title: 'My Bot',
    buttonText: 'All menus',
    sections: [{
      title: 'Main',
      rows: [
        { title: 'Owner menu', rowId: 'owner' },
        { title: 'General Commands', rowId: 'general' }
      ]
    }]
  }
})
```

## Carousel (custom names + images)

**Every title, body, and button label is yours** — pass whatever you need from ParadoxGPT or any other bot (`Fc-beta`, `Crash-beta`, product names, etc.).

### Without images

```ts
const content = buildParadoxCarousel({
  text: 'Bug menu cmd',
  cards: [
    {
      title: 'Beta Bug',
      body: 'Pick a beta action',
      buttons: [
        { text: 'Fc-beta', id: 'fc_beta' },
        { text: 'Crash-beta', id: 'crash_beta' },
        { text: 'Delay-beta', id: 'delay_beta' }
      ]
    },
    {
      title: 'Group Bug',
      body: 'Group actions',
      buttons: [
        { text: 'Fc-group', id: 'fc_group' },
        { text: 'Xgroup', id: 'xgroup' },
        { text: 'Delay-all', id: 'delay_all' }
      ]
    },
    {
      title: 'Contact me',
      body: 'Reach the owner',
      buttons: [{ text: 'Contact me', id: 'contact_owner' }]
    }
  ]
})
await sock.relayMessage(jid, content, {})
```

### With images

```ts
const content = await buildParadoxCarouselAsync(
  {
    text: 'Bug menu cmd',
    cards: [
      {
        title: 'Beta Bug',
        body: 'Fc-beta · Crash-beta · Delay-beta',
        image: { url: 'https://example.com/beta.jpg' }, // or Buffer
        buttons: [
          { text: 'Fc-beta', id: 'fc_beta' },
          { text: 'Crash-beta', id: 'crash_beta' }
        ]
      },
      {
        title: 'Group Bug',
        body: 'Fc-group · Delay-all',
        image: { url: 'https://example.com/group.jpg' },
        buttons: [
          { text: 'Fc-group', id: 'fc_group' },
          { text: 'Delay-all', id: 'delay_all' }
        ]
      }
    ]
  },
  { upload: sock.waUploadToServer }
)
await sock.relayMessage(jid, content, {})
```

### Preset (override anytime)

```ts
// Defaults (Fc-beta, Crash-beta, …)
await sock.relayMessage(jid, buildBugMenuCarousel(), {})

// Your own cards / names / images
await sock.relayMessage(
  jid,
  buildBugMenuCarousel({
    title: 'My menu',
    cards: [
      {
        title: 'Whatever you want',
        body: 'Any description',
        buttons: [{ text: 'Any label', id: 'any_id' }]
      }
    ]
  }),
  {}
)
```

## Branding

Footer is hard-baked as **Powered by: 𝕻𝖆𝖗𝖆𝖉𝖔𝖝 𝕺𝖛𝖊𝖗𝖑𝖔𝖗𝖉**.  
Override with `footer: '...'` on any builder if needed.

## Features

| Feature | Status |
|---------|--------|
| Nested list-in-button (`single_select`) | ✅ |
| Interactive native-flow buttons | ✅ |
| Carousel cards (fully custom names) | ✅ |
| Carousel image upload | ✅ `buildParadoxCarouselAsync` |
| Paradox Overlord branding | ✅ |
| Anti-ban hardening | 🔜 |

## Disclaimer

Not affiliated with WhatsApp. Use responsibly. Do not spam.

Upstream Baileys is maintained by the WhiskeySockets community. This fork adds Paradox Overlord interactive helpers on top.
