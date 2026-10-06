import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

// Standalone React component. No dependencies beyond React; the 3D view is
// projected onto Canvas so it works inside an existing React/Vite application.
type Vec = [number, number];
type Settings = { alpha: number; beta1: number; beta2: number; epsilon: number; x: number; y: number };
type AdamStep = { t: number; before: Vec; after: Vec; lossBefore: number; lossAfter: number; g: Vec; m: Vec; v: Vec; mh: Vec; vh: Vec; denominator: Vec; rate: Vec; delta: Vec };
const INITIAL: Settings = { alpha: 0.08, beta1: 0.9, beta2: 0.999, epsilon: 1e-8, x: -2.6, y: 1.8 };
const STEPS = 250;
const DOMAIN = 3.5;
const loss = (x: number, y: number) => 0.5 * (4.5 * x * x - 7 * x * y + 4.5 * y * y);
const gradient = (x: number, y: number): Vec => [4.5 * x - 3.5 * y, 4.5 * y - 3.5 * x];
const pair = (fn: (i: number) => number): Vec => [fn(0), fn(1)];
const fmt = (n: number) => !Number.isFinite(n) ? "—" : n !== 0 && Math.abs(n) < 0.0001 ? n.toExponential(3) : n.toFixed(5);

export function computeAdamRun(s: Settings): AdamStep[] {
  let theta: Vec = [s.x, s.y], m: Vec = [0, 0], v: Vec = [0, 0];
  return Array.from({ length: STEPS }, (_, index) => {
    const t = index + 1, before: Vec = [...theta], g = gradient(...before);
    m = pair(i => s.beta1 * m[i] + (1 - s.beta1) * g[i]);
    v = pair(i => s.beta2 * v[i] + (1 - s.beta2) * g[i] ** 2);
    const mh = pair(i => m[i] / (1 - s.beta1 ** t));
    const vh = pair(i => v[i] / (1 - s.beta2 ** t));
    const denominator = pair(i => Math.sqrt(vh[i]) + s.epsilon);
    const rate = pair(i => s.alpha / denominator[i]);
    const delta = pair(i => -rate[i] * mh[i]);
    theta = pair(i => before[i] + delta[i]);
    return { t, before, after: [...theta], lossBefore: loss(...before), lossAfter: loss(...theta), g, m: [...m], v: [...v], mh, vh, denominator, rate, delta };
  });
}

const stages = [
  { name: "Gradient", formula: "gₜ = ∇f(θₜ₋₁)", explanation: "Measure the slope at the current position. The negative gradient points downhill." },
  { name: "First moment", formula: "mₜ = β₁mₜ₋₁ + (1 − β₁)gₜ", explanation: "Blend the new gradient with the previous first moment. This gives Adam a memory of past directions." },
  { name: "Second moment", formula: "vₜ = β₂vₜ₋₁ + (1 − β₂)gₜ²", explanation: "Track squared gradients separately for x and y. This is the second raw moment, not the variance." },
  { name: "Bias correction", formula: "m̂ₜ = mₜ / (1 − β₁ᵗ)    v̂ₜ = vₜ / (1 − β₂ᵗ)", explanation: "Correct the initial bias caused by starting both moving averages at zero." },
  { name: "Parameter update", formula: "θₜ = θₜ₋₁ − α m̂ₜ / (√v̂ₜ + ε)", explanation: "Scale each coordinate by its own gradient history, then move the ball to the new parameters." },
];

function Surface({ run, index, stage, initial, resetKey }: { run: AdamStep[]; index: number; stage: number; initial: Vec; resetKey: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ run, index, stage, initial });
  stateRef.current = { run, index, stage, initial };
  const camera = useRef({ yaw: -0.65, tilt: 0.65, zoom: 1 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => { camera.current = { yaw: -0.65, tilt: 0.65, zoom: 1 }; }, [resetKey]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0, last = performance.now(), position: Vec = [...stateRef.current.initial], rotation = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      const rect = canvas.getBoundingClientRect(), w = rect.width, h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      const { run: data, index: stepIndex, stage: phase, initial: start } = stateRef.current;
      const current = data[stepIndex], target = phase === 4 ? current.after : current.before;
      const old: Vec = [...position];
      const blend = reduceMotion.matches ? 1 : 1 - Math.exp(-dt * 9);
      position = pair(i => position[i] + (target[i] - position[i]) * blend);
      rotation += Math.hypot(position[0] - old[0], position[1] - old[1]) / 0.14;
      const { yaw, tilt, zoom } = camera.current;
      const scale = Math.min(w / 9.6, h / 7.8) * zoom;
      const project = (x: number, y: number, z: number) => {
        const a = Math.cos(yaw) * x - Math.sin(yaw) * y;
        const b = Math.sin(yaw) * x + Math.cos(yaw) * y;
        return { x: w / 2 + a * scale, y: h * 0.63 + (b * Math.sin(tilt) - z * Math.cos(tilt)) * scale, depth: b * Math.cos(tilt) + z * Math.sin(tilt) };
      };
      const height = (x: number, y: number) => loss(x, y) * 0.055;
      // Painter's algorithm for a triangulated 3D height field.
      const triangles: { points: ReturnType<typeof project>[]; depth: number; z: number }[] = [];
      const n = 30;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const x = -DOMAIN + i * 2 * DOMAIN / n, y = -DOMAIN + j * 2 * DOMAIN / n, d = 2 * DOMAIN / n;
        for (const coords of [[[x, y], [x + d, y], [x, y + d]], [[x + d, y], [x + d, y + d], [x, y + d]]]) {
          const points = coords.map(([a, b]) => project(a, b, height(a, b)));
          triangles.push({ points, depth: points.reduce((sum, p) => sum + p.depth, 0) / 3, z: coords.reduce((sum, [a, b]) => sum + height(a, b), 0) / 3 });
        }
      }
      triangles.sort((a, b) => a.depth - b.depth);
      for (const tri of triangles) {
        ctx.beginPath(); tri.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.closePath();
        ctx.fillStyle = `hsl(${171 + Math.min(tri.z / 9, 1) * 32} 35% ${27 + Math.min(tri.z / 9, 1) * 23}%)`;
        ctx.fill(); ctx.strokeStyle = "rgba(132,210,193,.15)"; ctx.lineWidth = 0.6; ctx.stroke();
      }
      const line = (points: Vec[], color: string, width: number) => {
        ctx.beginPath(); points.forEach(([x, y], i) => { const p = project(x, y, height(x, y) + 0.04); if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
      };
      const path: Vec[] = [start, ...data.slice(0, stepIndex).map(s => s.after), position];
      line(path, "#ffd18b", 2.5);
      const origin = project(0, 0, 0.08);
      ctx.strokeStyle = "#b6ffdc"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(origin.x, origin.y, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#d5eee5"; ctx.font = "11px system-ui"; ctx.fillText("minimum (0, 0)", origin.x + 10, origin.y + 4);
      for (const [x, y, label] of [[DOMAIN, 0, "x"], [0, DOMAIN, "y"]] as [number, number, string][]) {
        const p = project(x, y, height(x, y)); ctx.fillStyle = "#a6bcb5"; ctx.font = "bold 14px system-ui"; ctx.fillText(label, p.x + 10, p.y);
      }
      const arrowVector = phase === 0 ? current.g.map(v => -v) as Vec : phase === 1 ? current.m.map(v => -v) as Vec : phase === 4 ? current.delta : null;
      if (arrowVector && Math.hypot(...arrowVector) > 1e-8) {
        const norm = Math.hypot(...arrowVector), len = 0.8;
        const end: Vec = pair(i => position[i] + arrowVector[i] / norm * len);
        const a = project(...position, height(...position) + 0.18), b = project(...end, height(...end) + 0.18);
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        ctx.strokeStyle = phase === 4 ? "#ffd18b" : "#91bfff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - 9 * Math.cos(angle - 0.45), b.y - 9 * Math.sin(angle - 0.45)); ctx.lineTo(b.x - 9 * Math.cos(angle + 0.45), b.y - 9 * Math.sin(angle + 0.45)); ctx.fill();
      }
      const ball = project(...position, height(...position) + 0.15), r = Math.max(7, 0.14 * scale);
      ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(ball.x + 3, ball.y + r, r * 1.1, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
      const grad = ctx.createRadialGradient(ball.x - r * 0.4, ball.y - r * 0.5, 0, ball.x, ball.y, r);
      grad.addColorStop(0, "#fff7e4"); grad.addColorStop(0.45, "#ffd18b"); grad.addColorStop(1, "#b47135");
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2); ctx.clip(); ctx.strokeStyle = "rgba(90,49,22,.55)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(ball.x, ball.y, Math.max(0.5, Math.abs(Math.cos(rotation)) * r), r, 0.3, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={canvasRef} className="adam-canvas" aria-label="Interactive 3D quadratic loss surface. Gold ball follows Adam's parameter updates. Drag to rotate; use zoom buttons to change scale." onPointerDown={e => { drag.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={e => { if (!drag.current) return; camera.current.yaw += (e.clientX - drag.current.x) * 0.007; camera.current.tilt = Math.max(0.15, Math.min(1.3, camera.current.tilt + (e.clientY - drag.current.y) * 0.004)); drag.current = { x: e.clientX, y: e.clientY }; }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onWheel={e => { camera.current.zoom = Math.max(0.6, Math.min(1.8, camera.current.zoom - e.deltaY * 0.001)); }} />;
}

function LossChart({ run, index }: { run: AdamStep[]; index: number }) {
  const values = [run[0].lossBefore, ...run.map(s => s.lossAfter)], max = Math.max(...values, 0.01);
  const px = (i: number) => 12 + i / STEPS * 576, py = (l: number) => 94 - l / max * 80;
  return <svg viewBox="0 0 600 112" role="img" aria-label={`Loss over ${STEPS} updates; currently inspecting update ${index + 1}`} className="adam-chart">
    <path d={`M12 14V94H588`} stroke="#35473f" fill="none" />
    <polyline points={values.map((v, i) => `${px(i)},${py(v)}`).join(" ")} fill="none" stroke="#617b70" strokeWidth="1.8" />
    <polyline points={values.slice(0, index + 2).map((v, i) => `${px(i)},${py(v)}`).join(" ")} fill="none" stroke="#ffd18b" strokeWidth="2.5" />
    <circle cx={px(index + 1)} cy={py(values[index + 1])} r="4" fill="#ffd18b" />
    <text x="12" y="109" fill="#90a59b" fontSize="10">0</text><text x="568" y="109" fill="#90a59b" fontSize="10">250</text>
  </svg>;
}

function exportCSV(run: AdamStep[], s: Settings) {
  const vectors: (keyof AdamStep)[] = ["before", "g", "m", "v", "mh", "vh", "denominator", "rate", "delta", "after"];
  const lines = [["t", "alpha", "beta1", "beta2", "epsilon", "loss_before", "loss_after", ...vectors.flatMap(k => [`${k}_x`, `${k}_y`])].join(","), ...run.map(row => [row.t, s.alpha, s.beta1, s.beta2, s.epsilon, row.lossBefore, row.lossAfter, ...vectors.flatMap(k => row[k] as Vec)].join(","))];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = "adam-quadratic-250-steps.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AdamVisualization({ onClose }: { onClose?: () => void }) {
  const [settings, setSettings] = useState<Settings>(INITIAL);
  const [index, setIndex] = useState(0), [stage, setStage] = useState(0), [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(700), [cameraKey, setCameraKey] = useState(0);
  const run = useMemo(() => computeAdamRun(settings), [settings]);
  const current = run[index], previous = index > 0 ? run[index - 1] : null;
  const advance = () => { if (stage < 4) setStage(stage + 1); else if (index < STEPS - 1) { setIndex(index + 1); setStage(0); } else setPlaying(false); };
  useEffect(() => { if (!playing) return; const id = window.setTimeout(advance, speed); return () => window.clearTimeout(id); });
  const reset = () => { setPlaying(false); setIndex(0); setStage(0); };
  const change = (key: keyof Settings, value: number) => { reset(); setSettings(s => ({ ...s, [key]: value })); };
  const displayPosition = stage === 4 ? current.after : current.before;
  const rows: [string, Vec, string, number][] = [
    ["Parameters before · θₜ₋₁", current.before, "Starting position", -1],
    ["Gradient · gₜ", current.g, "Local slope", 0],
    ["Previous first moment · mₜ₋₁", previous?.m ?? [0, 0], "Directional memory entering this step", 1],
    ["First moment · mₜ", current.m, "Exponentially averaged gradient", 1],
    ["Previous second moment · vₜ₋₁", previous?.v ?? [0, 0], "Squared-gradient memory entering this step", 2],
    ["Second moment · vₜ", current.v, "Exponentially averaged squared gradient", 2],
    ["Corrected first moment · m̂ₜ", current.mh, "mₜ / (1 − β₁ᵗ)", 3],
    ["Corrected second moment · v̂ₜ", current.vh, "vₜ / (1 − β₂ᵗ)", 3],
    ["Denominator · √v̂ₜ + ε", current.denominator, "Coordinate-wise normalization", 4],
    ["Effective rate · α/(√v̂ₜ + ε)", current.rate, "Learning-rate multiplier for m̂ₜ", 4],
    ["Update · Δθₜ", current.delta, "−α m̂ₜ / (√v̂ₜ + ε)", 4],
    ["Parameters after · θₜ", current.after, "θₜ₋₁ + Δθₜ", 4],
  ];
  const buttonStyle: CSSProperties = { fontFamily: "inherit" };
  return <main className="adam-page">
    <style>{CSS}</style>
    <header className="adam-header"><div className="adam-brand"><span className="adam-logo">a</span><span>ML MINDMAP <span className="adam-slash">/</span> INTERACTIVE LAB</span></div><div className="adam-header-actions"><a href="https://arxiv.org/abs/1412.6980" target="_blank" rel="noreferrer">Original paper ↗</a>{onClose && <button onClick={onClose}>← Back to mindmap</button>}</div></header>
    <section className="adam-intro"><div><p className="adam-eyebrow">OPTIMIZATION / 01</p><h1>Adam, <em>in motion.</em></h1><p>Follow a ball across a loss landscape. See how gradient memory and adaptive scaling turn into the next step.</p></div><span className="adam-badge"><span /> LIVE CALCULATION</span></section>
    <div className="adam-layout">
      <section className="adam-left">
        <div className="adam-surface-card"><div className="adam-card-top"><div><span className="adam-eyebrow">THE LOSS LANDSCAPE</span><h2>A tilted quadratic bowl</h2></div><button onClick={() => setCameraKey(k => k + 1)}>Reset view</button></div>
          <Surface run={run} index={index} stage={stage} initial={[settings.x, settings.y]} resetKey={cameraKey} />
          <div className="adam-surface-caption"><span><i className="adam-dot" /> Adam trajectory</span><span>Drag to orbit · scroll to zoom</span></div>
          <div className="adam-stats"><div><small>ITERATION</small><strong>{current.t}<span> / {STEPS}</span></strong></div><div><small>CURRENT LOSS</small><strong>{fmt(stage === 4 ? current.lossAfter : current.lossBefore)}</strong></div><div><small>POSITION (x, y)</small><strong className="adam-position">({fmt(displayPosition[0])}, {fmt(displayPosition[1])})</strong></div></div>
        </div>
        <div className="adam-playback"><div className="adam-play-buttons"><button className="adam-primary" style={buttonStyle} onClick={() => { if (index === STEPS - 1 && stage === 4) { setIndex(0); setStage(0); } setPlaying(p => !p); }}>{playing ? "Ⅱ Pause" : "▶ Play"}</button><button onClick={() => { setPlaying(false); if (stage > 0) setStage(stage - 1); else if (index > 0) { setIndex(index - 1); setStage(4); } }} disabled={index === 0 && stage === 0}>← Previous</button><button onClick={() => { setPlaying(false); advance(); }} disabled={index === STEPS - 1 && stage === 4}>Next stage →</button><button onClick={reset}>↺ Restart</button><select aria-label="Playback speed" value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={1400}>0.5× speed</option><option value={700}>1× speed</option><option value={350}>2× speed</option><option value={120}>Fast run</option></select></div><label className="adam-scrub">Inspect an iteration <input aria-label="Iteration" type="range" min="1" max={STEPS} value={index + 1} onChange={e => { setPlaying(false); setIndex(Number(e.target.value) - 1); setStage(0); }} /><span>{index + 1}</span></label></div>
        <div className="adam-bottom-grid"><section className="adam-mini-card"><div className="adam-card-top"><h2>Loss over time</h2><span>f(θ)</span></div><LossChart run={run} index={index} /><p>The full run is muted; the inspected path is gold. Loss can increase between updates.</p></section><section className="adam-mini-card"><h2>The function</h2><div className="adam-function">f(x,y) = ½(4.5x² − 7xy + 4.5y²)</div><p>∇f = (4.5x − 3.5y, 4.5y − 3.5x)</p><p>Minimum: (0, 0), f = 0. Curvatures 1 and 8 create a narrow valley.</p></section></div>
        <details className="adam-settings" open><summary>Experiment settings <span>Changing a value restarts the run</span></summary><div className="adam-inputs">{([['alpha', 'Learning rate α', 0.005, 0.3, 0.005], ['beta1', 'First moment β₁', 0, 0.99, 0.01], ['beta2', 'Second moment β₂', 0, 0.9999, 0.0001], ['x', 'Starting x', -3, 3, 0.1], ['y', 'Starting y', -3, 3, 0.1]] as [keyof Settings, string, number, number, number][]).map(([key, label, min, max, step]) => <label key={key}>{label}<output>{settings[key]}</output><input type="range" min={min} max={max} step={step} value={settings[key]} onChange={e => change(key, Number(e.target.value))} /></label>)}<label>Stability ε<select value={settings.epsilon} onChange={e => change("epsilon", Number(e.target.value))}><option value={1e-8}>10⁻⁸</option><option value={1e-6}>10⁻⁶</option><option value={0.01}>0.01</option><option value={0.1}>0.1</option></select></label></div><button onClick={() => { reset(); setSettings(INITIAL); }}>Restore defaults</button></details>
        <p className="adam-note">The ball is a visual analogy: its positions come from discrete Adam updates, with smooth interpolation between them. Gravity, mass, and collision forces do not determine the trajectory. Surface height is scaled for readability; calculations use the exact function above. Arrows show direction with normalized length.</p>
      </section>
      <aside className="adam-inspector"><div className="adam-card-top"><div><span className="adam-eyebrow">UNDER THE HOOD</span><h2>One step, unpacked.</h2></div><span className="adam-step-tag">t = {current.t}</span></div>
        <nav className="adam-stage-nav" aria-label="Adam calculation stages">{stages.map((s, i) => <button key={s.name} aria-current={stage === i ? "step" : undefined} className={stage === i ? "active" : ""} onClick={() => { setPlaying(false); setStage(i); }}><span>{i + 1}</span>{s.name}</button>)}</nav>
        <div className="adam-explainer" aria-live="polite"><span className="adam-eyebrow">STAGE {stage + 1} / 5</span><h3>{stages[stage].name}</h3><p>{stages[stage].explanation}</p><div className="adam-formula">{stages[stage].formula}</div></div>
        <div className="adam-data-title"><h3>Every value</h3><button onClick={() => exportCSV(run, settings)}>Export CSV ↓</button></div>
        <div className="adam-table-wrap"><table className="adam-table"><thead><tr><th>Quantity</th><th>x</th><th>y</th></tr></thead><tbody>{rows.map(([label, vec, hint, rowStage]) => <tr key={label} className={rowStage === stage ? "highlight" : ""}><th title={hint}>{label}</th><td>{fmt(vec[0])}</td><td>{fmt(vec[1])}</td></tr>)}</tbody></table></div>
        <div className="adam-bias"><span>Bias correction factors</span><div>1 − β₁ᵗ = <b>{fmt(1 - settings.beta1 ** current.t)}</b></div><div>1 − β₂ᵗ = <b>{fmt(1 - settings.beta2 ** current.t)}</b></div><div>f before → after = <b>{fmt(current.lossBefore)} → {fmt(current.lossAfter)}</b></div></div>
        <p className="adam-note">All operations on vectors are coordinate-wise. Values are rounded here; the CSV keeps JavaScript numerical precision for all 250 updates.</p>
      </aside>
    </div>
    <footer className="adam-footer">Adaptive Moment Estimation <span>Deterministic full-gradient demo · Based on Kingma & Ba, Algorithm 1</span></footer>
  </main>;
}

const CSS = `
.adam-page{--bg:#0d1713;--panel:#14221b;--line:#2b3b31;--text:#e8eee9;--muted:#99ada0;--gold:#ffd18b;box-sizing:border-box;min-height:100vh;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,sans-serif;padding:0 36px 24px;color-scheme:dark}.adam-page *{box-sizing:border-box}.adam-page button,.adam-page select{font:inherit;font-size:12px;border:1px solid var(--line);border-radius:7px;background:#1b2b21;color:var(--text);padding:9px 12px;cursor:pointer}.adam-page button:hover{border-color:#718474;background:#24362a}.adam-page button:disabled{opacity:.35;cursor:default}.adam-page button:focus-visible,.adam-page input:focus-visible,.adam-page a:focus-visible,.adam-page select:focus-visible,.adam-page summary:focus-visible{outline:2px solid var(--gold);outline-offset:3px}.adam-header{height:74px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line);gap:20px}.adam-brand{display:flex;align-items:center;gap:12px;font-size:10px;letter-spacing:1.6px}.adam-logo{width:30px;height:30px;border:1px solid #849581;border-radius:8px;display:grid;place-items:center;font:italic 26px Georgia;color:var(--gold)}.adam-slash{color:#68806c;margin:0 10px}.adam-header-actions{display:flex;align-items:center;gap:20px}.adam-header a{font-size:12px;color:var(--muted);text-decoration:none}.adam-intro{display:flex;justify-content:space-between;align-items:center;padding:36px 0 28px;gap:20px}.adam-eyebrow{font-size:9px;letter-spacing:2px;color:#a3b29c;font-weight:600;margin:0 0 10px}.adam-intro h1{font-size:clamp(34px,4vw,52px);font-weight:500;letter-spacing:-2px;margin:6px 0 12px;line-height:1.1}.adam-intro h1 em{font-family:Georgia,serif;font-weight:400;color:var(--gold)}.adam-intro p:not(.adam-eyebrow){max-width:620px;font-size:13px;line-height:1.7;color:var(--muted);margin:0}.adam-badge{font-size:9px;letter-spacing:1.3px;color:#b2c3b1;display:flex;gap:8px;align-items:center;white-space:nowrap}.adam-badge span{width:6px;height:6px;border-radius:50%;background:#a6e0ac}.adam-layout{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(390px,1fr);gap:24px;max-width:1600px;margin:auto}.adam-left{min-width:0}.adam-surface-card,.adam-inspector,.adam-mini-card,.adam-settings{background:var(--panel);border:1px solid var(--line);border-radius:12px}.adam-card-top{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:22px 22px 0}.adam-card-top h2,.adam-mini-card h2{font-size:15px;font-weight:500;margin:6px 0}.adam-card-top>span{color:var(--muted);font-size:11px}.adam-card-top .adam-eyebrow{display:block}.adam-canvas{width:100%;height:410px;display:block;touch-action:none;cursor:grab}.adam-canvas:active{cursor:grabbing}.adam-surface-caption{display:flex;justify-content:space-between;padding:0 22px 18px;font-size:10px;color:var(--muted);gap:12px}.adam-dot{display:inline-block;width:6px;height:6px;background:var(--gold);border-radius:50%;margin-right:6px}.adam-stats{border-top:1px solid var(--line);display:grid;grid-template-columns:0.7fr 1fr 1.5fr;padding:20px 22px;gap:12px}.adam-stats small{display:block;font-size:8px;letter-spacing:1.5px;color:var(--muted);margin-bottom:9px}.adam-stats strong{font:19px ui-monospace,SFMono-Regular,monospace;color:#eee9d8}.adam-stats strong span{font:11px system-ui;color:var(--muted)}.adam-stats .adam-position{font-size:13px}.adam-playback{padding:20px 0}.adam-play-buttons{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.adam-page .adam-primary{background:var(--gold);border-color:var(--gold);color:#1b251c;min-width:87px;font-weight:600}.adam-page .adam-primary:hover{background:#ffe0ad}.adam-play-buttons select{margin-left:auto}.adam-scrub{display:flex;align-items:center;gap:14px;font-size:11px;color:var(--muted);margin-top:18px}.adam-page input[type=range]{accent-color:var(--gold);width:100%;cursor:pointer}.adam-scrub input{flex:1;min-width:40px}.adam-scrub span{width:25px;font-family:monospace}.adam-bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.adam-mini-card{padding:18px;min-width:0}.adam-mini-card .adam-card-top{padding:0}.adam-mini-card p{font-size:10px;color:var(--muted);line-height:1.7;margin:10px 0 0}.adam-chart{display:block;width:100%;height:100px}.adam-function{font:12px ui-monospace,monospace;color:var(--gold);padding:20px 0 7px;line-height:1.7}.adam-settings{margin-top:16px;padding:18px}.adam-settings summary{cursor:pointer;font-size:13px}.adam-settings summary span{font-size:10px;color:var(--muted);float:right}.adam-inputs{display:grid;grid-template-columns:repeat(3,1fr);gap:18px 20px;margin:22px 0}.adam-inputs label{font-size:11px;color:var(--muted);display:block}.adam-inputs output{float:right;font-family:monospace;color:var(--gold)}.adam-inputs input{display:block;margin-top:12px}.adam-inputs select{display:block;width:100%;margin-top:10px}.adam-note{font-size:10px;line-height:1.8;color:var(--muted);margin:16px 0}.adam-inspector{padding-bottom:22px;align-self:start;min-width:0}.adam-step-tag{padding:7px 10px;background:#243b2a;border-radius:6px;color:var(--gold)!important;font-family:monospace}.adam-stage-nav{display:flex;padding:22px 20px 0;gap:5px}.adam-page .adam-stage-nav button{padding:10px 4px;flex:1;text-align:center;font-size:8px;background:transparent;border-color:transparent;line-height:1.5}.adam-stage-nav button span{display:block;border-radius:50%;border:1px solid var(--line);width:22px;height:22px;line-height:20px;margin:0 auto 7px;font-size:10px}.adam-page .adam-stage-nav button.active{background:#26382b;color:var(--gold)}.adam-stage-nav button.active span{border-color:var(--gold)}.adam-explainer{margin:20px 22px;padding:20px;background:#1b2e21;border:1px solid #344a36;border-radius:8px;min-height:205px}.adam-explainer h3{font-size:18px;font-weight:500;margin:8px 0 10px}.adam-explainer p{color:#aabdac;font-size:12px;line-height:1.75;margin:0}.adam-formula{font:12px ui-monospace,monospace;color:var(--gold);margin-top:18px;line-height:1.9;overflow-wrap:anywhere}.adam-data-title{display:flex;justify-content:space-between;align-items:center;padding:0 22px 12px}.adam-data-title h3{font-size:13px;font-weight:500}.adam-table-wrap{overflow-x:auto;margin:0 12px}.adam-table{width:100%;border-collapse:collapse;font-size:10px;text-align:left}.adam-table thead th{font-size:9px;color:var(--muted);letter-spacing:1px;padding:12px 10px;border-bottom:1px solid var(--line)}.adam-table td,.adam-table tbody th{padding:12px 10px;border-bottom:1px solid #23362a}.adam-table tbody th{font-weight:400;min-width:155px}.adam-table td{font-family:ui-monospace,monospace;text-align:right;white-space:nowrap;color:#b5c8b9}.adam-table thead th:not(:first-child){text-align:right}.adam-table tr.highlight{background:#263829}.adam-table tr.highlight td{color:var(--gold)}.adam-bias{margin:18px 22px 0;padding:14px;background:#101c15;border-radius:7px;font-size:10px;line-height:2;color:var(--muted)}.adam-bias span{display:block;color:#dde9da;margin-bottom:5px}.adam-bias b{font-family:monospace;font-weight:400;color:#d5decf}.adam-inspector>.adam-note{margin:16px 22px 0}.adam-footer{display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:20px;margin-top:25px;font-size:10px;color:var(--muted);gap:20px}.adam-page h1,.adam-page h2,.adam-page h3{color:var(--text)}
@media(min-width:1600px){.adam-intro,.adam-header,.adam-footer{max-width:1600px;margin-left:auto;margin-right:auto}.adam-canvas{height:500px}}@media(max-width:1050px){.adam-page{padding-left:20px;padding-right:20px}.adam-layout{grid-template-columns:1fr}.adam-inspector{width:100%}.adam-stage-nav{gap:12px}.adam-page .adam-stage-nav button{font-size:11px}.adam-table{font-size:12px}.adam-explainer{min-height:0}}@media(max-width:600px){.adam-page{padding:0 12px 20px}.adam-header{height:auto;min-height:72px;flex-wrap:wrap;padding:14px 0;gap:12px}.adam-header-actions{gap:10px}.adam-brand{font-size:8px}.adam-intro{padding-top:26px}.adam-badge{display:none}.adam-canvas{height:310px}.adam-card-top{padding:18px 15px 0}.adam-stats{padding:18px 15px;grid-template-columns:1fr 1fr}.adam-stats>div:last-child{grid-column:1/-1}.adam-surface-caption{padding-left:15px;padding-right:15px;font-size:9px}.adam-bottom-grid{grid-template-columns:1fr}.adam-inputs{grid-template-columns:1fr 1fr}.adam-settings summary span{display:block;float:none;margin-top:8px}.adam-play-buttons select{margin-left:0}.adam-explainer{margin-left:15px;margin-right:15px}.adam-stage-nav{padding:15px 10px 0;gap:3px}.adam-page .adam-stage-nav button{font-size:9px}.adam-footer{display:block;line-height:1.8}.adam-footer span{display:block}.adam-scrub{gap:8px;font-size:10px}}
`;
