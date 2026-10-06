import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";

import type { ConceptKind } from "../data/concepts";

export type ConceptNodeData = {
  title: string;
  category: string;
  kind: ConceptKind;
  short: string;
};

export type ConceptNodeType = Node<ConceptNodeData, "concept">;

const kindStyles: Record<ConceptKind, string> = {
  concept:
    "border-neutral-300 bg-white",

  optimizer:
    "border-violet-300 bg-violet-50/40",

  mechanism:
    "border-blue-200 bg-blue-50/40",

  math:
    "border-amber-200 bg-amber-50/40",
};

const kindBadgeStyles: Record<ConceptKind, string> = {
  concept:
    "bg-neutral-100 text-neutral-600",

  optimizer:
    "bg-violet-100 text-violet-700",

  mechanism:
    "bg-blue-100 text-blue-700",

  math:
    "bg-amber-100 text-amber-700",
};

const kindLabels: Record<ConceptKind, string> = {
  concept: "Concept",
  optimizer: "Optimizer",
  mechanism: "Mechanism",
  math: "Math",
};

export default function ConceptNode({
  data,
  selected,
}: NodeProps<ConceptNodeType>) {
  return (
    <div
      className={`
        min-w-[220px]
        max-w-[240px]
        rounded-2xl
        border
        px-4
        py-3
        shadow-sm
        transition-all
        duration-200
        ${kindStyles[data.kind]}
        ${
          selected
            ? "ring-2 ring-neutral-800 shadow-md"
            : "hover:shadow-md hover:border-neutral-400"
        }
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-neutral-400"
      />

      <div className="flex items-center justify-between gap-2">
        <span
          className={`
            inline-block
            rounded-full
            px-2
            py-1
            text-[10px]
            font-semibold
            uppercase
            tracking-wide
            ${kindBadgeStyles[data.kind]}
          `}
        >
          {kindLabels[data.kind]}
        </span>

        <span className="text-[10px] uppercase tracking-wide text-neutral-400">
          {data.category}
        </span>
      </div>

      <h3 className="mt-3 text-base font-semibold text-neutral-900">
        {data.title}
      </h3>

      <p className="mt-1 text-sm leading-snug text-neutral-500">
        {data.short}
      </p>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-neutral-400"
      />
    </div>
  );
}