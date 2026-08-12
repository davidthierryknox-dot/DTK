import type { DependencyStimulusData, DependencyNode } from "../../lib/stimulusTypes";

const RADIUS = 28;

function trimmedEndpoints(from: DependencyNode, to: DependencyNode) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist;
  const uy = dy / dist;
  return {
    x1: from.x + ux * RADIUS,
    y1: from.y + uy * RADIUS,
    x2: to.x - ux * (RADIUS + 8),
    y2: to.y - uy * (RADIUS + 8),
  };
}

export function DependencyGraph({ data }: { data: DependencyStimulusData }) {
  const byId = Object.fromEntries(data.nodes.map((n) => [n.id, n]));
  const maxX = Math.max(...data.nodes.map((n) => n.x)) + RADIUS + 20;
  const maxY = Math.max(...data.nodes.map((n) => n.y)) + RADIUS + 20;
  return (
    <div>
      <svg
        width={maxX}
        height={maxY}
        viewBox={`0 0 ${maxX} ${maxY}`}
        role="img"
        aria-label="See text alternative below the stimulus."
      >
        <defs>
          <marker id="dep-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="var(--ink)" />
          </marker>
        </defs>
        {data.edges.map(([fromId, toId]) => {
          const { x1, y1, x2, y2 } = trimmedEndpoints(byId[fromId], byId[toId]);
          return (
            <line
              key={`${fromId}-${toId}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--ink)"
              strokeWidth="2"
              markerEnd="url(#dep-arrow)"
            />
          );
        })}
        {data.nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r={RADIUS} fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="var(--font-sans)"
              fontSize="20"
              fontWeight="500"
              fill="var(--ink)"
            >
              {node.id}
            </text>
          </g>
        ))}
      </svg>
      <p className="visually-hidden">
        {data.nodes.length} steps, labeled {data.nodes.map((n) => n.id).join(", ")}, connected by arrows meaning
        "must happen before." The arrows are:{" "}
        {data.edges.map(([from, to]) => `${from} to ${to}`).join("; ")}. Use the arrows to work out which orderings
        respect every dependency.
      </p>
    </div>
  );
}
