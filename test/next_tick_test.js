'use strict';

const Zone = require('../lib/zone');
const expect = require('chai').expect;

describe('process.nextTick', function () {

  it('should work with process.nextTick', function () {
    const zone = new Zone();
    zone.run(function () {
      zone.set('hello', 'world');
      process.nextTick(function () {
        expect(Zone.current.get('hello')).to.equal('world');
      });
    });
    expect(zone.get('hello')).to.be.ok;
  });

  it('should work with nested zones', function (done) {
    const zone = Zone.current.fork();
    const zone2 = Zone.current.fork();
    zone.set('hello', 1);
    zone2.set('hello', 2);
    zone.run(function () {
      process.nextTick(function () {
        expect(Zone.current).to.equal(zone);
        expect(Zone.current.get('hello')).to.equal(1);
        Zone.current.set('hello', 3);
        zone2.run(function () {
          expect(Zone.current).to.equal(zone2);
          expect(Zone.current.get('hello')).to.equal(2);
          process.nextTick(function () {
            expect(Zone.current).to.equal(zone2);
            expect(Zone.current.get('hello')).to.equal(2);
          });
          done();
        });
        expect(Zone.current).to.equal(zone);
        expect(Zone.current.get('hello')).to.equal(3);
      });
    });
  });

});
