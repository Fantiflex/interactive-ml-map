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
    position: { x: 430, y: 20 },
    data: {
      title: "Machine Learning",
      category: "Overview",
      short: "Learn patterns from data.",
    },
  },

  {
    id: "optimization",
    type: "concept",
    position: { x: 250, y: 180 },
    data: {
      title: "Optimization",
      category: "Training",
      short: "Update parameters to reduce loss.",
    },
  },

  {
    id: "generalization",
    type: "concept",
    position: { x: 610, y: 180 },
    data: {
      title: "Generalization",
      category: "Training",
      short: "Perform well on unseen data.",
    },
  },

  {
    id: "gd",
    type: "concept",
    position: { x: 100, y: 360 },
    data: {
      title: "Gradient Descent",
      category: "Optimization",
      short: "Follow the negative gradient.",
    },
  },

  {
    id: "sgd",
    type: "concept",
    position: { x: 350, y: 360 },
    data: {
      title: "SGD",
      category: "Optimization",
      short: "Use mini-batches.",
    },
  },

  {
    id: "momentum",
    type: "concept",
    position: { x: 230, y: 540 },
    data: {
      title: "Momentum",
      category: "Optimization",
      short: "Gradient + memory.",
    },
  },

  {
    id: "rmsprop",
    type: "concept",
    position: { x: 480, y: 540 },
    data: {
      title: "RMSProp",
      category: "Optimization",
      short: "Adaptive gradient scaling.",
    },
  },

  {
    id: "adam",
    type: "concept",
    position: { x: 355, y: 720 },
    data: {
      title: "Adam",
      category: "Optimization",
      short: "Momentum + RMSProp.",
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

  {
    id: "opt-gd",
    source: "optimization",
    target: "gd",
  },

  {
    id: "opt-sgd",
    source: "optimization",
    target: "sgd",
  },

  {
    id: "sgd-momentum",
    source: "sgd",
    target: "momentum",
    label: "add memory",
  },

  {
    id: "sgd-rmsprop",
    source: "sgd",
    target: "rmsprop",
    label: "adaptive scaling",
  },

  {
    id: "momentum-adam",
    source: "momentum",
    target: "adam",
  },

  {
    id: "rmsprop-adam",
    source: "rmsprop",
    target: "adam",
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