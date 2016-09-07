'use strict';

const Zone = require('../lib/zone');
const http = require('http');
const url = require('url');
const expect = require('chai').expect;

describe.only('http', function () {

  describe('Server', function () {
    it('should work with http.createServer', function (done) {
      const zone = new Zone();
      const actions = {
        '/path1': function () {
          const req = Zone.current.get('req');
          const res = Zone.current.get('res');
          res.end(req.headers.secret);
        },

        '/path2': function () {
          const req = Zone.current.get('req');
          const res = Zone.current.get('res');
          res.end(req.url);
        }
      };
      const handler = function (req, res) {
        zone.run(function () {
          Zone.current.set('req', req);
          Zone.current.set('res', res);
          const parsed = url.parse(req.url);
          const action = actions[parsed.path];
          if(action) {
            action();
          } else {
            res.writeHead(404);
            res.end();
          }
        });
      };
      const server = http.createServer(handler);
      server.listen(function () {
        const secret = String(Math.random());
        http.get({
          hostname: 'localhost',
          port: server.address().port,
          path: '/path1',
          headers: {
            secret: secret
          }
        }, function (res) {
          const buf = [];
          res.on('readable', function () {
            buf.push(res.read());
          });
          res.on('end', function () {
            const result = Buffer.concat(buf).toString();
            expect(result).to.equal(secret);
            server.close(done);
          });
          res.on('error', function () {
            server.close(done);
          });
        });
      });
    });
  });

  describe('Client', function () {

    it('should work with http.request', function (done) {
      const server = http.createServer(function (req, res) {
        res.end(String(Math.random()));
      });
      server.listen(function () {
        const zone = new Zone();
        zone.run(function () {
          const secret = Math.random();
          Zone.current.set('secret', secret);
          const req = http.request({
            method: 'GET',
            hostname: 'localhost',
            port: server.address().port,
            path: '/'
          }, function (res) {
            // expect(Zone.current.get('secret')).to.equal(secret);
            res.on('readable', function () {
              const line = res.read();
              process._rawDebug('********hello!!!!', line.toString());
              expect(Zone.current.get('secret')).to.equal(secret);
            });
            res.on('end', function () {
              server.close(done);
            });
            res.on('error', function () {
              server.close(done);
            });
          });
          req.end();
        });
      });
    });

  });

});
