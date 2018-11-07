---
layout: post
title: "Creating an Integration test in Ember.js (Screencast)"
date: 2014-06-27
---

Once upon a time it used to be difficult to create integration tests in Ember.js.
Fortunately, the framework has come a long way and it's now really easy to get
integration testing working in your application. This screencast shows how
to set it up with ember-cli:

<iframe width="560" height="315" src="//www.youtube.com/embed/2O24ltr0pPU" frameborder="0" allowfullscreen></iframe>

There is some boilerplate code required that you'll need at the top of your
integration test files if you want to do it yourself. Here it is:

```javascript
import startApp from 'vault/tests/helpers/start-app';
var App;

module('Integration - Secret', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});
```

