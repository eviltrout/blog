---
title: "Ember without Ember Data"
date: 2013-03-23
---

### Update May 26, 2014

The concepts in this article are still true, but I've recorded a [screencast](https://www.youtube.com/watch?v=7twifrxOTQY)
showing how to use ember without ember data using ember-cli and the latest version of Ember.
It goes beyond the contents of this article, showing how to create an adapter, store and
even your own identity map. **[Check it out](https://www.youtube.com/watch?v=7twifrxOTQY)**!

---

[Ember Data](https://github.com/emberjs/data) is a persistence layer for [Ember.Js](http://emberjs.com/).
Unlike Ember, which currently has a candidate for a 1.0 release, Ember Data is still very much
a work in progress. This has been a source of confusion for people who are learning Ember, as the two
frameworks are complimentary but currently exist in different realms of stability.

Ember Data has ambitious goals, and it has come a long way in the last year. If you're the kind of
programmer who loves working on upcoming stuff, you might find it exhilarating. On the other hand, it is
completely understandable if you'd want to avoid it. Deprecations and changing APIs can be frustrating
and time consuming.

One thing that is not always clear to people starting with Ember is that **Ember works perfectly well
without Ember Data**! Trust me on this: [Discourse](https://github.com/discourse/discourse) doesn't use
Ember Data for persistence and it's working quite well. Moreover, *using AJAX with Ember is something that
is not difficult to do*.

### Ember Models that are just Objects

Ember includes an [object model](http://emberjs.com/guides/object-model/classes-and-instances/) that
most people with an OOP background should find familiar. A subclass of `Ember.Object`
works very well for a data model.

Here's what a class might look like to represent a link from [reddit](http://www.reddit.com/):

```javascript
App.RedditLink = Ember.Object.extend({});
```

You could then easily instantiate it and use getters and setters to access its properties:

```javascript
var link = App.RedditLink.create();
link.set('url', 'http://eviltrout.com');
console.log(link.get('url')); // http://eviltrout.com
```

If you like, when you construct your model instance, you can pass it a regular Javascript object
with the properties rather than setting them one at a time:

```javascript
var discourseLink = App.RedditLink.create({
  title: "Discourse",
  url: "http://www.discourse.org"
});

console.log(discourseLink.get('title')); // Discourse
```

Here's how you'd bind those properties to a handlebars template:

```handlebars
Title: {{title}}
Url: {{url}}
```

Once bound to a template like this, if you called `set` on your model, it would automatically update
the HTML.


### Accessing Reddit via JSONP

Data models are a lot more exciting when you fill them real data. Let's write a method that finds the
links from a subreddit. Reddit provides a [JSONP](http://en.wikipedia.org/wiki/JSONP) API that we can
access via jQuery:

```javascript
$.getJSON("http://www.reddit.com/r/" + subreddit + "/.json?jsonp=?", function(response) {
  // response contains the JSON result
});
```

The response from reddit's API includes the colleciton of links under `data.children`, but their
properties are under an additional `data` attribute. We can loop through them like so, creating
instances of `RedditLink` as we go:

```javascript
var links = response.data.children.map(function (child) {
  return App.RedditLink.create(child.data);
});
// links now contains all our `RedditLink` objects!
```

`$.getJSON` is an asynchronous call. It follows that our model's finder method will have to
be asynchronous as well. One common approach to dealing with this is to pass a callback function to
our finder method. When the `$.getJSON` call finishes, it can execute the callback with the result.
What happens, though, when you need to handle the errors? You'd have to supply two callbacks: one
for the error callback and one for the success callback.

### Promises

This is all much cleaner to do with [Promises](http://blog.parse.com/2013/01/29/whats-so-great-about-javascript-promises/).
Promises are objects you return from your functions. They contain a `then` method that you can call when
the operation is complete.

The nice thing about this is you don't have to supply your callbacks to your function - you just
attach them to the `Promise` object that your function returns. It ends up being a lot cleaner
and simpler to follow. Additionally, Promises can be *chained*, so that the result of one promise is only
passed through to the next function in the chain once it is complete.

jQuery conveniently return promises from all its AJAX calls, so we can just make use of it. Here's
how our finder looks, returning a promise:

```javascript
App.RedditLink.reopenClass({

  findAll: function(subreddit) {
    return $.getJSON("http://www.reddit.com/r/" + subreddit + "/.json?jsonp=?").then(
      function(response) {
        return response.data.children.map(function (child) {
          return App.RedditLink.create(child.data);
        });
      }
    );
  }

});
```

Notice that we're returning the result of `$.getJSON`, but also calling `then` on it. This means that the
Promise that our `findAll` method returns will eventually resolve to our list of `RedditLink` objects.
Here's how you could you could call it and log the results from the subreddit [/r/aww](http://www.reddit.com/r/aww):

```javascript
App.RedditLink.findAll('aww').then(function (links) {
  console.log(links); // logs the array of links after it loads
});
```

### Putting it all together

I've created a [github project](https://github.com/eviltrout/emberreddit-old/) that puts all the code from this
blog entry together.

The [code for the application](https://github.com/eviltrout/emberreddit-old/blob/master/js/app.js) is quite
short, which I think reflects Ember's greatest strength: as a developer you have to write less code to get
stuff done.

I implore you to not be scared off by Ember Data's current state. Ember itself is quite stable, and it's
easy to get started with AJAX calls like this today.
