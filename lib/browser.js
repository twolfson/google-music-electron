// Load in our dependencies
var ipc = require('ipc');
var GoogleMusic = require('google-music');

// When the DOM loads
// DEV: We load navigation here because otherwise we have a FOUC while our new icons load
window.addEventListener('DOMContentLoaded', function handleDOMLoad () {
  // Find our attachment point for nav buttons
  var navOpenEl = document.querySelector('.top > #material-one-left > #left-nav-open-button');

  // If there is one
  if (navOpenEl) {
    // Generate our buttons
    // https://github.com/google/material-design-icons
    // Match aria info for existing "back" button (role/tabindex given by Chrome/Polymer)
    var backEl = document.createElement('sj-icon-button');
    backEl.setAttribute('aria-label', 'Back');
    backEl.setAttribute('icon', 'arrow-back');
    backEl.setAttribute('id', 'gme-back-button');
    var forwardEl = document.createElement('sj-icon-button');
    forwardEl.setAttribute('aria-label', 'Forward');
    forwardEl.setAttribute('icon', 'arrow-forward');
    forwardEl.setAttribute('id', 'gme-forward-button');

    // Apply one-off styles to repair positioning and padding
    // DEV: Taken from CSS styles on hidden "back" button
    var cssFixes = [
      'align-self: center;',
      'min-width: 24px;'
    ].join('');
    backEl.style.cssText = cssFixes;
    forwardEl.style.cssText = cssFixes;

    // Attach event listeners
    backEl.addEventListener('click', function onBackClick () {
      window.history.go(-1);
    });
    forwardEl.addEventListener('click', function onBackClick () {
      window.history.go(1);
    });

    // Expose our buttons adjacent to the hidden back element
    navOpenEl.parentNode.insertBefore(forwardEl, navOpenEl.nextSibling);
    navOpenEl.parentNode.insertBefore(backEl, forwardEl);
  }
});

// When we finish loading
// DEV: We must wait until the UI fully loads otherwise mutation observers won't bind
// DEV: Even with the `onload` event, we still could not have JS fully loaded so use a setTimeout loop
var loadAttempts = 0;
function handleLoad() {
  // Try to bind GoogleMusic to the UI
  var googleMusic;
  try {
    googleMusic = new GoogleMusic(window);
    console.info('Successfully initialized `GoogleMusic`');
  // If there was an error
  } catch (err) {
    // If this is our 60th attempt (i.e. 1 minute of failures), then throw the error
    if (loadAttempts > 60) {
      throw err;
    // Otherwise, try again in 1 second
    } else {
      console.info('Failed to initialize `GoogleMusic`. Trying again in 1 second');
      loadAttempts += 1;
      return setTimeout(handleLoad, 1000);
    }
  }

  // Forward events over `ipc`
  var events = ['change:song', 'change:playback', 'change:playback-time'];
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
}
window.addEventListener('load', handleLoad);
