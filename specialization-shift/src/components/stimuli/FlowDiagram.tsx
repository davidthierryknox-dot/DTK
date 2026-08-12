type Box = { label: string; x: number; y: number; w: number; h: number };

const START: Box = { label: "Package arrives", x: 160, y: 12, w: 200, h: 56 };
const DECISION_1: Box = { label: "Is it heavy?", x: 160, y: 118, w: 200, h: 64 };
const WAIT_1: Box = { label: "Wait for a human", x: 480, y: 118, w: 200, h: 64 };
const DECISION_2: Box = { label: "Is it fragile?", x: 160, y: 248, w: 200, h: 64 };
const WAIT_2: Box = { label: "Wait for a human", x: 480, y: 248, w: 200, h: 64 };
const DELIVER: Box = { label: "Deliver it", x: 160, y: 382, w: 200, h: 56 };

function center(box: Box) {
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
}

function FlowNode({ box }: { box: Box }) {
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
        fontSize="15"
        fontWeight="500"
        fill="var(--ink)"
      >
        {box.label}
      </text>
    </g>
  );
}

function VerticalArrow({ from, to, label }: { from: Box; to: Box; label?: string }) {
  const x = center(from).x;
  const y1 = from.y + from.h;
  const y2 = to.y;
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2 - 2} stroke="var(--ink)" strokeWidth="2" markerEnd="url(#flow-arrow)" />
      {label && (
        <text
          x={x + 12}
          y={(y1 + y2) / 2}
          fontFamily="var(--font-sans)"
          fontSize="14"
          fill="var(--ink-2)"
          dominantBaseline="central"
        >
          {label}
        </text>
      )}
    </g>
  );
}

function HorizontalArrow({ from, to, label }: { from: Box; to: Box; label?: string }) {
  const y = center(from).y;
  const x1 = from.x + from.w;
  const x2 = to.x;
  return (
    <g>
      <line x1={x1} y1={y} x2={x2 - 2} y2={y} stroke="var(--ink)" strokeWidth="2" markerEnd="url(#flow-arrow)" />
      {label && (
        <text
          x={(x1 + x2) / 2}
          y={y - 10}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="14"
          fill="var(--ink-2)"
        >
          {label}
        </text>
      )}
    </g>
  );
}

export function FlowDiagram() {
  return (
    <div>
      <svg
        width="700"
        height="460"
        viewBox="0 0 700 460"
        role="img"
        aria-label="See text alternative below the stimulus."
      >
        <defs>
          <marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="var(--ink)" />
          </marker>
        </defs>
        <VerticalArrow from={START} to={DECISION_1} />
        <HorizontalArrow from={DECISION_1} to={WAIT_1} label="YES" />
        <VerticalArrow from={DECISION_1} to={DECISION_2} label="NO" />
        <HorizontalArrow from={DECISION_2} to={WAIT_2} label="YES" />
        <VerticalArrow from={DECISION_2} to={DELIVER} label="NO" />
        <FlowNode box={START} />
        <FlowNode box={DECISION_1} />
        <FlowNode box={WAIT_1} />
        <FlowNode box={DECISION_2} />
        <FlowNode box={WAIT_2} />
        <FlowNode box={DELIVER} />
      </svg>
      <p className="visually-hidden">
        A flow diagram. "Package arrives" leads to a decision, "Is it heavy?" If yes, the flow goes to "Wait for a
        human." If no, it continues to a second decision, "Is it fragile?" If yes, the flow again goes to "Wait for
        a human." If no, the flow ends at "Deliver it." Use this behaviour to work out which written rule set would
        produce it.
      </p>
    </div>
  );
}
