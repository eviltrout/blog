---
title: "Getting Started with ES6 Modules"
date: 2014-05-03
---

Javascript is a fantastic example of how something, despite having visible warts
and [very poor design](http://www.2ality.com/2013/04/12quirks.html), can dominate the tech
landscape. Nobody uses Javascript because it's a beautiful language; they use it because it's
ubiquitous. Its warts are now well understood and most have workarounds.

An amazing omission in Javascript's design is the lack of a built-in module system. As
more projects used Javascript and shared more code, the need for a robust module system
became necessary. Two contenders sprung up, [Asynchronous Module Definition](https://github.com/amdjs/amdjs-api/wiki/AMD) (AMD)
and [CommonJS](http://wiki.commonjs.org/wiki/CommonJS) (CJS). The former is much more popular with
browser applications and the latter is much more popular with server applications written
in [node.js](http://nodejs.org).

Having two major standards for defining modules led to a technological holy war in the
Javascript community akin to the vim/emacs arguments of the editor world. It wasn't pretty.

Fortunately, there is light at the end of the tunnel. [TC39](http://www.ecma-international.org/memento/TC39.htm)
has been hard at work on the next version of Javascript, called ES6 (short for EcmaScript 6).
One of the major features of ES6 is a standard syntax for handling modules in Javascript.

### A simple example of ES6 modules

By default anything you declare in a file in a ES6 project is not available outside that
file. You have to use the `export` keyword to explicitly make it available. Here's an example of how to export a user class:

```javascript
// user.js

var localVariable = 123;  // not visible outside this file

export default function User(age) {
  this.age = age;
}; // can be imported by other files
```

And now if we wanted to use the `User` class in another file:

```javascript
// user-details.js

import User from 'user';

var evilTrout = new User(35);
```

Pretty simple, isn't it? There are many more examples of the syntax [here](http://wiki.ecmascript.org/doku.php?id=harmony:modules_examples)
if you are curious about other ways it can be used.

### When will it be available in browsers?

In the past, it was very risky to use new Javascript features before they were
standardized and widely available in browsers. You'd never know if someone was
using an old or incompatible browser and it would cause your code to crash and
burn.

These days, thanks to the [Extensible Web](http://extensiblewebmanifesto.org/) movement,
people are working hard at making it so that developers can try out advanced features
before they're compatible in all browsers.

**The great news is you can use ES6 modules today!** You just have to run your code
through a transpiler. The transpiler will convert your ES6 modules into
Javascript that browsers can understand today. In the future, when the browsers
understand ES6 modules natively, you'll be able to stop transpiling and it will
just work.

The transpiler I've been using lately is [es6-module-transpiler](https://github.com/square/es6-module-transpiler)
from [Square](https://squareup.com). If you check out their [build tools](https://github.com/square/es6-module-transpiler#build-tools)
section you'll see they've got integration stories for all the major Javascript build tools.

If you are using Rails on the server side, [Dockyard](http://dockyard.com/) has created an easy to use [Gem
version](https://github.com/dockyard/es6_module_transpiler-rails) of it that you should
be able to drop into your project.


### ES6 Modules and Ember.js

The Ember community has bet big on ES6 modules. For example, if you are using
[Ember App Kit](https://github.com/stefanpenner/ember-app-kit) to structure your project,
it includes ES6 module support via transpiling out of the box.

Recently, [Robert Jackson](https://twitter.com/rwjblue) converted the
Ember source code to ES6 modules. This means that, if you have things set up properly
in your development environment, you can import just the parts of Ember.js that you want
to use and end up with a potentially smaller runtime.

ES6 modules integrate quite beautifully in an Ember project. If you're not using ES6 modules,
the standard way of making parts of your application available for discovery was by hanging
them off your application's global namespace. For example:

```javascript
// app/controllers/user.js
App.UserController = Ember.ObjectController.extend({
  // ... controller code
});
```

Then if you transitioned to the `user` route, Ember would search for a `UserController` on
your `App` object. This actually works quite well, but making everything available
globally makes it too easy for developers to reach into components they have no
business reaching into. If you make it easy for a developer to do the
wrong thing, they *will* do it.

To contrast, if you are using Ember with an ES6 application you can define your
user controller this way:

```javascript
// app/controllers/user.js

export default Ember.ObjectController.extend({
  // ... controller code
});
```

Ember's [new resolver](https://github.com/stefanpenner/ember-jj-abrams-resolver) will
then look for the module exported from the `app/controllers/user` path and will wire
it up for you automatically.

### Going Forward

I've found that since I started using ES6 modules in my projects that their code bases are a lot
cleaner and more organized. It also just feels awesome to be using a standard before
it's widely available.

I've got a [branch of Discourse](https://github.com/discourse/discourse/tree/es6)
that I am converting to ES6 modules one at a time. The bad news is that Discourse has
hundreds of files to convert, so it will be some time before we are 100% on ES6.
The good news is, with a little duct tape in our custom resolver, the application
can run with some modules in the global `Discourse` namespace and some in ES6
format. I'm hoping to merge it into master shortly so our contributors can
help with the converting efforts.

My advice is to not wait for browsers to implement these modules; start hacking
today and put your project ahead ot the curve. There are other ES6 features
that can be transpiled too, and I'm excited to try some of those out too!
