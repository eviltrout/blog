---
layout: post
title: Infinite Scrolling that Works
date: 2013-02-16
---

Shortly after we began working together on [Discourse](http://www.discourse.org), Jeff wrote a post about [infinite scrolling](http://www.codinghorror.com/blog/2012/03/the-end-of-pagination.html). At first, I was surprised at how many people claimed to hate sites that used it. However, after reading through many comments
about it, I realized that most didn't hate the scrolling itself, *they hated how it broke their browser!*

### Infinite Scrolling done wrong: Twitter

When I visit Twitter, I am presented with a list of tweets in reverse chronological order. If I scroll down far enough, Twitter will automatically
load more tweets so I don't have to stop reading. Initially, their implementation seems great. I can keep scrolling until I'm done reading.

Twitter's infinite scrolling has a huge limitation -- it only works while you keep your tab open. Try this: open a Twitter window, and scroll down a fair bit.
Remember the tweet at the top of your browser window. Restart your browser. If you're using Chrome, it should re-open all your tabs automatically. Is the
tweet you remembered anywhere near the top of your screen? No. Personally, when I do this, I get stuck at the bottom of the first set of tweets Twitter 
loads.

The engineers at Twitter seem aware of this flaw. Their whole UI is designed around making sure you never lose state in that one tab. All links in tweets open 
in new tabs when clicked. Your private messages load in a pop-up. Clicking on a user shows a modal with their most recent tweets. If you want to see more 
of their tweets, it reloads the whole tab with a view of just that user. 

After you've read a few tweets, what if you want to go back to where you left off in your initial stream? Sorry! Your back button only goes back to the top.

### How Discourse deals with these issues

Discourse has infinite scrolling, but it doesn't have any of the aforementioned issues Twitter does. If you scroll down in a topic and close your browser, you'll end up right back where you left off. We don't force links to open in new tabs by default: if users want to do that, they can do it themselves.

How do we do this this? By taking advantage of HTML5's [History API](https://developer.mozilla.org/en-US/docs/DOM/Manipulating_the_browser_history).

Compare the URL 

You might have noticed that as you scroll through a topic in Discourse that the URL changes. At first, a URL in a topic looks like this:

    http://meta.discourse.org/t/is-it-better-for-discourse-to-use-javascript-or-coffeescript/3153

After you've scrolled down a little bit, it will look like this:

    http://meta.discourse.org/t/is-it-better-for-discourse-to-use-javascript-or-coffeescript/3153/4

The `/4` that is appended to the end refers to the current post number you're looking at in the topic. In this case, your screen is positioned near the top of the 4<sup>th</sup> post of topic id 3153.

The [replaceState](http://docs.webplatform.org/wiki/dom/methods/replaceState) function in the History API allows us to do this. `replaceState` tells the browser that the URL has changed and the new one should be used if the user hits the back button or reopens a closed tab.

To complete the back button functionality, we then have to support incoming URLs with a post number in them, so we can restore the view the user saw before they left. In Discourse, a URL with a post number doesn't mean "only show me post x", it actually means "give me a bunch of posts with x near the top."

The rest of our infinite scrolling implementation is fairly straightforward. When you reach the bottom of the posts in memory, we trigger a call to load posts after the last post we know. If you scroll upwards to the top, we load the posts before the first post. 

### The URL is the serialized state of your web application

URLs are meant to represent the location of *resources* - but I often think people are too focused on resources as documents or videos. Why shouldn't a URL mean "the posts near post 100"? Twitter's URL is almost always *twitter.com*, and their user experience suffers for it. 

I won't claim that Discourse's approach to infinite scrolling is perfect. There is certainly room for improvement and of course we'd love contributions to our source code. However, I do feel we've taken the right approach to infinite scrolling so far by persisting user state in the URL
as they scroll.




