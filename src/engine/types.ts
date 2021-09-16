export interface Engine {
  size: V2D;
  particles: Particle[];
  wallWidth: number;
}

export interface Particle {
  id: number;
  position: V2D;
  velocity: V2D;
  radius: number;
  data: number;
  color: Color;
  charge: number;
  interactor: Interactor;
}

export interface V2D {
  x: number;
  y: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

export type Interactor = (p1: Particle, p2: Particle) => V2D
export type BoundsEnforcer = (p: Particle) => Particle;

export function add(v1: V2D, v2: V2D): V2D {
  return {x: v1.x + v2.x, y: v1.y + v2.y};
}

export function scale(v: V2D, scale: number): V2D {
  return {x: v.x * scale, y: v.y * scale};
}

export function dist2(v1: V2D, v2: V2D): number {
  return (v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y);
}

export function dist(v1: V2D, v2: V2D): number {
  return Math.sqrt(dist2(v1, v2));
}

export function angleBetween(source: V2D, dest: V2D): number {
  return Math.atan2(dest.y - source.y, dest.x - source.x);
}

export function repel(repelled: V2D, repellant: V2D, magnitude: number): V2D {
  const angle = Math.atan2(repelled.y - repellant.y, repelled.x - repellant.y);
  return {x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude}
}