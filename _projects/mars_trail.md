---
title: Mars Trail
date: 2025 June
---
# Mars Trail: a text adventure!

Stored neatly on [github](https://github.com/hoeksemaa/Mars_Trail)

## Project Description
You're headed off to Mars! The mission plan is a prudent Hohmann transfer orbit, meaning you'll arrive in a short 9 months. Make wise decisions while you're traveling to ensure you arrive in one piece.

## Post-Mortem
- pointers are good; use them frequently
- limit scope as tight as possible and just make that work, don’t make 18 events before the basic game works
- similarly: don’t optimize too early. JUST MAKE IT WORK
- clarity for yourself and other programmers is huge:
- heavily employ conventions where possible, like build.sh or Makefiles and standard file structures like images/ directories
- make data as simple as possible, and collected in one place
- clean naming conventions are huge
- XXXX_delta for EVERYTHING
- take advantage that C initializes values to zero
- i can afford to have lots of object attributes if most of them will be zero anyways
- separate data from actions
- i had individual outcome functions that applied a number to a 
- getting an outside set of eyes can improve things a lot
- restructuring outcome fns → outcome data
- figuring out a bug i had with input parsing (using 2 getchar’s) 

