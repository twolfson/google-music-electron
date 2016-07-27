// Load in our dependencies
var ipcMain = require('electron').ipcMain;
var _ = require('underscore');
var GoogleMusic = require('google-music');
var MprisService = require('mpris-service');

// Define a function to set up mpris
exports.init = function (gme) {
  // https://github.com/emersion/mpris-service/tree/a245730635b55c8eb06c605f4ece61e251f04e20
  // https://github.com/emersion/mpris-service/blob/a245730635b55c8eb06c605f4ece61e251f04e20/index.js
  // http://www.freedesktop.org/wiki/Specifications/mpris-spec/metadata/
  // http://specifications.freedesktop.org/mpris-spec/latest/Player_Interface.html
  var mpris = new MprisService({
    name: 'google-music-electron'
  });
  mpris.on('next', gme.controlNext);
  mpris.on('playpause', gme.controlPlayPause);
  mpris.on('previous', gme.controlPrevious);
  mpris.on('quit', gme.quitApplication);
  mpris.on('raise', gme.onRaise);
  // Currently position and seek aren't supported due to not receiving events in Cinnamon =(
  // DEV: Stop isn't supported in Google Music (unless it's pause + set position 0)
  // DEV: We choose to let the OS volume be controlled by MPRIS

  var songInfo = {};
  ipcMain.on('change:song', function handleSongChange (evt, _songInfo) {
    mpris.metadata = songInfo = {
      'mpris:artUrl': _songInfo.art,
      // Convert milliseconds to microseconds (1s = 1e3ms = 1e6µs)
      'mpris:length': _songInfo.duration * 1e3,
      'xesam:album': _songInfo.album,
      'xesam:artist': _songInfo.artist,
      'xesam:title': _songInfo.title
    };
  });

  ipcMain.on('change:playback-time', function handlePlaybackUpdate (evt, playbackInfo) {
    // Convert milliseconds to microseconds (1s = 1e3ms = 1e6µs)
    var newPosition = playbackInfo.current * 1e3;
    var newTotal = playbackInfo.total * 1e3;

    // If the total has been updated, update our songInfo cache
    // DEV: This is due to `google-music.js` not always having an up to date length upon song change
    if (songInfo['mpris:length'] !== newTotal) {
      mpris.metadata = _.extend(songInfo, {
        'mpris:length': newTotal
      });
    }

    // If our position varies by 2 seconds, consider it a seek
    // DEV: Seeked takes the delta (positive/negative depending on position
    var delta = newPosition - mpris.position;
    if (Math.abs(delta) > 2e6) {
      mpris.seeked(delta);
    }
  });

  var playbackStrings = {};
  playbackStrings[GoogleMusic.Playback.PLAYING] = 'Playing';
  playbackStrings[GoogleMusic.Playback.PAUSED] = 'Paused';
  playbackStrings[GoogleMusic.Playback.STOPPED] = 'Stopped';
  ipcMain.on('change:playback', function handlePlaybackChange (evt, playbackState) {
    mpris.playbackStatus = playbackStrings[playbackState];
  });
};
