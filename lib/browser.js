// Load in our dependencies
var ipc = require('ipc');
var GoogleMusic = require('google-music');

// When we finish loading
document.addEventListener('DOMContentLoaded', function handleLoad () {
  // Add a button to our UI
  var btn = document.createElement('button');

  // When our button is pressed
  btn.onclick = function () {
    // Send a message back to the parent
    ipc.send('test', 'hello');
  };
});
