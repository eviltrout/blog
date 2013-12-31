---
title: Ember 1.0 preview upgrade notes
date: 2013-02-04
---

This is just a quick follow up to [a post I made recently](/2013/01/27/ember-router-v2-upgrade-notes.html) about upgrading Ember to the new router. A couple small things have changed that I feel are worth mentioning. In particular they deprecated one piece of advice I gave so I wanted to correct it!


### this.controllerFor() inside Controllers has been deprecated

If you want a controller to speak to another in your app, previously you could do `this.controllerFor('foo')` to get a `FooController`. That's been deprecated for a much nicer way of doing things. Simply include a `needs` property in your declaration for the controllers you need access to. It will then be available under `controllers.bar`:

```javascript
App.FooController = Ember.ObjectController.extend({
  needs: ['bar', 'baz'],

  someMethod: function() {
    this.get('controllers.bar').hello();
    this.get('controllers.baz').goodbye();
  }
});
```

A cool side effect of this new API is you can see exactly what relationships your controllers have to each other. If you see more than one or two controllers in your `needs` property, you might want to raise an eyebrow. It's a sign that perhaps your controllers are too dependant and maybe you could rewrite things in a better way.

Also to be clear: you can still use `this.controllerFor()` in your router. It's just deprecrated inside controllers.

### ContainerView's childViews is deprecated

This is another change that will result in a lot less code. Previously, if you had a `ContainerView`, you could add and remove views from it using the `childViews` proeprty. Now, the childViews property has been deprecated as the `ContainerView` itself acts like an Array. So instead of:

```javascript
// The old way
this.get('childViews').pushObject(App.CoolView.create());
```

You can just do:


```javascript
// The new way
this.pushObject(App.CoolView.create());
```

Pretty slick!


