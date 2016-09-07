'use strict';

const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const Zone = require('../lib/zone');
const expect = require('chai').expect;

describe('fs', function () {

  class TestFile {
    constructor() {
      this.data = crypto.randomBytes(20);
      this.path = path.join(process.env.TMPDIR, Date.now() + '.tmp');
      fs.writeFileSync(this.path, this.data);
    }

    static get() {
      return new TestFile();
    }

  }

  it('should work fs.truncate', function (done) {
    Zone.current.fork().run(function () {
      const secret = Math.random();
      Zone.current.set('secret', secret);
      const file = TestFile.get();
      fs.truncate(file.path, 1, function (e) {
        if(e) {
          done(e);
        }
        expect(fs.statSync(file.path).size).to.equal(1);
        expect(Zone.current.get('secret')).to.equal(secret);
        done();
      });
    });
  });

  it('should work with fs.ftruncate', function (done) {
    Zone.current.fork().run(function () {
      const secret = Math.random();
      Zone.current.set('secret', secret);
      const file = TestFile.get();
      const fd = fs.openSync(file.path, 'w');
      fs.ftruncate(fd, 1, function (e) {
        fs.closeSync(fd);
        if(e) {
          done(e);
        }
        expect(fs.statSync(file.path).size).to.equal(1);
        expect(Zone.current.get('secret')).to.equal(secret);
        done();
      });
    });
  });

});
