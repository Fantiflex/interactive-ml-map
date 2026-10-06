import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";

export type ConceptNodeData = {
  title: string;
  category: string;
  short: string;
};

export type ConceptNodeType = Node<ConceptNodeData, "concept">;

const categoryStyles: Record<string, string> = {
  Overview:
    "bg-neutral-100 text-neutral-600",

  Training:
    "bg-blue-50 text-blue-700",

  Optimization:
    "bg-violet-50 text-violet-700",

  Generalization:
    "bg-emerald-50 text-emerald-700",

  Math:
    "bg-amber-50 text-amber-700",
};

export default function ConceptNode({
  data,
  selected,
}: NodeProps<ConceptNodeType>) {
  const categoryStyle =
    categoryStyles[data.category] ??
    "bg-neutral-100 text-neutral-600";

  return (
    <div
      className={`
        min-w-[220px]
        rounded-2xl
        border
        bg-white
        px-4
        py-3
        shadow-sm
        transition-all
        duration-200
        ${
          selected
            ? "border-neutral-900 shadow-md ring-2 ring-neutral-200"
            : "border-neutral-200 hover:border-neutral-400 hover:shadow-md"
        }
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-neutral-400"
      />

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
          ${categoryStyle}
        `}
      >
        {data.category}
      </span>

      <h3 className="mt-3 text-base font-semibold text-neutral-900">
        {data.title}
      </h3>

      <p className="mt-1 max-w-[190px] text-sm leading-snug text-neutral-500">
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