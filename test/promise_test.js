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


});
