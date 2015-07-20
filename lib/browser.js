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
    googleMusic.playback.forward();
  });
  ipc.on('control:previous', function handlePrevious (evt) {
    googleMusic.playback.rewind();
  });

  // Find our attachment point for nav buttons
  var navEl = document.querySelector('.top > #material-one-left');

  // If there is one
  if (navEl) {
    // Generate our buttons
    var backEl = document.createElement('sj-icon-button');
    backEl.textContent = '←';
    var forwardEl = document.createElement('sj-icon-button');
    forwardEl.textContent = '→';

    // Attach event listeners
    backEl.addEventListener('click', function onBackClick () {
      window.history.go(-1);
    });
    forwardEl.addEventListener('click', function onBackClick () {
      window.history.go(1);
    });

    // Expose our buttons
    navEl.appendChild(backEl);
    navEl.appendChild(forwardEl);
  }
});
