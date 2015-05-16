// Load in our dependencies
var ipc = require('ipc');
var GoogleMusic = require('google-music');

// When we finish loading
window.addEventListener('load', function handleLoad () {
  // Bind GoogleMusic to the UI
  var googleMusic = new GoogleMusic(window);

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
    // Send a message back to the parent
    ipc.send('test', 'hello');

    // Play some music
    googleMusic.playback.playPause();
  };

  document.body.appendChild(btn);
});
