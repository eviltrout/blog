---
layout: post
title: "Hiding Offscreen Content in Ember.js"
date: 2014-01-04
---

Everything you render in a browser, whether it's a blog post or a tweet or a video, has a
performance cost.

At the very least, you will be asking the browser to render a handful of tags and text
elements that make up your user interface. That structure, a subtree in the browser's
DOM, can be quite complicated and memory intensive.

The more tags and elements you render, the slower the browser is going to perform, and
the more memory it is going to use to do it. It follows that if you give the browser
less work to do, it will do it faster.

This principle holds true even if you are using a browser application framework like
[Ember.js](http://emberjs.com/). Every data binding you make between an element and an object has a cost. If
you reduce your bindings and views, your interface will feel snappier.

### Long Lived Applications

[Discourse](http://www.discourse.org/) makes heavy use of infinite scrolling. If a user
is reading a long topic with many posts, new posts will stream in asynchronously from
the server as the scroll position approaches the end of the browser's viewport.

For shorter topics, adding all that extra content to the DOM was not a performance issue.
Modern browsers, even on mobile devices, could handle rendering of hundreds of posts of
formatted text without breaking a sweat.

However, as Discourse installs began to see heavy use, we found some topics had thousands of posts,
and some users would read many of them in one sitting. All of those inserted posts started
having a negative effect; browsers would often start to feel "choppy" and could even
crash, leaving users frustrated.

### Cloaking Offscreen Content

The obvious solution to this problem was to unload content from the DOM as it scrolled
offscreen and render it again if it came back onscreen.

The issue with this is that if you remove an element from the DOM, the browser will
reflow, and all the other content underneath it will jump back upwards. In order to
prevent the browser viewport from moving, you have to replace the element with a
simpler one that has the exact same height as the element it's replacing.

One of Ember's strengths is how it breaks down your UI into a hierarchy of views.
You have your `ApplicationView` which contains your `TopicView` and a collection of
`PostView`s and so forth.

I took advantage of this structure and implemented a `CloakedView` class.

The idea is any of your views can be contained in a **cloak**. When onscreen,
the cloak renders the contained view. When offscreen, the cloak will copy the
height of its rendered content and unload it.

A `PostView` doesn't care if it's cloaked or not. It should only be concerned
with how to render a post. We can choose to cloak when we display a list
of posts with a special helper. So instead of rendering a collection of Posts
like so:

```handlebars{% raw %}
{{collection content=topic.posts itemViewClass="postView"}}
{% endraw %}```

We can drop in a replacement like so:

```handlebars{% raw %}
{{cloaked-collection content=topic.posts cloakView="post"}}
{% endraw %}```

### ember-cloaking

After implementing cloaking, there was an immediate drop of 30% RAM usage in
long Discourse topics. Scrolling also remains smooth even if many posts 
are browser in one sitting. We've been running it in production for
about a month and it's been a huge win!

I've extracted the cloaking logic into a library called [ember-cloaking](https://github.com/eviltrout/ember-cloaking).

For now it only works with vertical scrolling, but if you are doing a large
amount of horizontal scrolling I'm sure it could be adjusted to work without
too much effort.

The fact that I was able to implement this functionality in a generic way
without much code is a testament to Ember's excellent design.

If your application is rendering many items in the browser at once,
especially if you are implementing infinite scrolling, you should give it
a shot and let me know how it works for you!
