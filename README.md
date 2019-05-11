
# Flock-follow Experiment

This is an experiment I learned in a workshop some time ago (I don't quite remember the exact occasion):

Ask a group of people to walk around in a restricted space, so that flocking behaviour can emerge. Let them keep moving while trying not to bump into each other.

Observe the behaviour for a while.

Then introduce the "follow-rule". From a certain moment, signalled by a clap, each person:

1. secretly selects another random person, and
2. tries to keep a constant distance to that person.

Observe the behaviour again. What has changed?

I have done the experiment a number of times with groups of students. Afterwards I have shown this simulation, which attempts to model the phenomenon.

This code grew from a rewrite of the p5.js flocking example by Daniel Shiffman from "The Nature of Code" (http://natureofcode.com).

To start, run a webserver, e.g. [live-server](https://github.com/tapio/live-server) in the main directory.

## DONE

- ES6
- implement parameter UI with [Materialize](http://materializecss.com/)
- implement "follow" logic
- expose neighborhood parameters
- save/load parameters
- implement run/pause
- implement variable number of boids
- lint the code with [semistandard](https://github.com/Flet/semistandard)

## IDEAS

- implement "highlight one" (klick on one boid while paused to highlight it)
- implement a small random error in the following distance  
- display graphs of parameters over time, e.g. global cohesion
- implement optional tracing and save trace data
- add an option to show a video of the experiment with humans and the simulation side-by-side
- implement more behaviours from Reynolds' paper
- show parameter values in the UI
- better handle "load parameters" (path)
- select colors for boids / background

- modularize the code, make p5.js work with ES6 modules
- function parameters instead of global variables
- optimize (avoid vector creation in the draw loop)
- optimize (reduce multiple runs through the boids array in flocking behaviors into one)

- add sonification

- extend the human experiment with switching followees, alternating between following and non-following mode, varying speed, different group and room sizes.

## References

[p5.js](https://p5js.org)

https://p5js.org/examples/simulate-flocking.html

http://natureofcode.com/book/chapter-6-autonomous-agents/

Reynolds, Craig W. “Flocks, Herds and Schools: A Distributed Behavioral Model.” ACM Siggraph Computer Graphics 21, no. 4 (1987): 25–34.

Reynolds, Craig W. “Steering Behaviors for Autonomous Characters.” In Game Developers Conference, 1999:763–782, 1999.
