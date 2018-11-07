---
layout: page
title: Turbolinks and the Prague Café Effect
date: 2013-01-06
---

### Turbolinks

[Turbolinks](https://github.com/rails/turbolinks) is a new Ruby library, enabled in Rails 4 by default, that is designed to speed up your web applications.

It does this by binding a Javascript handler to all link clicks. Instead of allowing the browser to load the new page, it fetches it in the background via AJAX. It then parses out the body, and injects it into the document you're currently viewing.

The main advantage of Turbolinks is that your static assets such as Javascript or CSS will not be downloaded or parsed every time a link is clicked. This can result in a significant client side speed improvement for your end users.

Turbolinks was extracted from work that 37signals did on the latest release of their [Basecamp](https://basecamp.com) product and has given them some serious [speed improvements](http://37signals.com/svn/posts/3112-how-basecamp-next-got-to-be-so-damn-fast-without-using-much-client-side-ui).

I happen to live in [one of the largest cities](http://en.wikipedia.org/wiki/Toronto) in North America. Basecamp is hosted out of Chicago, which, at 880KM away is actually quite close to me! The Internet is fast, and we can send those packets over distances in a jiffy.

When I click on a link on Basecamp, things load super quickly! Good job 37 signals and Turbolinks!

...But what if I didn't live in North America?

---

### The Prague Café Effect

A few developers traveled to Prague a few months ago for a conference. I'm told they had a fantastic time: the city was beautiful, the food was delicious and the people were lovely. The one major downside was they had to go to a local café to access the Internet.

Accessing a North American site was a wholly different experience. Web applications that used to be fast suddenly took forever to respond. All those packets had **7x** as far to travel *each way*!

Large companies like Amazon have a solution to this problem: they set up data centres all over the world. Their users are directed to the closest server for faster speeds.

The issue with this approach is that setting up data centres all over the world is too expensive for most. Additionally, the development involved to partition your data, or keep data it in sync over large distances is hard. The chances are, unless you are a Google or Amazon you *probably aren't doing this*.

Fortunately, there is an accessible way to use geographically disparate data centres that is easy and cheap: The trusty [Content Delivery Network](http://en.wikipedia.org/wiki/Content_delivery_network) (CDN).

Setting up a CDN is ridiculously easy these days. There are dozens cheap and reliable ones. I can't recommend them enough. **If you care about the performance of your web application, you should be using a CDN**.

The major downside of a CDN is that they only blaze on static content. Your North American dynamic content won't arrive any faster at that Internet Café in Prague.

---

### Back to Basecamp

The smart guys at 37signals use a CDN for Basecamp. Good stuff. But what happens when you click around? For example, here is my list of projects in basecamp:

<img src="/images/posts/basecamp.png" class="screenshot" alt="Basecamp Projects List">

On the left column in the screenshot, directly below New Project, they have a few icons you can click to filter your project list. When I click one of the icons, I get a view like this:

<img src="/images/posts/filter_az.png" class="screenshot" alt="Filter A-Z">

This view must be very useful if you have many projects. However, what do you think happened between my browser and the server when I clicked the icon?

My web browser already contained all the data I needed to display the list (just a title and link.) However, due to the way Basecamp is set up, it actually makes a full HTTP request to the server, which returns HTML, which is then shoved in the DOM.

This is a major flaw. *Turbolinks encourages you to make requests to the server when you want to change the UI, even when the end user already has all the data they need!*

But isn't Turbolinks [supposed to be fast](http://37signals.com/svn/posts/3112-how-basecamp-next-got-to-be-so-damn-fast-without-using-much-client-side-ui)? Yes, but **Turbolinks is biased towards those who live close to your servers**.

---

### Leveraging your CDN

There is a way you can leverage the power of the CDN to improve the performance of your web application, regardless of where your users live: by using a Javascript MVC framework. [There are many to choose from](http://blog.stevensanderson.com/2012/08/01/rich-javascript-applications-the-seven-frameworks-throne-of-js-2012/), but for the last year I've been using [Ember](http://emberjs.com/), so I'll speak about that one.

<center><img src="/images/posts/ember.png" class="embedded" alt="Ember Hamster"></center>

In a typical Ember application, you perform all your rendering on the client side, using handlebars templates. Your templates are bound to the objects you have in the browser's memory, so if the object changes, the template will automatically re-render. If the projects list in Basecamp were coded this way, clicking on the new filter would just tell Ember to re-render the page using a different view, and nothing would be exchanged with the server.

The *default* behavior in an Ember app is to only download your stylesheets and scripts once, so you get the benefit of the Turbolinks-style "one-time parse" too.

Of course, you can't *eliminate* the conversation with the server entirely - JSON data would need to be
sent down the wire initially to populate the projects list. However that payload is generally a lot smaller, as JSON contains much less extra data than the HTML your server would send back. And you can do a lot more with it, for example filtering to only "starred" projects rather than making a whole new request.

I've found that the more comfortable I get with this approach, the more I end up shoving into the CDN for fast delivery to end users. All my application's templates live in the CDN, as does all the UI logic.

---

I deliberately left out a part of the Prague Café story.

The developers there had access to an Ember app I've been working on. They claimed it was one of the fastest sites they accessed. Our CDN delivered almost everything to them, so they only had to reach across the ocean when they absolutely needed to.

If you haven't had a chance to investigate a Javascript MVC framework, I highly recommend you skip Turbolinks altogether and do so.

