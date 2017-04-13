---
title: The value of a thousand little features
date: 2017-04-13
---

It's been over a year since I [wrote a blog entry](https://eviltrout.com/2016/02/25/fixing-android-performance.html)! And while of course the universal excuse of "I've been busy" applies, I think we reached a point in [Discourse](http://www.discourse.org/)'s development where we just were able to focus on the product without a lot of stuff getting in our way.

I've now been working on Discourse full time for 5 years. In the beginning we had a lot more uncertainty about technical decisions. Some of the things we debated interally include:

- Whether to use Rails or Node.js (We chose Rails)
- Whether to use an ORM direct SQL (We use ActiveRecord)
- Whether we could get away with a NOSQL database instead of Postgres
- Whether to do server side rendering or embrace a front end MVC framework (We use Ember.js)
- Whether to use CoffeeScript/Javascript (Javascript won, now ES2015)

&nbsp;

Beyond those major discussions, we also went back and forth a lot about the details of our codebase:

- How much test coverage is enough?
- How and when do we introduce internationalization?
- How should the code base look (how much space, when to add new lines, etc)
- How do we handle code reviews from within our team?

&nbsp;

If you're reading this as a developer, I'll bet some of the above bullet points triggered some immediate opinions :)

The truth is that **over time our team found its mojo**. Issues we had with our major decisions eventually found workarounds or solutions. Members of our team whose priorities were different (performance focused vs code quality for example) eventually found a happy ground and we just became productive.

We also saw some excellent performance gains in Ember.js and V8, and both of those teams deserve some serious credit. Android performance still isn't where I'd like it to be, but it's improved significantly since the project began.

To be clear: we aren't done changing our codebase. For example [there's interest in moving to TypeScript](https://meta.discourse.org/t/revisiting-moving-to-typescript/60519/3?u=eviltrout), and we are pretty tired with Sprockets so we'll be ditching that, plus we want to upgrade Ruby and Rails versions. Web technology continues to advance and we're along for the ride!

### A thousand little features

Once in a while, someone will ask me (in a polite way) something like "hey, after 5 years, what is left to do for forum software?"

From a 10,000ft view, it seems that Discourse already does what you'd expect forum software to do. We let users log in, read content and post replies. So what the heck is our team still working on?!?

There is a tendency in software engineering to oversimplify products you're not familiar with. I remember reading a Hacker News article about Disourse a few years ago where someone posted something to the effect of:

> Why is the Discourse codebase so big? Aren't they just taking text and showing it on a web page?

Well, yes. But isn't *every* web application ultimately just taking text and showing it on a web page? If it were that simple I think we would have packed it up a long time ago.

If you zoomed in closer on Discourse, say to the 5000ft view, you'd see that we have many big features we had to implement but might not seem obvious at first including: Sub-categories, User Groups, Theming, Moderator Tools, a Setup Wizard, etc). I think a lot of experienced developers would recognize that you'd need all that stuff as your product gets used by more people.

The thing that has been a great learning experience for me though, is the *thousands* of little features that most people don't see.

When a user posts on Discourse, they're presented with what is essentially a HTML `<textarea>`. They fill it in, hit post and their content shows up in the topic.

What is not obvious, unless you've *actively used the software* is how many little features are layered on top of that to encourage what we think is good discussion.

For example (and this is nowhere near an exhaustive list):

- If your reply is too short, we'll encourage you to say more. Short replies offer little value.
- If your post links to something recently mentioned, we'll say "Hey that was already posted x replies above you."
- If your new topic is similar to one that already exists, we link to it and tell you to check it out first before perhaps creating a duplicate.
- If you start dominating the topic by replying too much, we ask you to slow down and give other people a chance to participate.
- If you are only replying to the same person over and over, we suggest that you might be derailing the topic and perhaps should take it elsewhere like a private message.

&nbsp;

Those thousands of little features really add up over a while. We've added them because we use Discourse every day and have seen patterns of usage in our own forums and the forums of our customers that we think we can improve.

Of course, a truly toxic user will find a way to be toxic regardless of how many times to discourage their bad behavior, but the vast majority of users are *not* toxic and will happily follow hints that lead them towards a better discussion. Many of our users will never see this work, but the ones who do will hopefully be pointed in the right direction.

I love that we can add these little things quicky to our codebase, and because we're a web application we can deploy them to users right away to see their effects and tweak them over time. It has really changed a lot of my thinking of software development, where there traditionally seems to be a huge focus on BIG features to create value.

Maybe instead of spending months creating a big feature, spend a day or two knocking out a small one? Those little ones really add up, and can add up to make a big difference before you know it!

