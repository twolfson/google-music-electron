// Load in our dependencies
var Menu = require('menu');

// Load in JSON for our menus (e.g. `./menus/linux.json`)
// https://github.com/atom/electron-starter/blob/96f6117b4c1f33c0881d504d655467fc049db433/src/browser/appmenu.coffee#L15
var menuTemplate = require('./menus/' + process.platform + '.json');

// Define a function to set up our application menu
exports.init = function (googleMusicElectron) {
  // Parse and set up our menu
  // https://github.com/atom/electron-starter/blob/96f6117b4c1f33c0881d504d655467fc049db433/src/browser/appmenu.coffee#L27-L41
  function bindMenuItems(menuItems) {
    menuItems.forEach(function bindMenuItemFn (menuItem) {
      // If there is a selector, continue
      // DEV: This is an OSX specific binding
      if (menuItem.selector !== undefined) {
        return;
      }

      // If there is a submenu, recurse it
      if (menuItem.submenu) {
        bindMenuItems(menuItem.submenu);
        return;
      }

      // Otherwise, find the function for our command
      var cmd = menuItem.command;
      if (cmd === 'application:about') {
        menuItem.click = googleMusicElectron.openAboutWindow;
      } else if (cmd === 'application:quit') {
        menuItem.click = googleMusicElectron.quitApplication;
      } else if (cmd === 'window:reload') {
        menuItem.click = googleMusicElectron.reloadWindow;
      } else if (cmd === 'window:toggle-dev-tools') {
        menuItem.click = googleMusicElectron.toggleDevTools;
      } else if (cmd === 'window:toggle-full-screen') {
        menuItem.click = googleMusicElectron.toggleFullScreen;
      } else {
        throw new Error('Could not find function for menu command "' + cmd + '" ' +
          'under label "' + menuItem.label + '"');
      }
    });
  }
  bindMenuItems(menuTemplate.menu);
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate.menu));
};
