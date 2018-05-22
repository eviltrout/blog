---
title: Candles, Programming and Archetypes
date: 2018-05-22
---

Once in a while, I daydream about being thrown back in time. I'd have no Wikipedia, no books, or any
access to information except what's already in my head.

If I were thrown into Victorian London, what could I do? What could I teach them?

Well, the first thing I would do is tell them to wash their hands. With soap. Frequently. That would probably
be the most significant contribution I could make.

Beyond that, I'm a computer programmer. I like to think I know my way around a web browser pretty well,
but that's pretty useless knowledge in a world without computers.

It can be a fun exercise to start with something you know, say, TypeScript, and work your way backwards
as far as you can:

* TypeScript is a high level languge and is transpiled into Javascript

* Javascript is a language that is interpreted by a Web Browser

* A Web Browser is a native program, probably written in C++

* C++ is a programming language, which is compiled into machine language

* The machine language is run and prioritized by an operating system

* The operating system passes streams of machine language to the CPU

* The CPU runs the streams out of order, interfacing with other devices on the computer

* The computer is a collection of standardized components, powered by electricity

* Electricity is... etc (gotta stop somewhere!)

I wrote the above steps off the top of my head, and I'm fully aware there are huge gaps in my knowledge,
and probably many inaccuracies in the way I've written it out. This is normal in our specialized modern world.
There will always be far more things at play than you'll ever have time to understand.

Having said that, there is no reason you can't spend *some* time looking back and trying to fill in
your own personal gaps. I've become a huge fan of [The 8-Bit Guy](http://www.the8bitguy.com/) on Youtube
for this kind of thing.  Here's one of his best videos, about how graphics worked on "oldschool" systems:

<iframe width="560" height="315" src="https://www.youtube.com/embed/Tfh0ytz8S0k" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

---

Over the last year or so I've made it somewhat of a hobby of mine to find old computer manuals and briefly
tour their programming guides.

You hear a lot about the challenges of programming old systems. It's true that they had limited memory and
processing power, and programs also loaded slowly from disk. But there's also a **simplicity** to them
that is beautiful.

A professor of mine once said something interesting about [Archetypes](https://en.wikipedia.org/wiki/Archetype) (paraphrased):

> A candle is an archetype of the light bulb. You use it to create *darkness*, not light.

---

On an old computer such as a [Commodore 64](https://en.wikipedia.org/wiki/Commodore_64), 
there's nothing preventing you from accessing any piece of memory or IO device.

Booting a Commodore 64 (which you can now do in [a browser](https://virtualconsoles.com/online-emulators/c64/)!)
will present you with something like this:

<img src="/images/c64-boot.png">

This is [BASIC](https://en.wikipedia.org/wiki/BASIC), an early high level programming language. But its
simplicity doesn't mean it can't access the computer directly! If you type in `POKE 53280, 2`, that will write
the value `2` into the Commodore 64's memory at address `53280`, which happens to be the video memory that
determines the border color of the screen:

<img src="/images/c64-poke.png">

To a modern programmer, this should be alarming. What's to stop a bad program from reading memory it shouldn't,
or accessing devices it shouldn't?

---

Candles are literally open flame. I remember during the
[Northeast Blackout of 2003](https://en.wikipedia.org/wiki/Northeast_blackout_of_2003) the mayor coming on the
radio and asking people not to use candles out of fear of starting fires all over the city.

Used responsibly, though, a candle creates a beautiful darkness. I recently toured
[Denis Severs' House](https://en.wikipedia.org/wiki/Dennis_Severs%27_House) in London. It's a visceral
arrangement of life in London through the centuries, and it's almost entirely candlelit, which allows it to
alternate between warmth and spookiness.

I probably wouldn't object if someone told me learning to program a Commodore 64 in 2018 is a nerdy
pursuit. I *would* object if they said it's useless though; Programming is all about trade offs, and
our predecessors made some excellent ones given the technolgical constraints of the time.

If you have the time and the interest, I'd highly recommend spending some time learning about how obsolete
computers worked. I can't promise it'll make you a better programmer, but it will give you a better
perspective, and that's something I think all of us could use these days.

