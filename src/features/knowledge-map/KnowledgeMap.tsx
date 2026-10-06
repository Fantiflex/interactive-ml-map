import { useState } from "react";
import { Background, Controls, MarkerType, ReactFlow, type Edge, type NodeTypes } from "@xyflow/react";
import { concepts } from "../../content/concepts";
import {
  hierarchyPositions,
  hierarchyRelations,
} from "../../content/optimizationHierarchy";
import ConceptNode, { type ConceptNodeType } from "./ConceptNode";
import "@xyflow/react/dist/style.css";

const nodeTypes: NodeTypes = { concept: ConceptNode };
function getPrerequisitePath(id: string): Set<string> {
  const visited = new Set<string>([id]);
  function visit(current: string) {
    for (const prerequisite of concepts[current]?.prerequisites ?? []) {
      if (!visited.has(prerequisite)) { visited.add(prerequisite); visit(prerequisite); }
    }
  }
  visit(id); visited.delete(id); return visited;
}

type Props = { onSelectConcept: (id: string) => void; selectedConcept: string | null };
export default function KnowledgeMap({ onSelectConcept, selectedConcept }: Props) {
  const [showInspiration, setShowInspiration] = useState(false);
  const path = selectedConcept ? getPrerequisitePath(selectedConcept) : new Set<string>();
  const directlyRelated = new Set<string>();
  if (selectedConcept) for (const relation of hierarchyRelations) {
    if (relation.kind === "inspired" && !showInspiration) continue;
    if (relation.source === selectedConcept) directlyRelated.add(relation.target);
    if (relation.target === selectedConcept) directlyRelated.add(relation.source);
  }
  const active = (id: string) => !selectedConcept || id === selectedConcept || path.has(id) || directlyRelated.has(id);
  const nodes: ConceptNodeType[] = hierarchyPositions.filter(p => concepts[p.id]).map(p => ({
    id: p.id, type: "concept", position: { x: p.x, y: p.y }, selected: p.id === selectedConcept,
    data: { title: concepts[p.id].title, category: concepts[p.id].category, short: concepts[p.id].short, kind: concepts[p.id].kind },
    style: { opacity: active(p.id) ? 1 : 0.22 },
  }));
  const edges: Edge[] = hierarchyRelations.filter(r => r.kind !== "inspired" || showInspiration).map((r, i) => {
    const from = hierarchyPositions.find(p => p.id === r.source)!;
    const to = hierarchyPositions.find(p => p.id === r.target)!;
    const sameRow = from.y === to.y;
    const upwards = from.y > to.y;
    const rightwards = from.x < to.x;
    const focused = !selectedConcept || r.source === selectedConcept || r.target === selectedConcept || (path.has(r.source) && path.has(r.target));
    const color = r.kind === "inspired" ? "#d97706" : r.kind === "uses" ? "#7c3aed" : "#737373";
    return { id: `${r.source}-${r.target}-${i}`, source: r.source, target: r.target,
      sourceHandle: sameRow ? (rightwards ? "source-right" : "source-left") : upwards ? "source-top" : undefined,
      targetHandle: sameRow ? (rightwards ? "target-left" : "target-right") : upwards ? "target-bottom" : undefined,
      type: "bezier", label: r.label, markerEnd: { type: MarkerType.ArrowClosed, color },
      style: { stroke: color, strokeWidth: focused ? 2 : 1, opacity: focused ? 1 : 0.15, strokeDasharray: r.kind === "inspired" ? "6 5" : undefined },
      labelStyle: { fontSize: 10, fill: color }, labelBgStyle: { fill: "#ffffff", opacity: 0.95 },
    };
  });
  return <div className="relative h-full w-full">
    <div className="absolute left-3 top-3 z-10 max-w-sm rounded-xl border border-neutral-200 bg-white/95 p-3 text-xs shadow-sm">
      <p className="font-semibold text-neutral-800">Foundations → Mechanisms → Optimizers</p>
      <p className="mt-1 text-neutral-500">Top: objective, derivatives, step size and gradient estimates.</p>
      <p className="mt-1 text-neutral-500">Middle: reusable update mechanisms. Bottom: complete optimizers.</p>
      <p className="mt-2 text-violet-700">Purple arrows: optimizer → mechanism it uses.</p>
      <label className="mt-2 flex cursor-pointer items-center gap-2 text-amber-700"><input type="checkbox" checked={showInspiration} onChange={e => setShowInspiration(e.target.checked)} /> Show “inspired by” links</label>
    </div>
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.2 }} nodesDraggable={false} onNodeClick={(_, node) => onSelectConcept(node.id)}>
      <Background /><Controls />
    </ReactFlow>
  </div>;
}
