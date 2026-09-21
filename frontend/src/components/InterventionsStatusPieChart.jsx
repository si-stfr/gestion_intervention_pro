import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const STATUT_PIE_CATEGORIES = [
  { key: "SIGNALE", name: "Demande", color: "#cd2c2e" },
  { key: "EN_COURS", name: "En cours", color: "#f1c40f" },
  { key: "EN_RETARD", name: "En retard", color: "#e77000" },
  { key: "EN_ATTENTE_VALIDATION", name: "En attente de validation", color: "#8b5a2b" },
  { key: "IMPOSSIBLE", name: "Non résolue", color: "#9b59b6" },
  { key: "ABOUTI", name: "Terminée", color: "#27ae60" },
];

export default function InterventionsStatusPieChart({
  interventions,
  onSliceClick,
  title = "Interventions par statut",
  height = 500,
}) {
  const data = STATUT_PIE_CATEGORIES.map((cat) => ({
    ...cat,
    value: interventions.filter((i) => i.statut === cat.key).length,
  })).filter((item) => item.value > 0);

  return (
    <div className="chart-container">
      <h2>{title}</h2>

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={180}
            label={({ name, value }) => `${name} (${value})`}
            onClick={onSliceClick ? (entry) => onSliceClick(entry.key) : undefined}
          >
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
