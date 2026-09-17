---
layout: default
title: Videos
---

# Videos

<div class="post-list">
{%- comment -%}
  Videos with `unlisted: true` keep a working URL but stay off this list,
  so a link already shared with someone still resolves.
{%- endcomment -%}
{% assign sorted_videos = site.videos | where_exp: "v", "v.unlisted != true" | sort: "date" | reverse %}
{% for video in sorted_videos %}
<a class="post-item" href="{{ video.url }}">
  <span class="post-title">{{ video.title }}</span>
  <span class="post-date">{{ video.date | date: "%Y %b %d" | upcase }}</span>
</a>
{% endfor %}
</div>
