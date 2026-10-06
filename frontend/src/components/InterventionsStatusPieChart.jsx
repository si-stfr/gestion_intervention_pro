import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const STATUT_PIE_CATEGORIES = [
  { key: "SIGNALE", name: "Demande", color: "#cd2c2e" },
  { key: "EN_COURS", name: "En cours", color: "#f1c40f" },
  { key: "EN_RETARD", name: "En retard", color: "#e77000" },
  { key: "EN_ATTENTE_VALIDATION", name: "En attente de validation", color: "#8b5a2b" },
  { key: "IMPOSSIBLE", name: "Non résolue", color: "#9b59b6" },
  { key: "ABOUTI", name: "Terminée", color: "#27ae60" },
];

const SMALL_SCREEN_QUERY = "(max-width: 500px)";

function useSmallScreen() {
  const [small, setSmall] = useState(() => window.matchMedia(SMALL_SCREEN_QUERY).matches);

  useEffect(() => {
    const mq = window.matchMedia(SMALL_SCREEN_QUERY);
    const onChange = (e) => setSmall(e.matches);
    setSmall(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return small;
}

export default function InterventionsStatusPieChart({
  interventions,
  onSliceClick,
  title = "Interventions par statut",
  height = 500,
}) {
  const small = useSmallScreen();

  const data = STATUT_PIE_CATEGORIES.map((cat) => ({
    ...cat,
    value: interventions.filter((i) => i.statut === cat.key).length,
  })).filter((item) => item.value > 0);

  return (
    <div className="chart-container">
      <h2>{title}</h2>

      <ResponsiveContainer width="100%" height={small ? 380 : height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={small ? 70 : 180}
            label={
              small
                ? ({ value }) => value
                : ({ name, value }) => `${name} (${value})`
            }
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
