---
title: "Ember RC5 Upgrade Notes"
date: 2013-06-09
---

{:javascript: class=javascript}

Recently, the Ember.JS team released two release candidates in succession. First came RC4 with a bunch of improvements
and functionality, but it included a couple of performance regressions. It was promptly fixed with
[Release Candidate 5](http://emberjs.com/blog/2013/06/01/ember-1-0-rc5.html).

All users are encouraged to get their apps up to speed on the latest
candidate as Ember approaches its 1.0 release.

We did encounter a few gotchas when we upgraded [Discourse](http://discourse.org) so I thought I'd write up our
experiences in case it helps anyone else.

### The Obvious One

The most obvious thing that broke in Discourse was anticipated, as it was covered in the [RC4 Upgrade blog entry](http://emberjs.com/blog/2013/05/28/ember-1-0-rc4.html).

Previously, if you had a `model` hook in a router, it would always be set as the `model` (and `content`) property
of your controller. This would happen even if you defined your own `setupController` method. There was a flaw with
this automatic behavior however; if for some reason you _didn't_ want to set your `model`, there's no way you could do that.

So as of RC4, if you define a `setupController` method, you have to explicitly set `controller.set('model', model)`.
This was fairly easy to audit in the Discourse source. I think we had about half a dozen routes that had `model`
hooks but weren't setting it ourselves. It took about 20 minutes to find them all and upgrade. Not so bad!

### Creating Child Views Manually

Once our models were implemented, we started receiving a lot of deprecation warnings on our use of `defaultContainer`.
There was a helpful link provided in the deprecation warning to [a gist](https://gist.github.com/stefanpenner/5627411)
with a longer explanation.

We had some places in our code base where we were dynamically creating views and pushing them into a `ContainerView`.
A good example would be the bar of buttons at the bottom of a topic. We'd have some code like
`var btn = Discourse.LoginButton.create({topic: topic})`  and then `this.pushObject(btn)`.

The issue with this is the views we were creating were not wired up properly. The call to `create()` was not
correctly establishing the link between the new child view and the parent view. The solution is relatively simple. When
creating child views, use the `createChildView` method:


    // old way: var btn = Discourse.LoginButton.create({topic: topic});

    // new, correct way:
    var btn = this.createChildView(Discourse.LoginButton, {topic: topic});

    this.pushObject(btn);


### Initializing State in `didInsertElement`

This last gotcha was totally our fault, and was the reason we had to roll back RC5 shortly after deploying it.
We've since fixed the issues and are redeploying our RC5 build tomorrow morning.

The `didInsertElement` hook is great if you need to work with a view once it has been inserted into the DOM.
A typical use of it is for using a jQuery plugin or selector that needs your view to be present.

Unfortunately, we had some places where we used it to initialize state that belonged in the controller.
In particular, the code we used to track which posts a user had read.

Previously, Ember would destroy and recreate a `TopicView` if we navigated from one topic directly to another.
In RC4/RC5, Ember re-uses views for performance and memory reasons. This is awesome and the right thing to do,
but obviously `didInsertElement` won't be called a second time when navigating to a new topic.

The solution here was to move the logic out of `didInsertElement` and into the `setupController` hook of the
route where it belonged.

**Make sure that code in your views is only concerned with the view itself!** Keep all model and user state in your
controllers and keep your views as lightweight and reusable as possible.


### Ember-Testing appears!

RC5 includes some new functions to make testing much easier. Discourse has done a great
job on test coverage for our server component, but the client side is severely lacking. As you can imagine,
it means we get more regressions and bugs than we'd like in the front end.

Going forward, we're going to start testing the heck out our Ember code using this new functionality.
I'll be writing up more about that as we implement it!



