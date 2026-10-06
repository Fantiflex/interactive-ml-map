import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { concepts } from "../../content/concepts";

import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

import { visualizationRegistry } from "./visualizationRegistry";
import MomentumAnimation from "../optimization/visualizations/MomentumAnimation";
import AdaptiveScalingDemo from "../optimization/visualizations/AdaptiveScalingDemo";



type ConceptPanelProps = {
  selectedConcept: string | null;
};

export default function ConceptPanel({
  selectedConcept,
}: ConceptPanelProps) {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const demoOpen = activeDemo !== null;
  useEffect(() => {
    if (!demoOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("[data-demo-dialog] button")?.focus();
    });
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveDemo(null);
      if (event.key === "Tab") {
        const focusable = Array.from(document.querySelectorAll<HTMLElement>(
          "[data-demo-dialog] button:not(:disabled), [data-demo-dialog] a[href], [data-demo-dialog] input, [data-demo-dialog] select, [data-demo-dialog] summary"
        ));
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = oldOverflow;
      previouslyFocused?.focus();
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [demoOpen]);

  if (!selectedConcept) {
    return (
      <aside className="w-[380px] border-l bg-white p-6">
        <p className="text-neutral-500">
          Select a concept to learn more.
        </p>
      </aside>
    );
  }

  const concept = concepts[selectedConcept];

  if (!concept) {
    return (
      <aside className="w-[380px] border-l bg-white p-6">
        <p className="text-neutral-500">
          Concept not found.
        </p>
      </aside>
    );
  }
  
  const Visualization = activeDemo
    ? visualizationRegistry[activeDemo]
    : undefined;

  const demoConcept = activeDemo ? concepts[activeDemo] : undefined;

  return (
    <aside className="w-[380px] overflow-y-auto border-l bg-white p-6">
      {demoOpen && createPortal(
        <div data-demo-dialog role="dialog" aria-modal="true" aria-label="Interactive concept visualization" style={{ position: "fixed", inset: 0, zIndex: 1000, overflowY: "auto" }}>
          {Visualization ? (
            <Visualization onClose={() => setActiveDemo(null)} />
          ) : (
            <main className="min-h-screen bg-neutral-950 p-8 text-white">
              <button
                type="button"
                onClick={() => setActiveDemo(null)}
                className="mb-8 rounded-lg border border-neutral-700 px-4 py-2"
              >
                ← Back to mindmap
              </button>

              <h1 className="mb-4 text-3xl font-semibold">
                {demoConcept?.title ?? "Visualization"}
              </h1>

              <p className="text-neutral-400">
                Not implemented yet.
              </p>
            </main>
          )}
        </div>,
        document.body
      )}

      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {concept.kind}
        </p>

        <h2 className="text-2xl font-semibold text-neutral-900">
          {concept.title}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          {concept.short}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setActiveDemo(selectedConcept)}
        className="mb-6 w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700"
      >
        Open interactive visualization ↗
      </button>

      <section className="mb-6">
        <h3 className="mb-2 text-sm font-semibold text-neutral-900">
          Intuition
        </h3>

        <p className="text-sm leading-relaxed text-neutral-600">
          {concept.intuition}
        </p>

        {selectedConcept === "adaptive_scaling" && (
          <section className="mb-6">
            <AdaptiveScalingDemo />
          </section>
        )}
      </section>

            {selectedConcept !== "adaptive_scaling" &&
              concept.updates &&
              concept.updates.length > 0 && (
              <section className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-neutral-900">
                  Update rule
                </h3>

                <div className="space-y-3">
                  {concept.updates.map((update, index) => (
                    <div
                      key={update}
                      className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                    >
                      <p className="mb-1 text-xs font-medium text-neutral-400">
                        Step {index + 1}
                      </p>

                      <BlockMath math={update} />
                    </div>
                  ))}
                </div>
              </section>
            )}

      {concept.animation === "momentum" && (
        <section className="mb-6">
          <MomentumAnimation />
        </section>
      )}

      {concept.parameters && concept.parameters.length > 0 && (
        <section className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-neutral-900">
            Parameters
          </h3>

          <ul className="space-y-2">
            {concept.parameters.map((parameter) => (
              <li
                key={parameter}
                className="text-sm text-neutral-600"
              >
                • {parameter}
              </li>
            ))}
          </ul>
        </section>
      )}

      {concept.advantages && concept.advantages.length > 0 && (
        <section className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-neutral-900">
            Advantages
          </h3>

          <ul className="space-y-2">
            {concept.advantages.map((advantage) => (
              <li
                key={advantage}
                className="text-sm text-neutral-600"
              >
                + {advantage}
              </li>
            ))}
          </ul>
        </section>
      )}

      {concept.disadvantages &&
        concept.disadvantages.length > 0 && (
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-neutral-900">
              Limitations
            </h3>

            <ul className="space-y-2">
              {concept.disadvantages.map((disadvantage) => (
                <li
                  key={disadvantage}
                  className="text-sm text-neutral-600"
                >
                  − {disadvantage}
                </li>
              ))}
            </ul>
          </section>
        )}

      {concept.uses && concept.uses.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-neutral-900">
            Uses
          </h3>

          <div className="flex flex-wrap gap-2">
            {concept.uses.map((id) => (
              <span
                key={id}
                className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600"
              >
                {concepts[id]?.title ?? id}
              </span>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}