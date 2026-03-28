---
layout: default
title: Projects
---

# My Projects

<div class="post-list">
{% assign sorted_projects = site.projects | sort: "date" | reverse %}
{% for project in sorted_projects %}
<a class="post-item" href="{{ project.url }}">
  <span class="post-title">{{ project.title }}</span>
  <span class="post-date">{{ project.date | date: "%Y %b" | upcase }}</span>
</a>
{% endfor %}
</div>
