---
layout: default
title: Brain Pong
date: 2026-07-14
---

# brain pong

## humble origins

the project started out from humble origins: an SSVEP script and a headband holding wet, salty sponges to the back of my head. it was awful! it barely worked too. the script had flashing lights of 10 hz on one side and 15 hz on the other. the theory was that when you looked at flashing lights on one side, neurons in your occipital lobe would pulse at that same frequency. this frequency could be picked up by the sponge electrodes! somebody looked at the flashing screen and asked me to turn it off! this had to change.

## first working demo

i explored other ideas and settled on EOG tech. with 2 electrodes recording the eyes, i could record a simple single dimension of motion while proving i can make something fun with the tech at all. this also forced me to learn things like cleaning skin for electrode contact. i had a working demo i believe within the first month!

<div class="blue-box" markdown="1">
<span class="blue-box-title">what is EOG?</span>
electrooculography (EOG) measures the tiny voltage between the front and back of your eyeball, which acts like a small battery — positive at the cornea, negative at the retina. when your eyes rotate, that dipole swings past electrodes placed beside them, producing a signal that tracks gaze direction. it's cheap, fast, and far less fussy than reading the brain directly, which made it the perfect way to get pong on screen with just two electrodes.
</div>

## valley of pain

i tried to improve the design and ended up making it worse. i didn’t like having an electrical ground as one of the electrodes, as i thought it was unnecessary. i removed it, modified the firmware to compensate, and likely messed up the electrode inputs to the bias as well. this took ~2 weeks to revert. i had no clue what was going wrong, as the data i was getting was garbage. i ended up rescheduling the brain pong tournament twice. As the first date passed, even a single board wasn’t producing good data. finally i corrected the firmware and started getting real data from the board.

## mass data collection

i designed a new protocol of collecting less noisy data, as i was concerned about minimizing impedance of the electrodes. with my new protocol, i collected 10 really clean datasets of people looking left and right. unfortunately, this data wasn’t actually helpful in improving detection under real world conditions. first, it had none of the messiness of real-world glances. second, it only prompted left and right glances, and had no accommodations for blinks or other noise. third, i was failing to train personal classifiers. all my signal filtering blended together in a soup. i did get better at asking random people for help though!

## the tournament

it was a blast to host the tournament! i’m happy so many people came and enjoyed the snacks! i made many mistakes. probably the most significant one was not running a dry run of the tournament ahead of time. this may have 1. clued me in to the fact that gel takes a LONG time to apply and remove, as well as 2. exposing that noise is a much bigger threat to signal when two people are playing and connected to a screen as well. overall, i had fun and learned a lot.

## future project

my next project will likely be an EEG mouse. this will do two important things. first: i will be measuring the brain, not the eyes. i’d like to get familiarity with brain signals, as this is closest to the role i’d like. second: a mouse (two degrees of freedom + click) opens up MANY more games than just the one dimension of control of pong. a significantly more fun chess tournament (or any game that can be played with a mouse) would be possible! I’m also interested in training personal classifiers for individual people; I’m guessing this will give me significantly higher precision than a 1-size-fits-all classifier. Before I do anything though, I’m going to do a survey of what others have tried.

## why?

I’ve been fascinated by BCIs for a decade, quietly keeping my eye on the industry as it grows. In the past couple months, i decided to try hard for a job in the industry. in the short term, there’s a wealth of serious medical problems to solve. we can make life significantly better for a chunk of humanity and shouldn’t pass up this chance. in the long term, i’m excited for the beautiful and wild possibilities that unlock when we have much better control of reading/writing to a significant number of neurons in the brain. we can make life so much better for humanity. excelsior!
