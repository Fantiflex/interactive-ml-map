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

type KnowledgeMapProps = {
  onSelectConcept: (id: string) => void;
  selectedConcept: string | null;
};

const nodeTypes: NodeTypes = {
  concept: ConceptNode,
};

const nodes: ConceptNodeType[] = [
  // ------------------------------------------------------------------
  // HIGH-LEVEL CONCEPTS
  // ------------------------------------------------------------------

  {
    id: "ml",
    type: "concept",
    position: { x: 500, y: 20 },
    data: {
      title: concepts.ml.title,
      category: concepts.ml.category,
      kind: concepts.ml.kind,
      short: concepts.ml.short,
    },
  },

  {
    id: "optimization",
    type: "concept",
    position: { x: 500, y: 180 },
    data: {
      title: concepts.optimization.title,
      category: concepts.optimization.category,
      kind: concepts.optimization.kind,
      short: concepts.optimization.short,
    },
  },

  {
    id: "generalization",
    type: "concept",
    position: { x: 850, y: 180 },
    data: {
      title: concepts.generalization.title,
      category: concepts.generalization.category,
      kind: concepts.generalization.kind,
      short: concepts.generalization.short,
    },
  },

  // ------------------------------------------------------------------
  // OPTIMIZERS — SAME LEVEL
  // ------------------------------------------------------------------

  {
    id: "gd",
    type: "concept",
    position: { x: -50, y: 420 },
    data: {
      title: concepts.gd.title,
      category: concepts.gd.category,
      kind: concepts.gd.kind,
      short: concepts.gd.short,
    },
  },

  {
    id: "rmsprop",
    type: "concept",
    position: { x: 220, y: 420 },
    data: {
      title: concepts.rmsprop.title,
      category: concepts.rmsprop.category,
      kind: concepts.rmsprop.kind,
      short: concepts.rmsprop.short,
    },
  },

  {
    id: "adam",
    type: "concept",
    position: { x: 490, y: 420 },
    data: {
      title: concepts.adam.title,
      category: concepts.adam.category,
      kind: concepts.adam.kind,
      short: concepts.adam.short,
    },
  },

  {
    id: "adamw",
    type: "concept",
    position: { x: 760, y: 420 },
    data: {
      title: concepts.adamw.title,
      category: concepts.adamw.category,
      kind: concepts.adamw.kind,
      short: concepts.adamw.short,
    },
  },

  {
    id: "muon",
    type: "concept",
    position: { x: 1030, y: 420 },
    data: {
      title: concepts.muon.title,
      category: concepts.muon.category,
      kind: concepts.muon.kind,
      short: concepts.muon.short,
    },
  },

  // ------------------------------------------------------------------
  // MECHANISMS / MATH
  // ------------------------------------------------------------------

  {
    id: "gradient",
    type: "concept",
    position: { x: -50, y: 700 },
    data: {
      title: concepts.gradient.title,
      category: concepts.gradient.category,
      kind: concepts.gradient.kind,
      short: concepts.gradient.short,
    },
  },

  {
    id: "momentum",
    type: "concept",
    position: { x: 220, y: 700 },
    data: {
      title: concepts.momentum.title,
      category: concepts.momentum.category,
      kind: concepts.momentum.kind,
      short: concepts.momentum.short,
    },
  },

  {
    id: "adaptive-scaling",
    type: "concept",
    position: { x: 490, y: 700 },
    data: {
      title: concepts["adaptive-scaling"].title,
      category: concepts["adaptive-scaling"].category,
      kind: concepts["adaptive-scaling"].kind,
      short: concepts["adaptive-scaling"].short,
    },
  },

  {
    id: "weight-decay",
    type: "concept",
    position: { x: 760, y: 700 },
    data: {
      title: concepts["weight-decay"].title,
      category: concepts["weight-decay"].category,
      kind: concepts["weight-decay"].kind,
      short: concepts["weight-decay"].short,
    },
  },

  {
    id: "orthogonalization",
    type: "concept",
    position: { x: 1030, y: 700 },
    data: {
      title: concepts.orthogonalization.title,
      category: concepts.orthogonalization.category,
      kind: concepts.orthogonalization.kind,
      short: concepts.orthogonalization.short,
    },
  },
];

const edges: Edge[] = [
  // Main hierarchy
  {
    id: "ml-opt",
    source: "ml",
    target: "optimization",
    label: "training problem",
  },

  {
    id: "ml-gen",
    source: "ml",
    target: "generalization",
  },

  // Optimization → optimizer choices
  {
    id: "opt-gd",
    source: "optimization",
    target: "gd",
    label: "optimizer",
  },

  {
    id: "opt-rmsprop",
    source: "optimization",
    target: "rmsprop",
    label: "optimizer",
  },

  {
    id: "opt-adam",
    source: "optimization",
    target: "adam",
    label: "optimizer",
  },

  {
    id: "opt-adamw",
    source: "optimization",
    target: "adamw",
    label: "optimizer",
  },

  {
    id: "opt-muon",
    source: "optimization",
    target: "muon",
    label: "optimizer",
  },

  // Optimizer → mechanisms they use
  {
    id: "gd-gradient",
    source: "gd",
    target: "gradient",
    label: "uses",
  },

  {
    id: "rmsprop-gradient",
    source: "rmsprop",
    target: "gradient",
    label: "uses",
  },

  {
    id: "rmsprop-adaptive",
    source: "rmsprop",
    target: "adaptive-scaling",
    label: "uses",
  },

  {
    id: "adam-gradient",
    source: "adam",
    target: "gradient",
    label: "uses",
  },

  {
    id: "adam-momentum",
    source: "adam",
    target: "momentum",
    label: "uses",
  },

  {
    id: "adam-adaptive",
    source: "adam",
    target: "adaptive-scaling",
    label: "uses",
  },

  {
    id: "adamw-gradient",
    source: "adamw",
    target: "gradient",
    label: "uses",
  },

  {
    id: "adamw-momentum",
    source: "adamw",
    target: "momentum",
    label: "uses",
  },

  {
    id: "adamw-adaptive",
    source: "adamw",
    target: "adaptive-scaling",
    label: "uses",
  },

  {
    id: "adamw-weight-decay",
    source: "adamw",
    target: "weight-decay",
    label: "uses",
  },

  {
    id: "muon-gradient",
    source: "muon",
    target: "gradient",
    label: "uses",
  },

  {
    id: "muon-momentum",
    source: "muon",
    target: "momentum",
    label: "uses",
  },

  {
    id: "muon-orthogonalization",
    source: "muon",
    target: "orthogonalization",
    label: "uses",
  },
];

function getRelatedConcepts(conceptId: string): Set<string> {
  const related = new Set<string>();

  related.add(conceptId);

  const selected = concepts[conceptId];

  // If an optimizer is selected, highlight the mechanisms it uses.
  if (selected?.uses) {
    selected.uses.forEach((id) => related.add(id));
  }

  // If a mechanism is selected, highlight all optimizers using it.
  for (const [id, concept] of Object.entries(concepts)) {
    if (concept.uses?.includes(conceptId)) {
      related.add(id);
    }
  }

  // Optimization is conceptually the parent of all optimizers.
  if (selected?.kind === "optimizer") {
    related.add("optimization");
  }

  // If Optimization itself is selected, show all optimizer choices.
  if (conceptId === "optimization") {
    for (const [id, concept] of Object.entries(concepts)) {
      if (concept.kind === "optimizer") {
        related.add(id);
      }
    }
  }

  return related;
}

export default function KnowledgeMap({
  onSelectConcept,
  selectedConcept,
}: KnowledgeMapProps) {
  const relatedConcepts = selectedConcept
    ? getRelatedConcepts(selectedConcept)
    : new Set<string>();

  const displayNodes = nodes.map((node) => {
    const isRelated =
      !selectedConcept ||
      relatedConcepts.has(node.id);

    return {
      ...node,
      style: {
        ...node.style,
        opacity: isRelated ? 1 : 0.18,
      },
    };
  });

  const displayEdges = edges.map((edge) => {
    const isRelated =
      !selectedConcept ||
      (
        relatedConcepts.has(edge.source) &&
        relatedConcepts.has(edge.target)
      );

    return {
      ...edge,
      animated: Boolean(selectedConcept && isRelated),
      style: {
        strokeWidth: isRelated ? 2.2 : 1,
        stroke: isRelated ? "#525252" : "#d4d4d4",
        opacity: isRelated ? 1 : 0.12,
      },
      labelStyle: {
        fill: isRelated ? "#525252" : "#a3a3a3",
        fontSize: 11,
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
        minZoom={0.35}
        maxZoom={1.5}
        onNodeClick={(_, node) =>
          onSelectConcept(node.id)
        }
        defaultEdgeOptions={{
          type: "smoothstep",
          style: {
            strokeWidth: 1.5,
            stroke: "#a3a3a3",
          },
        }}
      >
        <Background gap={24} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}