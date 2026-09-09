---
layout: default
title: Writings
redirect_from: /blog
---

# Assorted writings

<div class="post-list">
{% for post in site.posts %}
<a class="post-item" href="{{ post.url }}">
  <span class="post-title">{{ post.title }}</span>
  <span class="post-date">{{ post.date | date: "%Y %b %d" | upcase }}</span>
</a>
{% endfor %}
</div>
