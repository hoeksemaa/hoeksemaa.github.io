---
layout: default
title: Brain Pong
date: 2026-07-14
---

# brain pong

## origins

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

## first working demo

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

**1. The man looks right.** Pretty straightforward so far.

**2. Body//electrode connection (hardware).** To collect eye signals, electrodes are placed on the outer corners of the eyes. There are also electrodes placed on the earlobes for bias and SRB1 signals; more on that soon.

The electrodes should have a high quality contact with the skin to minimize impedance. This involves adding sufficient gel to the electrodes such that the cup and skin are in maximal contact via the conductive gel. Then, medical tape is used to firmly hold them in place.

Another consideration is minimizing the mismatch of impedance. When one electrode has low impedance and the other has high, it creates noise in the signal. I strive for the exact same application conditions for the electrodes: same skin prep, same amount of gel, same application time, same amount of contact with the face.

The bias signal is used to minimize environmental noise from the electrodes. Your body is a bag of conductive salt water and loves picking up signals from the environment. If you live in the United States, there are likely power outlets around you right now that are generating a 60 Hz signal. The body carries all kinds of electrical signals! It’s our job to extract the ones we care about and filter out the rest. Luckily, a 60 Hz signal from the environment would be captured by both the left and right electrodes. The bias signal takes the average of the left and right electrode signals and pumps that signal back into the body, seeking to minimize large environmental noise. This works similarly to noise-cancelling headphones.

![A diagram of how noise cancellation works: ambient sound is picked up by a microphone, inverted, and played back so the waveforms cancel.](/assets/images/brain-pong-noise-cancellation.png)

**3. Electrode//board connection (hardware).** This one’s pretty simple: focus on the wire connecting your electrode to your board. Does it conduct well? If you use a shoestring to connect the two, you will get no signal. Measure your wire’s resistance using a multimeter. Look for kΩs to Ohms resistance. MΩs means there’s a problem with your wire.

**4. Board//computer connection (hardware).** The Cerelog BCI board helps you with your signal quality without you having to do anything! Resistors remove frequencies above [VALIDATE NUMBER WITH SIMON. I THINK ITS 250] Hz from electrode signals before they make it to the ADS1299 chip. This is a small gift, freely given.

The correct firmware on the ADS1299 chip is also important. The firmware (in simple terms) handles which pins are accepted as valid inputs. In this setup, I’m only using pins 1 and 2; pins 3-8 shouldn’t feed into the bias calculation. I will forget this later.

One of the most common causes of a noisy signal in EOG setups is when someone accidentally adds electrical noise to the system. I’ve forgotten many times to unplug my laptop from its charging cord, or have kept my laptop plugged into an external monitor. This creates noise! It’s large and immediately obvious if you’re paying attention, but I’ve forgotten this step many times.

The ADS1299 [converts the signals from analog to digital](https://en.wikipedia.org/wiki/Analog-to-digital_converter). This process is basically looking at a continuous, messy signal and placing it into one of 12 precise buckets. The digitized signal is passed from ADS1299 to ESP32 and then out to the computer.

There are other “duh” checks that I perform, each of which has burned me at least once. To list the most egregious: Is the board turned on? Are the wires plugged into the right locations? Have the left/right electrodes been swapped? Is the board plugged into the correct laptop port? My time in rocketry taught me that there’s a simple solution to ensure these “duh” checks don’t slow you down in the future: [write a checklist](https://en.wikipedia.org/wiki/The_Checklist_Manifesto).

**5. Subtract left from right (software).** We are now firmly in the regime of software. We’ve made the assumption that the signal has been recorded from the body; the data has been safely deposited in the computer’s loving memory. We now have 2 raw data channels: the left and right electrodes. This is a time-series dataset. We don’t particularly care about the exact reading of right or left, but the difference between them.

Remember the idea underlying EOG: The eyes are charged. When the eyes swing right, one eye is moving towards an electrode, and the other is moving away. We should expect to see a positive change in one channel and a negative change in the other.

To gain a single signal to work with, the left channel is subtracted from the right.

**6. Perform filtering (software).** Even after the board filtered out some of the high-frequency noise, a lot still remains. This noise makes it harder to isolate the signal, so it’s worthwhile to strip it out. The standard industry tools are filters that snip parts of the frequency range. I use a [low-pass filter](https://en.wikipedia.org/wiki/Low-pass_filter) at 0.5 Hz, [high-pass filter](https://en.wikipedia.org/wiki/High-pass_filter) at 100 Hz, and [band-pass filters](https://en.wikipedia.org/wiki/Band-pass_filter) at 50 Hz (European) and 60 Hz (American).

Other than the band-pass filtering for specific wall outlet frequencies, picking precise numbers was an exercise in the dark arts. I reviewed the literature a bit, looked at what worked a bit, and held my finger to the wind a bit. 0.5 and 100 Hz seem to work well.

**7. Perform calibration (software).** Finally! We’ve made it to what I would judge to be a somewhat “clean” signal. How do we judge what counts as a spike? A simple way is to plop the subject in the chair, wire them up to the electrodes, turn on the software, and record them for several seconds. It’s good to ask them not to move their head, blink, swallow, or look around. This establishes a clean electrical “baseline”. We can derive a sigma value that defines a “noisyness” for their data.

**8. Detect spikes! (software).** Use the sigma value multiplied by some constant to establish lines above and below the zero line. If the graph crosses it, congrats! Spike detected!

I hope the pipeline is clear now.

This was the basic setup that allowed me to get Pong working for the very first time.

<!-- TODO: embed the demo video here (the doc had "[INSERT VIDEO SOMEHOW]") -->

## valley of pain

I got a bit cocky. Steps were taken out of order: I tried to delete parts before I was happy with performance.

After the success of the initial pipeline, I attempted to remove the SRB1 ground from the device. The theory is that because it’s subtracted equally from both left and right, the SRB1 value should cancel! I reflashed the board’s firmware to remove the SRB1 pin as an input. This unfortunately immediately broke the software.

There are actually two reasons for why it broke. The first is more obvious: the signals needed it. Subtracting SRB1 from each signal kept each signal individually within a healthy range so the signals would rail less often.

The second reason is that I accidentally turned on all 8 channels as input to the bias signal. This means that when the bias is calculating which signal average to generate, it takes in 6 channels of garbage unconnected electrical noise (nothing was connected to channels 3-8).

The second reason gave me a week or two of pain as I tried to figure out why my data was garbage. In this process, I also improve the filtering and detection algorithms. The event I was hoping to host, Brain Pong, also needed to be rescheduled twice as the tech just wasn’t ready. I couldn’t even figure out a single board at the time!

## mass data collection

I was overjoyed when I figured out the firmware fix. In response, I resolved to do better!

First, I designed a fresh skin preparation regime. I wanted to ensure electrode impedance was as low as possible. Modifications were: scrubbing the skin with a paper towel and then rinsing with alcohol. At a later date, I began asking participants to wash off their face after sweating in the summer heat.

Second, I collected 10 different participants’ data. This was fun! It gave me an opportunity to talk to lots of strangers and ask them if they would like “to get hooked up to my brain machine”. Sadly, a core lesson of this period is that the data I was collecting wasn’t actually useful. I didn’t know how to convert this data into actionable pipeline changes!

## tournament day!

it was a blast to host the tournament! i’m happy so many people came and enjoyed the snacks! i made many mistakes. probably the most significant one was not running a dry run of the tournament ahead of time. this may have 1. clued me in to the fact that gel takes a LONG time to apply and remove, as well as 2. exposing that noise is a much bigger threat to signal when two people are playing and connected to a screen as well. overall, i had fun and learned a lot.

## post-mortem

There were lots of things I did wrong! I’d like to improve on the following things for my next event:

- Reading the literature of others!
- I hate gel! Try to switch to dry electrodes
- Collect data in a way that turns into a better model
- run the engineering design process. every step!

## the future

my next project will likely be an EEG mouse. this will do two important things. first: i will be measuring the brain, not the eyes. i’d like to get familiarity with brain signals, as this is closest to the role i’d like. second: a mouse (two degrees of freedom + click) opens up MANY more games than just the one dimension of control of pong. a significantly more fun chess tournament (or any game that can be played with a mouse) would be possible! I’m also interested in training personal classifiers for individual people; I’m guessing this will give me significantly higher precision than a 1-size-fits-all classifier. Before I do anything though, I’m going to do a survey of what others have tried.

## why do this at all?

I’ve been fascinated by BCIs for a decade, quietly keeping my eye on the industry as it grows. In the past couple months, i decided to try hard for a job in the industry. in the short term, there’s a wealth of serious medical problems to solve. we can make life significantly better for a chunk of humanity and shouldn’t pass up this chance. in the long term, i’m excited for the beautiful and wild possibilities that unlock when we have much better control of reading/writing to a significant number of neurons in the brain. we can make life so much better for humanity. excelsior!

![A whaler standing on deck, harpoon in hand, facing the enormous eye of a whale.](/assets/images/brain-pong-whale-eye.jpg)
