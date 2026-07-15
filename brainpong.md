---
layout: default
title: Brain Pong
---

# Brain Pong

Pong, played with your brain. A build log of an EEG-controlled game of Pong.

<div class="post-list">
{% assign entries = site.brainpong | sort: "date" | reverse %}
{% for post in entries %}
<a class="post-item" href="{{ post.url }}">
  <span class="post-title">{{ post.title }}</span>
  <span class="post-date">{{ post.date | date: "%Y %b %d" | upcase }}</span>
</a>
{% endfor %}
</div>
