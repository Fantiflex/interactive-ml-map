import { useEffect, useMemo, useState } from "react";
import type { PointerEvent } from "react";

type Vec = [number, number];
type Settings = { eta: number; steepness: number; angle: number; beta: number; start: Vec };
type Frame = { position: Vec; gradient: Vec; history: Vec; scale: Vec; update: Vec; loss: number };
const COUNT = 60, LIMIT = 3.5, EPS = 1e-8;
const DEFAULT: Settings = { eta: 0.12, steepness: 12, angle: 0, beta: 0.9, start: [2.4, 2.2] };
function loss(s: Settings, p: Vec) {
  const a = s.angle * Math.PI / 180, c = Math.cos(a), d = Math.sin(a);
  const u = c * p[0] + d * p[1], v = -d * p[0] + c * p[1];
  return 0.5 * (s.steepness * u * u + v * v);
}
function gradient(s: Settings, p: Vec): Vec {
  const a = s.angle * Math.PI / 180, c = Math.cos(a), d = Math.sin(a);
  const u = c * p[0] + d * p[1], v = -d * p[0] + c * p[1];
  return [s.steepness * u * c - v * d, s.steepness * u * d + v * c];
}
export function simulateScaling(s: Settings, adaptive: boolean): Frame[] {
  let position: Vec = [...s.start], history: Vec = [0, 0];
  const frames: Frame[] = [{ position: [...position], gradient: gradient(s, position), history: [0, 0], scale: [1, 1], update: [0, 0], loss: loss(s, position) }];
  for (let t = 0; t < COUNT; t++) {
    const g = gradient(s, position);
    if (adaptive) history = [s.beta * history[0] + (1 - s.beta) * g[0] ** 2, s.beta * history[1] + (1 - s.beta) * g[1] ** 2];
    const scale: Vec = adaptive ? [1 / (Math.sqrt(history[0]) + EPS), 1 / (Math.sqrt(history[1]) + EPS)] : [1, 1];
    const update: Vec = [-s.eta * scale[0] * g[0], -s.eta * scale[1] * g[1]];
    position = [position[0] + update[0], position[1] + update[1]];
    // The shared-rate experiment can diverge. Retain finite results without clipping.
    if (!Number.isFinite(loss(s, position)) || Math.hypot(...position) > 1e6) break;
    frames.push({ position: [...position], gradient: g, history: [...history], scale, update, loss: loss(s, position) });
  }
  return frames;
}
const format = (n: number) => n !== 0 && (Math.abs(n) < .001 || Math.abs(n) >= 10000) ? n.toExponential(2) : n.toFixed(3);
const sx = (x: number) => 160 + x / LIMIT * 133;
const sy = (y: number) => 140 - y / LIMIT * 115;
function Plot({ settings, frames, step, adaptive, onPlace }: { settings: Settings; frames: Frame[]; step: number; adaptive: boolean; onPlace: (p: Vec) => void }) {
  const frame = frames[Math.min(step, frames.length - 1)], outside = frame.position.some(v => Math.abs(v) > LIMIT);
  const color = adaptive ? "#0f766e" : "#d97706";
  const place = (e: PointerEvent<SVGSVGElement>) => {
    // Invert the SVG viewBox transform, including any letterboxing.
    const matrix = e.currentTarget.getScreenCTM(); if (!matrix) return;
    const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
    onPlace([Math.max(-LIMIT, Math.min(LIMIT, (point.x - 160) * LIMIT / 133)), Math.max(-LIMIT, Math.min(LIMIT, (140 - point.y) * LIMIT / 115))]);
  };
  return <div className="as-plot-card"><h4>{adaptive ? "Adaptive scaling" : "Shared learning rate"}</h4><p>{adaptive ? "Separate factors for x and y" : "One factor for both coordinates"}</p>
    <svg viewBox="0 0 320 280" role="img" aria-label={`${adaptive ? 'Adaptive scaling' : 'Shared rate'} trajectory at step ${step}. Click or drag to change the common starting position.`} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); place(e); }} onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) place(e); }} onPointerUp={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }} className="as-plot">
      <defs><clipPath id={adaptive ? "as-adaptive-clip" : "as-shared-clip"}><rect x="20" y="20" width="280" height="240" rx="8" /></clipPath></defs>
      <rect x="20" y="20" width="280" height="240" rx="8" fill="#fafaf9" />
      <g clipPath={`url(#${adaptive ? "as-adaptive-clip" : "as-shared-clip"})`}>
        {[1, 2, 4, 8, 16, 32, 64].map(level => <path key={level} d={Array.from({ length: 97 }, (_, i) => {
          const t = i / 96 * 2 * Math.PI, u = Math.sqrt(2 * level / settings.steepness) * Math.cos(t), v = Math.sqrt(2 * level) * Math.sin(t), a = settings.angle * Math.PI / 180;
          const x = Math.cos(a)*u - Math.sin(a)*v, y = Math.sin(a)*u + Math.cos(a)*v;
          return `${i ? "L" : "M"}${sx(x)},${sy(y)}`;
        }).join(" ") + " Z"} fill="none" stroke="#d6ded8" strokeWidth="1" />)}
        <path d="M20 140H300M160 20V260" stroke="#e7e5e4" strokeDasharray="3 4" />
        <polyline points={frames.slice(0, Math.min(step + 1, frames.length)).map(f => `${sx(f.position[0])},${sy(f.position[1])}`).join(" ")} stroke={color} strokeWidth="2.5" fill="none" />
        <circle cx={sx(settings.start[0])} cy={sy(settings.start[1])} r="5" fill="white" stroke={color} strokeWidth="2" />
        {!outside && <circle className="as-ball" cx={sx(frame.position[0])} cy={sy(frame.position[1])} r="7" fill={color} stroke="white" strokeWidth="2" />}
      </g>
      <circle cx="160" cy="140" r="3" fill="#525252" />
      <text x="168" y="135" fontSize="9" fill="#737373">minimum</text><text x="291" y="154" fontSize="10" fill="#737373">x</text><text x="169" y="28" fontSize="10" fill="#737373">y</text>
    </svg>
    <div className="as-readout"><span>Loss <b>{format(frame.loss)}</b></span><span>Step size <b>{format(Math.hypot(...frame.update))}</b></span></div>
    {outside && <p className="as-warning">Position is outside the visible range. Lower the learning rate.</p>}
    {step >= frames.length && <p className="as-warning">Simulation stopped before overflow; parameters were not clipped.</p>}
  </div>;
}
function Bars({ title, values, colors, empty }: { title: string; values: Vec; colors: string[]; empty: boolean }) {
  const max = Math.max(...values, 1e-12);
  return <div className="as-bars"><h4>{title}</h4>{values.map((v, i) => <div className="as-bar-row" key={i}><span>{i ? "y" : "x"}</span><div className="as-bar-track"><div style={{ width: empty ? "0%" : `${v / max * 100}%`, background: colors[i] }} /></div><b>{empty ? "—" : format(v)}</b></div>)}</div>;
}
export default function AdaptiveScalingDemo() {
  const [settings, setSettings] = useState<Settings>(DEFAULT), [step, setStep] = useState(0), [playing, setPlaying] = useState(false);
  const shared = useMemo(() => simulateScaling(settings, false), [settings]);
  const adaptive = useMemo(() => simulateScaling(settings, true), [settings]);
  const frame = adaptive[Math.min(step, adaptive.length - 1)];
  useEffect(() => { if (!playing) return; if (step >= COUNT) { setPlaying(false); return; } const timer = window.setTimeout(() => setStep(t => Math.min(t + 1, COUNT)), 350); return () => window.clearTimeout(timer); }, [playing, step]);
  const reset = () => { setPlaying(false); setStep(0); };
  const place = (start: Vec) => { reset(); setSettings(s => ({ ...s, start })); };
  const change = (key: "eta" | "steepness" | "angle" | "beta", value: number) => { reset(); setSettings(s => ({ ...s, [key]: value })); };
  const highX = frame.history[0] > frame.history[1];
  return <section className="as-demo">
    <style>{styles}</style>
    <div className="as-intro"><span>INTERACTIVE MECHANISM</span><h3>Why adaptive scaling?</h3><p>A single learning rate can move too far across a steep direction while making slow progress along a shallow one. Gradient history lets us rescale each coordinate separately.</p></div>
    <div className="as-plots"><Plot settings={settings} frames={shared} step={step} adaptive={false} onPlace={place} /><Plot settings={settings} frames={adaptive} step={step} adaptive onPlace={place} /></div>
    <div className="as-buttons"><button type="button" className="as-primary" onClick={() => { if (step >= COUNT) setStep(0); setPlaying(p => !p); }}>{playing ? "Pause" : "Play"}</button><button type="button" disabled={step >= COUNT} onClick={() => { setPlaying(false); setStep(t => Math.min(t + 1, COUNT)); }}>Next step</button><button type="button" onClick={reset}>Reset</button><span>Step {step}/{COUNT}</span></div>
    <label className="as-scrub">Inspect the evolution<input aria-label="Inspect step" type="range" min="0" max={COUNT} value={step} onChange={e => { setPlaying(false); setStep(Number(e.target.value)); }} /></label>
    <div className="as-bar-panels"><Bars title="Squared-gradient history" values={frame.history} colors={["#7c3aed", "#2563eb"]} empty={step === 0} /><Bars title="Scaling factor" values={frame.scale} colors={["#7c3aed", "#2563eb"]} empty={step === 0} /></div>
    <p className="as-insight" aria-live="polite">{step === 0 ? "Press Next step: build squared-gradient history, then watch the scaling factors respond." : Math.abs(frame.history[0] - frame.history[1]) < 1e-9 ? "Both coordinates have similar history, so their scaling factors are similar." : `${highX ? "x" : "y"} has larger squared-gradient history, so it receives the smaller scaling factor. The final movement also depends on the current gradient.`}</p>
    <p className="as-caption">Each bar pair uses a shared linear scale; the two panels use different units. Bars show the history and scaling used for the latest adaptive update.</p>
    <div className="as-controls">{([["steepness", "Valley steepness", 2, 20, 1], ["eta", "Learning rate", 0.005, 0.3, 0.005], ["beta", "History retention", 0, 0.99, 0.01], ["angle", "Rotate valley (°)", 0, 80, 5]] as ["eta" | "steepness" | "angle" | "beta", string, number, number, number][]).map(([key, label, min, max, inc]) => <label key={key}>{label}<output>{settings[key]}</output><input type="range" min={min} max={max} step={inc} value={settings[key]} onChange={e => change(key, Number(e.target.value))} /></label>)}</div>
    <div className="as-start-controls">{[0, 1].map(i => <label key={i}>Starting {i ? "y" : "x"}<input aria-label={`Starting ${i ? 'y' : 'x'}`} type="range" min="-3" max="3" step="0.1" value={settings.start[i]} onChange={e => { const p: Vec = [...settings.start]; p[i] = Number(e.target.value); place(p); }} /><output>{settings.start[i].toFixed(2)}</output></label>)}</div>
    <p className="as-caption">Click or drag either plot to move the common starting point. Changing a control restarts both runs.</p>
    <details><summary>What this comparison shows</summary><p>The adaptive side uses an RMSProp-style squared-gradient average and divides the current gradient by its root plus ε = 10⁻⁸. Both sides share the same base learning rate and objective. This is a mechanism demonstration, not a tuned optimizer benchmark.</p><p>At zero rotation the steep direction aligns with x. Rotating the valley shows a limitation: coordinate-wise scaling does not generally align with the valley's principal directions.</p><p>Smaller scaling factors do not guarantee smaller final steps, since the current gradient also matters. Larger scaling factors near a flat region do not by themselves imply instability.</p></details>
  </section>;
}
const styles = `
.as-demo{container-type:inline-size;font-family:inherit;color:#262626;border:1px solid #e5e7eb;border-radius:16px;padding:16px;background:white;margin:18px 0}.as-demo *{box-sizing:border-box}.as-intro>span{font-size:9px;letter-spacing:1.3px;color:#0f766e;font-weight:700}.as-demo h3{font-size:18px;font-weight:600;margin:8px 0}.as-demo p{font-size:12px;line-height:1.7;color:#737373}.as-plots{display:grid;grid-template-columns:1fr;gap:14px;margin:18px 0}.as-plot-card{border:1px solid #e7e5e4;border-radius:12px;padding:12px;min-width:0}.as-demo h4{font-size:12px;font-weight:600;margin:0 0 5px}.as-plot-card>p{font-size:10px;margin:0}.as-plot{display:block;width:100%;touch-action:none;cursor:crosshair}.as-ball{transition:cx .25s linear,cy .25s linear}.as-readout{display:flex;justify-content:space-between;gap:10px;font-size:10px;color:#737373}.as-readout b{color:#404040;font-family:monospace}.as-demo .as-warning{color:#b45309;font-size:10px}.as-buttons{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.as-demo button{font:inherit;font-size:11px;padding:8px 11px;background:#f5f5f4;border:1px solid #d6d3d1;border-radius:7px;cursor:pointer;color:#404040}.as-demo button.as-primary{background:#0f766e;border-color:#0f766e;color:white}.as-demo button:disabled{opacity:.4;cursor:default}.as-buttons>span{font-size:10px;color:#737373;margin-left:auto}.as-demo input[type=range]{accent-color:#0f766e;width:100%;display:block;margin:10px 0 0;cursor:pointer}.as-scrub{display:block;font-size:10px;color:#737373;margin-top:14px}.as-bar-panels{display:grid;grid-template-columns:1fr;gap:16px;margin-top:22px}.as-bar-row{display:grid;grid-template-columns:12px 1fr 65px;align-items:center;gap:8px;font-size:10px;margin-top:10px}.as-bar-row>b{text-align:right;font:10px monospace}.as-bar-track{height:9px;border-radius:5px;overflow:hidden;background:#f5f5f4}.as-bar-track>div{height:100%;border-radius:5px;transition:width .2s}.as-demo .as-insight{padding:12px;border-radius:9px;background:#f0fdfa;color:#115e59;margin:18px 0 8px}.as-demo .as-caption{font-size:10px;line-height:1.7}.as-controls{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px}.as-controls label{font-size:10px;color:#525252}.as-controls output{float:right;font-family:monospace;color:#0f766e}.as-start-controls{margin-top:16px;display:grid;gap:12px}.as-start-controls label{display:grid;grid-template-columns:55px 1fr 35px;align-items:center;gap:8px;font-size:10px;color:#737373}.as-start-controls input[type=range]{margin:0}.as-start-controls output{font-family:monospace}.as-demo details{border-top:1px solid #e5e7eb;padding-top:14px;margin-top:16px}.as-demo summary{font-size:11px;cursor:pointer;color:#404040}.as-demo button:focus-visible,.as-demo input:focus-visible,.as-demo summary:focus-visible{outline:2px solid #0f766e;outline-offset:3px}@container(min-width:600px){.as-plots,.as-bar-panels{grid-template-columns:1fr 1fr}.as-controls{grid-template-columns:repeat(4,1fr)}.as-start-controls{grid-template-columns:1fr 1fr}}@media(prefers-reduced-motion:reduce){.as-ball,.as-bar-track>div{transition:none}}
`;
