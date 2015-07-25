// Load in our dependencies
var ipc = require('ipc');
var GoogleMusic = require('google-music');
var MprisService = require('mpris-service');

// Define a function to set up mpris
exports.init = function (gme) {
  // https://github.com/emersion/mpris-service/tree/a245730635b55c8eb06c605f4ece61e251f04e20
  var mpris = new MprisService({
    name: 'google-music-electron'
  });
  mpris.on('next', gme.controlNext);
  mpris.on('playpause', gme.controlPlayPause);
  mpris.on('previous', gme.controlPrevious);
  mpris.on('quit', gme.quitApplication);
  mpris.on('raise', gme.onRaise);
  // TODO: Support position
  // TODO: Support seek
  // TODO: Support stop
  // TODO: Support volume

  ipc.on('change:song', function handleSongChange (evt, songInfo) {
    mpris.metadata = {
      'xesam:title': songInfo.title,
      'xesam:artist': songInfo.artist,
      'xesam:album': songInfo.album
    };
  });

  var playbackStrings = {};
  playbackStrings[GoogleMusic.Playback.PLAYING] = 'Playing';
  playbackStrings[GoogleMusic.Playback.PAUSED] = 'Paused';
  playbackStrings[GoogleMusic.Playback.STOPPED] = 'Stopped';
  ipc.on('change:playback', function handlePlaybackChange (evt, playbackState) {
    mpris.playbackStatus = playbackStrings[playbackState];
  });
};
