---
layout: default
title: Brain Pong
date: 2026-07-14
favicon: /assets/images/brain-pong-favicon.png
---

<script>window.EOG_FIG_BASE = "/assets/essay-figures";</script>
<link rel="stylesheet" href="/assets/essay-figures/figures.css?v=18">

# Brain Pong

<p class="essay-subtitle">play pong with your eyes!</p>

<div class="essay-buttons">
  <a class="essay-button" href="https://github.com/hoeksemaa/brain-pong"><i class="ph-bold ph-github-logo"></i> project github</a>
  <a class="essay-button" href="https://hoeksemaa.github.io/brain-pong/"><i class="ph-bold ph-database"></i> public data portal</a>
</div>

<figure class="essay-figure">
  <img src="/assets/images/brain-pong-esther-hero.jpg" alt="A smiling player wearing EOG electrodes gives a thumbs up beside a competitor flashing a peace sign at the tournament table.">
</figure>

<nav class="essay-toc" markdown="1">
<span class="essay-toc-title">table of contents</span>

- [part 1: actions](#part-1-actions)
  - [ocular origins](#ocular-origins)
  - [dashing to a demo](#dashing-to-a-demo)
    - [1. The man looks right](#step-1)
    - [2. raw electrode traces are measured](#step-2)
    - [3. bias is driven into the body](#step-3)
    - [4. digitization](#step-4)
    - [5. subtract left from right](#step-5)
    - [6. detrend](#step-6)
    - [7. perform filtering](#step-7)
    - [8. perform calibration](#step-8)
    - [9. detect spikes!](#step-9)
  - [path of pain](#path-of-pain)
  - [incremental improvements](#incremental-improvements)
    - [body -- electrode connection](#body-electrode-connection)
    - [electrode -- board connection](#electrode-board-connection)
    - [board -- computer connection](#board-computer-connection)
  - [gathering gigabytes](#gathering-gigabytes)
  - [time for a tournament!](#time-for-a-tournament)
- [part 2: reflections](#part-2-reflections)
  - [how did I screw up?](#how-did-i-screw-up)
  - [what’s next?](#whats-next)
  - [why do this at all?](#why-do-this-at-all)
- [glossary](#glossary)
</nav>

# part 1: actions {#part-1-actions}

## ocular origins {#ocular-origins}

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

## dashing to a demo {#dashing-to-a-demo}

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

**Using these pieces and a couple more tricks, when the eyes move, a clear spike can be detected in the data.**

There were lots of bumps on the way to detecting a clear spike. By the end of this, you should understand how every step of the pipeline works.

### 1. The man looks right {#step-1}

<div id="fig-01" class="eog-fig"></div>

Pretty straightforward so far.

### 2. raw electrode traces are measured {#step-2}

Fair warning: I’m using real software data; animation 6 is the data I collected from my own R/L electrodes. I collected this data from the board, sent it to my laptop, and recorded the data digitally. I’m NOT using real hardware data. The SRB1 and Bias data are spoofed to common frequencies and amplitudes; the real ADC sampling is significantly faster (250 Hz). All the math, however, is real.

<div id="fig-02" class="eog-fig"></div>

My body is a big bag of salt water. It’s fantastic at picking up signals. When an electrode is placed on my skin, the following are some biological sources of voltage: brain activity, jaw clenching, blinking, swallowing, talking. The body is also fantastic at picking up signals from the environment; here are some non-biological sources: power outlets, computer charger transformers, large speakers, power tools, large machinery like refrigerators. Power outlets are the worst offenders. They produce a large 60 Hz wave (50 Hz for our European friends) that is in the mV to V range; significantly larger than the signal we’re looking for. Eyeball movements create signals measured in the µV range. We need to remove the environmental noise.

EOG’s standard technique is to use a reference electrode. This electrode’s purpose is to set an electrical baseline by attaching to the body in a place we don’t care about and measuring the “background” electrical noise. This noise will be both biological and non-biological in nature. If you’re sitting near an outlet and also swallowing, this reference electrode would pick up some combination 60 Hz wave + throat muscle signals. Another electrode close to the eye would pick up something similar: 60 Hz wave + throat muscle signals + eyeball movement signals. The reference electrode wouldn’t pick up the eyeball movement because those signals are very weak, so they don’t travel very far.

In my example, I’ve set the “background” noise to 60 Hz plus some extra harmonics. 3 electrodes on the body measure signal: left eye, right eye, and reference electrode, as shown in the EOG picture above. These electrodes that measure signal are called **passive** electrodes. As you can see, when the SRB1 signal is subtracted, the signal range drops from Vs to mVs. This is good and expected.

### 3. bias is driven into the body {#step-3}

<div id="fig-03" class="eog-fig"></div>

Bias is the 4th electrode, attached to an earlobe like SRB1. Bias doesn’t record anything, it sends an electrical signal back into the body. This is called an **active** electrode.

What signal does it send? There’s still noise in the left eye and right eye electrodes. The ADS1299 calculates the average signal between the two electrodes and pumps it back into the body via the bias electrode. This signal is in the mV range and shouldn’t hurt anyone.

This works on the same principle as noise-cancelling headphones: active interference. When a wave and the exact opposite wave are played at the same time, they cancel out. In our case, the difference we’re left with is the faint signals of the two eyes.

<figure class="essay-figure">
  <img src="/assets/images/brain-pong-noise-cancellation.png" alt="A diagram of how noise cancellation works: ambient sound is picked up by a microphone, inverted, and played back so the waveforms cancel.">
  <figcaption>wave peaks and troughs cancel</figcaption>
</figure>

### 4. digitization {#step-4}

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

All of this so far has been done on **hardware**, primarily the ADS1299 chip. Once digitization is finished, the values are sent off to the computer to be processed by software.

### 5. subtract left from right {#step-5}

<div id="fig-06" class="eog-fig"></div>

We now have 2 raw data channels: the left and right electrodes. This is a time-series dataset. We don’t particularly care about the exact reading of right or left, but the **difference** between them.

Remember the idea underlying EOG: The eyes are charged. When the eyes swing right, one eye is moving towards an electrode, and the other is moving away. We should expect to see a positive change in one channel and a negative change in the other. When subtracted, this should show clear directional swings after looking left or right.

### 6. detrend {#step-6}

<div id="fig-07" class="eog-fig"></div>

The left and right electrode voltages have a tendency to drift over time. This is due to gel drying, the exact contact shifting, and some electrical effects. These factors are usually slightly different across electrodes, leading to them drifting different amounts. Even after the two channels are subtracted from each other, there can still be a noticeable slope over time, shown in the image below. Read more about [someone else’s EOG processing pipeline here](https://www.researchgate.net/figure/Optimization-of-signal-processing-and-feature-extraction-for-real-time-data_fig3_368375242)!

<figure class="essay-figure">
  <img src="/assets/images/brain-pong-detrend-drift.png" alt="An EOG trace after DC offset removal, with a green arrow tracing a steady upward drift across four seconds.">
  <figcaption>over time, the signal trends up</figcaption>
</figure>

My detrend is very aggressive. I’d like to adjust it to take effect over a period of 10 seconds instead of the ~0.5 seconds it takes to bring the signal’s value to zero.

Notice also how detrend also brings the graph’s vertical offset to zero. This makes applying future math easier.

### 7. perform filtering {#step-7}

<div id="fig-08" class="eog-fig"></div>

Even after the board filtered out some of the high-frequency noise, a lot still remains. This noise makes it harder to isolate the signal, so it’s worthwhile to strip it out. The standard industry tools are filters that snip parts of the frequency range. I use a [low-pass filter](https://en.wikipedia.org/wiki/Low-pass_filter) at 100 Hz, [high-pass filter](https://en.wikipedia.org/wiki/High-pass_filter) at 0.5 Hz, and [band-stop filters](https://en.wikipedia.org/wiki/Band-stop_filter) at 50 Hz (European) and 60 Hz (American).

Other than the band-pass filtering for specific wall outlet frequencies, picking precise numbers was an exercise in the dark arts. I reviewed the literature a bit, looked at what worked a bit, and held my finger to the wind a bit. 0.5 and 100 Hz seem to work well.

### 8. perform calibration {#step-8}

<div id="fig-09" class="eog-fig"></div>

Finally! We’ve made it to what I would judge to be a somewhat “clean” signal. How do we judge what counts as a spike? A simple way is to plop the subject in the chair, wire them up to the electrodes, turn on the software, and record them for several seconds. It’s good to ask them not to move their head, blink, swallow, or look around. This establishes a clean electrical “baseline”. We can derive a sigma value that defines a “noisiness” for their data.

### 9. detect spikes! {#step-9}

<div id="fig-10" class="eog-fig"></div>

Use the sigma value multiplied by some constant to establish lines above and below the zero line. If the graph crosses it, congrats! Spike detected!

This was the basic setup that allowed me to get Pong working for the very first time. The resulting pipeline was noisy, but the game worked! It was a surreal feeling to control something with my mind for the first time.

<video controls muted playsinline preload="metadata" poster="/assets/video/brain-pong-first-demo-poster.jpg">
  <source src="/assets/video/brain-pong-first-demo.mp4" type="video/mp4">
  A player wired up with gold cup electrodes and a Cerelog board moves the Pong paddle by looking left and right.
</video>

## path of pain {#path-of-pain}

After the initial success of the pipeline, I got cocky. The pipeline still had bugs but I wanted to optimize.

The SRB1 pin, as mentioned earlier, provides an electrical baseline. It measures the electrical baseline your whole body is at so that this value can be subtracted out from individual left and right electrodes. SRB1 is subtracted from both left and right! That means that when I subtract left from right to create a single wave, the subtraction of SRB1 from both should cancel out! I thought removing this would simplify the system. In practice, it led to more pain.

Once I removed SRB1, all of my data was garbage. It was noisy and basically impossible to extract signal from.

There are two reasons for why it broke.

The first is relatively obvious: the electrodes needed it. Each electrode has a possible range of values that it can take, and if it goes too high (or low), the signal “rails”, meaning it can’t go higher. The recorded value flatlines. Subtracting SRB1 from each signal kept each signal **individually** within a healthy range so the signals would rail less often.

The second reason is actually unrelated to SRB1. When changing the firmware to ignore SRB1, I accidentally turned on all 8 channels as input to the bias signal. Previously, the bias was only calculated from the left and right channels! This means that when the bias was calculating which signal average to generate, it used 2 channels of real signal and 6 channels of garbage unconnected electrical noise (nothing was connected to channels 3-8).

**Imagine trying to listen to 2 people singing together, but then 6 other people start screaming at the tops of their lungs! They are not helping!**

This made the bias signal mostly garbage, which fed back into the head and made the left and right channel data garbage too.

I went a little crazy considering a whole host of theories for why my data was garbage. My raw data was noisy, so most of them related to connection quality, like:

- the body -- electrode connection is bad
- the electrode -- board connection is bad
- the board -- computer connection is bad

I tested these theories one by one. The culprit (as the reader knows) is none of them, but I’ll talk more about them soon!

After a while of pulling out my hair, I took another look at the firmware and discovered the 8-channel bias error. It was a simple fix to turn back on SRB1, drop bias back to 2 channels, and reflash the board!

Things will always break; this is a normal part of the iteration process. Upon reflection, the key error of this process was **not understanding the firmware I was using**. I had skimmed the ADS1299 datasheet but hadn’t understood there was a setting for modifying the channels bias used in calculation. My agent made software changes that I didn’t understand, and I had to understand the firmware fully to fix it. You could also argue that giving the agent more context on how I was using the board may also have prevented this.

I also committed the sin of optimizing too early! I shouldn’t have tried to change things that weren’t on the critical path. The SRB1 electrode wasn’t hurting anyone! A clearer articulation of this problem is given by [the story of the Monkey and the Pedestal](https://thebootstrappedfounder.com/the-monkey-and-the-pedestal/).

In future projects, I want the software to spit out its firmware configuration on boot and check that it matches the desired firmware. I will also be reading through the ADS1299 configuration settings again.

## incremental improvements {#incremental-improvements}

I mentioned earlier that my paranoia generated many theories for why my data looked like garbage. None of these on their own were transformative, but led to small improvements that I appreciate anyways! I’ll go through them quickly.

### body -- electrode connection {#body-electrode-connection}

<figure class="essay-figure">
  <img src="/assets/images/brain-pong-electrode-application.jpg" alt="Two helpers press gold cup electrodes onto a competitor’s face beside each eye.">
  <figcaption>a solid body – electrode connection!</figcaption>
</figure>

Ideally, all electrodes will have both a **low** and a **similar** impedance. If one electrode has a different impedance, this can cause noise from [common-mode interference](https://en.wikipedia.org/wiki/Common-mode_signal).

Originally, I directly applied gelled electrodes to the head. Now, my protocol calls for skin and gel standardization:

1. ask subject to wash face with soap (sweat changes conductivity)
2. abrade subject’s skin in electrode spots with paper towel
3. clean subject’s skin with alcohol
4. apply gel to each electrode. eyeball for standardization

### electrode -- board connection {#electrode-board-connection}

This is a fancy way of asking “are the wires good?” I used an ohmmeter to measure all of the wires I was using. I found that 1 of 4 had higher resistance than I expected, cut the wires and rewired it, and the resistance dropped to nominal levels. Good wires will have resistance in the ohms - kiloohms range; megaohms means your wires are bad.

This problem was later negated by switching over fully to gold cup electrode wires. These were more reliable than hand-taped wires.

### board -- computer connection {#board-computer-connection}

The board sends the computer electrical signals to encode data. If anything else is electrically connected to the computer, it can interfere with the data transmission. Ideally, you can create an **electrically isolated system of body and board and computer**, with nothing else conductive touching this system.

After numerous gaffes of getting noisy data, I updated my pre-game checklist to include the following:

- disconnect laptop from charger, external monitors via HDMI, and all other cords that are not strictly necessary
- place body, board, and laptop on non-conductive surfaces

These changes largely solved their associated noise issues. I use a lot of wireless screen mirroring for tournaments.

## gathering gigabytes {#gathering-gigabytes}

The path to improvement appeared next to be mass data collection. I had the software working reasonably well on myself; surely I should collect data from lots of people and see if it worked on them!

The data collection script prompted people to look left or right randomly, and then back to center. They were wired up while they performed this task. For the most part, this data was very clean! Peaks were easy to see, noise was low, and the timestamp of when they were prompted to look was also recorded.

Useful software changes precipitated out of the new data! The largest glaring problem was that my amplitude detector was failing to capture a majority of the prompted glances in my new dataset! It had a 45% failure rate using a 6σ detection band when tested on the 10 new people (feel free to take a look at the last 2 pipeline animations if you need a refresher). Amplitude worked well on me, but when tested on others, it could fail spectacularly. This was obviously unworkable.

After a literature review, the obvious change was to switch from measuring amplitude to velocity. When someone looks left or right, there’s a very strong and fast spike in one direction and then a smaller reverse spike as the signal attenuates back to zero. Using a pure amplitude detector can sometimes pick up this reverse spike as its own spike. By using a velocity detector, the first faster spike is easier to pick up and the reverse spike can be discarded. This needed to be coupled with HPF/LPF value tweaks to make it work well on everyone.

<div id="fig-085" class="eog-fig"></div>

A fatal flaw existed in this method of data collection. It failed to replicate tournament conditions well. People blink, swallow, turn their head, look partially left, and move their eyes at different speeds. They’re fantastic at creating unwanted electrical noise. The process didn’t even consider **two people**, the actual gameplay format! Come tournament time, my pipeline would prove insufficient for some.

People were the highlight of this process. I wanted to collect 10 different datasets and didn’t consistently have 10 friends floating around the workspace. Cold-approaching strangers and asking them if they wanted to “get hooked up to my brain machine” was a lot of fun! I got several responses of “no” or “i’m busy”. Overall, I was surprised by how much people were willing to help me. [Asking strangers for things usually goes pretty well!](https://www.youtube.com/watch?v=mC34TSXNKiY) It’s nice to have a couple more friendly faces to say hi to in my workspace.

<figure class="essay-figure">
  <img src="/assets/images/brain-pong-data-collection.jpg" alt="A wired-up subject sits at a laptop that prompts GLANCE RIGHT while his EOG trace scrolls across the screen.">
  <figcaption>a subject kindly giving me his brain waves!</figcaption>
</figure>

## time for a tournament! {#time-for-a-tournament}

To finally put the technology to the test, I hosted a [Brain Pong tournament](https://luma.com/74gvtjzb). Everything was in place: the competitors had been signed up, the eyeball-shaped snacks had been purchased, and the electrodes had been labeled and dried. All that was left was to see how the tech performed!

A problem I ran into is that everything took **dramatically** longer than I had expected. This had two parts: First, I hadn’t run a dress rehearsal, so the time spent gelling and alcohol swabbing and talking with contestants ballooned to much longer than I had planned. **Ignore the golden rule of “everything always takes longer than you expect” at your own peril.** Second, I ran into a lot of technical problems, primarily noise, that I had to do my best to mitigate. This also burned time. Even though I had conducted 2-player tests before, running it on many people revealed new problems.

There were some steps I took to mitigate tournament noise. Foolishly I tried again to see if an HDMI cable would work, as the center room had a nicer screen for tournaments. This failed and I switched to the side room display and used Screen Mirroring.

I also electrically isolated the contestants and board and computer. I put textbooks beneath the laptop and board, and swapped the contestants’ chairs from metal stools to a wooden piano bench.

Some contestants had dramatically more noise than others. This is still a mystery to me as to why this would be the case. Removing, regelling, and reapplying the electrodes didn’t help much.

The summer heat was bearing down on the contestants as they arrived at the tournament. Many of them showed up sweaty! Asking them to wash their face with soap seemed to improve noise results.

Some contestants had fantastically low noise, while others basically couldn’t get a clear signal at all. Sometimes I feel like I’m taking crazy pills; that electrons hate me personally; that some people are secretly robots that have 10x the electrical noise of real humans. The process of getting better SNR across 10+ people has felt a bit like a knife fight in the dark, where only excessive paranoia and problem isolation allows me to make progress. Any way I can lower the odds of a problem occurring is a gift.

<figure class="essay-figure">
  <img src="/assets/images/brain-pong-tournament-arena.jpg" alt="Two competitors seated in front of a projector screen showing the Pong arena mid-game.">
  <figcaption>two competitors duke it out in the arena</figcaption>
</figure>

The people and conversations that night were a high point! Neuroengineers of all stripes turned up that night. We had in attendance:

- the founder of [Cerelog](https://www.cerelog.com/), a BCI board company
- the founder of a TMS company
- the founder of a non-invasive BCI headset for ADHD and autism
- a member of a neuroscience research group
- an intern from a VC fund interested in BCIs
- several neuro enthusiasts, excited to incorporate BCI tools into their workflow
- many friends, who were very supportive and loved chatting about the brain :)

As the pong games raged on, it was a joy to hear snippets of neuroscience discussions in the background.

The tournament was kind of a mess. The technology worked smoothly on probably less than 50% of people. It’s frustrating when the controller doesn’t respond as you expect it to! When I throw the next tournament, game control accuracy is my biggest focus. I want people to be able to feel like they’re in control.

In other ways, the tournament was a smashing success! I’m grateful so many competitors wanted to play and gave me an excellent opportunity to test the technology under real-world conditions. The wealth of data I’ve collected from the tournament should help me refine the processing pipeline further. Bringing BCI-interested people together was also a blast.

So long, and I hope you liked the eyeball-shaped snacks!

# part 2: reflections {#part-2-reflections}

## how did I screw up? {#how-did-i-screw-up}

How could I have conducted this process better, from prototype to tournament? It’s traditional to conduct a post-mortem after software incidents, and the military conducts [hot washes](https://en.wikipedia.org/wiki/Hotwash) after missions. I want to take some time to reflect on how to do better.

<figure class="essay-figure">
  <img src="/assets/images/brain-pong-booster-catch.jpg" alt="A rocket booster descending onto its launch tower’s catch arms at sunset.">
  <figcaption>it’s a beautiful day for a full integrated test</figcaption>
</figure>

**My greatest sin was not [sprinting to a full integrated test](https://grantobi.substack.com/p/how-to-go-fast-without-breaking-that?utm_medium=reader2).** I had a working one-player version in May! When one-player was working, I should have immediately modified the game to support two-player and tested it until it broke. Integrated tests usually reveal major problems, and I should have tried to find these problems as soon as possible.

I treated two-player, the actual use case, as an afterthought. It burned me. I did one test with another person a day or two before the tournament that seemed to go well, but the full tournament with 8 new people revealed massive noise problems. Iteration speed on the critical path is often the bottleneck; build the next version quickly!

<figure class="essay-figure">
  <img src="/assets/images/brain-pong-engineering-design-process.png" alt="A flowchart of the engineering design process, from defining the problem through testing and communicating results.">
  <figcaption>what are you trying to solve, really?</figcaption>
</figure>

My second greatest sin was not following the engineering design process. I was thrashing around trying to make progress without defining a goal or using metrics to guide my decisions. Many of my decisions were based on vibes. There is a wealth of EOG literature that I, at best, skimmed. This existing literature may have shown me easy solutions to problems I was having. This includes reading the ADS1299 datasheet too; there’s an option to output the bias signal that I totally missed.

Letting my decisions be driven by requirements and metrics likely would’ve forced me to understand the technology more deeply. Poking at problems as they arise isn’t a strategy ([although organizational firefighting can often be good!](https://maxhodak.com/writings/2016/10/26/fast-progress-requires-strong-gradients)). The closest I got to using requirements was using [true positive/false positive/false negative](https://en.wikipedia.org/wiki/False_positives_and_false_negatives) rates to drive algorithm decisions. This was reasonable but unstructured.

Admittedly, these problems are at odds with each other. I should sprint, and also follow a structured engineering process? Yes. I need to go faster and also learn what structure is helpful; progress is possible. **Continuing to build and look for ways to improve is the only path to grow.**

There were other failures which were not as critical but are worth mentioning.

I wrote basically 100% of this project with AI tools. Like many other developers, I haven’t written a line of code by hand for a while. I should have given the agent environment more attention; this would have been a major force multiplier for coding progress. This mostly involves leaning into the [Bitter Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html). Give your agents more context about you, your project, and your desired workflow. Remove requests for your agents to work in a certain way unless it consistently gets things wrong (but check again in another 6 months!). More context; fewer limitations. Follow [@\_\_drewface](https://x.com/__drewface) or [@\_\_\_Atin\_\_\_](https://x.com/___Atin___) on twitter if you want to supercharge your agent workflow! I’m not convinced that the time of humans writing software for safety-critical systems like BCIs is over. However, the industry seems to be moving towards AI systems that supercharge testing and observability of code instead of more human effort.

I should have built more internal tooling. Specifically, an automated test suite, live quality tests for firmware and electrode quality, and a data visualization pipeline to view every data transformation step would’ve helped. I’m making the assumption that this tooling would tighten the iteration loop by providing additional visibility to what specifically was failing.

The data processing pipeline also had no personalization to individuals. People have different noise and signal characteristics. This honestly might be fine with simpler artifacts, but I have a hunch this will fail horribly if I want to make the jump to 8-channel EEG. A better approach would be to build an ML model tuned to each individual. This would cost hours per person but lead to better results.

## what’s next? {#whats-next}

EOG is cool, but it isn’t measuring the brain. It measures the physical motion of the eyeballs. It was a good technology to build basic skills, but I want to level up to measuring the brain directly.

My next project will likely be an EEG mouse. I’d like to get familiar with brain signals, as I’m actively pursuing employment with brain interface companies. A mouse provides two degrees of freedom + click, opening up more games than just the one dimension of control of pong. Think of all of your favorite games that can be played with just a mouse! 8-channel EEG will have significantly more and weaker signals than 2-channel brain pong, so I’ll have to learn even more tricks to get it to work.

I want to close with a final note on safety. My level of rigor for this first engineering artifact is acceptable to me, as it was never going into anyone’s head and the voltages were low. As a first BCI, I’m comfortable with the philosophy of “make it work at all”. This isn’t acceptable for future invasive BCIs.

If I intend to help build implantable devices, the safety and reliability need to be bulletproof. The most useful instinct here is **paranoia**. It is worthwhile to try literally anything to decrease the risk of devices failing their seal or behaving erratically or being hacked.

Testing the shit out of the device before it comes close to human implantation is an obvious must. Simulated and vat-grown brain tissue testing is probably smart, and animal studies are regrettable but necessary. [I’m also a big fan of restricting the software and hardware used to only be able to do what you want and literally nothing else.](https://maxhodak.com/writings/2020/09/13/buggy-technology-malware) The designs of Science Corporation and Precision Neuroscience are also fantastic as they never directly insert anything into the cortex, just place electrodes on top. I would even advocate for a system similar to the airline industry, where all commercial crashes are investigated.

If the industry continues down its current path, significantly stronger safety controls will be necessary.

## why do this at all? {#why-do-this-at-all}

The human brain is a glorious mystery: the originator of all experiences and yet a confusing mess of connections that we don’t fully understand.

In the short term, there is an enormous amount of medical good to do. Sensor/actuator problems, i.e. the brain’s failure to communicate with sensors like eyeballs or actuators like muscles, seem firmly in reach with enough capital and engineering effort. Brain implants are already [restoring capability to quadriplegics](https://www.youtube.com/watch?v=78m32VSOMBk) and [close to restoring sight](https://www.youtube.com/watch?v=J_qTLT8kJPU). Progress will continue and the health and capability of those we love will improve.

In the long term, things get more speculative and exotic. How could we improve the human condition if we unlock general read/write capabilities to the brain? Communicate without words? Add senses? Plumb the depths of how our minds really work? Merge with machines? The possibilities dizzy me.

It is not a riskless path. Having a computer connected to a mind surfaces questions of privacy, of exotic failures, of brain hacking. These are very scary futures, and ones I would like to steer away from in the strongest terms. I will always work for humanity.

Let’s build a beautiful future together ❤️

<figure class="essay-figure">
  <img src="/assets/images/brain-pong-tournament-spectators.jpg" alt="Two wired-up players sit side by side, eyes fixed on the game.">
  <figcaption>Excelsior!</figcaption>
</figure>

# glossary {#glossary}

- ADC: analog-digital converter
- ADHD: Attention-Deficit/Hyperactivity Disorder
- AI: artificial intelligence
- BCI: brain-computer interface
- CPU: central processing unit
- EEG: [Electroencephalography](https://en.wikipedia.org/wiki/Electroencephalography)
- EOG: [Electrooculography](https://en.wikipedia.org/wiki/Electrooculography)
- FFT: fast Fourier transform
- garbage: a technical term for Very Noisy Data
- HPF: high pass filter
- LPF: low pass filter
- ML: machine learning
- mV: millivolts
- µV: microvolts
- R/L: right/left
- σ: sigma, used in context for [standard deviation](https://en.wikipedia.org/wiki/Standard_deviation)
- SNR: signal-to-noise ratio
- SRB1: stimulus/reference/bias pin 1; a pin of the ADS1299 chip
- SSVEP: [Steady state visually evoked potential](https://en.wikipedia.org/wiki/Steady_state_visually_evoked_potential)
- TMS: [Transcranial magnetic stimulation](https://en.wikipedia.org/wiki/Transcranial_magnetic_stimulation)
- V: volts
- VC: venture capital
- Hz: hertz

<script src="/assets/essay-figures/figures.js?v=115"></script>
