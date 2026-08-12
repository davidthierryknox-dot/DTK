import type { FlowStimulusData } from "../../lib/stimulusTypes";

function center(box: FlowStimulusData["boxes"][number]) {
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
}

function FlowNode({ box, fontSize }: { box: FlowStimulusData["boxes"][number]; fontSize: number }) {
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx="10"
        fill="var(--surface)"
        stroke="var(--ink)"
        strokeWidth="2"
      />
      <text
        x={box.x + box.w / 2}
        y={box.y + box.h / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-sans)"
        fontSize={fontSize}
        fontWeight="500"
        fill="var(--ink)"
      >
        {box.label}
      </text>
    </g>
  );
}

function FlowArrow({
  from,
  to,
  direction,
  label,
  fontSize,
  markerId,
}: {
  from: FlowStimulusData["boxes"][number];
  to: FlowStimulusData["boxes"][number];
  direction: "vertical" | "horizontal";
  label?: string;
  fontSize: number;
  markerId: string;
}) {
  if (direction === "vertical") {
    const x = center(from).x;
    const y1 = from.y + from.h;
    const y2 = to.y;
    return (
      <g>
        <line x1={x} y1={y1} x2={x} y2={y2 - 2} stroke="var(--ink)" strokeWidth="2" markerEnd={`url(#${markerId})`} />
        {label && (
          <text x={x + 10} y={(y1 + y2) / 2} fontFamily="var(--font-sans)" fontSize={fontSize} fill="var(--ink-2)" dominantBaseline="central">
            {label}
          </text>
        )}
      </g>
    );
  }
  const y = center(from).y;
  const x1 = from.x + from.w;
  const x2 = to.x;
  return (
    <g>
      <line x1={x1} y1={y} x2={x2 - 2} y2={y} stroke="var(--ink)" strokeWidth="2" markerEnd={`url(#${markerId})`} />
      {label && (
        <text x={(x1 + x2) / 2} y={y - 8} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={fontSize} fill="var(--ink-2)">
          {label}
        </text>
      )}
    </g>
  );
}

let instanceCounter = 0;

export function FlowDiagram({ data, compact }: { data: FlowStimulusData; compact?: boolean }) {
  const byId = Object.fromEntries(data.boxes.map((b) => [b.id, b]));
  const markerId = `flow-arrow-${(instanceCounter += 1)}`;
  const fontSize = compact ? 11 : 15;
  const labelFontSize = compact ? 10 : 14;

  return (
    <div>
      <svg
        width={data.width}
        height={data.height}
        viewBox={`0 0 ${data.width} ${data.height}`}
        role="img"
        aria-label="See text alternative below the stimulus."
      >
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="var(--ink)" />
          </marker>
        </defs>
        {data.edges.map((edge, i) => (
          <FlowArrow
            key={i}
            from={byId[edge.from]}
            to={byId[edge.to]}
            direction={edge.direction}
            label={edge.label}
            fontSize={labelFontSize}
            markerId={markerId}
          />
        ))}
        {data.boxes.map((box) => (
          <FlowNode box={box} key={box.id} fontSize={fontSize} />
        ))}
      </svg>
      {!compact && (
        <p className="visually-hidden">
          A flow diagram with {data.boxes.length} steps, connected by arrows.{" "}
          {data.boxes.map((b) => `"${b.label}"`).join(", ")}. Use the branching to work out which written rule set
          would produce this behaviour.
        </p>
      )}
    </div>
  );
}
