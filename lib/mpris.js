// Load in our dependencies
var ipc = require('ipc');
var GoogleMusic = require('google-music');
var MprisService = require('mpris-service');

// Define a function to set up mpris
exports.init = function (gme) {
  var mpris = new MprisService({
    name: 'google-music-electron'
  });
  mpris.on('playpause', gme.controlPlayPause);
  mpris.on('next', gme.controlNext);
  mpris.on('previous', gme.controlPrevious);

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
