---
layout: default
title: Projects
---

# My Projects

{% for project in site.projects %}
- [{{ project.title }}]({{ project.url }}) - {{ project.date }}
{% endfor %}
