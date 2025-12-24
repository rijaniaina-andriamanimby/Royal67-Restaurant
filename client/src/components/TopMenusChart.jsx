import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const TopMenusChart = ({ data }) => (
  <div className="border rounded-xl p-4 bg-white shadow-sm">
    <h3 className="font-semibold mb-3">Top 5 menus les plus vendus (7 derniers jours)</h3>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="nom" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" />
      </BarChart>
    </ResponsiveContainer>
  </div>
)

export default TopMenusChart
