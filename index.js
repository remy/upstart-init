#!/usr/bin/env node

/**
  Script will generate a upstart conf for this project
  (hope to expand for further uses)
 */

function method(prompt, def, msg) {
  return function () {
    program.prompt((msg ? msg : prompt + (def ? ' [' + def + ']' : '')) + ': ', function (value) {
      if (value) {
        pkg[prompt] = value;
      }

      methods.shift()();
    });
  };
}

function testfile(f) {
  return fs.existsSync('./' + f) ? process.cwd() + '/' + f : false;
}

function findmain() {
  return ['index.js', 'app.js', 'server.js'].filter(testfile)[0];
}


var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    program = require('commander'),
    Handlebars = require('handlebars'),
    template = Handlebars.compile(fs.readFileSync('./template.conf', 'utf8')),
    pkg = {},
    defaultpkg = {
      name: path.basename(process.cwd()),
      author: process.env.USER,
      main: findmain()
    };

if (fs.existsSync('./package.json')) {
  pkg = _.extend({}, _.pick(require('./package.json'), 'name', 'author', 'description', 'main'), defaultpkg);
}

var methods = [
  method('name', pkg.name),
  method('description', pkg.description),
  method('author', pkg.author),
  method('main', pkg.main),
  method('env', undefined, 'environment (i.e. PORT=8000)'),
  function () {
    // build the shiz
    // console.log(pkg);
    pkg.user = 'www-data';
    pkg.command = (pkg.env || '') + ' /usr/local/bin/node ' + (pkg.main.indexOf('/') === 0 ? pkg.main : process.cwd() + '/' + pkg.main );
    console.log(template(pkg));
    process.exit(0);
  }
];

methods.shift()();
