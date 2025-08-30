---
layout: default
title: Projects
---

# My Projects

{% for project in site.projects %}
    <div>
        <h3><a></a></h3>
        <p></p>
        <p>{{ project.description }}</p>
    </div>
{% endfor %}
