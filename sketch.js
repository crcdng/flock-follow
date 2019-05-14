// flock-follow by crcdng. see Readme.md
/* global background, beginShape, circle, CLOSE, createButton, createCanvas, createCheckbox, createP, createSlider, createSpan, createVector, draw, endShape, fill, height, line, loadJSON, loop, noFill, noLoop, p5, pop, print, push, radians, random, rotate, saveJSON, setup, stroke, translate, vertex, width */

let btnPause, btnRun, checkboxHalo, defaults, flock, numberOfboids, parameters, running,
  sliderAlignment, slideralignmentDiameter, sliderCohesion,
  slidercohesionDiameter, sliderSeparation, sliderseparationDiameter, spanNumberOfBoids;

function setup () {
  createCanvas(640, 480).parent('canvas-area');
  running = false;
  noLoop();
  numberOfboids = 100;
  defaults = {
    separation: 2.5,
    separationDiameter: 30,
    alignment: 0.2,
    alignmentDiameter: 50,
    cohesion: 0.2,
    cohesionDiameter: 50
  };
  parameters = Object.assign({}, defaults);

  createP('').parent('ui-area'); // some distance
  const btnInit = createButton('Initialize').class('btn').parent('ui-area');
  btnInit.mousePressed(initialize);
  createP('').parent('ui-area'); // some distance
  createSpan('boids ').parent('ui-area');
  spanNumberOfBoids = createSpan(numberOfboids).parent('ui-area');
  const sliderNumberOfBoids = createSlider(0, 500, numberOfboids, 0).parent('ui-area');
  sliderNumberOfBoids.input(onSliderNumberOfBoidsInput);
  createP('').parent('ui-area'); // some distance
  btnRun = createButton('Run').class('btn blue disabled').parent('ui-area');
  btnRun.mousePressed(runPause);
  createSpan(' ').parent('ui-area'); // some distance
  btnPause = createButton('Pause').class('btn blue disabled').parent('ui-area');
  btnPause.mousePressed(runPause);

  createP('').parent('ui-area'); // some distance
  createSpan('separation').parent('ui-area');
  sliderSeparation = createSlider(0, 5.0, parameters.separation, 0).parent('ui-area');
  createSpan('alignment').parent('ui-area');
  sliderAlignment = createSlider(0, 1.0, parameters.alignment, 0).parent('ui-area');
  createSpan('cohesion').parent('ui-area');
  sliderCohesion = createSlider(0, 1.0, parameters.cohesion, 0).parent('ui-area');

  createP('').parent('ui-area'); // some distance
  const btnReset = createButton('reset parameters').class('btn').parent('ui-area');
  btnReset.mousePressed(onButtonResetParametersPressed);
  createP('').parent('ui-area'); // some distance
  const btnLoad = createButton('load parameters').class('btn').parent('ui-area');
  btnLoad.mousePressed(loadParameters);
  createP('').parent('ui-area'); // some distance
  const btnSave = createButton('save parameters').class('btn').parent('ui-area');
  btnSave.mousePressed(saveParameters);

  createP('').parent('ui-area'); // some distance
  const checkboxFollow = createCheckbox('follow', false).parent('ui-area');
  checkboxFollow.changed(onCheckboxFollowChanged);
  const checkboxVisualizeFollow = createCheckbox('visualize follow', false).parent('ui-area');
  checkboxVisualizeFollow.changed(onCheckboxVisualizeFollowChanged);
  const checkboxBoundary = createCheckbox('wrap boundary', false).parent('ui-area');
  checkboxBoundary.changed(onCheckboxBoundaryChanged);
  checkboxHalo = createCheckbox('show halo', true).parent('ui-area');
  const checkboxRadii = createCheckbox('show radii', false).parent('ui-area');
  checkboxRadii.changed(onCheckboxRadiiChanged);

  createP('').parent('ui-area'); // some distance
  createSpan('separation radius').parent('ui-area');
  sliderseparationDiameter = createSlider(20, 200, parameters.separationDiameter, 0).parent('ui-area');
  createSpan('alignment radius').parent('ui-area');
  slideralignmentDiameter = createSlider(20, 200, parameters.alignmentDiameter, 0).parent('ui-area');
  createSpan('cohesion radius').parent('ui-area');
  slidercohesionDiameter = createSlider(20, 200, parameters.cohesionDiameter, 0).parent('ui-area');
}

function draw () {
  background(51, checkboxHalo.checked() ? 77 : 255);
  parameters.separation = sliderSeparation.value();
  parameters.separationDiameter = sliderseparationDiameter.value();
  parameters.alignment = sliderAlignment.value();
  parameters.alignmentDiameter = slideralignmentDiameter.value();
  parameters.cohesion = sliderCohesion.value();
  parameters.cohesionDiameter = slidercohesionDiameter.value();
  if (flock != null) { flock.run(parameters); } // draw runs once even if noLoop is called in setup()
}

function initialize () {
  btnRun.removeClass('disabled');
  makeFlock(numberOfboids);
  background(51);
}

function loadParameters () {
  parameters = loadJSON('flockfollow_params.json', updateUiParameterElements, (e) => { print('flockfollow parameter file not found!'); });
}

function makeFlock (n) {
  flock = new Flock(parameters);
  for (let i = 0; i < n; i++) {
    flock.addBoid(new Boid(random(0, width), random(0, height)));
  }
}

function onButtonResetParametersPressed () {
  parameters = Object.assign({}, defaults);
  updateUiParameterElements();
}

function onCheckboxBoundaryChanged () {
  flock.wrapBoundary(this.checked());
}

function onCheckboxRadiiChanged () {
  flock.showRadii(this.checked());
}

function onCheckboxFollowChanged () {
  if (this.checked()) {
    flock.startFollow();
  } else {
    flock.stopFollow();
  }
}

function onCheckboxVisualizeFollowChanged () {
  flock.visualizeFollow(this.checked());
}

function onSliderNumberOfBoidsInput (value) {
  numberOfboids = int(value.target.valueAsNumber);
  spanNumberOfBoids.elt.innerHTML = numberOfboids;
}

function runPause () {
  if (running === true) {
    running = false;
    btnRun.toggleClass('disabled');
    btnPause.toggleClass('disabled');
    noLoop();
  } else {
    running = true;
    btnRun.toggleClass('disabled');
    btnPause.toggleClass('disabled');
    loop();
  }
}

function saveParameters () {
  saveJSON(parameters, 'flockfollow_params.json');
}

function updateUiParameterElements () {
  sliderSeparation.value(parameters.separation);
  sliderseparationDiameter.value(parameters.separationDiameter);
  sliderAlignment.value(parameters.alignment);
  slideralignmentDiameter.value(parameters.alignmentDiameter);
  sliderCohesion.value(parameters.cohesion);
  slidercohesionDiameter.value(parameters.cohesionDiameter);
}

class Flock {
  constructor () {
    this.boids = [];
    this.parameters = parameters;
  }

  addBoid (boid) {
    this.boids.push(boid);
  }

  run (parameters) {
    let sumDistDiff = 0;
    for (const boid of this.boids) {
      if (boid.following) { sumDistDiff = sumDistDiff + Math.abs(boid.distDiff); }
      boid.run(this.boids, parameters);
    }
    // console.log(sumDistDiff);
  }

  showRadii (on) {
    for (const boid of this.boids) {
      boid.showRadii = on;
    }
  }

  startFollow () {
    for (const boid of this.boids) {
      boid.startFollow(this.boids);
    }
  }

  stopFollow () {
    for (const boid of this.boids) {
      boid.stopFollow();
    }
  }

  visualizeFollow (on) {
    for (const boid of this.boids) {
      boid.visualizeFollow = on;
    }
  }

  wrapBoundary (on) {
    for (const boid of this.boids) {
      boid.wrapBoundary = on;
    }
  }
}

class Boid {
  constructor (x, y) {
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.position = createVector(x, y);
    this.r = 6.0;
    this.maxspeed = 3;
    this.maxforce = 0.05;
    this.following = false;
    this.followee = null;
    this.initialDistToFollowee = 0;
    this.distDiff = 0;
    this.visualizeFollow = false;
    this.wrapBoundary = false;
    this.showRadii = false;
  }

  // attempt to match velocity with nearby flockmates
  align (boids, params) {
    const sum = createVector(0, 0);
    let count = 0;
    for (const boid of boids) {
      const dist = p5.Vector.dist(this.position, boid.position);
      if ((dist > 0) && (dist < params.alignmentDiameter)) {
        sum.add(boid.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxspeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxforce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  applyForce (force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  }

  borders (wraparound) {
    if (wraparound) {
      if (this.position.x < -this.r) {
        this.position.x = width + this.r;
      }
      if (this.position.y < -this.r) {
        this.position.y = height + this.r;
      }
      if (this.position.x > width + this.r) {
        this.position.x = -this.r;
      }
      if (this.position.y > height + this.r) {
        this.position.y = -this.r;
      }
    } else {
      if (this.position.x < this.r) {
        this.position.x = this.r + 1;
        this.velocity.x = -this.velocity.x;
      }
      if (this.position.y < this.r) {
        this.position.y = this.r + 1;
        this.velocity.y = -this.velocity.y;
      }
      if (this.position.x > width - this.r) {
        this.position.x = width - (this.r + 1);
        this.velocity.x = -this.velocity.x;
      }
      if (this.position.y > height - this.r) {
        this.position.y = height - (this.r + 1);
        this.velocity.y = -this.velocity.y;
      }
    }
  }

  // attempt to stay close to nearby flockmates
  cohesion (boids, params) {
    const sum = createVector(0, 0); // Start with empty vector to accumulate all locations
    let count = 0;
    for (const boid of boids) {
      const dist = p5.Vector.dist(this.position, boid.position);
      if ((dist > 0) && (dist < params.cohesionDiameter)) {
        sum.add(boid.position); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum); // Steer towards the location
    } else {
      return createVector(0, 0);
    }
  }

  // accumulate a new acceleration each time based on three rules
  flock (boids, params) {
    const sep = this.separate(boids, params); // Separation
    const ali = this.align(boids, params); // Alignment
    const coh = this.cohesion(boids, params); // Cohesion
    // weight these forces
    sep.mult(params.separation);
    ali.mult(params.alignment);
    coh.mult(params.cohesion);
    // Add the force vectors to acceleration
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }

  follow () {
    const currentDist = p5.Vector.dist(this.followee.position, this.position);
    this.distDiff = currentDist - this.initialDistToFollowee;
    let followSteer = this.seek(this.followee.position);
    followSteer.mult(this.distDiff);
    this.applyForce(followSteer);
  }

  render (params) {
    // Draw a triangle rotated in the direction of velocity
    const theta = this.velocity.heading() + radians(90);
    fill(127);
    stroke(200);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);
    if (this.showRadii) {
      noFill();
      stroke(120, 0, 0);
      circle(0, 0, params.alignmentDiameter);
      stroke(0, 120, 0);
      circle(0, 0, params.cohesionDiameter);
      stroke(0, 0, 120);
      circle(0, 0, 50); // follow
      stroke(120, 120, 0);
      circle(0, 0, params.separationDiameter);
    }
    pop();
    if (this.following && this.visualizeFollow) {
      stroke(200, 11, 34);
      line(this.position.x, this.position.y, this.followee.position.x, this.followee.position.y);
    }
  }

  run (boids, params) {
    this.flock(boids, params);
    if (this.following === true) { this.follow(); }
    this.update();
    this.borders(this.wrapBoundary);
    this.render(params);
  }

  seek (target) {
    let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
    desired.normalize();
    desired.mult(this.maxspeed);
    // steering = desired minus current velocity
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force
    return steer;
  }

  // avoid collisions with nearby flockmates
  separate (boids, params) {
    const steer = createVector(0, 0);
    let count = 0;
    for (const boid of boids) {
      const dist = p5.Vector.dist(this.position, boid.position);
      if ((dist > 0) && (dist < params.separationDiameter)) {
        // Calculate vector pointing away from neighbor
        let diff = p5.Vector.sub(this.position, boid.position);
        diff.normalize();
        diff.div(dist); // Weight by distance TODO try inverse square
        steer.add(diff);
        count++; // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }
    return steer;
  }

  // pick a random nearby boid to follow (or any boid if no one is near)
  startFollow (boids) {
    const candidates = [];
    for (const boid of boids) {
      let dist = p5.Vector.dist(this.position, boid.position);
      if ((dist > 0) && (dist < this.followDistance)) {
        candidates.push(boid);
      }
    }
    this.followee = random(candidates);
    if (this.followee == null) { this.followee = random(boids); }
    this.initialDistToFollowee = p5.Vector.dist(this.position, this.followee.position);

    // console.log('I follow ', this.followee, 'at distance ', this.initialDistToFollowee);
    this.following = true;
    return this.initialDistToFollowee;
  }

  stopFollow () {
    this.following = false;
    this.followee = null;
    this.initialDistToFollowee = 0;
  }

  update () {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }
}
