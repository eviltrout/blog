---
layout: post
title: Generating IIFEs in Rails
date: 2013-02-25
---

Recently we ported Discourse from
[CoffeeScript to plain old Javascript](http://meta.discourse.org/t/is-it-better-for-discourse-to-use-javascript-or-coffeescript/3153).
The process was straightforward since CoffeeScript spits out fairly good Javascript, although I did have to spend the better part of
a day [cleaning it up afterwards](https://github.com/discourse/discourse/commit/e461c842537b5c48e6f99fa658236948b850276b). (Note: we'd
love any patches to further tidy up the generated Javascript.)

One thing that CoffeeScript does by default that's nice is it wraps everything in an Immediately Invoked Function Expression (IIFE).
If you're a Javascript developer you've almost certainly seen IIFEs before even if you haven't used the acroynm -- they're very
useful to ensure that any of your defined variables [don't leak](http://benalman.com/news/2010/11/immediately-invoked-function-expression/)
out.

After I'd converted the code base, every single one of our .js files had a function closure wrapping everything. It seemed awfully
repetitive so I wondered if there was a way to automatically generate them. As it turns out, you can do i fairly easily using
Rails' asset pipeline! I had a hard time figuring this out so I figured I'd quickly blog about it in case anyone else
wants to know how it's done.

First, create a class, for example `lib/generate_iife.rb`

```ruby
class GenerateIIFE < Sprockets::Processor

  # Add a IIFE around our javascript
  def evaluate(context, locals)
    "(function () {\n\n#{data}\n\n})(this);"
  end

end
```

Then all you have to do is create an initializer to activate it, for example `config/initializers/enable_iifes.rb`

```ruby
require 'generate_iife'

Rails.application.assets.register_preprocessor('application/javascript', GenerateIIFE)
```

And then you're good to go! Any Javascript file you load via the asset pipeline will have the IIFE surrounding its content.

Note you can use this to wrap *any* type of file that passes through the preprocessor with content.
One caveat -- if you change the IIFE code, you'll have to clear your `tmp` directory in order to get your assets to recompile.
