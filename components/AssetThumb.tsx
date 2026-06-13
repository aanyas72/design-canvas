import { Asset } from "@/lib/assets";

export default function AssetThumb({ asset }: { asset: Asset }) {
  const r = asset.render;
  const vw = (r.width || 80) + 10;
  const vh = (r.height || 80) + 10;
  const ox = 5, oy = 5;

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {r.type === "path" && (
        <path
          d={r.d}
          fill={r.fill ?? "transparent"}
          stroke={r.stroke}
          strokeWidth={r.strokeWidth}
          transform={`translate(${ox},${oy})`}
          strokeLinecap="round"
        />
      )}
      {r.type === "circle" && (
        <circle
          cx={ox + r.radius}
          cy={oy + r.radius}
          r={r.radius}
          fill={r.fill ?? "transparent"}
          stroke={r.stroke}
          strokeWidth={r.strokeWidth}
        />
      )}
      {r.type === "line" && (
        <polyline
          points={r.points
            .map((p, i) => (i % 2 === 0 ? p + ox : p + oy))
            .join(",")}
          stroke={r.stroke}
          strokeWidth={r.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {r.type === "rect" && (
        <rect
          x={ox}
          y={oy + 10}
          width={r.width}
          height={r.height}
          fill={r.fill}
          rx={r.rx}
        />
      )}
      {r.type === "dots" &&
        r.positions.map(([x, y], i) => (
          <circle key={i} cx={ox + x} cy={oy + y} r={r.radius} fill={r.fill} />
        ))}
      {r.type === "cross" && (
        <>
          <line
            x1={ox + 10} y1={oy + 10}
            x2={ox + r.width - 10} y2={oy + r.height - 10}
            stroke={r.stroke} strokeWidth={r.strokeWidth} strokeLinecap="round"
          />
          <line
            x1={ox + r.width - 10} y1={oy + 10}
            x2={ox + 10} y2={oy + r.height - 10}
            stroke={r.stroke} strokeWidth={r.strokeWidth} strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
