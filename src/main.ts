import { createEngine, runEngineStep } from './engine/engine';
import { drawEngineState } from './engine/renderer';
import './style.css'

const engineStepsPerFrame = 10;

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d')!;

document.body.append(canvas);

const engine = createEngine({x: canvas.width, y: canvas.height});
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, engine.size.x, engine.size.y);

let step = 0;
function render() {

  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(0, 0, engine.size.x, engine.size.y);

  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillText(`Step: ${step}`, 50, 50);

  for (let i = 0; i < engineStepsPerFrame; i++) {
    runEngineStep(engine, 1/engineStepsPerFrame);
  }
  drawEngineState(engine, ctx);

  step++;
  requestAnimationFrame(render);
}
requestAnimationFrame(render);