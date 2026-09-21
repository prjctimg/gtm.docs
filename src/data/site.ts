import { KeybindingItem } from '../types';

export const IMAGES = {
  themesArt: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLBW2XDyCnRIENZAIHXngeZMEYUcRnInWY8F679xgggSQhIAubP8jw5RnJCneUWLb_STjUTjg4C4G2QYjjHEDlIuOW3OcfAAPgL4ybG86qirdB8wchC3BXxW-pLT5jt5B3GXqI8bg4xuNXRprik_bIzNAV7d1Whq-opKOk2q6SJEfczA9TyXMxbs0cYahoqJYi-44cyI_CJvvM5UtxwnXqiZl75kwcIzenHWzM8_wRFYHxCn2nvtOydTX-aIoVfWZbpA",
  libraryView1: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwH4KkygpN_ShbNAeSEDKI18dqsXnIOACTCCybSqRg7BFKz3NNyf0vM75xOrdMW29SUmYDboThSau9-lKxar1vdDiJ72HBg1WVv9YbZN_puegQPB1rBvK0YfWpWWFz8W9eQHEEp0uTUP_NaBgvC0kKelJnyhWhzXPLkZBkIsg-qo8oQyV-RUtoTRZsy_2PvEPKMK5Cyz8Kneu_tYd8cZGSy5AmZPEl-sJPNSDnpR1vCkBhHCdo3Eup9Fq9ZMhqs9NO3w",
  lyricsView1: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDYayxW79xe3NbEoVGWQ-cdzi2OCjnkRKYe0bAJUJx2fx4AHr1XYUBRyCAo5qWkYcEXcl0VFWunI2e5XN8aDejzIjhL4uIUO_g2TZypX-folzLokaaglHhygNxlxgTcDRXa6f7yIgOv3cV3uDjkOP_7GyvjNcTHeNCWjHzjTvC_7jvRIGERicztyJvYG_HE5jgqgXH42YXmTvzNXCHOcfmvNiNrRu_5M_nLyjRD5gxUPeevizXT5qWNRHgBlNU3aWeQA",
  libraryView2: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZv0l6ooxx_MK8lpGKmOjH1RASoLjAIP-chqizfDu6EWzM_SW7Nl0vpGG8G9KRzDtJwuzxqVL_CNZUBe0xHdm3SRghWsZkFfQCngqdG9rGVeMVXs3C3nf4P_zlDJKZHHDWhBY9mfpxFEBnL-av131vtwfDmXiBzDwHXlUQTjto9cVwzdda-Cr5-pfWN0F5FkQfoVAlx1ZmZBll4gTbrY6rHxzbWERVLmRUa48iztM5ze41Sufd-FsMyOjqsF38_FJ4Rw",
  lyricsView2: "https://lh3.googleusercontent.com/aida-public/AB6AXuDUAiMC3KvJmnK7ndpU0KD3_1bJFs92Axbi6gAWSp3CeV0tE9QGl-mNmWbO17XyxsUrxV8ohexgtuYveiOgQFpzq24nSV8i6hQ65x_1LcXXwS3VLni98uT5EqnF3mvfHtMBmlMWh6pk79ngAmLrEs9suctRnOsl2T93VSbV3MCRZ6h_hfRL7E0IqbeL5fqRik-kEb1IScy2NAs6ryTLFXGCoWCkL4jBPyFel6ezrlNGEZEtq1jEsLgjYn3I4WOqXkw-Rg"
};

/** Real default bindings, sourced from gtm/src/keymap.rs (`default_keybindings`). */
export const KEYBINDINGS: KeybindingItem[] = [
  { key: 'Space', action: 'Play / pause', scope: 'Global' },
  { key: 'n / p', action: 'Next / previous track', scope: 'Global' },
  { key: 'j / k', action: 'Cursor down / up', scope: 'List' },
  { key: 'Enter', action: 'Select / play', scope: 'List' },
  { key: ', / .', action: 'Seek backward / forward', scope: 'Normal' },
  { key: '+ / -', action: 'Volume up / down', scope: 'Normal' },
  { key: 'm', action: 'Toggle mute', scope: 'Normal' },
  { key: '> / <', action: 'Playback speed up / down', scope: 'Normal' },
  { key: 's', action: 'Stop', scope: 'Normal' },
  { key: 'r', action: 'Cycle repeat mode', scope: 'Normal' },
  { key: 'S', action: 'Toggle shuffle', scope: 'Normal' },
  { key: 'f', action: 'Toggle favourite', scope: 'Normal' },
  { key: '*', action: 'Love track on Last.fm', scope: 'Normal' },
  { key: '&', action: 'Toggle Last.fm scrobbling', scope: 'Normal' },
  { key: 'l', action: 'Fetch lyrics', scope: 'Normal' },
  { key: 'e', action: 'Edit metadata', scope: 'Normal' },
  { key: 'a / A', action: 'Add to queue / playlist', scope: 'Normal' },
  { key: 'x', action: 'Delete from list', scope: 'Normal' },
  { key: 'v', action: 'Toggle multiselect', scope: 'Normal' },
  { key: ':', action: 'Open command palette', scope: 'Normal' },
  { key: 'Tab', action: 'Next pane', scope: 'Normal' },
  { key: 'Ctrl+V', action: 'Toggle visualizer', scope: 'Normal' },
  { key: 'Alt+T', action: 'Toggle theme', scope: 'Normal' },
  { key: 'z', action: 'Toggle low-power mode', scope: 'Normal' },
  { key: '?', action: 'Toggle help', scope: 'Global' },
  { key: 'Q', action: 'Quit daemon', scope: 'Global' },
  { key: 'q', action: 'Quit client', scope: 'Global' },
];

/** Install methods documented by gtm.rs (README + crates.io). */
export const PACKAGE_COMMANDS = {
  curl: 'curl -fsSL https://gtmd.dev/install.sh | bash',
  cargo: 'cargo install gtm --locked',
  source: 'git clone https://github.com/prjctimg/gtm.rs && cd gtm.rs && cargo build --release',
  termux: 'make termux',
};
