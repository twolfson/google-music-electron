# google-music-electron changelog
2.13.0 - Fixed navigation arrow size for new Google Music UI

2.12.1 - Corrected forward/back enabled/disabled after page reload

2.12.0 - Added enabling/disabling of forward/back buttons when available/not

2.11.0 - Followed back rename of `gmusic.js` to  `google-music`

2.10.1 - Repaired `google-music-electron` failing to launch due to a lack of `window-info`

2.10.0 - Added window size/location preservation via @JordanRobinson in #42

2.9.0 - Updated deprecated requires and Electron methods

2.8.0 - Added Edit menu for OS X editing support via @chushao in #36

2.7.0 - Upgraded to `electron@0.36.2` to patch OS specific crashes. Fixes #29

2.6.0 - Relocated `install-mpris` command from running inside `electron` to `node` launcher (part of #25)

2.5.1 - Followed renamed `google-music` to `gmusic.js`

2.5.0 - Upgraded to `google-music@3.3.0` to receive error noise patches

2.4.0 - Increased `min-width` of arrow container to prevent shrinking arrows. Fixes #26

2.3.0 - Added truncation to tooltip to stop Windows crashes. Fixes #24

2.2.1 - Corrected license to SPDX format by @execat in #23

2.2.0 - Added support for `paper-icon-button` navigation

2.1.1 - Upgraded `electron-rebuild` to fix `node@4.0` (in Electron) issues

2.1.0 - Upgraded to `google-music-electron@3.2.0` for cross-version selectors and added `setTimeout` loop for binding initialization

2.0.1 - Added `Node.js` version to about window

2.0.0 - Moved to using single instance by default. Fixes #19

1.23.1 - Repaired respecting CLI overrides

1.23.0 - Added CLI options to preferences

1.22.0 - Added configuration bindings for shortcuts

1.21.0 - Upgraded to `electron@0.34.0` to pick up Windows hide patches. Fixes #16

1.20.0 - Added `icon` to browser window. Fixes #17

1.19.1 - Added `foundry` for release

1.19.0 - Repaired missing forward/back buttons

1.18.1 - Added newsletter subscription to README.md

1.18.0 - Upgraded to `google-music@3.1.0` to repair duplicate playback events and detect stops

1.17.2 - Repaired lint error

1.17.1 - Updated MPRIS screenshot

1.17.0 - Added playback time tracking for MPRIS

1.16.0 - Added album art, duration, exit, and raise events/actions to MPRIS

1.15.0 - Added MPRIS support via @jck in #10

1.14.1 - Added documentation on how to upgrade via @Q11x in #9

1.14.0 - Added "Forward/Back" navigation buttons. Fixed #6

1.13.0 - Added `--minimize-to-tray` via @kempniu in #8

1.12.0 - Added `--hide-via-tray` CLI option

1.11.0 - Upgraded to `electron@0.26.1` and added tray click for minimization

1.10.1 - Added documentation for development

1.10.0 - Repaired separator menu bug for OSX via @arboleya in #5. Fixes #4

1.9.0 - Added support for Chromium flags

1.8.0 - Added debug repl option

1.7.0 - Refactored again to keep all application state/methods under one roof

1.6.0 - Repaired bug with restoring minimized window from tray

1.5.1 - Updated CLI documentation

1.5.0 - Added `winston` as our logger

1.4.0 - Repaired electron PATH issues

1.3.0 - Added `--version` and `--skip-taskbar` support

1.2.0 - Added menu item for show/hide application window

1.1.0 - Abstracted menu/tray/shortcut hooks into separate modules

1.0.1 - Added missing bin script

1.0.0 - Initial release
