---
title: PorchBench
date: 2026 October
---
# PorchBench: a doorbell camera benchmark

## Live Site
Watch a doorbell camera find (and miss) a delivery at [antioch-demo-hoeksema.vercel.app](https://antioch-demo-hoeksema.vercel.app)!

## Github
Stored neatly on [github](https://github.com/hoeksemaa/antioch)

## Project Description
I built this demo for [Antioch](https://antioch.com/), a company that builds cloud simulation for robots and sensors. It simulates a doorbell camera on a front porch, in many environments.

Each scene mixes 9 settings: the house, what happens (a delivery, a dog, a passing car, or nothing), the light (day, dusk, night, or IR), the weather, the camera (basic or fisheye), the person, their speed, the surfaces, and what blocks the view.

A Python benchmark captures 100 fixed scenes and runs 5 open-source person detectors on every frame. The best one finds the person in 74% of the frames, but in only 56% when the person is a child. The site scores each detector by distance and by setting, and replays every scene with each detector's boxes.

I used Three.js and TypeScript for the scene, and Python with PyTorch for the benchmark. Unofficial demo: not affiliated with Antioch.
