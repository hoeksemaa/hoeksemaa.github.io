---
title: Piramidal Demo
date: 2026 October
---
# Piramidal Demo: a live seizure-monitoring wall

## Live Site
Watch 23 beds of real EEG at [piramidal-demo-hoeksema.vercel.app](https://piramidal-demo-hoeksema.vercel.app/)!

## Github
Stored neatly on [github](https://github.com/hoeksemaa/piramidal)

## Project Description
I built this demo for [Piramidal](https://piramidal.ai/), a company that builds a foundation model for EEG. It replays 23 beds of real pediatric EEG (CHB-MIT, from PhysioNet) as a live monitoring wall.

An open model, SPaRCNet, reads each bed's last 10 seconds of EEG every 2 seconds. It flags seizures and the four patterns of the ictal-interictal continuum.

Beds in a seizure flash red at the top of a live risk ranking. Click a bed to see its full EEG, the seizure onset and detection times, and its pattern burden.

I used Next.js, React, and TypeScript. Canvas strip charts hold 60 fps across all 23 beds. Not for clinical use.
