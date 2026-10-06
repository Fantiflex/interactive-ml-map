import { useState } from "react";
import KnowledgeMap from "./components/KnowledgeMap";
import ConceptPanel from "./components/ConceptPanel";


export default function App() {
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  

  return (
    <div className="h-screen bg-neutral-50">
      <header className="h-16 border-b bg-white px-8 flex items-center">
        <h1 className="font-semibold text-lg">ML Map</h1>
      </header>

      <main className="flex h-[calc(100vh-4rem)]">
        <section className="flex-1">
          <KnowledgeMap
            onSelectConcept={setSelectedConcept}
            selectedConcept={selectedConcept}
          />
        </section>

        
        <ConceptPanel selectedConcept={selectedConcept} />
      </main>
    </div>
  );
}