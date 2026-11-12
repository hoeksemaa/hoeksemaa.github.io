---
title: Hearing Pipeline Rebuild
date: 2026 November
---
# Hearing Pipeline Rebuild: inside an AI hearing aid

## Live Site
Follow a noisy room through an AI hearing aid, one step at a time, at [fortell-demo-hoeksema.vercel.app](https://fortell-demo-hoeksema.vercel.app)!

## Github
Stored neatly on [github](https://github.com/hoeksemaa/fortell)

## Project Description
I built this demo for [Fortell](https://www.fortell.com/), a company that makes AI hearing aids. It rebuilds the signal pipeline of their hearing aid from public sources: their patents, their user manual, and reviews.

A short scene (two talkers, room hum, a wind gust, and a dish clatter) goes through 12 steps: microphones, feedback cancel, wind cut, beamformer, STFT, neural mask, mix back, steady-noise mask, gain and compression, inverse STFT, limiter, and the speaker.

Each step is a function with its equation, a short explanation, and an animation. You can see and hear the sound after every step. Change one step, or bypass it, and every later step updates at once. The neural mask is a placeholder, because Fortell's network is not public.

I used plain JavaScript with Canvas and Web Audio; all of the signal processing runs in the browser. Unofficial demo: not affiliated with Fortell.
