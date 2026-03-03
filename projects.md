---
layout: default
title: Projects
---

# My Projects

<div class="post-list">
{% for project in site.projects %}
<a class="post-item" href="{{ project.url }}">
  <span class="post-title">{{ project.title }}</span>
  <span class="post-date">{{ project.date | date: "%Y %b" | upcase }}</span>
</a>
{% endfor %}
</div>
