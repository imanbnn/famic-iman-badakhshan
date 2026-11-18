import { placePosterRipples, placeChartRipples } from "#render/harbour/ripple-layout";

const WATER_FRAME_MS = 75;
const MAX_ELAPSED_MS = 125;
const PHASE_PER_MS = 0.00115;

const WAVE = {
  phaseOffset: 0.71,
  horizontalSpeed: 0.8,
  verticalSpeed: 0.52,
  horizontalTravel: 5,
  verticalTravel: 1.4,
  minSpan: 3,
  extraSpan: 5,
  minOpacity: 0.1,
  extraOpacity: 0.4,
  minWidth: 0.9,
  extraWidth: 0.65
};

export class Tide {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.phase = 0;
    this.ripples = new Map();
  }

  addRipple(x, y, seed) {
    if (!this.ripples.has(seed)) this.ripples.set(seed, []);
    this.ripples.get(seed).push({ x, y });
  }

  fitPoster() {
    this.ripples.clear();
    placePosterRipples((x, y, seed) => this.addRipple(x, y, seed));
    this.paint(0);
  }

  fit(chart) {
    this.canvas.width = Math.ceil(chart.view.width);
    this.canvas.height = Math.ceil(chart.view.height);
    this.ripples.clear();
    placeChartRipples(chart, (x, y, seed) => this.addRipple(x, y, seed));
    this.paint(this.phase);
  }

  paint(phase) {
    const c = this.ctx;
    c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    c.lineCap = "round";
    for (const [seed, points] of this.ripples) {
      const p = phase + seed * WAVE.phaseOffset,
        glow = (1 + Math.sin(p)) * 0.5;
      const dx = Math.sin(p * WAVE.horizontalSpeed) * WAVE.horizontalTravel,
        dy = Math.cos(p * WAVE.verticalSpeed) * WAVE.verticalTravel,
        span = WAVE.minSpan + glow * WAVE.extraSpan;
      c.beginPath();
      for (const point of points) {
        const x = point.x + dx,
          y = point.y + dy;
        c.moveTo(x - span, y + 0.8);
        c.quadraticCurveTo(x - 1, y - 1.6, x + span, y);
      }
      c.strokeStyle = "rgba(208,238,218," + (WAVE.minOpacity + WAVE.extraOpacity * glow) + ")";
      c.lineWidth = WAVE.minWidth + glow * WAVE.extraWidth;
      c.stroke();
    }
  }

  run(enabled) {
    if (this.running === enabled) return;
    this.running = enabled;
    clearTimeout(this.timer);
    cancelAnimationFrame(this.frame);
    if (!enabled) return;
    let last = performance.now();
    const advance = (now) => {
      this.phase += Math.min(MAX_ELAPSED_MS, now - last) * PHASE_PER_MS;
      last = now;
      this.paint(this.phase);
      this.timer = setTimeout(() => {
        this.frame = requestAnimationFrame(advance);
      }, WATER_FRAME_MS);
    };
    this.frame = requestAnimationFrame(advance);
  }
}
