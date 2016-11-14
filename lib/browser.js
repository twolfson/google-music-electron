// Load in our dependencies
var ipcRenderer = require('electron').ipcRenderer;
var webContents = require('electron').remote.getCurrentWebContents();
var GoogleMusic = require('google-music');

// When the DOM loads
// DEV: We load navigation here because otherwise we have a FOUC while our new icons load
window.addEventListener('DOMContentLoaded', function handleDOMLoad () {
  // Find our attachment point for nav buttons
  var leftNavContainer = document.querySelector('.top > #material-one-left');
  var navOpenEl = leftNavContainer ? leftNavContainer.querySelector('#left-nav-open-button') : null;

  // If there is one
  if (navOpenEl) {
    // Generate our buttons
    // https://github.com/google/material-design-icons
    // Match aria info for existing "back" button (role/tabindex given by Chrome/Polymer)
    // DEV: We use `nodeName` to to guarantee `sj-icon-button` or `paper-icon-button` on their respective pages
    var nodeName = navOpenEl.nodeName;
    var backEl = document.createElement(nodeName);
    backEl.setAttribute('aria-label', 'Back');
    backEl.setAttribute('icon', 'arrow-back');
    backEl.setAttribute('id', 'gme-back-button');
    var forwardEl = document.createElement(nodeName);
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

    // Determine the current size of the menu button
    // 40px -> 40
    var navOpenElWidthStr = window.getComputedStyle(navOpenEl).width;
    var navOpenElWidthPx = parseInt(navOpenElWidthStr.replace(/px$/, ''), 10);

    // Increase the `min-width` for our leftNavContainer
    // 226px -> 226 -> 306px
    var leftNavContainerMinWidthStr = window.getComputedStyle(leftNavContainer).minWidth;
    var leftNavContainerMinWidthPx = parseInt(leftNavContainerMinWidthStr.replace(/px$/, ''), 10);
    leftNavContainer.style.minWidth = (leftNavContainerMinWidthPx + (navOpenElWidthPx * 2)) + 'px';

    // Attach event listeners
    backEl.addEventListener('click', function onBackClick () {
      window.history.back();
    });
    forwardEl.addEventListener('click', function onBackClick () {
      window.history.forward();
    });

    // When our page changes, update enabled/disabled navigation
    var updateNavigation = function () {
      if (webContents.canGoBack()) {
        // DEV: Google Music automatically sets `aria-disabled` as well
        backEl.removeAttribute('disabled');
      } else {
        backEl.setAttribute('disabled', true);
      }
      if (webContents.canGoForward()) {
        forwardEl.removeAttribute('disabled');
      } else {
        forwardEl.setAttribute('disabled', true);
      }
    };
    window.addEventListener('hashchange', updateNavigation);

    // Update navigation immediately
    // DEV: On initial page load/reload, we won't have disabled our arrows otherwise
    // DEV: We might still show "back" as navigable on reload, it is but the page will refresh
    //   This is caused by the page not being in push state (same behavior in Chrome)
    updateNavigation();

    // Expose our buttons adjacent to the hidden back element
    navOpenEl.parentNode.insertBefore(forwardEl, navOpenEl.nextSibling);
    navOpenEl.parentNode.insertBefore(backEl, forwardEl);
    console.info('Added navigation buttons');

    // Watch our music logo for hide/show events
    // DEV: Logo is hidden on non-root page but its container isn't (yet)
    // DEV: This occupies dead whitespace that shrinks our arrows otherwise
    //   https://github.com/twolfson/google-music-electron/issues/43
    var musicLogoContainer = leftNavContainer.querySelector('.music-logo-link');
    var musicLogoEl = musicLogoContainer.querySelector('.music-logo');
    var updateLogoDisplay = function () {
      var displayVal = window.getComputedStyle(musicLogoEl).display;
      musicLogoContainer.style.display = displayVal === 'none' ? 'none' : 'initial';
    };
    var musicLogoObserver = new MutationObserver(function handleMutations (mutations) {
      mutations.forEach(function handleMutation (mutation) {
        var targetEl = mutation.target;
        if (targetEl === musicLogoEl) {
          updateLogoDisplay();
        }
      });
    });
    musicLogoObserver.observe(musicLogoEl, {
      attributes: true
    });

    // Update music logo immediately as it starts as `display: none` on page refresh
    updateLogoDisplay();

    // Notify user of our changes
    console.info('Added monitor for music logo visibility');
  } else {
    console.error('Failed to find navigation button');
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
      ipcRenderer.send(event, data);
    });
  });

  // When we receive requests to control playback, run them
  ipcRenderer.on('control:play-pause', function handlePlayPause (evt) {
    googleMusic.playback.playPause();
  });
  ipcRenderer.on('control:next', function handleNext (evt) {
    googleMusic.playback.forward();
  });
  ipcRenderer.on('control:previous', function handlePrevious (evt) {
    googleMusic.playback.rewind();
  });
}
window.addEventListener('load', handleLoad);
