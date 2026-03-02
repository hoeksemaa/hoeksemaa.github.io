---
layout: default
title: Blog
---

# John's slice of the Blogosphere

{% for post in site.posts %}
- [{{ post.title }}]({{ post.url }}) - {{ post.date | date: "%Y %B %d"}}
{% endfor %}
