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
  // TODO: Support HasTrackList
  // TODO: Support position
  // TODO: Support seek
  // TODO: Support stop
  // TODO: Support volume

  ipc.on('change:song', function handleSongChange (evt, songInfo) {
    // http://www.freedesktop.org/wiki/Specifications/mpris-spec/metadata/
    console.log(songInfo.duration, typeof songInfo.duration);
    mpris.metadata = {
      'mpris:artUrl': songInfo.art,
      'mpris:length': songInfo.duration >>> 0,
      'xesam:album': songInfo.album,
      'xesam:artist': songInfo.artist,
      'xesam:title': songInfo.title
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
