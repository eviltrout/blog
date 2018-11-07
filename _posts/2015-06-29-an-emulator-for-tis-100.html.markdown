---
layout: post
title: "TIS-100: My emulator for a CPU that doesn't exist"
date: "2015-06-29"
---

Recently I became infatuated with [TIS-100](http://www.zachtronics.com/tis-100/), a game which aptly
describes itself as "the assembly language programming game you never asked for!"

The point of the game is to program the (imaginary) TIS-100 CPU to solve problems. For example,
you might need to take input from two ports and swap them, then write the outputs to two other
ports.

The game flies in the face of all modern game design: The first thing you need to do is sit and
read a 14 page PDF that outlines the TIS-100 instruction set. And when I say "read", I mean "learn",
because a quick skim is not going to cut it! There are no tutorial levels or handholding.
You **must read the manual.**

After solving the first few problems and feeling good about myself, I approached some of my
programmer friends and tried to get them to buy the game so I could compare my solutions
to theirs.  I swear I tried bringing this up with 3 people and had the exact same conversation:

Them: "So, it's a game about programming..."

Me: "Yes, it's so much fun!"

Them: "But I program all day."

Me: "Me too!"

Them: "The last thing I want to do when I come home is program again"

*awkward silence*

Them: "You're nuts."


## The rabbit hole goes deeper

Despite not having any close friends to play with, I plowed through the puzzles in the game. One in
particular was quite devious; The TIS-100 is, as I mentioned, an imaginary CPU. And it is clearly
designed to be puzzling rather than practical. It has only two registers, and one is a backup that
cannot be addressed directly. This afformentioned puzzle involved taking the input of two numbers
and dividing one by the other. You then output the resulting quotient to one port and the
remainder to another.

It was quite fun to work through, but to my dismay my solution was quite inefficient. If I
clicked the regular "Play" button to execute it it would take several minutes to finish.
Even if I ran it in "Fast" mode it would take about 5 seconds to complete successfully.

This was obviously unacceptable.

A typical person might call it a day and say, "well, the real
victory is solving the puzzle!". Another, more eccentric person might spend the time
figuring out how to optimize their solution so it executes in less time. And then there's me.

## Introducing my TIS-100 emulator

I decided the most logical thing to do was to implement the TIS-100 CPU myself in pure C.
This seemed like a good idea to me despite having not used C in about 15 years.

Amazingly, most of the concepts came back fairly quickly. Maybe C is like riding a bike?
Maybe using so much Javascript (and its C syntax) kept me on the ball? I'm not sure.

I first wrote a parser to input the TIS-100 assembly language as defined in game. It writes
it to memory in byte code, which is then interpreted. The resulting performance is really
impressive!

The Unity version of TIS-100 that runs on my Mac executes my division program in about
5 seconds, which is an eternity as far as programs go! My C emulator runs the code in a
sleek 0.005s, or roughly 1000x faster!

The full [source code](https://github.com/eviltrout/tis-100) is on GitHub, so feel free to
download it and check it out. I'll even accept pull requests as I'm sure there's a lot of
room for improvement.


## Why did I spend my time on this pointless project?

I try to not use the word "crazy" often because I don't want to trivialize mental illness,
but let's be honest: I have to be a least a *little* off base to attempt a project like this.
Programming is a legitimate hobby of mine. I make a living at it but I also do it in my
spare time. TIS-100 was a perfect storm of programming and fun, and I didn't
want it to end.

Obivously I'm not [the only one](http://gamasutra.com/view/news/244969/Things_we_create_tell_people_who_we_are_Designing_Zachtronics_TIS100.php)
who enjoyed the game, so there is a market for this kind of thing. Maybe this is
the long tail of games?

All I know is I had a lot of fun doing it, and I hope someone has fun with my
emulator. Let me know if you do!

