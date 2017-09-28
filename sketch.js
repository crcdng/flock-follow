// Based on p5.js example code from The Nature of Code, Daniel Shiffman, http://natureofcode.com

let checkboxBoundary, checkboxFollow, checkboxVisualizeFollow, flock, sliderAlignment, sliderCohesion, sliderSeparation;

function setup () {
  let canvasWidth = 640;
  let canvasHeight = 480;

  flock = new Flock();

  createCanvas(canvasWidth, canvasHeight).parent('canvas-holder');

  checkboxFollow = createCheckbox('Follow', false).parent('instrument-holder');
  checkboxFollow.changed(onCheckBoxFollowChanged);
  checkboxVisualizeFollow = createCheckbox('Visualize Follow', false).parent('instrument-holder');
  checkboxVisualizeFollow.changed(onCheckboxVisualizeFollowChanged);

  sliderSeparation = createSlider(0, 5.0, flock.parameters.separation, 0).parent('instrument-holder');
  createSpan('separation').parent('instrument-holder');
  sliderAlignment = createSlider(0, 1.0, flock.parameters.alignment, 0).parent('instrument-holder');
  createSpan('alignment').parent('instrument-holder');
  sliderCohesion = createSlider(0, 1.0, flock.parameters.cohesion, 0).parent('instrument-holder');
  createSpan('cohesion').parent('instrument-holder');

  checkboxBoundary = createCheckbox('Wrap Boundary', false).parent('instrument-holder');
  checkboxBoundary.changed(onCheckboxBoundaryChanged);

  for (let i = 0; i < 100; i++) {
    flock.addBoid(new Boid(random(0, width), random(0, height)));
  }
}

function draw () {
  background(51);
  flock.run({ separation: sliderSeparation.value(),
    alignment: sliderAlignment.value(),
    cohesion: sliderCohesion.value()
  });
}

function onCheckboxBoundaryChanged () {
  flock.wrapBoundary(this.checked());
}

function onCheckBoxFollowChanged () {
  if (this.checked()) {
    flock.startFollow();
  } else {
    flock.unfollow();
  }
}

function onCheckboxVisualizeFollowChanged () {
  flock.visualizeFollow(this.checked());
}

class Flock {
  constructor () {
    this.boids = [];
    this.parameters = { separation: 2.5, alignment: 0.2, cohesion: 0.2 };
  }

  addBoid (b) {
    this.boids.push(b);
  }

  run (parameters) {
    let sumDistDiff = 0;
    for (const boid of this.boids) {
      if (boid.following) { sumDistDiff = sumDistDiff + Math.abs(boid.distDiff); }
      boid.run(this.boids, parameters);
    }
    console.log(sumDistDiff);
  }

  startFollow () {
    for (const boid of this.boids) {
      boid.startFollow(this.boids);
    }
  }

  unfollow () {
    for (const boid of this.boids) {
      boid.unfollow();
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
    this.followeeDist = 0;
    this.distDiff = 0;
    this.visualizeFollow = false;
    this.wrapBoundary = false;
  }

  // attempt to match velocity with nearby flockmates
  align (boids) {
    const neighbordist = 50;
    const sum = createVector(0, 0);
    let count = 0;
    for (const boid of boids) {
      const dist = p5.Vector.dist(this.position, boid.position);
      if ((dist > 0) && (dist < neighbordist)) {
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
      if (this.position.x < 0) {
        this.position.x = 1;
        this.velocity.x = -this.velocity.x;
      }
      if (this.position.y < 0) {
        if (wraparound) {} else {}
        this.position.y = 1;
        this.velocity.y = -this.velocity.y;
      }
      if (this.position.x > width - this.r) {
        if (wraparound) {} else {}
        this.position.x = width - (this.r + 1);
        this.velocity.x = -this.velocity.x;
      }
      if (this.position.y > height - this.r) {
        if (wraparound) {} else {}
        this.position.y = height - (this.r + 1);
        this.velocity.y = -this.velocity.y;
      }
    }
  }

  // attempt to stay close to nearby flockmates
  cohesion (boids) {
    const neighbordist = 50;
    const sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
    let count = 0;
    for (const boid of boids) {
      const dist = p5.Vector.dist(this.position, boid.position);
      if ((dist > 0) && (dist < neighbordist)) {
        sum.add(boid.position); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum);  // Steer towards the location
    } else {
      return createVector(0, 0);
    }
  }

  // We accumulate a new acceleration each time based on three rules
  flock (boids, params) {
    const sep = this.separate(boids);   // Separation
    const ali = this.align(boids);      // Alignment
    const coh = this.cohesion(boids);   // Cohesion
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
    this.distDiff = currentDist - this.followeeDist;
    let target = p5.Vector.sub(this.followee.position, this.position);
    let fol = this.seek(this.followee.position);
    fol.mult(this.distDiff);
    this.applyForce(fol);
  }

  render () {
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
    pop();

    if (this.following && this.visualizeFollow) {
      stroke(200, 11, 34);
      line(this.position.x, this.position.y, this.followee.position.x, this.followee.position.y);
    }
  }

  run (boids, params) {
    this.flock(boids, params);
    if (this.following) { this.follow(); }
    this.update();
    this.borders(this.wrapBoundary);
    this.render();
  }

  seek (target) {
    let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
    desired.normalize();
    desired.mult(this.maxspeed);
    // steering = desired minus current velocity
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce);  // Limit to maximum steering force
    return steer;
  }

  // avoid collisions with nearby flockmates
  separate (boids) {
    const desiredseparation = 30.0;
    const steer = createVector(0, 0);
    let count = 0;
    for (const boid of boids) {
      const dist = p5.Vector.dist(this.position, boid.position);
      if ((dist > 0) && (dist < desiredseparation)) {
        // Calculate vector pointing away from neighbor
        let diff = p5.Vector.sub(this.position, boid.position);
        diff.normalize();
        diff.div(dist); // Weight by distance TODO try inverse square
        steer.add(diff);
        count++;            // Keep track of how many
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

  startFollow (boids) {
    const neighbordist = 50;
    const candidates = [];
    for (const boid of boids) {
      let dist = p5.Vector.dist(this.position, boid.position);
      if ((dist > 0) && (dist < neighbordist)) {
        candidates.push(boid);
      }
    }
    // pick a random nearby boid or any random boid if no one is near
    this.followee = random(candidates);
    if (this.followee == null) { this.followee = random(boids); }
    this.followeeDist = p5.Vector.dist(this.position, this.followee.position);

    // console.log('I follow ', this.followee, 'at distance ', this.followeeDist);
    this.following = true;
    return this.followeeDist;
  }

  unfollow () {
    this.following = false;
    this.followee = null;
    this.followeeDist = 0;
  }

  update () {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }
}
