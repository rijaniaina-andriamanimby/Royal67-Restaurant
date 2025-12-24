import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts"

const CategoryStatsChart = ({ data }) => (
  <div className="border rounded-xl p-4 bg-white shadow-sm">
    <h3 className="font-semibold mb-2">Ventes par catégorie</h3>

    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="categorie" />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
)

export default CategoryStatsChart
