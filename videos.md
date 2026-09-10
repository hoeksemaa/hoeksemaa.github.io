---
layout: default
title: Videos
---

# Videos

<div class="post-list">
{% assign sorted_videos = site.videos | sort: "date" | reverse %}
{% for video in sorted_videos %}
<a class="post-item" href="{{ video.url }}">
  <span class="post-title">{{ video.title }}</span>
  <span class="post-date">{{ video.date | date: "%Y %b %d" | upcase }}</span>
</a>
{% endfor %}
</div>
