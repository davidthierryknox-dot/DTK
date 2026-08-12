import type { TwoViewStimulusData } from "../../lib/stimulusTypes";

export function TwoView({ data }: { data: TwoViewStimulusData }) {
  const maxValue = Math.max(...data.rows.map((r) => Math.max(r.tableValue, r.chartValue)));
  return (
    <div style={{ width: "100%" }}>
      <div className="two-view" role="img" aria-label="See text alternative below the stimulus.">
        <table className="two-view__table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Value ({data.unit})</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>{row.tableValue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="two-view__chart">
          {data.rows.map((row) => (
            <div className="two-view__bar-row" key={row.label}>
              <span className="two-view__bar-label">{row.label}</span>
              <div className="two-view__bar-track">
                <div
                  className="two-view__bar-fill"
                  style={{ width: `${(row.chartValue / maxValue) * 100}%` }}
                />
              </div>
              <span className="two-view__bar-value">{row.chartValue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="visually-hidden">
        The same {data.rows.length} values shown twice: once in a table and once as a bar chart. Table values:{" "}
        {data.rows.map((r) => `${r.label} ${r.tableValue}`).join(", ")}. Chart values:{" "}
        {data.rows.map((r) => `${r.label} ${r.chartValue}`).join(", ")}. Compare the two views row by row to find
        the one value that disagrees between them.
      </p>
    </div>
  );
}
