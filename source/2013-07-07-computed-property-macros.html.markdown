---
title: "Computed Property Macros"
date: 2013-07-07
---

### Computed Properties

By design, [Handlebars](http://handlebarsjs.com/) templates don't allow complex expressions. You are given
an `{{#if}}` block helper, but it can only evaluate whether something is "truthy" (aka `true`, a non-empty
string or array or other value that is not `undefined` or `null`.)

For example, you **can't** do something like this:

```handlebars
{{#if (eyes.length == 1) && (horns.length == 1) && flies && (color == 'purple') && eatsDudes}}
  <i>It was a one-eyed, one-horned, flying purple people eater!</i>
{{/if}}
```

Handlebars encourages you to use a single evaluation for your logic:

```handlebars
{{#if purplePeopleEater}}
  <i>It was a one-eyed, one-horned, flying purple people eater!</i>
{{/if}}
```

I think the second example is much clearer and easier to follow. Even though some other templating languages
might allow you to use more complex expressions in your templates like the first example, I'd recommend
aggregating them anyway. It will make your life a lot easier.

Ember gives you a great tool out of the box to do this easily called
[computed properties](http://emberjs.com/guides/object-model/computed-properties/). I've
[written](https://eviltrout.com/2013/06/15/ember-vs-angular.html) about them before, but in a nutshell
they allow you to create a function that transforms one or more properties into another single property.
In this case, you could make one like this:

```javascript
var Creature = Ember.Object.extend({

  purplePeopleEater: function() {
    return (this.get('eyes.length') === 1) &&
           (this.get('horns.length') === 1) &&
           (this.get('flies') &&
           (this.get('color') === 'purple') &&
           (this.get('eatsDudes')));
  }.property('eyes.length', 'horns.length', 'flies', 'color', 'eatsDudes')

});
```

By adding `.property()` to your function prototype, this tells Ember that it's a computed property. The
5 arguments tell Ember to cache the result unless any of those properties change. As long as our
`Creature`'s values don't change, the result won't be recalculated.

### Computed Property Macros

Computed Properties are an important feature in Ember and are understood well developers. However,
there is a less well known way to declare computed properties that is often a lot easier and clearer: using
the `Ember.computed` set of functions. They are shortcuts for creating common types of computed properties. Here's
some examples:

```javascript
var Creature = Ember.Object.extend({
  eyesBlue: Ember.computed.equal('eyes', 'blue'),

  hasTwoBananas: Ember.computed.gte('bananas.length', 2),

  sick: Ember.computed.not('healthy'),

  radical: Ember.computed.and('ninja', 'turtle'),

  staff: Ember.computed.or('moderator', 'admin')
});
```

You can find a [full list of macros](http://emberjs.com/api/classes/Ember.html) on the Ember API site.

Not only are the computed property macros often shorter to write, but you don't have to specify the dependant
properties for caching like you do when using the `.property()` method, so I find them to be less error
prone. Here's how I might re-write the `purplePeopleEater` property by breaking it into smaller
macros:

```javascript
var Creature = Ember.Object.extend({
  oneEyed: Ember.computed.equal('eyes.length', 1),
  oneHorned: Ember.computed.equal('horns.length', 1),
  purple: Ember.computed.equal('color', 'purple'),

  purplePeopleEater: Ember.computed.and('oneEyed', 'oneHorned', 'flies', 'purple', 'eatsDudes')
});
```

It's a lot more [DRY](http://en.wikipedia.org/wiki/Don't_repeat_yourself) than the previous solution. In
the first solution we had to write every property name twice, now we only write it once.

A secondary benefit of this approach is we've cached the internal properties such as `oneEyed`. If another
computed property needed that comparison, we already have it available and cached.

Once you start to use these macros you won't stop! You'll find yourself breaking long sequences of
conditionals into smaller boolean chunks that are easier to re-use and cache for performance. Have fun!

