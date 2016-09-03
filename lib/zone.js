'use strict';

const asyncHook = require('async-hook');
const assert = require('assert');
const debug = require('./debug');

class ZoneStack extends Array {
  enter(zone) {
    debug('enter', zone);
    this.push(zone);
  }

  exit(zone) {
    if(this.length > 1 && this[this.length - 1] === zone) {
      debug('exit', zone);
      return this.pop();
    }
    return null;
  }
}

const stack = new ZoneStack();
const pool = new WeakMap();

class Zone {

  constructor(options, context) {
    options = Object.assign({
      name: ''
    }, options || {});
    this.name = options.name;
    this.parent = options.parent;
    this.context = context || {};
  }

  fork(options) {
    return new Zone({
      name: options && options.name,
      parent: this
    }, Object.create(this.context));
  }

  reset(context) {
    this.context = context || {};
  }

  run(callback) {
    try {
      stack.enter(this);
      return callback();
    } finally {
      stack.exit(this);
    }
  }

  wrap(callback) {
    assert(callback, 'should have callback');
    const self = this;
    return function () {
      const args = Array.prototype.slice.call(arguments, 0);
      args.unshift(this);
      const func = callback.bind.apply(callback, args);
      return self.run(func);
    };
  }

  get(key) {
    if(key in this.context) {
      return this.context[key];
    }
    return this.parent && this.parent.get(key);
  }

  set(key, value) {
    this.context[key] = value;
  }

  static get current() {
    return stack[stack.length - 1];
  }

}

stack.push(new Zone({name: 'root'}));

let indent = 1;
asyncHook.addHooks({
  init: function (uid, handle) {
    debug('init', handle.constructor.name, uid, Zone.current);
    pool.set(handle, Zone.current);
  },
  pre: function (uid, handle) {
    const zone = pool.get(handle);
    debug('--'.repeat(indent++) + '>', handle.constructor.name, uid);
    stack.enter(zone);
  },
  post: function (uid, handle, didThrow) {
    const zone = pool.get(handle);
    stack.exit(zone);
    debug('<' + '--'.repeat(--indent), handle.constructor.name, uid, didThrow);
  }
});

asyncHook.enable();

module.exports = Zone;
