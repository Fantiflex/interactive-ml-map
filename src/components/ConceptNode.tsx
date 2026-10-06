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

export default function ConceptNode({
  data,
}: NodeProps<ConceptNodeType>) {
  return (
    <div className="min-w-[220px] rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-neutral-400"
      />

      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
        {data.category}
      </p>

      <h3 className="text-base font-semibold text-neutral-900">
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