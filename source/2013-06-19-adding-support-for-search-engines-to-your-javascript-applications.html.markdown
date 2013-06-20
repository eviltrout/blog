---
title: "Adding Support for Search Engines to your Javascript Applications"
date: 2013-06-19
---

{:javascript: class=javascript}

It's a myth that if you use a client side MVC framework that your application's content cannot
be indexed by search engines. In fact, [Discourse forums were indexable by Google](https://www.google.ca/search?q=site:meta.discourse.org+javascript) the day we launched.

Search engine visibility does, however, require a little more work to implement. This is a real trade off
you'll have to consider before you decide to go with an MVC framework instead of an application that does its rendering
on the server side.

Before you get scared off: I'd like to point out that our search engine code was done by [Sam Saffron](http://samsaffron.com/)
in a **day**! This extra work might take you less time than you thought.


### Getting Started: Pretty URLs

Out of the box, most client side MVC frameworks will default to hash-based URLs that take advantage of
the fact that characters in a URL after an `#` are not passed through to the server. Once the Javascript
application boots up it looks at hash data and figures out what it has to do.

Modern browsers have a better alternative to hash-based URLs: The HTML5 [History API](https://developer.mozilla.org/en-US/docs/Web/Guide/DOM/Manipulating_the_browser_history#Adding_and_modifying_history_entries). The History API
allows your Javascript code to modify the URL without reloading the entire page. Instead of URLs
like `http://yoursite.com/#/users/eviltrout` you can support `http://yoursite.com/users/eviltrout`.

There are two downsides to using the History API. The first is Internet Explorer only started
supporting it IE10. If you have to support IE9, you'll want to stick with hashes. (Note: Discourse
actually works on IE9, but the URL does not update as the user goes around. We've accepted this
trade off.)

The second downside is that you have to modify your server to serve up your Javascript application regardless of
what URL is requested. You need to do this because if you change the browser URL and the user refreshes their
browser the server will look for a document at that path that doesn't exist.

* [How to Enable the History API in Ember](http://emberjs.com/guides/routing/specifying-the-location-api/)
* [How to Enable the History API in AngularJS](http://docs.angularjs.org/guide/dev_guide.services.$location#html5mode)


### Serving Content

The second downside I mentioned actually has an nice upside to it. Even if you are
serving up the same Javascript code regardless of URL, there is still an opportunity for the
server to do some custom work.

The trick is to serve up two things in one document: your Javascript application
and the basic markup for search engines in a `<noscript>` tag. If you're unfamiliar with a the `<noscript>`
tag, it's designed for rendering versions of a resource to a clients like search engines that don't support
Javascript.

This is really easy to do in Ruby on Rails (and probably other frameworks that I'm less familiar with!).
Your `application.html.erb` can look like this:

    <html>
      <body>
        <section id='main'></section>
        <noscript>
          <%= yield %>
        </noscript>
      </body>
      ... load your Javascript code here into #main
    </html>

With this approach, if any server side route renders a simple HTML document, it will end up in the `<noscript>`
tag for indexing. I wouldn't spend much time on what the HTML looks like. It's meant to
be read by a robot! Just use very basic HTML. To preview what a search engine will see, you can turn
off Javascript support in your browser and hit refresh.

We've found it advantageous to use the same URLs for our JSON API as for our routes in the
Javascript application. If a URL is requested via XHR or otherwise specifies the JSON content
type, it will [receive JSON](http://meta.discourse.org/users/eviltrout.json) back.

In Rails, you can reuse the same logic for finding your objects, and then
choose the JSON or HTML rendering path in the end. Here's a simplified version of our
`user#show` route:

    def show
      @user = fetch_user_from_params

      respond_to do |format|
        format.html do
          # doing nothing here renders show.html.erb with the basic user HTML in <noscript>
        end

        format.json do
          render_json_dump(UserSerializer.new(@user))
        end
      end
    end

Note that you don't have to implement HTML views for all your routes, just the ones that
you want to index. The others will just render nothing into `<noscript>`.


### One More Thing

If you get an HTML request for a URL that also responds with JSON, there is a good chance
your application is going to make a call to the same API endpoint after it loads to
retrieve the data in JSON so it can be rendered.

You can avoid this unnecessary round trip by rendering the JSON result into a variable
in a `<script>` tag. Then, when your Javascript application looks for your JSON, have it check to see
if it exists in the document already. If it's there, use it instead of making the extra
request.

This approach is much faster for initial loads! If you're interested in how it's
implemented in Discourse, check out:

* [preload_store.js](https://github.com/discourse/discourse/blob/master/app/assets/javascripts/preload_store.js) - a simple interface to load data that's been set in `PreloadStore`.
* [application.html.erb](https://github.com/discourse/discourse/blob/master/app/views/layouts/application.html.erb#L59) how we set data in `PreloadStore`.





