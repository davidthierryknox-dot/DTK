const RADIUS = 28;

type Node = { id: string; x: number; y: number };

// Corpus SA-2: A → B → D, and B → C.
const NODES: Node[] = [
  { id: "A", x: 60, y: 120 },
  { id: "B", x: 190, y: 120 },
  { id: "C", x: 190, y: 220 },
  { id: "D", x: 320, y: 60 },
];

const EDGES: [string, string][] = [
  ["A", "B"],
  ["B", "D"],
  ["B", "C"],
];

function trimmedEndpoints(from: Node, to: Node) {
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

export function DependencyGraph() {
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  return (
    <div>
      <svg
        width="380"
        height="260"
        viewBox="0 0 380 260"
        role="img"
        aria-label="See text alternative below the stimulus."
      >
        <defs>
          <marker id="dep-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="var(--ink)" />
          </marker>
        </defs>
        {EDGES.map(([fromId, toId]) => {
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
        {NODES.map((node) => (
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
        Four steps, labeled A, B, C, and D, connected by arrows meaning "must happen before." There is an arrow from
        A to B, an arrow from B to D, and an arrow from B to C. Use the arrows to work out which orderings respect
        every dependency.
      </p>
    </div>
  );
}
