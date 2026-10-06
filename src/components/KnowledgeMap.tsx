import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";

import { concepts } from "../data/concepts";

import "@xyflow/react/dist/style.css";

import ConceptNode, {
  type ConceptNodeType,
} from "./ConceptNode";

function getPrerequisitePath(conceptId: string): Set<string> {
  const result = new Set<string>();

  function visit(id: string) {
    const concept = concepts[id];

    if (!concept?.prerequisites) return;

    for (const prerequisite of concept.prerequisites) {
      if (!result.has(prerequisite)) {
        result.add(prerequisite);
        visit(prerequisite);
      }
    }
  }

  visit(conceptId);

  return result;
}

type KnowledgeMapProps = {
  onSelectConcept: (id: string) => void;
  selectedConcept: string | null;
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
      category: "Optimization",
      short: "Update parameters to reduce loss.",
    },
  },

  {
    id: "generalization",
    type: "concept",
    position: { x: 610, y: 180 },
    data: {
      title: "Generalization",
      category: "Generalization",
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
  selectedConcept,
}: KnowledgeMapProps) {
  const prerequisitePath = selectedConcept
    ? getPrerequisitePath(selectedConcept)
    : new Set<string>();

  const displayNodes = nodes.map((node) => {
    const isSelected = node.id === selectedConcept;
    const isPrerequisite = prerequisitePath.has(node.id);

    const isRelated =
      !selectedConcept ||
      isSelected ||
      isPrerequisite;

    return {
      ...node,
      style: {
        ...node.style,
        opacity: isRelated ? 1 : 0.25,
      },
    };
  });

  const displayEdges = edges.map((edge) => {
    const sourceRelated =
      edge.source === selectedConcept ||
      prerequisitePath.has(edge.source);

    const targetRelated =
      edge.target === selectedConcept ||
      prerequisitePath.has(edge.target);

    const isRelated =
      !selectedConcept ||
      (sourceRelated && targetRelated);

    return {
      ...edge,
      style: {
        strokeWidth: isRelated ? 2.5 : 1,
        stroke: isRelated ? "#525252" : "#d4d4d4",
        opacity: isRelated ? 1 : 0.2,
      },
    };
  });

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        nodeTypes={nodeTypes}
        fitView
        onNodeClick={(_, node) => onSelectConcept(node.id)}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: {
            strokeWidth: 1.5,
            stroke: "#a3a3a3",
          },
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}