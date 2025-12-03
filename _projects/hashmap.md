---
title: hashbrowns
date: 2025 July
---
# hashbrowns

## Project Overview


## Post-Mortem
- make sure the top-level data structure pieces fit together before building the internals
- aug 6: 
- not sure when to abstract or leave gritty and detailed in the code. what is the proper level of abstraction?
- was considering helper function to clean up failed table resize; better solution was to place table resize in code earlier and fail sooner
- node_insert() helper fn was helpful
- managing mem allocation failure is messy. when there are multiple steps to it, undoing multiple at once is very messy. try to keep changes as small as possible and fail mallocs as much as possible
- mem changes: meant to be ATOMIZED, just like databases. everything happens, or nothing happens. (i break this rule with allowing table resize to happen first and persist on success, even if node insertion fails)
- avoid messy mallocs by using logic to abstract
- separate “does a new node need to be created” from “insert new node”
- aug 10:
- testing takes a LONG time, maybe even 50% of project time
- lots of this is edge cases, which likely account for a small % of situations
- testing is another arm of defensive programming
- probably HELLA valuable if cost of failure is high
- like with code trading models: DONT LOSE MONEY
- solutions to avoid insane testing
- sandboxing and observing behavior there
- aug 17: 
- makefiles and other autocompilation / autoclean tools are wonderful time savers
- write a scope beforehand and publish it
- otherwise, how do you know when you’re done? potentially some artistic flex to this
- you must FINISH the project: insert joe barnard videorelease to users early and let them find the bugs
