import {
  add,
  angleBetween,
  Color,
  dist,
  dist2,
  Engine,
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
    wallWidth: 15,
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

function getClosestParticle(
  to: Particle,
  others: Particle[]
): [Particle, number] {
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

function getColorSimilarity(c1: Color, c2: Color): number {
  return (
    1 -
    (Math.abs(c1.r - c2.r) + Math.abs(c1.g - c2.g) + Math.abs(c1.b - c2.b)) /
      (255 * 3)
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
      // particle.data = Math.floor(nearestd);
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
      // if (particle.charge === neighbor.charge) {
      //   chargeForce *= -1;
      // }
      netForce += chargeForce;

      // Anticollider force
      const edgeDist = d - particle.radius - neighbor.radius;
      if (edgeDist < 0) {
        // netForce += -0.1;
        netForce += edgeDist/(particle.radius + neighbor.radius)
      }

      // particle.data = particle.charge
      particle.velocity.x += Math.cos(angle) * netForce;
      particle.velocity.y += Math.sin(angle) * netForce;
    }

    const energyLossFactory = 1 - 0.001;
    particle.velocity = scale(particle.velocity, energyLossFactory);

    particle.position = add(particle.position, scale(particle.velocity, dt));
  }
}
