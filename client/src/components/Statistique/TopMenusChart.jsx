import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const TopMenusChart = ({ data }) => (
  <div className="border rounded-xl p-4 bg-white shadow-sm">
    <h3 className="font-semibold mb-3">Top 5 menus les plus vendus (7 derniers jours)</h3>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="nom" />
        <YAxis />
        <Tooltip />
        <Bar
          dataKey="total"
          fill="#3b82f6"
          radius={[5, 5, 0, 0]}
          barSize={100}
          isAnimationActive={true} // Activé par défaut
          animationBegin={200}     // Délai avant le début (ms)
          animationDuration={1500}  // Durée de l'animation (ms)
          animationEasing="ease-out" // Type de mouvement (linear, ease, ease-in, ease-out, ease-in-out)
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
)

export default TopMenusChart
