// Load in our dependencies
var Tray = require('tray');
var ipc = require('ipc');
var Menu = require('menu');
var MenuItem = require('menu-item');
var GoogleMusic = require('google-music');

// Define a function to set up our tray icon
exports.init = function (methods) {
  // Set up our tray
  var trayMenu = new Menu();
  trayMenu.append(new MenuItem({
    label: 'Show/hide window',
    click: methods.toggleMinimize
  }));
  trayMenu.append(new MenuItem({
    type: 'separator'
  }));
  trayMenu.append(new MenuItem({
    label: 'Play/Pause',
    click: methods.controlPlayPause
  }));
  trayMenu.append(new MenuItem({
    label: 'Next',
    click: methods.controlNext
  }));
  trayMenu.append(new MenuItem({
    label: 'Previous',
    click: methods.controlPrevious
  }));
  trayMenu.append(new MenuItem({
    type: 'separator'
  }));
  trayMenu.append(new MenuItem({
    label: 'Quit',
    click: methods.quitApplication
  }));
  var tray = new Tray(__dirname + '/assets/icon.png');
  tray.setContextMenu(trayMenu);

  // When the song changes, update our tooltip
  ipc.on('change:song', function handleSongChange (evt, songInfo) {
    var infoStr = [
      'Title: ' + songInfo.title,
      'Artist: ' + songInfo.artist,
      'Album: ' + songInfo.album
    ].join('\n');
    tray.setToolTip(infoStr);
  });

  // When the playback state changes, update the icon
  ipc.on('change:playback', function handlePlaybackChange (evt, playbackState) {
    // Determine which icon to display based on state
    // By default, render the clean icon (stopped state)
    var icon = __dirname + '/assets/icon.png';
    if (playbackState === GoogleMusic.Playback.PLAYING) {
      icon = __dirname + '/assets/icon-playing.png';
    } else if (playbackState === GoogleMusic.Playback.PAUSED) {
      icon = __dirname + '/assets/icon-paused.png';
    }

    // Update the icon
    tray.setImage(icon);
  });
};
