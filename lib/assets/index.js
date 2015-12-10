module.exports = {
  darwin: {
    icon: __dirname + '/darwin-icon.png',
    playing: __dirname + '/darwin-icon-playing.png',
    paused: __dirname + '/darwin-icon-paused.png'
  },
  win32: {
    // Can use darwin icons, because sizes are the same
    icon: __dirname + '/darwin-icon.png',
    playing: __dirname + '/darwin-icon-playing.png',
    paused: __dirname + '/darwin-icon-paused.png'
  },
  any: {
    icon: __dirname + '/icon.png',
    playing: __dirname + '/icon-playing.png',
    paused: __dirname + '/icon-paused.png'
  }
};
