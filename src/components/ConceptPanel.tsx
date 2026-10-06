import { concepts } from "../data/concepts";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";



type ConceptPanelProps = {
  selectedConcept: string | null;
};

export default function ConceptPanel({
  selectedConcept,
}: ConceptPanelProps) {
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

  return (
    <aside className="w-[380px] overflow-y-auto border-l bg-white p-6">
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

      <section className="mb-6">
        <h3 className="mb-2 text-sm font-semibold text-neutral-900">
          Intuition
        </h3>

        <p className="text-sm leading-relaxed text-neutral-600">
          {concept.intuition}
        </p>
      </section>

      {concept.updates && concept.updates.length > 0 && (
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