import KnowledgeMap from "./components/KnowledgeMap";

export default function App() {
  return (
    <div className="h-screen bg-neutral-50">
      <header className="h-16 border-b bg-white px-8 flex items-center">
        <h1 className="font-semibold text-lg">ML Map</h1>
      </header>

      <main className="flex h-[calc(100vh-4rem)]">
        <section className="flex-1">
          <KnowledgeMap />
        </section>

        <aside className="w-[360px] border-l bg-white p-6">
          <p className="text-neutral-500">
            Select a concept to learn more.
          </p>
        </aside>
      </main>
    </div>
  );
}