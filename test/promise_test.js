'use strict';

const Zone = require('../lib/zone');
const expect = require('chai').expect;

describe('Promise', function () {

  it('should work with chained promises', function (done) {
    Zone.current.fork().run(function () {
      Zone.current.set('abc', 123);
      Promise.resolve().then(function () {
        expect(Zone.current.get('abc')).to.equal(123);
      })
      .then(function () {
        expect(Zone.current.get('abc')).to.equal(123);
      })
      .then(function () {
        expect(Zone.current.get('abc')).to.equal(123);
        throw new Error('gggg');
      })
      .catch(function () {
        expect(Zone.current.get('abc')).to.equal(123);
      })
      .then(done);
    });
  });

  it('should work with unwrapped promises', function (done) {
    Zone.current.fork().run(function () {
      Zone.current.set('abc', 123);
      expect(Zone.current.get('abc')).to.equal(123);
      Promise.resolve().then(function () {
        expect(Zone.current.get('abc')).to.equal(123);
        return Promise.resolve();
      }).then(function () {
        expect(Zone.current.get('abc')).to.equal(123);
        return Promise.reject();
      }).catch(function () {
        expect(Zone.current.get('abc')).to.equal(123);
        return Promise.resolve();
      }).then(function () {
        expect(Zone.current.get('abc')).to.equal(123);
      }).then(done);
    });
  });

  it('should work with forked continuations', function () {
    return Zone.current.fork({
      name: 'sunday'
    }).run(function () {
      const promise = Promise.resolve();
      return Zone.current.fork({
        name: 'saturday'
      }).run(function () {
        Zone.current.set('abc', 123);
        return Promise.all([
          promise.then(function () {
            expect(Zone.current.get('abc')).to.equal(123);
          }),
          promise.then(function () {
            expect(Zone.current.get('abc')).to.equal(123);
          }),
          promise.then(function () {
            expect(Zone.current.get('abc')).to.equal(123);
          })
        ]);
      });
    });
  });

});
