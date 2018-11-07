---
layout: default
title: Archives
permalink: /archives/
---

<div class="archives">
  {%- if site.posts.size > 0 -%}
    <h2 class="post-list-heading">Archived Posts</h2>
    <ul class="post-list">
      {%- for post in site.posts %}
        {% include archived_post.html %}
      {%- endfor -%}
    </ul>

    <p class="rss-subscribe">subscribe <a href="{{ "/feed.xml" | relative_url }}">via RSS</a></p>
  {%- endif -%}
</div>
