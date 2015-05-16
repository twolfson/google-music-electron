// Load in our dependencies
var ipc = require('ipc');

// Send a message back to the parent
ipc.send('test', 'hello');
