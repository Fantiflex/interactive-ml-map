import { useState } from "react";
import KnowledgeMap from "./components/KnowledgeMap";
import { concepts } from "./data/concepts";

export default function App() {
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  const concept = selectedConcept
    ? concepts[selectedConcept]
    : null;

  return (
    <div className="h-screen bg-neutral-50">
      <header className="h-16 border-b bg-white px-8 flex items-center">
        <h1 className="font-semibold text-lg">ML Map</h1>
      </header>

      <main className="flex h-[calc(100vh-4rem)]">
        <section className="flex-1">
          <KnowledgeMap onSelectConcept={setSelectedConcept} />
        </section>

        <aside className="w-[360px] border-l bg-white p-6">
          {concept ? (
            <div>
              <p className="text-sm text-neutral-500 mb-2">
                {concept.category}
              </p>

              <h2 className="text-2xl font-semibold mb-3">
                {concept.title}
              </h2>

              <p className="text-neutral-700 mb-6">
                {concept.short}
              </p>

              <h3 className="font-medium mb-2">
                Intuition
              </h3>

              <p className="text-neutral-600 leading-relaxed">
                {concept.intuition}
              </p>
            </div>
          ) : (
            <p className="text-neutral-500">
              Select a concept to learn more.
            </p>
          )}
        </aside>
      </main>
    </div>
  );
}