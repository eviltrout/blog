---
title: "We finally did something about Android Performance"
date: "2016-02-25"
---

Back in September, Codinghorror wrote a popular post on [the state of android Javascript performance](https://meta.discourse.org/t/the-state-of-javascript-on-android-in-2015-is-poor/33889)
on Discourse's Meta forum. It drew a lot of attention, and led to some fascinating discussions on our forum
and behind the scenes with browser engineers.

<img src='/images/android-sad.png' align='right'>

The poor performance of Discourse on Android was already old news to us at that point: we started paying attention
several years ago, and have spent some time contributing to the Ember.js community
tools to help profile application performance, in particular the "Render Performance" tab on the
[Ember Inspector](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi?hl=en),
and the [ember performance suite](http://emberperf.eviltrout.com/).


Over time, we've seen some modest performance improvements in newer Ember.js releases. In particular,
the [HTMLBars](http://talks.erikbryn.com/htmlbars-emberconf/) upgrade resulted in a roughly 25% boost. However,
rendering topics was still approximately 6 times slower on the top of the line Android device versus the equivalent
iPhone.

After years of waiting for a breakthrough in Android or Ember performance, we decided it was time to to take the
nuclear option: we replaced the Ember rendering engine for our most common view with a custom virtual DOM based
renderer.

The results have been **fantastic**:

### Large Topic Rendering Speed (Initial Visit)

* Desktop
  * 633ms avg (before)
  * 120ms avg (after)

* Nexus 6p (high-end Android)
  * 1248ms avg (before)
  * 248ms avg (after)

* Nexus 7 (2013 mid-range Android)
  * 4078ms avg (before)
  * 636ms avg (after)

### Large Topic Rendering Speed (Subsequent Visits)

* Desktop
  * 429ms avg (before)
  * 69ms avg (after)

* Nexus 6p (high-end Android)
  * 710ms avg (before)
  * 152ms avg (after)

* Nexus 7 (2013 mid-range Android)
  * 2757ms avg (before)
  * 350ms avg (after)

### Summary

<img src='/images/android-happy.png' align='right' width="150">

* Across all platforms, viewing a topic in Discourse averages **5x** faster.

* On older Android devices, viewing a topic is between **6-8x** faster.

* Our worst improvement was on the Nexus 6p on subsequent renders which was **4.6x** faster.

On a Desktop PC, the speedup is a nice touch, mainly if you are an avid Discourse user.

On Android, it's a **huge quality of life improvement**. Going from over 4 seconds to around
half a second completely changes the experience you have on a forum.

## Diagnosing Performance Problems

Ember's rendering system is made up of a hierarchy of [components](https://guides.emberjs.com/v1.10.0/components/).
Every template that you render is backed by an instance of a `Component` class, and it manages the lifecycle of the
template as well as delegating events to actions. Components can contain other components, and can use helpers to
control flow. Here's what a typical template looks like:

### post.hbs (for rendering a single post)
```handlebars
{{avatar-link user=post.creator}}
{{poster-name user=post.creator}}

<span class='date'>{{post.date}}</span>

<div class='post-body'>
  {{post.body}}
  {{post-controls post=post}}
</div>

<div class='gutter'>
  {{post-links links=post.links}}
</div>
```

In the above example, `avatar-link`, `poster-name`, `post-controls` and `post-links` are all custom components
that are displayed on every post. Each one would have its own handlebars template similar to `post.hbs`,
and probably also a Javascript file to handle clicks and other interactions with it.

Ember also handles data binding for you. In the above example, if the `post.author` or `post.body` changed,
the template would automatically update. During development, this means you spend a lot less time thinking about
how to update your user interface. If you want to change the body of a post, just call `post.set('body', 'new body')`
and you're done!

Behind the scenes, Ember does a lot of work to wire all this up. It keeps tabs on all the properties that can
change, which components they belong to and so forth. If you're only rendering a few posts, the overhead
involved in this is small, but as you render more things with more details, it can add up.

It can't be understated that **all performance issues are about tradeoffs**. I think Ember does the right
thing here and focuses on apps that are organized and scale up as you add more features. For the vast
majority of views in your application, the framework overhead will not concern you. However, if you
are rendering many nested components with many bindings, the situation can become pathological.

While Discourse might look simple on the surface, each post is rendered with quite a few components.
We have many dynamic buttons, links and effects applied every time a post is rendered with 
over 150 attributes involved.

## Hindsight is 20/20

Every time you see a blog entry that says "by switching our codebase from language X to language Y,
we improved our performance by a factor of Z!" you should realize that there's an important
detail omitted: When you re-write code, you have the full domain knowledge of the problem it solved
the first time around. This knowledge goes a long way towards making it faster, because you know exactly
what you need to do to get it to work.

For example: every time an Ember template encounters a `{{property}}`, it sets up a binding to make sure the
template updates when the underlying property changes. This is a good default to have, but what
if you know that the property will only change following an AJAX request? You can use this
knowledge to render significantly faster.

This is the general approach we took to rewriting our topic rendering. We thought about the bare
minimum amount of work the browser needed to do to implement the interface we'd already built.
How maintainable would that code be? Was there some middle ground, where we could gain
significant performance but also keep the code reasonably clean and integrated with the rest
of our Ember app?

## Wrapping code in Ember

Ember's Components are also great tools to [wrap third party Javascript](https://www.youtube.com/watch?v=S_l_DL8ysQQ),
as they give you lifecycle hooks for when an element is inserted into the DOM and when it is removed.
You can use these hooks to render pretty much whatever you want as long as you're using Javascript.

Our approach was to create a single component, instead of a series of nested components, and
when it was inserted in the DOM, to perform the rendering ourselves. We'd only re-render the
DOM if the user performed an action on it or if our [message bus](https://github.com/SamSaffron/message_bus)
told us to do so.

We looked around at various options for rendering quickly on the client side, and found
[virtual-dom](https://github.com/Matt-Esch/virtual-dom) to be very promising. It is only 8k
when minified and gzipped, which seemed like a reasonable amount of code in exchange for a
performance boost.

We didn't want to sacrifice *too much* code quality, so we implemented a lightweight version
of Ember Components called Widgets. (note: yes, I know Widget is very similar to Component,
but a distinction was required and hey... naming is hard!)

Widget are classes that, given a series of attributes and optionally some state, would emit
a series of virtual DOM nodes to be rendered. If you wanted to render a button that
increased a counter on click, the widget would look like this:

```javascript
import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

export default createWidget('counter', {
  tagName: 'button.counter-button',

  defaultState() {
    return { count: 0 };
  },

  html(attrs, state) {
    return `Clicked ${state.count} times`;
  },

  click() {
    this.state.count++;
  }
});
```

Widgets can render other widgets if they want too:

```javascript
export default createWidget('controls', {
  tagName: 'div.controls',

  html(attrs, state) {
    return h('div.controls', this.attach('counter', attrs, state));
  }
});
```

And you can mount a widget in any template template in our Ember application:

```handlebars
{{mount-widget widget="controls"}}
```

The existing actions in your Ember application can be triggered by templates:

```handlebars
{{mount-widget widget="button" doSomething="doSomething"}}
```

You can send it up from a click event easily:

```javascript
// in your widgets/button.js code
click() {
  return this.sendComponentAction('doSomething');
}
```

If your action returns a promise, once it is resolved the widget will re-render itself.
Most of the time the rendering is handled automatically like this for you, but you
can also trigger a re-render yourself by calling `this.queueRerender()`.
Renders are queued up and coalesced nicely by leveraging Ember's event loop.

## Downsides

After converting our old Handlebars templates over to be virtual DOM widgets, I have to admit
I find creating HTML this way significantly uglier than just creating a template. It's not
so bad if the widget only has a little markup, but if there is a lot it gets a little unwieldy.

On the other hand, there are some major advantages to emitting HTML by hand. The fine-tuned
control over the exact DOM I was creating came in very handy when rendering the gaps between
posts in a topic which was clumsier in the ember implementation.

It also took me quite a while to convert the entire topic renderer over, because we have
so much functionality hidden in there! The project took me about a month of full time
work to knock out an alpha, and then another 3 weeks of fixing bugs and to develop an upgrade
path for our plugin authors.

It did feel good to refactor some of the oldest code we had, though. I also added a couple of
hundred new acceptance tests. Traditionally the topic stream was not tested as well as the other
parts of the site because its code was the oldest and weirdest. I straightened all that out
while I was in there.

## The Road Ahead

Before setting out on a similar project, I'd ask yourself: are you okay spending a lot of
time without adding new features, and in the process likely breaking a bunch of working
stuff before you fix it again? Would you sacrifice some code quality for a speed
improvement?

Those are the major trade offs we made, and I believe it's worth it because Discourse is
quite a popular project used by many people. The 5-7x speed improvement will
add up across all the forums in the world, especially with all of the Android users
who browse it.

Going forward, we are likely to improve the widget system even more. I'd love to hook
into the HTMLBars complier AST so we could write some templates using Handlebars, so
we are not supporting two very different ways of creating templates. I spent about
a day looking into this now but couldn't find sufficient documentation or public
APIs, but I'm told that in the future it's likely we will be able to do this.

Until then, full speed ahead!

**Update:** If you want to learn more about how the Widget framework works,
[I've written more here](https://meta.discourse.org/t/a-tour-of-how-the-widget-virtual-dom-code-in-discourse-works/40347).

