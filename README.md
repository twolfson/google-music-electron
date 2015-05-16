# google-music-electron [![Build status](https://travis-ci.org/twolfson/google-music-electron.png?branch=master)](https://travis-ci.org/twolfson/google-music-electron)

// TODO: Use window menus from https://github.com/atom/electron-starter/blob/1cb0432acb5f0bb8270aa0d4345e45bded0f0f7f/src/browser/appmenu.coffee#L15-L16
// TODO: Change tray icon with playback changes
// TODO: Handle minimize/maximize as tray menu icon
// TODO: Handle minimize/maximize as tray menu click
// TODO: Set up media shortcuts
// TODO: Handle minimize/maximize normally with tray interaction being min/max to start
// TODO: Add on Amarok interaction with `--close-to-tray` option which closes the window but keeps everything running in the tray
//   Upon thinking further, we might need to make the option more `--hide-in-taskbar` or not since Google Music can't really play in the background =/

Desktop app for [Google Music][] on top of [Electron][]

This was written as a successsor to [google-music-webkit][]. When upgrading between versions of [nw.js][], there were regressions with taskbar and shortcut bindings. We are hoping there are less scenarios like that with [Electron][].

[Google Music]: https://play.google.com/music/listen
[Electron]: http://electron.atom.io/
[google-music-webkit]: https://github.com/twolfson/google-music-webkit
[nw.js]: https://github.com/nwjs/nw.js

## Getting Started
Install the module with: `npm install google-music-electron`

```js
var googleMusicElectron = require('google-music-electron');
googleMusicElectron(); // 'awesome'
```

## Documentation
_(Coming soon)_

### Icons
Source images are kept in the `resources/` folder. Icons are maintained via Inkscape and the `play/pause` buttons are isolated in layers.

To generate icons:

1. Export each of the play/pause/clean variants as a `.svg` file
2. Load the icons via GIMP as a 32x32 SVG
3. Export via GIMP as a `.png`

At the time of writing, Inkscape and Image Magick seemed to be generating non-transparent backgrounds upon converting SVG to PNG.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via `npm run lint` and test via `npm test`.

## Donating
Support this project and [others by twolfson][gratipay] via [gratipay][].

[![Support via Gratipay][gratipay-badge]][gratipay]

[gratipay-badge]: https://cdn.rawgit.com/gratipay/gratipay-badge/2.x.x/dist/gratipay.png
[gratipay]: https://www.gratipay.com/twolfson/

## Attribution
Headphones designed by Jake Dunham from [the Noun Project][headphones-icon]

[headphones-icon]: http://thenounproject.com/term/headphones/16097/

## Unlicense
As of May 16 2015, Todd Wolfson has released this repository and its contents to the public domain.

It has been released under the [UNLICENSE][].

[UNLICENSE]: UNLICENSE
