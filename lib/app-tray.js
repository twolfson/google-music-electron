// Load in our dependencies
var Tray = require('tray');
var NativeImage = require('native-image');
var ipc = require('ipc');
var Menu = require('menu');
var MenuItem = require('menu-item');
var GoogleMusic = require('google-music');
var assets = require('./assets');

// Define a truncation utility for tooltip
function truncateStr(str, len) {
  // If the string is over the length, then truncate it
  // DEV: We go 1 under length so we have room for ellipses
  if (str.length > len) {
    return str.slice(0, len - 2) + '…';
  }

  // Otherwise, return the string
  return str;
}

// Set-up for OS
assets = assets[process.platform] || assets.any;

// Define a function to set up our tray icon
exports.init = function (gme) {
  // Set up our tray
  var trayMenu = new Menu();
  trayMenu.append(new MenuItem({
    label: 'Show/hide window',
    click: gme.onTrayClick
  }));
  trayMenu.append(new MenuItem({
    type: 'separator'
  }));
  trayMenu.append(new MenuItem({
    label: 'Play/Pause',
    click: gme.controlPlayPause
  }));
  trayMenu.append(new MenuItem({
    label: 'Next',
    click: gme.controlNext
  }));
  trayMenu.append(new MenuItem({
    label: 'Previous',
    click: gme.controlPrevious
  }));
  trayMenu.append(new MenuItem({
    type: 'separator'
  }));
  trayMenu.append(new MenuItem({
    label: 'Quit',
    click: gme.quitApplication
  }));

  var icon = NativeImage.createFromPath(assets.icon);
  icon.setTemplateImage(true); // Dark menubar support for Mac OS X, does nothing everywhere else

  var tray = new Tray(icon);
  tray.setContextMenu(trayMenu);

  // When our tray is clicked, toggle visibility of the window
  tray.on('clicked', gme.onTrayClick);

  // When the song changes, update our tooltip
  ipc.on('change:song', function handleSongChange (evt, songInfo) {
    gme.logger.debug('Song has changed. Updating tray tooltip', {
      songInfo: songInfo
    });
    // We have a max length of 127 characters on Windows
    // so divvy up 47, 31, 47 (with 2 characters for line breaks)
    // https://github.com/twolfson/google-music-electron/issues/24
    var infoStr = [
      truncateStr('Title: ' + songInfo.title, 47),
      truncateStr('Artist: ' + songInfo.artist, 31),
      truncateStr('Album: ' + songInfo.album, 47)
    ].join('\n');
    tray.setToolTip(infoStr);
  });

  // When the playback state changes, update the icon
  ipc.on('change:playback', function handlePlaybackChange (evt, playbackState) {
    // Determine which icon to display based on state
    // By default, render the clean icon (stopped state)
    gme.logger.debug('Playback state has changed. Updating tray icon', {
      playbackState: playbackState
    });

    var icon;
    if (playbackState === GoogleMusic.Playback.PLAYING) {
      icon = NativeImage.createFromPath(assets.playing);
    } else if (playbackState === GoogleMusic.Playback.PAUSED) {
      icon = NativeImage.createFromPath(assets.paused);
    } else {
      icon = NativeImage.createFromPath(assets.icon);
    }

    icon.setTemplateImage(true); // Dark menubar support for Mac OS X

    // Update the icon
    tray.setImage(icon);
  });
};
