---
title: ADS1299 Puzzle
date: 2026 November
---
# ADS1299 Puzzle: a firmware game for a brain-signal chip

## Live Site
Fix a brain-signal chip's firmware at [voyant-sim.vercel.app](https://voyant-sim.vercel.app)!

## Github
Stored neatly on [github](https://github.com/hoeksemaa/voyant)

## Project Description
I built this demo for [Voyant Photonics](https://voyantphotonics.com/), a company that builds FMCW lidar on silicon photonics chips. It is a phone puzzle game about the [ADS1299](https://www.ti.com/product/ADS1299), the TI chip that measures tiny voltages from the body. I used this chip to build [Brain Pong](/projects/brainpong).

Each level puts electrodes on a body and starts from the board's real stock firmware. The chip's output does not match the target. You edit the chip's registers (the data rate, the gain of each channel, and the inputs of the bias drive) until it does. The three levels are EMG (a forearm muscle), EOG (eye movements), and EEG (brain waves under 60 Hz hum).

A model of the chip runs in the browser: the gain and input range, the sinc³ filter of the delta-sigma ADC, and the bias drive loop. Each level has an Overview with clues, three hints, clips from the TI datasheet, and an animation of the body.

I used TypeScript, Vite, and Three.js. Unofficial demo: not affiliated with Voyant Photonics or Texas Instruments.
