// Load in dependencies
var assert = require('assert');
var googleMusicElectron = require('../');

// Start our tests
describe('google-music-electron', function () {
  it('returns awesome', function () {
    assert.strictEqual(googleMusicElectron(), 'awesome');
  });
});
