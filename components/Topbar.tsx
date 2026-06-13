"use client";

interface Props {
  sessionName: string;
  itemCount: number;
  hasSelection: boolean;
  onDelete: () => void;
  onClear: () => void;
}

export default function Topbar({
  sessionName,
  itemCount,
  hasSelection,
  onDelete,
  onClear,
}: Props) {
  return (
    <div className="h-11 border-b border-neutral-800 flex items-center justify-between px-5 flex-shrink-0 bg-neutral-950">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-neutral-200">{sessionName}</span>
        {itemCount > 0 && (
          <span className="text-[10px] text-neutral-600">
            {itemCount} element{itemCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {hasSelection && (
          <button
            onClick={onDelete}
            className="text-[11px] text-neutral-500 hover:text-red-400 transition-colors px-2 py-1 rounded"
          >
            Delete
          </button>
        )}
        {itemCount > 0 && (
          <button
            onClick={onClear}
            className="text-[11px] text-neutral-600 hover:text-neutral-400 transition-colors px-2 py-1 rounded"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
