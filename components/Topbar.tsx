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
    <div
      style={{
        height: 44,
        borderBottom: "1px solid #404040",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 32,
        paddingRight: 32,
        flexShrink: 0,
        backgroundColor: "#030712",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "14px", fontWeight: 500, color: "#e5e5e5" }}>
          {sessionName}
        </span>
        {itemCount > 0 && (
          <span style={{ fontSize: "10px", color: "#595959" }}>
            {itemCount} element{itemCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          style={{
            fontSize: "11px",
            color: "#d4d4d4",
            padding: "6px 12px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "transparent",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
            marginRight: "8px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "white";
            e.currentTarget.style.backgroundColor = "#262626";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#d4d4d4";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <span>+</span>
          <span>Invite</span>
        </button>
        {hasSelection && (
          <button
            onClick={onDelete}
            style={{
              fontSize: "11px",
              color: "#808080",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#808080";
            }}
          >
            Delete
          </button>
        )}
        {itemCount > 0 && (
          <button
            onClick={onClear}
            style={{
              fontSize: "11px",
              color: "#737373",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#a3a3a3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#737373";
            }}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
