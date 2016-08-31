'use strict';

const Zone = require('../lib/zone');
const expect = require('chai').expect;

describe('Timers', function () {

  it('should work with setTimeout', function (done) {
    const zone = new Zone();
    zone.run(function () {
      zone.set('hello', 'world');
      setTimeout(function () {
        expect(Zone.current).to.equal(zone);
        expect(Zone.current.get('hello')).to.equal('world');
        done();
      }, 10);
    });
  });

  it('should work with setInterval', function (done) {
    const zone = new Zone();
    zone.fork().run(function () {
      Zone.current.set('i', 0);
      const timmer = setInterval(function () {
        expect(Zone.current.parent).to.equal(zone);
        Zone.current.set('i', Zone.current.get('i') + 1);
        if(Zone.current.get('i') === 3) {
          clearTimeout(timmer);
          done();
        }
      });
    });
  });

  it('should work with setImmediate', function () {
    const zone = new Zone();
    zone.set('hello', 789);
    Zone.current.fork().run(function () {
      Zone.current.set('hello', 123);
      Zone.current.hello = 456;
      expect(zone).not.to.equal(Zone.current);
      setImmediate(function () {
        expect(Zone.current.get('hello')).to.equal(123);
        expect(Zone.current.hello).to.equal(456);
        zone.run(function () {
          expect(zone.get('hello')).to.equal(789);
        });
        expect(Zone.current.get('hello')).to.equal(123);
      });
    });

  });

});
