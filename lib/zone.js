'use strict';

require('async-listener');

class ZoneStack extends Array {
  enter(zone) {
    this.push(zone);
  }

  exit(zone) {
    if(this.length > 1 && this[this.length - 1] === zone) {
      return this.pop();
    }
    return null;
  }

}

const Stack = new ZoneStack();

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
      Stack.enter(this);
      return callback();
    } catch (e) {
      throw e;
    } finally {
      Stack.exit(this);
    }
  }

  wrap(callback) {
    const self = this;
    return function () {
      return self.run(callback);
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
    return Stack[Stack.length - 1];
  }

}

Stack.push(new Zone({name: 'root'}));

process.addAsyncListener({
  create: function () {
    return Zone.current;
  },

  before: function (context, storage) {
    Stack.enter(storage);
  },

  after: function (context, storage) {
    Stack.exit(storage);
  }
});

module.exports = Zone;
