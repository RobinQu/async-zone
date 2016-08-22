'use strict';

const assert = require('assert');
const asyncHook = require('async-hook');
const Pool = new WeakMap();

class AsyncListener {

  constructor(observer, data) {
    assert(observer, 'should provider observer');

    data = data || null;
    const hooks = {};
    if(typeof observer.create === 'function') {
      hooks.init = function (uid) {
        Pool.set(uid, observer.create(data));
      };
    }

    if(typeof observer.before === 'function') {
      hooks.pre = function (uid, handle) {
        observer.before(handle, Pool.get(uid));
      };
    }

    hooks.post = function (uid, handle) {
      if(typeof observer.after === 'function') {
        observer.after(handle, Pool.get(uid));
      } else {
        observer.error(handle, Pool.get(uid));
      }
    };

    // store the async hooks
    this.hooks = hooks;
  }

  register() {
    asyncHook.init(this.hooks);
  }

  unregister() {
    asyncHook.removeHooks(this.hooks);
  }

}

const createAsyncListener = function (observer, data) {
  return observer instanceof AsyncListener ? observer : new AsyncListener(observer, data);
};

const addAsyncListener = function (observer, data) {
  const listener = createAsyncListener(observer, data);
  listener.register();
  return listener;
};


const removeAsyncListener = function (listener) {
  if(listener && listener.unregister) {
    listener.unregister();
  }
};

process.addAsyncListener = addAsyncListener;

process.removeAsyncListener = removeAsyncListener;

process.createAsyncListener = createAsyncListener;
