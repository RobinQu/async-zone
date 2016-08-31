'use strict';

const Zone = require('../lib/zone');
const expect = require('chai').expect;

describe('Zone API', function () {

  beforeEach(function () {
    Zone.current.reset();
  });

  it('should play nice', function () {
    expect(Zone.current).to.be.ok;
    Zone.current.set('hello', 'world');
    expect(Zone.current.get('hello')).to.equal('world');
    expect(Zone.current.name).to.equal('root');
  });

  it('should fork', function () {
    const zone = Zone.current.fork({name: 'child_zone'});
    expect(zone).to.be.ok;
  });

  it('should run', function () {
    Zone.current.a = 'b';
    Zone.current.set('a', 'b');
    Zone.current.fork().run(function () {
      expect(Zone.current.a).not.to.be.ok;
      expect(Zone.current.get('a')).to.equal('b');
      Zone.current.set('a', 'c');
      expect(Zone.current.get('a')).to.equal('c');
      expect(Zone.current.set('b', 'c'));
    });
    expect(Zone.current.get('b')).not.to.be.ok;
  });

});
