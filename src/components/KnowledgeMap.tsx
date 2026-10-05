import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const nodes: Node[] = [
  {
    id: "ml",
    position: { x: 350, y: 50 },
    data: { label: "Machine Learning" },
  },
  {
    id: "optimization",
    position: { x: 150, y: 200 },
    data: { label: "Optimization" },
  },
  {
    id: "generalization",
    position: { x: 500, y: 200 },
    data: { label: "Generalization" },
  },
];

const edges: Edge[] = [
  {
    id: "ml-opt",
    source: "ml",
    target: "optimization",
  },
  {
    id: "ml-gen",
    source: "ml",
    target: "generalization",
  },
];

export default function KnowledgeMap() {
  return (
    <div className="w-full h-full">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}