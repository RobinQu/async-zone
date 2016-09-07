'use strict';

const net = require('net');
const expect = require('chai').expect;
const Zone = require('../lib/zone');

describe('net', function () {

  it('should work with net.Server', function (done) {
    const zone = new Zone({name: 'zone1'});
    zone.set('secret', 123);
    const handler = function (c) {
      expect(Zone.current.get('secret')).to.equal(123);
      c.on('data', function () {
        expect(Zone.current.get('secret')).to.equal(123);
        c.end();
      });
      c.on('end', function () {
        expect(Zone.current.get('secret')).to.equal(123);
        done();
      });
    };
    const server = zone.run(function () {
      return net.createServer(handler);
    });

    // initiate a client in another zone
    const zone2 = new Zone({name: 'zone2'});
    zone2.set('secret', 456);
    const request = zone2.wrap(function () {
      // make sure request happens in zone2
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
    zone.run(function () {
      // make sure 'connection' event handlers are called in the scope of zone1
      server.listen(request);
    });

  });

});
