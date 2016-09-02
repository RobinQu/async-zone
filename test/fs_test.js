'use strict';

const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const Zone = require('../lib/zone');
const expect = require('chai').expect;

describe('fs', function () {

  class TestFile {
    constructor() {
      this.data = crypto.randomBytes();
      this.path = path.join(process.env.TMPDIR, Date.now() + '.tmp');
      fs.writeFileSync(this.path, this.data);
    }

    static get() {
      return new TestFile();
    }

  }

  const run = function (cb) {
    return new Promise(function (resolve) {
      Zone.current.fork().run(function () {
        const secret = Math.random();
        Zone.current.set('secret', secret);
        if(cb) {
          cb(null, secret);
        }
        resolve(secret);
      });
    });

  };

  it('should work fs.truncate', function (done) {
    run().then(function (secret) {
      const file = TestFile.get();
      fs.truncate(file.path, 1, function (e) {
        if(e) {
          done(e);
        }
        expect(fs.statsSync(file.path).size).to.equal(1);
        expect(Zone.current.get('secret')).to.equal(secret);
        done();
      });
    }).catch(done);
  });

});
