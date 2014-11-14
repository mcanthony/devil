#!/usr/bin/node
var program = require('commander'),
    config = require('../package.json'),
    fs = require('fs'),
    os = require('os'),
    spawn = require('child_process').spawn,

    Server = require('../src/server/Server');

program.version(config.version);
program.option('-s, --server', 'Server mode', false);
program.option('-c, --client', 'Client mode', false);
program.option('-h, --host [value]', 'Host address', '127.0.0.1');
program.option('-p, --port [value]', 'Port number', null);
program.parse(process.argv);

var _client = true, _server = true;
if (program.client || program.server) {
    if (!program.client) _client = false;
    if (!program.server) _server = false;
}

if (!program.port || isNaN(parseInt(program.port))) program.port = 0;
else program.port = parseInt(program.port);
if (program.port < 0 || !program.port || program.port > 65535) program.port = 0;

// Replace the console.log
console.demonicLog = console.log;
console.log =  new Function();

if (_server) {
    // Initialize a server
    var server = new Server(program.host, program.port);

    server.start(function (error) {
        if (error) {
            console.log("[ERROR] Server failed to start.");
            console.error(error);
        }
    });
}

if (_client) {
    var exe = require('nodewebkit').findpath();

    var exists = fs.existsSync(exe);
    if (!exists) {
        console.log("[ERROR] Cannot find node-webkit executable.");
        process.exit();
    }

    var client = spawn(exe, [__dirname + '/../src/client', program.host, program.port], {
        stdio: ['ignore', 'ignore', 'ignore']
    });

    client.on('close', function () {
        if (_server) console.log("[EXIT] Client closed.");
        process.exit();
    });
}
