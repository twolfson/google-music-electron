// Load in our dependencies
var Tray = require('tray');
var nativeImage = require('native-image');
var ipc = require('ipc');
var Menu = require('menu');
var MenuItem = require('menu-item');
var GoogleMusic = require('google-music');

// Define a function to set up our tray icon
exports.init = function (gme) {
  // Set up our tray
  var trayMenu = new Menu();
  trayMenu.append(new MenuItem({
    label: 'Play / Pause',
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
    label: 'Show / Hide Google Music Electron',
    click: gme.onTrayClick
  }));

  trayMenu.append(new MenuItem({
    label: 'Quit',
    click: gme.quitApplication
  }));

  var icon = nativeImage.createFromPath(__dirname + '/assets/icon.png');
  icon.setTemplateImage(true); // Dark menubar support for Mac OS X

  var tray = new Tray(icon);
  tray.setContextMenu(trayMenu);

  // When our tray is clicked, toggle visibility of the window
  tray.on('clicked', gme.onTrayClick);

  // When the song changes, update our tooltip
  ipc.on('change:song', function handleSongChange (evt, songInfo) {
    gme.logger.debug('Song has changed. Updating tray tooltip', {
      songInfo: songInfo
    });
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
    gme.logger.debug('Playback state has changed. Updating tray icon', {
      playbackState: playbackState
    });
    var icon;
    if (playbackState === GoogleMusic.Playback.PLAYING) {
      icon = nativeImage.createFromPath(__dirname + '/assets/icon-playing.png');
    } else if (playbackState === GoogleMusic.Playback.PAUSED) {
      icon = nativeImage.createFromPath(__dirname + '/assets/icon-paused.png');
    } else {
      icon = nativeImage.createFromPath(__dirname + '/assets/icon.png');
    }

    icon.setTemplateImage(true); // Dark menubar support for Mac OS X

    // Update the icon
    tray.setImage(icon);
  });
};
