#!/usr/bin/env node
"use strict";

// TODO: change to remove assumed source - use different sources/parts of app
var debug = require('debug')('jsprinter');

// joblist
var jobs = [];

// ipp-printer configuration
var Printer = require('ipp-printer');
var printer_conf = {name: 'jsprinter', port: 40023 || env.IPP_PORT, zeroconf:
  false};
var printer = new Printer(printer_conf);

// for display
var printer_url = 'http://localhost:' + printer_conf.port + '/printers/' +
                  printer_conf.name;
// TODO: add to about route with app info


// register incoming job callback
printer.on('job', function (job) {
  // TODO: insert debug switch for incoming job printing
  //  console.log(job);

  // TODO: set up temp file write
  //  job.pipe(job.stream);

    // add to joblist
    debug('got job ' + job.id);
    jobs[job.id] = job;
    job.content = job.read();
});

var express = require('express');
var app = express();

// joblist index route
app.get('/', function (req, res) {
    var response = 'printer is at ' + printer_url + '</br>';
    response += 'jobs:</br><ul>';
    jobs.forEach(function (current) {
        response += '<li><a href=/job/' + current.id + '>';
        response += current.id + ':' + current.name;
        response += '</a> ';
        response += '<a href=/job/' + current.id + '?delete>';
        response += 'forget job';
        response += '</a>';
        response += '</li>';
    });
    response += '</ul>';
    res.send(response);
});

// job access route
app.get('/job/:id', function (req, res) {
    var job = jobs[req.params.id];
    if (job == undefined) {
    res.sendStatus(404);
    return;
    }
    if (req.query.delete !== undefined) {
      debug('deleting job ' + job.id);
      delete jobs[job.id];
      //TODO: delete temp
      res.redirect('back');
      return;
    }
      res.set({
          'Content-Type': 'application/postscript',
          'Content-Disposition': 'inline; filename=' + job.id + '.ps'
      });
      res.send(job.content);
    }
);

var joblist_port = 40024 || env.JOBLIST_PORT;
app.listen(joblist_port);
console.log('started printer at ' + printer_url);
console.log('started joblist at http://localhost:' + joblist_port);
