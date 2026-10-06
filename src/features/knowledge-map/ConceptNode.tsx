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
  kind?: string;
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

  const kindColors: Record<string, string> = {
    mechanism: "bg-sky-50 text-sky-700", algorithm: "bg-violet-50 text-violet-700",
    math: "bg-amber-50 text-amber-700", concept: "bg-neutral-100 text-neutral-600",
  };
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

      <Handle id="source-top" type="source" position={Position.Top} className="!h-2 !w-2 !opacity-0" />
      <Handle id="target-bottom" type="target" position={Position.Bottom} className="!h-2 !w-2 !opacity-0" />
      <Handle id="source-left" type="source" position={Position.Left} className="!h-2 !w-2 !opacity-0" />
      <Handle id="target-left" type="target" position={Position.Left} className="!h-2 !w-2 !opacity-0" />
      <Handle id="source-right" type="source" position={Position.Right} className="!h-2 !w-2 !opacity-0" />
      <Handle id="target-right" type="target" position={Position.Right} className="!h-2 !w-2 !opacity-0" />
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

      {data.kind && <span className={`ml-2 inline-block rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${kindColors[data.kind] ?? kindColors.concept}`}>{data.kind === "algorithm" ? "Optimizer" : data.kind === "mechanism" ? "Mechanism" : "Foundation"}</span>}
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