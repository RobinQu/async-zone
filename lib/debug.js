'use strict';

module.exports = function () {
  if(process.env.DEBUG && (process.env.DEBUG.indexOf('async-zone') > -1 || process.env.DEBUG === '*')) {
    process._rawDebug.apply(process, arguments);
  }
};
