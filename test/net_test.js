'use strict';

const net = require('net');
const expect = require('chai').expect;
const Zone = require('../lib/zone');

describe('net', function () {

  it.only('should work with net.Server', function (done) {
    const zone = new Zone({name: 'zone1'});
    zone.set('secret', 123);
    const handler = zone.wrap(function (c) {
      process._rawDebug('1111');
      expect(Zone.current.get('secret')).to.equal(123);
      c.on('data', zone.wrap(function () {
        process._rawDebug('!!!!!!', Zone.current);
        expect(Zone.current.get('secret')).to.equal(123);
        c.end();
      }));
      c.on('end', function () {
        process._rawDebug('on end!!', Zone.current.get('secret'));
        expect(Zone.current.get('secret')).to.equal(123);
        done();
      });
    });
    const server = zone.run(function () {
      return net.createServer(handler);
    });

    // initiate a client in another zone
    const zone2 = new Zone({name: 'zone2'});
    zone2.set('secret', 456);
    const request = zone2.wrap(function () {
      expect(Zone.current.get('secret')).to.equal(456);
      const client = net.connect(server.address().port, function () {
        expect(Zone.current.get('secret')).to.equal(456);
        client.write('wow');
        client.on('data', function () {
          expect(Zone.current.get('secret')).to.equal(456);
        });
      });
    });

    // start
    server.listen(request);
  });

});
