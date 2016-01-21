---
title: Crawling the Downvote Brigades of Reddit
date: 2013-01-16
---

### ShitRedditSays and The Downvote Brigades of Reddit

*(note: if you're familiar with reddit and ShitRedditSays, you can skip to the next section.)*

As you probably know, Reddit is a site that revolves around voting. All users are encouraged to vote on things, which are then prioritized based on their total scores. 

Over time, Reddit's userbase has grown a lot. It is now one of the most popular sites on the Internet, and nobody has enough time to read through all its submissions and comments. As in many communities, the users have found themselves splitting off into various sub factions, or subreddits as they are known. (One that I really like is [/r/aww](http://www.reddit.com/r/aww) -- check it out if you are feeling blue.)

One of the most infamous of these subreddits is [/r/ShitRedditSays](http://www.reddit.com/r/shitredditsays), (SRS for short). SRS is a meta community. They exist solely to describe the goings on of reddit itself. Here's how they describe the type of content they are looking for:

> Have you recently read an upvoted Reddit comment that was bigoted, creepy, misogynistic, transphobic, unsettling, racist, homophobic, or just reeking of unexamined, toxic privilege? Of course you have! Post it here.

SRS is a place for redditors to mock the behavior they consider reprehensible on the rest of the site. As you can imagine, the people being made fun of often don't appreciate it. To say that SRS has many enemies is an understatement. It is almost certainly the most despised of all subreddits. It is also quite popular: there are over 30k members.

The hatred for SRS goes so deep that people have even created subreddits simply to oppose them. Here's how one, [/r/SRSSucks](http://www.reddit.com/r/SRSSucks) describes itself:

> They started out as a subreddit dedicated to calling out bigoted jokes, and they morphed into a large network of subreddits dedicated to a radical, mutated form of 2nd and 3rd wave feminism.

When discussing SRS, the cardinal sin that is often brought up is how they are a "downvote brigade." The idea is, when SRS links to a comment of yours, their members spill through and downvote you into oblivion. Indeed this concern is addressed right on the SRS homepage:

> Do not downvote any comments in the threads linked from here! Pretend the rest of Reddit is a museum of poop. Don't touch the poop.

### Are the brigades really downvoting en masse?

Many of reddit's users consider SRS to be a downvote brigade regardless of their statements to the contrary. In fact, SRSSucks even makes a jab at them while telling *their* users not to downvote content. Emphasis mine:

> No downvote brigading or promotion of such activities please! We do not support fighting SRS by *sinking to their level* and anyone caught brigading may be banned.

Recently, I got to wondering about how much of an effect being linked to on SRS actually has on your comment. It's one thing to say "hey, SRS downvotes everything," but can it be proven? I decided to create a program to put downvote brigading to the test. Here's my methodology:

1.  Scrape the subreddit homepage frequently.
2.  Record all links to comments, and their scores at the initial time seen. (If the post is a `self.post`, grab all links from the text instead.)
3.  Crawl the links again over time, and record their new values.

I ran the scripts on /r/ShitRedditSays, /r/SRSSucks and /r/SubRedditDrama, three subreddits accused of brigading. 

### The Results

I collected data on 198 links over a period of 48 hours. Here's what I found:

<table class='data'>
  <tr>
    <th>&nbsp;</th>
    <th>ShitRedditSays</th>
    <th>SRSSucks</th>
    <th>SubredditDrama</th>
  </tr>
  <tr>
    <td>Links Crawled</td>
    <td>140</td>
    <td>32</td>
    <td>26</td>
  </tr>  
  <tr>
    <td>Avg. Score Change</td>
    <td>+49</td>
    <td>+7</td>
    <td>+8</td>
  </tr>
  <tr>
    <td>% of Links Downvoted</td>
    <td>37%</td>
    <td>25%</td>
    <td>35%</td>
  </tr>

</table>


- On average, the scores *increased* after being featured on the "downvote brigades". Maybe they should be called upvote brigades? :)

- Still, the differences were mostly small. It seems, on average, if you are linked to, your vote won't change in a noticeable way.

- ShitRedditSays is a lot more popular than the other two! It had 4x as many submissions on its front page.

- The most downvoted link was [this image of a duck](http://www.reddit.com/r/AdviceAnimals/comments/16jxo6/i_also_received_advice_from_my_father/). It lost 443 points after being linked in SRS.

- The most upvoted link was [graffiti](http://www.reddit.com/r/funny/comments/16k2ys/its_ok_to_be_fat_as_explained_by_graffiti_in_a/). It *gained* 1139 points after being linked in SRS. 


### The Data

- You can download a [SQL dump of the dataset](https://eviltrout.com/sql/brigade.sql.gz). 

- Here's the [source code for the crawler](https://github.com/eviltrout/brigade).

