import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import ConceptNode, {
  type ConceptNodeType,
} from "./ConceptNode";


type KnowledgeMapProps = {
  onSelectConcept: (id: string) => void;
};

const nodeTypes: NodeTypes = {
  concept: ConceptNode,
};

const nodes: ConceptNodeType[] = [
  {
    id: "ml",
    type: "concept",
    position: { x: 330, y: 40 },
    data: {
      title: "Machine Learning",
      category: "Overview",
      short: "Learn patterns from data.",
    },
  },
  {
    id: "optimization",
    type: "concept",
    position: { x: 100, y: 220 },
    data: {
      title: "Optimization",
      category: "Training",
      short: "Update parameters to reduce loss.",
    },
  },
  {
    id: "generalization",
    type: "concept",
    position: { x: 530, y: 220 },
    data: {
      title: "Generalization",
      category: "Training",
      short: "Perform well on unseen data.",
    },
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

export default function KnowledgeMap({
  onSelectConcept,
}: KnowledgeMapProps) {
  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        onNodeClick={(_, node) => onSelectConcept(node.id)}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}