'use strict';

const EE = require('events');
const Zone = require('../lib/zone');
const expect = require('chai').expect;

describe('EventEmitter', function () {

  it('should bind emitter', function (done) {
    const emitter = new EE();
    const zone = new Zone();
    zone.set('hello', 123);
    Zone.current.fork().run(function () {
      expect(Zone.current.get('hello')).not.to.be.ok;
      zone.run(function () {
        emitter.once('boom', zone.wrap(function () {
          expect(Zone.current).to.equal(zone);
          expect(Zone.current.get('hello')).to.equal(123);
          done();
        }));
      });
    });
    emitter.emit('boom');
  });

});
