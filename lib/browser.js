// Load in our dependencies
var ipc = require('ipc');
var GoogleMusic = require('google-music');

// When we finish loading
// DEV: We must wait until the UI fully loads otherwise mutation observers won't bind
window.addEventListener('load', function handleLoad () {
  // Bind GoogleMusic to the UI
  var googleMusic = new GoogleMusic(window);

  // Forward events over `ipc`
  var events = ['change:song', 'change:playback'];
  events.forEach(function bindForwardEvent (event) {
    googleMusic.on(event, function forwardEvent (data) {
      // Send same event with data (e.g. `change:song` `GoogleMusic.Playback.PLAYING`)
      ipc.send(event, data);
    });
  });

  // When we receive requests to control playback, run them
  ipc.on('control:play-pause', function handlePlayPause (evt) {
    googleMusic.playback.playPause();
  });
  ipc.on('control:next', function handleNext (evt) {
    googleMusic.playback.next();
  });
  ipc.on('control:previous', function handlePrevious (evt) {
    googleMusic.playback.previous();
  });
});
