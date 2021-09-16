import {
  add,
  angleBetween,
  Color,
  dist,
  dist2,
  Engine,
  getHue,
  Particle,
  repel,
  scale,
  V2D,
} from "./types";
import { randAround0 } from "./util";

const wallHitFactor = 0.9;

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
      color: {
        r: Math.floor(Math.random() * 255),
        g: Math.floor(Math.random() * 255),
        b: Math.floor(Math.random() * 255),
      },
      velocity: { x: randAround0(), y: randAround0() },
      radius: 5 + Math.round(Math.random() * 5),
      data: 0,
      charge: Math.random() > 0.5 ? 1 : -1,
      interactor: () => ({ x: 0, y: 0 }),
    });
  }

  return {
    particles,
    size,
    wallWidth: 5,
  };
}

function enforceBoundsTeleport(engine: Engine, particle: Particle) {
  const p = particle.position;
  const v = particle.velocity;
  let hit = false;
  if (p.x < engine.wallWidth + particle.radius) {
    p.x = engine.size.x - engine.wallWidth - particle.radius;
    hit = true;
  } else if (p.x > engine.size.x - engine.wallWidth - particle.radius) {
    p.x = engine.wallWidth + particle.radius;
    hit = true;
  }
  if (p.y < engine.wallWidth + particle.radius) {
    p.y = engine.size.y - engine.wallWidth - particle.radius;
    hit = true;
  } else if (p.y > engine.size.y - engine.wallWidth - particle.radius) {
    p.y = engine.wallWidth + particle.radius;
    hit = true;
  }
  if (hit) {
    v.x = v.x * wallHitFactor;
    v.y = v.y * wallHitFactor;
  }
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

function getBest(
  p: Particle,
  others: Particle[],
  scorer: (p1: Particle, p2: Particle) => number
): Particle {
  let best = Number.NEGATIVE_INFINITY;
  let bestParticle = undefined as Particle | undefined;
  for (let neighbor of others) {
    // Skip self
    if (p.id === neighbor.id) {
      continue;
    }

    const score = scorer(p, neighbor);
    if (score > best) {
      best = score;
      bestParticle = neighbor;
    }
  }
  return bestParticle!;
}

function getClosest(p: Particle, others: Particle[]): Particle {
  return getBest(p, others, (p1, p2) => 1 - dist(p1.position, p2.position));
}

function getFurthest(p: Particle, others: Particle[]): Particle {
  return getBest(p, others, (p1, p2) => dist(p1.position, p2.position));
}

function getMostSimilarByColor(p: Particle, others: Particle[]) {
  return getBest(
    p,
    others,
    (p1, p2) =>
      0 -
      Math.pow(p1.color.r - p2.color.r, 2) -
      Math.pow(p1.color.g - p2.color.g, 2) -
      Math.pow(p1.color.b - p2.color.b, 2)
  );
}

export function runEngineStep(engine: Engine, dt: number) {
  for (let particle of engine.particles) {
    enforceBounds(engine, particle);
    particle.data = 0;

    for (let neighbor of engine.particles) {
      if (neighbor.id === particle.id) {
        continue;
      }
      const d = dist(particle.position, neighbor.position);
      const angle = angleBetween(particle.position, neighbor.position);

      // Particles > 1000 away are irrelevant
      if (d > 1000) {
        continue;
      }

      let netForce = 0;

      // Charge force
      const chargeMinRadius = particle.radius + neighbor.radius;
      const chargeMaxEffect = 2;
      let chargeForce =
        chargeMaxEffect / Math.max(chargeMinRadius * chargeMinRadius, d * d);
      netForce += chargeForce;

      // Anticollider force
      const edgeDist = d - particle.radius - neighbor.radius;
      if (edgeDist < 0) {
        // netForce += -0.1;
        netForce += edgeDist / (particle.radius + neighbor.radius);
      }

      // particle.data = particle.charge
      particle.velocity.x += Math.cos(angle) * netForce;
      particle.velocity.y += Math.sin(angle) * netForce;
    }

    //Friend tracker
    // const friend = getClosest(particle, engine.particles);
    // const angle = angleBetween(particle.position, friend.position);
    // let power = 0.01;
    // if (getHue(particle.color) > getHue(friend.color)) {
    //   power *= -1;
    // }

    // particle.velocity.x += Math.cos(angle) * power;
    // particle.velocity.y += Math.sin(angle) * power;

    const energyLossFactory = 1 - 0.001;
    particle.velocity = scale(particle.velocity, energyLossFactory);

    particle.position = add(particle.position, scale(particle.velocity, dt));
  }
}
