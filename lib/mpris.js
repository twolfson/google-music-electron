// Load in our dependencies
var ipc = require('ipc');
var GoogleMusic = require('google-music');
var MprisService = require('mpris-service');

// Define a function to set up mpris
exports.init = function (gme) {
  // https://github.com/emersion/mpris-service/tree/a245730635b55c8eb06c605f4ece61e251f04e20
  // https://github.com/emersion/mpris-service/blob/a245730635b55c8eb06c605f4ece61e251f04e20/index.js
  var mpris = new MprisService({
    name: 'google-music-electron'
  });
  mpris.on('next', gme.controlNext);
  mpris.on('playpause', gme.controlPlayPause);
  mpris.on('previous', gme.controlPrevious);
  mpris.on('quit', gme.quitApplication);
  mpris.on('raise', gme.onRaise);
  // Currently, position, seek, and stop aren't supported due inability to test in Cinnamon (seems broken)
  // DEV: We choose to let the OS volume be controlled by MPRIS

  ipc.on('change:song', _.debounce(function handleSongChange (evt, songInfo) {
    // http://www.freedesktop.org/wiki/Specifications/mpris-spec/metadata/
    mpris.metadata = {
      'mpris:artUrl': songInfo.art,
      // Convert milliseconds to microseconds (1s = 1e3ms = 1e6µs)
      'mpris:length': songInfo.duration * 1e3,
      'xesam:album': songInfo.album,
      'xesam:artist': songInfo.artist,
      'xesam:title': songInfo.title
    };
  }));

  var playbackStrings = {};
  playbackStrings[GoogleMusic.Playback.PLAYING] = 'Playing';
  playbackStrings[GoogleMusic.Playback.PAUSED] = 'Paused';
  playbackStrings[GoogleMusic.Playback.STOPPED] = 'Stopped';
  ipc.on('change:playback', function handlePlaybackChange (evt, playbackState) {
    mpris.playbackStatus = playbackStrings[playbackState];
  });
};
