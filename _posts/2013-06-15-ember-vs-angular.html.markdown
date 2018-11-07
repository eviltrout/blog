---
layout: post
title: "AngularJS vs Ember"
date: 2013-06-15
---

Recently I got together with some local developers to discuss client side MVC frameworks. We ended up discussing many of the differences between [AngularJS](http://angularjs.org/) and [Ember](http://emberjs.com/).

[Discourse](http://www.discourse.org/) is an Ember application and has been since the first prototype, so I have a lot of experience with it. However, it became clear during the conversation with my peers that there was a lot about AngularJS I didn't know.

There is evidence that AngularJS is beating out Ember in terms of developer mind share: there are more Stack Overflow questions dedicated to AngularJS. AngularJS has more stars and forks on Github. At a recent Javascript meetup in Toronto, when polled virtually every developer expressed interest in learning more about AngularJS. Clearly there is something to this framework!

I decided to take some time to seriously investigate AngularJS and see what all the fuss was about. I read through as much documentation, blog posts and guides as I could. I downloaded AngularJS and made simple applications. I reached out to local developers and pestered them with questions about the framework.

I have a good idea now why AngularJS is gaining momentum: it is simpler. There is a lot less to the framework and as a consequence it's easier to learn. If I were to rank the amount of tools various client side MVC frameworks give you, Angular seems to exist somewhere near the half way point between [Backbone](http://backbonejs.org/) and Ember.


### The pitfalls of simplicity

A few years ago, many Rails developers I knew were excited about [Sinatra](http://www.sinatrarb.com/). Sinatra is *far* simpler than Rails. It allocates a fraction of the objects Rails does. I observed a pattern as those developers started to build out their applications. Some were used to Rails' large toolbox of convenience functions so they included ActiveSupport. Some needed ORMs so they included ActiveRecord. At that point, what was the advantage of Sinatra? You were basically running a Rails application.

Framework simplicity is good if your application is meant to be simple. But you should be cautious when choosing simplicity if your application is ambitious and you care about supporting it for a long time.

Don't get me wrong: if an API is convoluted and verbose, and a competing one is equally functional yet simpler to use, by all means use the competitor. However, people are far too quick to mistake simplicity for good design.

Ember has more concepts to learn and more to wrap your head around than AngularJS. Before you write off Ember due to its complexity, consider why the developers added all that extra stuff. Perhaps it's there for a reason?

Ember is a toolbox full of concepts you *will* find useful if you want to build a large and maintainable application. The trade offs it has made in its API are there to help you structure your code in a sane way. As you learn Ember you will notice several philosophies and opinions that are completely absent from the  AngularJS framework.

This is far better illustrated via example. In this post, I'm going to try and demonstrate a few major shortcomings in AngularJS and how the Ember approach is much better.


### In pursuit of a single source of truth

Let's say you're working on a web application that does rendering on the server. The current page you're working on is meant to display a list of items as rows, and if the user clicks on a row, it will change color to indicate it's been selected.

If you were using [jQuery](http://jquery.com/) to do this, you'd likely bind a function to the click event on each row. When fired, your function would change the CSS class of the row to highlight it.

You can't stop there, though. Your function also has to remove the CSS class from any other rows that were previously selected. That's a little crazy if you think about it! Changing which item is selected means we have to know _everywhere_ that it's been represented in our UI.

**Whenever you store the same piece of data in multiple places, it is likely to go out of sync**. Additionally, your code ends up being longer and more complex as it has to manage all the various updates every time it changes.

Client side MVC (Model View Controller) frameworks like Ember and AngularJS separate your data model from its presentation. Your model becomes the *single source of truth*. If you change it, your HTML template changes automatically. If you want to know its current value, you read it from the model instead of the DOM.

This is a a huge boon to developer productivity while simultaneously reducing the potential for errors related to out of sync data.


### What's an AngularJS Model?

AngularJS touts itself as a MVC or MVW (Model View Whatever) framework.

It's clear where AngularJS' view layer is: you annotate regular HTML documents with `ng-*` attributes and handlebars style {% raw %}`{{variable}}`{% endraw %} expressions. It's also easy to understand where the controllers are; you link Javascript classes to elements using `ng-controller` attributes.

What isn't clear, especially if you come from a server side MVC background, is _what is an AngularJS model?_ There is no standard `Model` base class, nor is there a component or interface in AngularJS that defines what a model is supposed to be.

In an AngularJS controller, you are given an object called `$scope`. Any data you attach to it is rendered in your HTML template:

```javascript{% raw %}
function SomeCtrl($scope) {
  $scope.countries = ['can', 'usa', 'fra', 'jap'];
  $scope.user = {name: "Evil Trout"};
  $scope.age = 34;

  // Our template now can render {{age}}, {{user.name}} and a list of countries!
}
{% endraw %}```

According to the [AngularJS documentation](http://docs.AngularJS.org/guide/dev_guide.mvc.understanding_model) *any named data* in an AngularJS `$scope` is a model, not just Javascript objects and arrays, but primitives, too! In the above snippet, there are **three** models!

### What's wrong with Javascript primitives as models?

AngularJS gives you tools you need to manage a single source of truth in your templates. This is a concept known as [data binding](http://en.wikipedia.org/wiki/Data_binding). If we created a template that has an AngularJS expression {% raw %}`{{age}}`{% endraw %}, we can say it's bound to the `$scope.age` model. If you wrote {% raw %}`{{age}}`{% endraw %} several times in one template, and executed `$scope.age = 40` in your controller, all would update simultaneously.

There is a secondary level of data binding, however, that you need if you truly want to express a single source of truth, and that is *within your data model itself*. In other words, AngularJS stops short by only allowing for data binding only between your `$scope` and template, not within the structures in your Javascript code.

In Ember, all models extend the `Ember.Object` base class. When you do this, you gain the ability to declare relationships within and between models. For example:

```javascript
var Room = Ember.Object.extend({
  area: function() {
    return this.get('width') * this.get('height');
  }.property('width', 'height')
});
```

Here, we've created a model called `Room`. We've declared `area` which is known as a [computed property](http://emberjs.com/guides/object-model/computed-properties/). The `property` syntax you see at the end there tells Ember that the `Room`'s `area` depends on its `width` and `height`.

Creating an instance of this model is easy:

```javascript
var room = Room.create({width: 10, height: 5});
```

Now we can create a template:

```handlebars{% raw %}
<p>Room:</p>

<p>{{width}} ft.</p>
<p>{{height}} ft.</p>
<p>{{area}} sq ft.</p>
```

And Ember would render the attributes correctly. In this case, it's impossible for `area` to be out of sync with `width` and `height`. If either of those two properties change, `area` will be updated automatically.

### Modeling this in AngularJS

Because AngularJS models are regular Javascript objects, AngularJS doesn't have an equivalent to computed properties. However, you can approximate them using functions on your objects:

```javascript
var Room = function(args) {
  this.width = args.width;
  this.height = args.height;
}

Room.prototype.area = function() {
  return this.width * this.height;
}
{% endraw %}```

To access the area of our Room, you have to add a set of parentheses to your `area()` call:

```handlebars{% raw %}
<p>Room:</p>

<p>{{width}} ft.</p>
<p>{{height}} ft.</p>
<p>{{area()}} sq ft.</p>
{% endraw %}```

This illustrates a key difference between Ember and AngularJS. Ember subscribes to the [Uniform Access Principle](http://en.wikipedia.org/wiki/Uniform_access_principle). In an Ember template, regardless of whether you are accessing something that is computed or something that is a primitive, the expression looks the same. In AngularJS, functions have to be specifically demarcated.

This can cause maintainability nightmares down the road. Over time, in a large software project, you will inevitably want to replace something that was previously a primitive with a method. In Ember you can do this painlessly; in AngularJS you'll have to update every template where that model is used.


### Using getters and setters

It's worth discussing a related trade-off you might have noticed in the Ember code above: to access properties of a model, you have to use getters and setters. This means a little extra typing, but you reap the same benefit in the Javascript code that you do in the template: replacing a primitive with
a function will just work!

A secondary benefit to using getters and setters is you can chain them safely. Consider the following code:

```javascript
console.log(room.inhabitant.name);
```

What happens if the `inhabitant` is not present? You'll raise a Javascript error. In the Ember equivalent you'll get `undefined` back, which makes it
easier to write more resilient code:

```javascript
// outputs undefined
console.log(room.get('inhabitant.name'));
```

### Performance issues

There is another downside to using a functions instead of computed properties: it's much slower.

In our Ember code, we expressed that `area` depends on `width` and `height`. In AngularJS, we didn't do that. So how could AngularJS possibly know
to re-render the area if the width or height changed? In fact, how does AngularJS *ever* know to re-render when things change if it's not using
special Javascript objects for models?

The answer is: *it doesn't*. AngularJS uses a process called [dirty checking](http://stackoverflow.com/a/9693933/165668) to determine what it needs
to update in the DOM. When a controller finishes executing code, AngularJS compares everything in the `$scope` to its previous values. If
they've changed, it updates the DOM.

AngularJS *cannot* know whether it needs to execute the function again because it doesn't know what the function does, so it executes its code *every
time* it has to update the template. What if your function is executed hundreds or thousands of times on a template? What if the function does
a non-trivial computation? That would be very slow!

I asked around how AngularJS developers get around this and apparently the best answer is to cache the result of the function yourself in a
different variable. But if you do that, you've got more than one source of truth for that value. If you ever update the `Room`'s dimensions, how do we guarantee that the `area` property will be updated too?

I was pointed to an AngularJS function called `$scope.$watch` that allows you to watch an expression and execute some code when it changes. The
problem is that the `$watch` function belongs to the `$scope` and NOT the `Room`. If you had an array of `Room` instances for example, you
can't watch them all without looping through them all constantly.

What if the same `Room` object instance existed in multiple controllers? You'd have to have the `$watch` in *every* controller which
would mean a lot of unnecessary recalculations. Good luck debugging issues if you take that approach! Talk about a maintenance nightmare!


### Reusing object instances

AngularJS makes it much harder to reuse object instances than Ember does. In an Ember template for example, you can link to another route using the
`{% raw %}{{linkTo}}{% endraw %}` helper:

```handlebars{% raw %}
<ul>
{{#each user in users}}
  <li>{{linkTo 'users.show' user}}Show {{username}}{{/linkTo}}</li>
{{/each}}
</ul>
{% endraw %}```

Here, we're looping through a list of users and creating a link to show that particular user. If you hovered over the link, you'd see something like
/users/show/123 if your routes were set up properly. However, when you click the link, Ember actually passes the *reference to the user* through
to your other route.

Ember's router is smart enough to not have to resolve the user by `id` again if it already has the user object in memory. It just makes use of the
object it already has. In AngularJS, every time you visit a route, it passes an `id` and has to resolve it in your controllers.

One of the great advantages of long lived browser applications is you can reuse objects as the user navigates around. AngularJS doesn't follow
this philosophy; it encourages you to throw away what you already had and find it again (probably from the server!).

Another consequence of this is that if you ever end up with two instances of the same `User` in memory, you've violated the single source of truth
again!


### Conclusion

I think it's clear at this point that Angular's focus on simplicity has some serious consequences. There are workarounds for some of these
issues that you can implement yourself in your project with great discipline, but ask yourself this: are all developers on your team
going to follow the same conventions? Additionally, if you add all sorts of extra constructs to AngularJS to make it work like Ember, why not
just use Ember in the first place?

Due to it's lack of conventions, I wonder how many Angular projects rely on bad practices such as AJAX calls directly within controllers? Due to
dependency injection, are developers injecting router parameters into directives? Are novice AngularJS developers going to structure their code in a way that an experienced AngularJS developer believes is idiomatic?

In fact, *what is idiomatic AngularJS*? None of the examples or blogs I read through demonstrated how to reuse object instances, for example. Is that just not done in AngularJS applications?

Ultimately, I think you should examine your application's goals. Do you want to build something that pushes the boundaries of what people expect from the web? Is your application going to be super simple, or do you want to add powerful features and maintain it well over time?

If you're serious about front end development, I advise you to take the time to learn Ember properly. Once you figure out how all the pieces fit together, you'll won't be able to live without them.


### Final Note

If you know Angular and I've written something wrong here, please contact me to let me know! I'd love to revisit or correct any mistakes or omissions.


