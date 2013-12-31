---
title: "Organizing Data in Long Lived Applications"
date: 2013-05-26
---

### Trade offs

As a developer you're constantly faced with issues of choice: What library is best? What framework is best? What
platform should we deploy on?

Most of the time there isn't a clear winner. The decision you make comes down to a series of trade offs. Do you
want to optimize for developer happiness or performance? Do you care more about platform maturity or cost?

One trade off Ember.js has made relates to how it favors *long living applications*.

Ember.js applications tend to have larger downloads on your first request. This is not a great trade off to make if
you expect your user to bounce away quickly right after visiting your site. However, if you hope they will stick
around longer and navigate to many different things (such as in a Discourse forum) it's a big win.

### Old Habits Die Hard

When implementing server side applications, the best approach is often to do as little as possible as quickly as possible,
then free your memory for the next request. This approach works very well and is performant, but is incongruous with long running
applications.

Recently the distinction between short lived applications and long lived ones has started to rear its head in the design
of Discourse, so I thought I might discuss a mistake I think we've made and how we plan to refactor and address it in the
future.

### Case Study: A User Directory

Let's say you want to implement a user directory. It will list the users of your application, and clicking on one will display
an expanded view of their details.

### The Server Side Implementation

If you were doing this on the server side, you would probably start by performing a query of all the users, and rendering
an HTML page with their names and links to their details. If your user table was big, you might restrict your query to only
the columns you cared about, for example (`id`, `username`, `fullName`, `dateRegistered`).

The user details page would take an `id` as a parameter, and would use it to query the database for additional columns and
return them all as a nice HTML document.

When developing server side applications, you try to share as little state as possible between requests. The server's
philosophy might be summed up as "Forget about everything you know -- I'll tell it to you again." For example, the
user's name is right there on the directory list, but when you ask for that user's details the browser ejects it
from memory and asks for it again by id.

While it does seem wasteful to throw away what the client already has in memory, the system clearly works:
most web applications are built this way and function well. If your application is mainly a set of simple links
that the end user will follow, it will probably work out okay.

This approach becomes much less efficient when you don't want to go all the way back to the server just to update
or change a tiny piece of your document. There is a "short lived" solution for that too. You can use jQuery and
make Ajax calls, then only update the parts of your view that you care about. The issue here is the more you
do this, and the more dynamic your application becomes, the harder it is to organize and maintain your code
efficiently. *Sprinkles* of jQuery might work for some, but if your application is *ambitious* you'll probably
have more success with a client side MVC framework like Ember.js.

### The Ember.js Implementation

At first the Ember.js implementation of the user directory seems similar. You'd implement a route that
retrieves a list of user objects from the server in JSON and a handlebars template to render them.

In the template, you'd create a link to another route to display the user's details:

```handlebars
{{#each user in model}}
   <li>{{#linkTo showUserDetails user}}{{username}}{{/linkTo}} - {{fullName}}</li>
{{/each}}
```

There is a major difference here between the server and client side approaches. When you link to a user this way
in Ember.js, the reference to the User object you are displaying is actually passed through to your `showUserDetails`
route.

In other words, the `showUserDetails` route doesn't have to look up the user again or anything like that.
It is literally pointing to the same object in memory that the user list was using. This is what I mean when I say
Ember is designed for long lived applications. If you expect your app to be kept open for a while, you can re-use
the same objects in memory that you already have!

This is awesome because if your `showUserDetails` route wants to show the `fullName` or other attributes we've already
loaded, it can do it without contacting the server. If you hit the back button and click on another user,
the server will not be contacted.

### A Common Pitfall

When viewing a user's details, there are probably going to be a lot more fields to display than the list had. It would be
inefficient to query all of a user's data just to display a list. What if each user had 30 columns including text
blobs? Most of that data would be loaded and never seen... not to mention it would probably load quite slowly!

We knew this was an issue in Discourse from day one, so we did what we thought would be reasonable: we'd return lightweight
`User` objects with only a few of the fields loaded. The user list route would display them with the appropriate links. When
the `showUserDetails` route loaded, we'd ask the server for the additional fields, and put them into our object.

This works, and is what you'll find in most of the Discourse codebase right now. We've found though that it becomes very
difficult to manage. Given any instance of a `User` object, how do you know if the extra fields have been loaded?

* One approach is to force a more detailed User object to load when the route is entered, but that avoids
the advantages of long lived applications. Also you'd need multiple code paths for the different styles of JSON, perhaps `BasicUserSerializer` and `DetailedUserSerializer`, which gets messy fast.

* Another approach is to use a field like `detailsLoaded` to keep track of whether we have the details. If the field is false,
we load them and set it to true. This works but is also annoying to work with. You still need multiple serializers, and now you're
putting data in your object which solely exists to recall whether other data is present.


### Proposed Solution: Split up the Object

What if we thought of `UserDetails` as a separate entity, that is associated with the `User` via a "has one" relationship?
The user list would use a *single* JSON serialization path, `UserSerializer`. When the details need to be loaded, they'd
ask the server for them as a singular resource that would only include the fields it needed: `UserDetailsSerializer`.
Once loaded once, the relationship would be established inside the user object.

With this approach it would be easy to show a result to a user right away, as well as a message while the
details are loading:

```handlebars
<div>Username: {{user.username}}</div>
<div>Full Name: {{user.fullName}}</div>

{{#if user.details}}
  <div>Bio: {{user.details.bio}}</div>
  <div>Birth Date: {{user.details.birthDate}}</div>
{{else}}
  Loading user details!
{{/if}}
```


### Thinking Forward: Identity Maps

If you're working with a server side API, you'll inevitably end up with code paths in your app that don't have a reference
to an object but know it by `id` or another identifier. In this case, it's all too easy to naively load two instances of
the same object into your browser's memory which is wasteful and error prone.

In the future, we plan to add an identity map to Discourse that will ensure that multiple lookups by `id` will always
reference the same object in memory. Before contacting the server, the identity map will be checked for the object we want
in case we already have it around.

Another advantage to the solution above is it fits in very well with an identity map. The `id` for retrieving a user's
details will be the same as the `User` itself. We can share a lot of code, use less memory and avoid common bugs
and logic with unloaded data.


It's all too easy to try and map your client side application 1:1 with your server side API. However, you should take a
step back on a regular basis and consider whether you are taking full advantage of the tools at your disposal.

Programming is often implementing something that works, but discovering a better approach along the way. This is one
example of that in Discourse, but I'm sure there are many more. We love getting contacted about new and better
approaches to our code base, especially when it comes with pull requests :)

