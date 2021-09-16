import { Engine } from "./types";

function drawWalls(engine: Engine, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "pink";
  ctx.fillRect(0, 0, engine.wallWidth, engine.size.y);
  ctx.fillRect(0, 0, engine.size.x, engine.wallWidth);
  ctx.fillRect(
    0,
    engine.size.y - engine.wallWidth,
    engine.size.x,
    engine.wallWidth
  );
  ctx.fillRect(
    engine.size.x - engine.wallWidth,
    0,
    engine.wallWidth,
    engine.size.y
  );
}

function scaleColor(scale: number) {
  if (scale < 0) {
    scale = 0;
  } else if (scale > 1) {
    scale = 1;
  }

  return `rgba(${scale * 255},${scale*64},${scale*64},0.25)`
}

export function drawEngineState(engine: Engine, ctx: CanvasRenderingContext2D) {
  drawWalls(engine, ctx);
  ctx.font = "20px Monospace";

  for (let particle of engine.particles) {
    const color = scaleColor(particle.data / 3);
    const x = particle.position.x;
    const y = engine.size.y - particle.position.y;

    console.log(color);
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.arc(x, y, particle.radius, 0, Math.PI*2)
    ctx.fill();
    if (particle.data) {
      ctx.fillText(`${particle.data}`, x, y);
    }
  }
}
