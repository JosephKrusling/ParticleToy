import { add, angleBetween, dist, dist2, Engine, Particle, repel, scale, V2D } from "./types";
import { randAround0 } from "./util";

const wallHitFactor = 0.6;

export function createEngine(size: V2D): Engine {
  // Initialize particles
  let particles = [] as Particle[];
  for (let i = 0; i < 100; i++) {
    particles.push({
      id: i,
      position: {
        x: Math.floor(Math.random() * size.x),
        y: Math.floor(Math.random() * size.y),
      },
      velocity: {x: randAround0(), y: randAround0()},
      radius: 21,
      data: 0,
      interactor: () => ({x: 0, y: 0})
    });

  }

  return {
    particles,
    size,
    wallWidth: 10
  };
}

function enforceBounds(engine: Engine, particle: Particle) {
  const p = particle.position;
  const v = particle.velocity;
  let hit = false;
  if (p.x < engine.wallWidth + particle.radius) {
    p.x = engine.wallWidth + particle.radius;
    if (v.x < 0) {
      v.x = -v.x;
    }
    hit = true;
  } else if (p.x > engine.size.x - engine.wallWidth - particle.radius) {
    p.x = engine.size.x - engine.wallWidth - particle.radius;
    if (v.x > 0) {
      v.x = -v.x;
    }
    hit = true;
  }
  if (p.y < engine.wallWidth + particle.radius) {
    p.y = engine.wallWidth + particle.radius;
    if (v.y < 0) {
      v.y = -v.y;
    }
    hit = true;
  } else if (p.y > engine.size.y - engine.wallWidth - particle.radius) {
    p.y = engine.size.y - engine.wallWidth - particle.radius;
    if (v.y > 0) {
      v.y = -v.y;
    }
    hit = true;
  }
  if (hit) {
    v.x = v.x * wallHitFactor;
    v.y = v.y * wallHitFactor;
  }
}

function getClosestParticle(to: Particle, others: Particle[]): [Particle, number] {
  let bestDist = Number.MAX_VALUE;
  let bestParticle = null;
  for (let particle of others) {
    if (particle.id === to.id) {
      continue;
    }
    let d2 = dist2(to.position, particle.position);
    if (d2 < bestDist) {
      bestDist = d2;
      bestParticle = particle;
    }
  }
  return [bestParticle!, Math.sqrt(bestDist)];
}

export function runEngineStep(engine: Engine, dt: number) {
  for (let particle of engine.particles) {
    enforceBounds(engine, particle);
    particle.data = 0;

    for (let neighbor of engine.particles) {
      if (neighbor.id === particle.id) {
        continue;
      }
      // particle.data = Math.floor(nearestd);
      const d2 = dist2(particle.position, neighbor.position);
      const angle = angleBetween(particle.position, neighbor.position);

      let attractorMagnitude = 0;
      if (d2 < 5000) {
        attractorMagnitude = 0.01;
      }

      // Collision detection
      if (d2 < Math.pow(particle.radius + neighbor.radius, 2)) {
        particle.data += 1;
        attractorMagnitude *= -10 ;
        if (d2 < Math.pow(particle.radius + neighbor.radius, 2)) {
          attractorMagnitude *= 5;
        }
      }

      particle.velocity.x += Math.cos(angle) * attractorMagnitude;
      particle.velocity.y += Math.sin(angle) * attractorMagnitude;
    }

    const energyLossFactory = 1 - (0.01);
    particle.velocity = scale(particle.velocity, energyLossFactory);


    particle.position = add(particle.position, scale(particle.velocity, dt));
  }
}