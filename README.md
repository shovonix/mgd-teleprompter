# Space Prompter

A self-hosted, single-file teleprompter for video shoots. Live at https://studio.shovonix.dev

- **Dual Monitor** mode: a control window plus a mirrored Stage window on a second display (built).
- **Single Monitor, Tablet, Mobile** modes: coming.
- Inline script editing, multiple saved scripts, Bluetooth pedal keys, live stage preview.
- Keys: `Space` play/pause, double `Space` previous paragraph, hold `Space` jump to top, `F` full screen.

Everything lives in `index.html`; there is no build step. Scripts and settings are stored in the browser (`localStorage`).
- **Pair phone / tablet (QR)**: in Mobile/Tablet mode on a desktop, a QR opens the same script on the device, keeps it live, and lets either device play/pause. Needs the relay in `relay/` (see `relay/INSTALL.md`); traffic is end-to-end encrypted.
- **Controls**: Rotate 90°, Flip H, Flip V, text alignment.
