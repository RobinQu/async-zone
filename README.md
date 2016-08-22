# async-zone

WIP!

A TC39 [Zone](https://github.com/domenic/zones) implementation using `async_wrap`.

Zone is currently a [state-0](https://github.com/tc39/proposals/blob/master/stage-0-proposals.md) proprosal, and very helpful to deal with:

* `ThreadLocal`-like senarios for async calls
* tracing and capturing call stack
* uncaught exceptions and unhandled rejections

IDL for `Zone`

```
class Zone {
  constructor({ name, parent });

  name;
  get parent();

  fork({ name });
  run(callback);
  wrap(callback);

  static get current();
}
```
