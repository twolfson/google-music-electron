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
    events.on(event, function forwardEvent (data) {
      // Send same event with data (e.g. `change:song` `GoogleMusic.Playback.PLAYING`)
      ipc.send(event, data);
    });
  });

  // TODO: Add bindings for `control:play-pause`, `control:next`,  `control:previous`

  // Add a button to our UI
  var btn = document.createElement('button');
  btn.value = 'hi';
  btn.style.cssText = [
    'position: absolute;',
    'top: 0;',
    'left: 0;',
    'display: block;',
    'width: 200px;',
    'height: 200px;',
    'z-index: 9001;'
  ].join(' ');

  // When our button is pressed
  btn.onclick = function () {
    // Play some music
    googleMusic.playback.playPause();
  };

  document.body.appendChild(btn);
});
