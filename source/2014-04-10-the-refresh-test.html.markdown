---
title: "The Refresh Test"
date: 2014-04-10
---

How many times has the following happened to you?

You go to a web site and it asks you to create an account. You fill out a
form with all the obvious fields and hit submit. The page refreshes and
shows you the form again.

**Phone Number is required**

Well, that's annoying. There was no indication that the site needed
your phone number. You prefer not to give out your phone number to every
web site, but this one is run by a company you trust, so you scroll down and
fill it out. You submit the form again.

**Password is required**

What the heck!? You already entered a password! You scroll down to the form
and see that the fields are now empty. It turns out that even though
you filled out the password fields the first time, after you missed the
phone number they were cleared. You fill them out and submit the form again.

**Username is not available**

At this point you're ready to throw your computer out the window. There are
fewer things more frustrating than trying to get your data into the exact
shape a web site wants, especially if it clears fields every time
you fail.

Another annoyance: just about every time I order something online, right
after I input my credit card information, I am presented with a spinner
animation and the text "Do not hit the back button or refresh your browser!"
It's terrifying that a company that is taking my money over the Internet
can't handle me refreshing the page without charging my card twice.

The sad thing is that both of these problems are totally solvable. In fact,
they've been easy to solve for over a decade. Yet you still see them *all
the time*.

### Lessons from Live Reloading

Recently I spent some time playing with [Ember App Kit](https://github.com/stefanpenner/ember-app-kit).
Ember App Kit is a suggested project structure for your applications
built by Stefan Penner (and a bunch of other awesome developers). It's
really great and if you've never tried it out you should!<sup>[<a href='#refresh-footnote-1'>1</a>]</sup>

One feature Ember App Kit includes out of the box is support for
[connect-livereload](https://github.com/intesso/connect-livereload),
which automatically reloads your changes in your browser whenever
you save a file.

It sounds like a minor thing, but after using it for a few hours having
to manually hit Cmd-R feels like a chore. It's a great little productivity
booster.

Live Reload also has a side effect: *it encourages you to make your
application refresh resistant*.

In my application I had a multi-step wizard where you had to
enter many form fields at once, and I found it so frustrating to have
all my form data pulled out from underneath me every time I hit save.

The frustration led me to persist the form data temporarily in [localStorage](http://en.wikipedia.org/wiki/Web_storage#Local_and_session_storage).
Once I did that, every time my application refreshed it looked exactly
the same as it did before. It was probably a grand total of 10 minutes
of work, and my application was much more resilient for it.

### The Refresh Test

A great experiment to perform on a Javascript heavy application is to
simply refresh the page and see where you end up. Does it look the
same as before? Did you lose any work?

Users will put up with losing a small amount of state on refresh, for
example if they'd expanded a menu and it's suddenly collapsed, but you should
*never* throw away what they were working on.

One thing I love about Ember.js is that its router makes you
[think in terms of URLs](http://emberjs.com/guides/routing/), which gives you a great
head start for handling refreshes and the dreaded back button.

Many people think of URLs as files, because in the past requesting a path like
`profile.php?id=eviltrout` meant you really wanted a file on the server
called `profile.php` with the parameter `eviltrout`.

I find it's better to think of a URL as the serialized state of your
application. A path of `/profiles/eviltrout` should mean "I'm viewing
eviltrout's profile."

If you're building a Javascript application and the URL is not changing
as your users navigate around, that is practically begging to give them a bad
experience at some point. Not only can they be easily frustrated if they hit the back or refresh
buttons, but they won't be able to bookmark or share links with others.

I'm not suggesting that the URL contain *every* possible interaction a
user can make; if you do that you will end up with a huge headache and
a meaningless URL. Instead, you should focus on the most important things a
user will want to see when the page is refreshed. For example, on Discourse
we [maintain a user's scroll position](http://eviltrout.com/2013/02/16/infinite-scrolling-that-works.html)
in a topic by changing the URL as they scroll.

Going forward, I'm going to make sure that all my applications handle refreshing
elegantly and I recommend you do too! If you're interested in more on this topic,
Tom Dale has a great talk on this called [Stop Breaking the Web](http://2013.jsconf.eu/speakers/tom-dale-stop-breaking-the-web.html).

---

<span id='refresh-footnote-1'>1.</span> If you're a fan of using bleeding edge stuff, check out Stefan Penner's
[ember-cli](https://github.com/stefanpenner/ember-cli) and Jo Liss'
[broccoli](http://www.solitr.com/blog/2014/02/broccoli-first-release/).
Ember App Kit works well today but those projects are a glimpse of the
future of where Ember development is headed.


