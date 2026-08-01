---
layout: default
title: Brain Pong
date: 2026-07-14
---

<script>window.EOG_FIG_BASE = "/assets/essay-figures";</script>
<link rel="stylesheet" href="/assets/essay-figures/figures.css?v=17">

# brain pong

## the journey

### origins

My first BCI was properly medieval. 6 saltwater sponges were held together with a plastic headband. I mixed the saltwater by hand, adding generous amounts of sea salt to a bowl of warm water. The whole headband would be dunked into the bowl to wet the sponges. The sponges sat near the back of the head to give them good contact with the occipital lobe. They were rudimentary EEG electrodes. However, this did little to mitigate the feeling of water dripping down your back. Only brave souls not afraid of a little water would wear it!

<div class="green-box" markdown="1">
<span class="green-box-title">🔓 Hardware Unlocked: Saltwater sponge electrodes</span>

![A plastic headband holding six cube-shaped sponges against the back of the head.](/assets/images/brain-pong-sponge-headband.png)

Electrodes are any material that conducts an electrical signal from one place to another. Saltwater is conductive, so when sponges are placed firmly against the skull, faint electrical signals from the brain can be picked up. Wires stuck into these sponges read these signals into a computer.
</div>

The headband still needed to be plugged into a Cerelog board. The board would convert signals from analog to digital and give my computer access to those values. Once the values were connected to the Pong script, the game could be played!

<div class="green-box" markdown="1">
<span class="green-box-title">🔓 Hardware Unlocked: <a href="https://www.cerelog.com/">Cerelog 8-channel BCI board</a></span>

![A green Cerelog circuit board with the ESP32 and ADS1299 chips outlined in red.](/assets/images/brain-pong-cerelog-board.png)

A Cerelog board has two primary chips: an ESP32 and an ADS1299. The ESP32 is the “brains” of the board: it has a CPU core, some memory, and integrated wifi/bluetooth. Helpful for any small hardware system. The ADS1299 is what makes this a BCI board. It has many useful pins, most notably 8 electrode inputs, an SRB1 input, and a bias output. More on these pins later.
</div>

I inherited the device from a previous intern while interning at Cerelog, a BCI board design company. The intern had built the headband, as well as writing software to analyze the measured signal. The software let you play Pong with your brain! The game flashed lights on either side of the screen at 10 and 15 Hz respectively. It could tell which side you were looking at. How, you ask?

<div class="blue-box" markdown="1">
<span class="blue-box-title"><a href="https://en.wikipedia.org/wiki/Steady_state_visually_evoked_potential">SSVEP</a> Explainer</span>

![A power spectrum plot with clear peaks at 15 Hz, 30 Hz, and 45 Hz.](/assets/images/brain-pong-ssvep-fft.jpg)

When the eyes are stimulated by a light flashing at a certain frequency, the neurons of the occipital lobe (the portion of the brain processing sight) pulse at that same frequency. The neurons’ signal can be measured with electrodes. When you examine the frequencies of the electrode signal [via FFT](https://en.wikipedia.org/wiki/Fast_Fourier_transform), there is a clear spike at the frequency of the flashing lights (in this case 15 Hz). There are also harmonic effects, which is why you see spikes at 30 Hz and 45 Hz. Looking at this graph, I would claim that the subject is currently looking at a 15 Hz signal, not 10 Hz.
</div>

At this point, you may ask: how well did this work? Decently! It also had some problems. If I focused intently on one side, I could usually move the paddle left or right. However, this was contact-dependent: a guy with a near-shaved head was able to control it reliably, while a girl with thick hair found it basically unplayable. Staring at flashing lights gets painful pretty quickly too.

Kudos to the prior intern for making it work! It was technically impressive and helped lay a foundation of understanding for my future work.

### first working demo

I felt I could do better, and set out looking for other options.

Simplicity was important to me. I wanted to prove I could build a BCI at all, without worrying about the usefulness of the device yet. Through research, EOG emerged as the clear frontrunner. The signals from EOG are clear, large enough, and correspond to known actions. In contrast, EEG signals don’t have a clear 1:1 mapping between actions and signals.

<div class="blue-box" markdown="1">
<span class="blue-box-title"><a href="https://en.wikipedia.org/wiki/Electrooculography">EOG</a> Explainer</span>

![A diagram of a head showing electrode placement: right hEOG and left hEOG beside the eyes, reference behind the ear.](/assets/images/brain-pong-eog-electrode-placement.jpg)

EOG is a method of recording the electrical signals created by eyeball movements. There are additional things that cause electrical activity around this region of the face like blinking or swallowing. An eyeball is charged; it has a positive charge in the front and a negative charge in the back. When an eyeball swings left, nearby electrodes can record a spike in voltage. Whether the spike is positive or negative is determined by whether the person has looked right or left.
</div>

I also got my hands on a set of gold electrodes! Honestly, the reason I bought these is because [OpenBCI recommends them on their site](https://docs.openbci.com/GettingStarted/Biosensing-Setups/EEGSetup/). I’d seen successful products using an OpenBCI board in the past and had confidence the electrodes would work well enough for my purposes.

<div class="green-box" markdown="1">
<span class="green-box-title">🔓 Hardware Unlocked: <a href="https://shop.openbci.com/products/openbci-gold-cup-electrodes">Gold Cup Electrodes</a></span>

![A set of gold cup electrodes with colored wires, labeled for left eye, right eye, and SRB1.](/assets/images/brain-pong-gold-cup-electrodes.jpg)

Gold cup electrodes serve the same purpose as saltwater sponge electrodes: conduct signal. They have several advantages. Their [impedance](https://en.wikipedia.org/wiki/Electrical_impedance) (similar to electrical resistance) is low when combined with proper skin preparation and [Ten20 conductive gel](https://www.weaverandcompany.com/products/ten20/). The gold plating also resists corrosion, meaning they last longer and can be regularly washed and reused. In absolute terms, gold has worse impedance than silver/silver chloride electrodes (and perhaps even the sponge electrodes? didn’t test). The gold electrodes have worked well for me so far.
</div>

I’m going to make a claim up front and then explain step by step how to get there. Stay with me.

Using these pieces and a couple more tricks, when the eyes move, a clear spike can be detected in the data.

There were lots of bumps on the way to detecting a clear spike. By the end of this, you should understand how every step of the pipeline works.

**1. The man looks right.**

<div id="fig-01" class="eog-fig"></div>

Pretty straightforward so far.

**2. Raw electrode traces are measured.**

Fair warning: I’m using real software data; animation 6 is the data I collected from my own R/L electrodes. I collected this data from the board, sent it to my laptop, and recorded the data digitally. I’m NOT using real hardware data. The SRB1 and Bias data are spoofed to common frequencies and amplitudes; the real ADC sampling is significantly faster (250 Hz). All the math, however, is real.

<div id="fig-02" class="eog-fig"></div>

My body is a big bag of salt water. It’s fantastic at picking up signals. When an electrode is placed on my skin, the following are some biological sources of voltage: brain activity, jaw clenching, blinking, swallowing, talking. The body is also fantastic at picking up signals from the environment; here are some non-biological sources: power outlets, computer charger transformers, large speakers, power tools, large machinery like refrigerators. Power outlets are the worst offenders. They produce a large 60 Hz wave (50 Hz for our European friends) that is in the mV to V range; significantly larger than the signal we’re looking for. Eyeball movements create signals measured in the µV range. We need to remove the environmental noise.

EOG’s standard technique is to use a reference electrode. This electrode’s purpose is to set an electrical baseline by attaching to the body in a place we don’t care about and measuring the “background” electrical noise. This noise will be both biological and non-biological in nature. If you’re sitting near an outlet and also swallowing, this reference electrode would pick up some combination 60 Hz wave + throat muscle signals. Another electrode close to the eye would pick up something similar: 60 Hz wave + throat muscle signals + eyeball movement signals. The reference electrode wouldn’t pick up the eyeball movement because those signals are very weak, so they don’t travel very far.

In my example, I’ve set the “background” noise to 60 Hz plus some extra harmonics. 3 electrodes on the body measure signal: left eye, right eye, and reference electrode, as shown in the EOG picture above. These electrodes that measure signal are called passive electrodes. As you can see, when the SRB1 signal is subtracted, the signal range drops from Vs to mVs. This is good and expected.

**3. Bias is driven into the body.**

<div id="fig-03" class="eog-fig"></div>

Bias is the 4th electrode, attached to an earlobe like SRB1. Bias doesn’t record anything, it sends an electrical signal back into the body. This is called an active electrode.

What signal does it send? There’s still noise in the left eye and right eye electrodes. The ADS1299 calculates the average signal between the two electrodes and pumps it back into the body via the bias electrode. This signal is in the mV range and shouldn’t hurt anyone.

This works on the same principle as noise-cancelling headphones: active interference. When a wave and the exact opposite wave are played at the same time, they cancel out. In our case, the difference we’re left with is the faint signals of the two eyes.

![A diagram of how noise cancellation works: ambient sound is picked up by a microphone, inverted, and played back so the waveforms cancel.](/assets/images/brain-pong-noise-cancellation.png)

**4. Digitization**

<div id="fig-05" class="eog-fig"></div>

<div class="blue-box" markdown="1">
<span class="blue-box-title"><a href="https://en.wikipedia.org/wiki/Analog-to-digital_converter">ADC</a> Explainer</span>

An Analog-Digital Converter, as the name suggests, takes analog signals and converts them to digital ones.

What are these signal types? Analog signals have continuous times and values, meaning the signal has some exact value at an exact time. A beach wave has a position at 3pm, but also at 3:01pm, 3:01pm and 1 second, 3:01 and 1.1 seconds, and so on. The time can be sliced infinitely small ([some physicists may contest this!](https://en.wikipedia.org/wiki/Planck_units)) and the beach wave’s position will change smoothly with those time jumps.

[Digital signals](https://en.wikipedia.org/wiki/Digital_signal) do not have this freedom. They have discrete values: a computer can only record times and values to a given precision. With more memory, a computer can increase the precision of their representation, but this precision will always have a limit.

When an analog signal is converted into a digital one, the values must be “bucketed”. The simplest way to do this is: for each time step, measure the analog signal’s value and assign it the closest digital value the hardware can represent.

![A continuous grey waveform sampled at each whole time step, with red stems marking the nearest whole-number value assigned to each sample.](/assets/images/brain-pong-adc-quantization.png)

In the above image, the digital representation can represent whole numbers. At t = 11, the “true” signal value is around 3.75. The computer can only store whole numbers, so the digital representation of 3.75 is 4.
</div>

My Cerelog board samples at 250 Hz (it can sample faster but the data output becomes a problem). However, in this ADC animation, we’re sampling at 10 Hz because it’s easier to see. The analog data is converted via the board to a 24 bit value.

All of this so far has been done on hardware, primarily the ADS1299 chip. Once digitization is finished, the values are sent off to the computer to be processed by software.

**5. Subtract left from right.**

<div id="fig-06" class="eog-fig"></div>

We now have 2 raw data channels: the left and right electrodes. This is a time-series dataset. We don’t particularly care about the exact reading of right or left, but the difference between them.

Remember the idea underlying EOG: The eyes are charged. When the eyes swing right, one eye is moving towards an electrode, and the other is moving away. We should expect to see a positive change in one channel and a negative change in the other. When subtracted, this should show clear directional swings after looking left or right.

**6. detrend**

<div id="fig-07" class="eog-fig"></div>

The left and right electrode voltages have a tendency to drift over time. This is due to gel drying, the exact contact shifting, and some electrical effects. These factors are usually slightly different across electrodes, leading to them drifting different amounts. Even after the two channels are subtracted from each other, there can still be a noticeable slope over time, shown in the image below. Read more about [someone else’s EOG processing pipeline here](https://www.researchgate.net/figure/Optimization-of-signal-processing-and-feature-extraction-for-real-time-data_fig3_368375242)!

![An EOG trace after DC offset removal, with a green arrow tracing a steady upward drift across four seconds.](/assets/images/brain-pong-detrend-drift.png)

My detrend is very aggressive. I’d like to adjust it to take effect over a period of 10 seconds instead of the ~0.5 seconds it takes to bring the signal’s value to zero.

Notice also how detrend also brings the graph’s vertical offset to zero. This makes applying future math easier.

**7. Perform filtering (software)**

<div id="fig-08" class="eog-fig"></div>

Even after the board filtered out some of the high-frequency noise, a lot still remains. This noise makes it harder to isolate the signal, so it’s worthwhile to strip it out. The standard industry tools are filters that snip parts of the frequency range. I use a [low-pass filter](https://en.wikipedia.org/wiki/Low-pass_filter) at 100 Hz, [high-pass filter](https://en.wikipedia.org/wiki/High-pass_filter) at 0.5 Hz, and [band-stop filters](https://en.wikipedia.org/wiki/Band-stop_filter) at 50 Hz (European) and 60 Hz (American).

Other than the band-pass filtering for specific wall outlet frequencies, picking precise numbers was an exercise in the dark arts. I reviewed the literature a bit, looked at what worked a bit, and held my finger to the wind a bit. 0.5 and 100 Hz seem to work well.

**8. Perform calibration (software)**

<div id="fig-09" class="eog-fig"></div>

Finally! We’ve made it to what I would judge to be a somewhat “clean” signal. How do we judge what counts as a spike? A simple way is to plop the subject in the chair, wire them up to the electrodes, turn on the software, and record them for several seconds. It’s good to ask them not to move their head, blink, swallow, or look around. This establishes a clean electrical “baseline”. We can derive a sigma value that defines a “noisyness” for their data.

**9. Detect spikes! (software).**

<div id="fig-10" class="eog-fig"></div>

Use the sigma value multiplied by some constant to establish lines above and below the zero line. If the graph crosses it, congrats! Spike detected!

This was the basic setup that allowed me to get Pong working for the very first time. There were learning pains along the way and the resulting pipeline was noisy, but the game worked! It was a surreal feeling to control something with my mind for the first time.

<video controls muted playsinline preload="metadata" poster="/assets/video/brain-pong-first-demo-poster.jpg">
  <source src="/assets/video/brain-pong-first-demo.mp4" type="video/mp4">
  A player wired up with gold cup electrodes and a Cerelog board moves the Pong paddle by looking left and right.
</video>

### valley of pain

I got a bit cocky. Steps were taken out of order: I tried to delete parts before I was happy with performance.

After the success of the initial pipeline, I attempted to remove the SRB1 ground from the device. The theory is that because it’s subtracted equally from both left and right, the SRB1 value should cancel! I reflashed the board’s firmware to remove the SRB1 pin as an input. This unfortunately immediately broke the software.

There are actually two reasons for why it broke. The first is more obvious: the signals needed it. Subtracting SRB1 from each signal kept each signal individually within a healthy range so the signals would rail less often.

The second reason is that I accidentally turned on all 8 channels as input to the bias signal. This means that when the bias is calculating which signal average to generate, it takes in 6 channels of garbage unconnected electrical noise (nothing was connected to channels 3-8).

The second reason gave me a week or two of pain as I tried to figure out why my data was garbage. In this process, I also improve the filtering and detection algorithms. The event I was hoping to host, Brain Pong, also needed to be rescheduled twice as the tech just wasn’t ready. I couldn’t even figure out a single board at the time!

### mass data collection

I was overjoyed when I figured out the firmware fix. In response, I resolved to do better!

First, I designed a fresh skin preparation regime. I wanted to ensure electrode impedance was as low as possible. Modifications were: scrubbing the skin with a paper towel and then rinsing with alcohol. At a later date, I began asking participants to wash off their face after sweating in the summer heat.

Second, I collected 10 different participants’ data. This was fun! It gave me an opportunity to talk to lots of strangers and ask them if they would like “to get hooked up to my brain machine”. Sadly, a core lesson of this period is that the data I was collecting wasn’t actually useful. I didn’t know how to convert this data into actionable pipeline changes!

### tournament day!

it was a blast to host the tournament! i’m happy so many people came and enjoyed the snacks! i made many mistakes. probably the most significant one was not running a dry run of the tournament ahead of time. this may have 1. clued me in to the fact that gel takes a LONG time to apply and remove, as well as 2. exposing that noise is a much bigger threat to signal when two people are playing and connected to a screen as well. overall, i had fun and learned a lot.

## next steps

### post-mortem

There were lots of things I did wrong! I’d like to improve on the following things for my next event:

- Reading the literature of others!
- I hate gel! Try to switch to dry electrodes
- Collect data in a way that turns into a better model
- run the engineering design process. every step!

### the future

my next project will likely be an EEG mouse. this will do two important things. first: i will be measuring the brain, not the eyes. i’d like to get familiarity with brain signals, as this is closest to the role i’d like. second: a mouse (two degrees of freedom + click) opens up MANY more games than just the one dimension of control of pong. a significantly more fun chess tournament (or any game that can be played with a mouse) would be possible! I’m also interested in training personal classifiers for individual people; I’m guessing this will give me significantly higher precision than a 1-size-fits-all classifier. Before I do anything though, I’m going to do a survey of what others have tried.

### why do this at all?

I’ve been fascinated by BCIs for a decade, quietly keeping my eye on the industry as it grows. In the past couple months, i decided to try hard for a job in the industry. in the short term, there’s a wealth of serious medical problems to solve. we can make life significantly better for a chunk of humanity and shouldn’t pass up this chance. in the long term, i’m excited for the beautiful and wild possibilities that unlock when we have much better control of reading/writing to a significant number of neurons in the brain. we can make life so much better for humanity. excelsior!

## glossary

- ADC: analog-digital converter
- BCI: brain-computer interface
- EEG: electroencephalography
- EOG: electrooculography
- mV: millivolts
- µV: microvolts
- V: volts
- Hz: hertz

<script src="/assets/essay-figures/figures.js?v=112"></script>
