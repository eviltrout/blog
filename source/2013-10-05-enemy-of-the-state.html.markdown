---
title: "Enemy of the State"
date: 2013-10-05
---

I learned very quickly while working on a
[large open source project](https://github.com/discourse/discourse) is that it
is important to make my code hard to break. The primary line of defense for this is a
comprehensive test suite, but I think it's also very important to create functions
that are easy to use and difficult to damage.

I find I even code this way on personal projects that will never be released. Even if
you never work on a team with other developers, there is a good chance you will forget
a lot of implementation details of the code that you aren't actively working on. You need to
protect your code from yourself!

I think a *lot* about state these days. How much data should an object have, and how
should it expose that to other objects? I find many bugs are related to the state and
scope of data not being what you'd expect.

### An Example: ActiveRecord


ActiveRecord makes it easy to retrieve all rows from database and represent them as objects:

```ruby
Product.all.each do |p|
  puts p.name
end
```

We didn't have to specify that we wanted the `name` column from the database before we
outputted it; by default ActiveRecord includes all the columns in the table.

Over time, many frequently used tables in databases such as `Product` tend to get
more columns added to them to support new features. You might find that your table
that started off with 4 columns is eventually over 50!

There is overhead involved in returning all those extra columns from the database.
At the very least, the database has to send more data across the wire to your application.
On top of that, Rails has to deserialize all the columns into their appropriate types
in the object.

When returning a single `Product` you will probably not notice
much of a difference. However, when returning hundreds of rows at once, the overhead
can add up quite a bit.

### Selecting only what you need

ActiveRecord provides a method called `select` that can be used choose the columns
returned from the database. We could write something like this:

```ruby
Product.select([:id, :name]).each do |p|
  puts p.name
end
```

This will certainly execute faster than the `Products.all` query above. However, if
you do this, you are **exposing yourself to many bugs due to inconsistent state**.

The danger here is ActiveRecord returns a mixed state instance of `Product`. The
returned object *looks* like a `Product`. It has all of the instance methods
you defined on `Product`, however, it is missing some of the data that is normally
there.

To illustrate this, imagine you have a function that returns a product's name,
but adds an asterisk if it's on sale:

```ruby
def fancy_product_title(product)
  if product.on_sale?
    return product.name + "*"
  else
    return product.name
  end
end
```

In this case, our method checks the `on_sale` column in the database to determine
whether to append the asterisk. However, if you retrieved the `Product` using
`select([:id, :name])` you would not have this column present, and even if the
product was on sale your users wouldn't know about it.

Now this might seem like a pretty easy bug to squash. Any competant programmer
could adjust this code to return `on_sale` in the `select` clause if if they saw it
wasn't ever being displayed.

That is demanding a much broader knowledge of the application and the flow of data
than is necessary. It takes more development time, and doesn't scale well when your
codebase grows. Also, who wants to constantly think "hey, do I have all the
data I need in this object to do my work?"

### Keep it Consistent

**You can eliminate any entire class of bugs by never using `select`**. You should
insist that your object instances *always* include all their data members.

What about the performance issues? I suggest instead that you design your data
structures in a different way. Rather than returning inconsistent `Product` models, why not
create a method that returns `BasicProduct` objects?

All `Product` instances have enough data to transform into `BasicProduct` instances if they
need to. If you like inheritance you could make a `Product` extend a `BasicProduct`. If
you're not a fan of inheritance you could create a `to_basic` method.

This is just one example of how easy it is to leave things in an inconsistent state,
especially when considering performance. I suggest that you make an effort to keep
your data in sync as much as possible, even if it involves a little data modelling.
You'll have fewer bugs, and your code will be better to use in the long run.

