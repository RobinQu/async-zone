'use strict';

const asyncHook = require('async-hook');
const debug = require('debug')('zone:async_listener');

const Pool = new WeakMap();
const Listeners = [];

const AsyncCatcher = function (e) {
  // process._rawDebug('async catcher');
  let handled = false;
  for(const listener of Listeners) {
    handled = listener.error(Pool.get(listener), e);
  }
  return handled;
};

process.on('uncaughtException', AsyncCatcher);

const Hooks = {};
Hooks.init = function () {
  for(const listener of Listeners) {
    if(listener.create) {
      Pool.set(listener, listener.create(listener.data));
    } else {
      Pool.set(listener, listener.data);
    }
  }
};

Hooks.pre = function (uid, handle) {
  for(const listener of Listeners) {
    if(typeof listener.before === 'function') {
      listener.before(handle, Pool.get(listener));
    }
  }
};

Hooks.post = function (uid, handle, didThrow) {
  process._rawDebug('post', didThrow);
  for(const listener of Listeners) {
    if(!didThrow && typeof listener.after === 'function') {
      listener.after(handle, Pool.get(listener));
    }
  }
};

asyncHook.addHooks(Hooks);
asyncHook.enable();

class AsyncListener {
  constructor(observer, data) {
    debug('ctor', observer, data);
    this.before = observer.before;
    this.after = observer.after;
    this.create = observer.create;
    this.error = observer.error;
    this.data = data;
  }

  register() {
    debug('register');
    if(Listeners.indexOf(this) === -1) {
      Listeners.push(this);
    }
  }

  unregister() {
    debug('unregister');
    const idx = Listeners.indexOf(this);
    if(idx > -1) {
      Listeners.splice(idx, -1);
    }
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

if(!process.addAsyncListener) {
  process.addAsyncListener = addAsyncListener;
}

if(!process.removeAsyncListener) {
  process.removeAsyncListener = removeAsyncListener;
}

if(!process.createAsyncListener) {
  process.createAsyncListener = createAsyncListener;
}

module.exports = AsyncListener;
