'use strict';

const asyncHook = require('async-hook');
const pool = new WeakMap();


asyncHook.init({

  init: function (uid, handle, provider, parentUid, parentHandle) {
    const context = pool.get(parentUid);
  }

});
