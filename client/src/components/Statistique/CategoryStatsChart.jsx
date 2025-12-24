import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { PieChartIcon } from "lucide-react"

const COLORS = ["#2563eb", "#1e40af", "#3b82f6", "#60a5fa", "#93c5fd"]

const CategoryStatsChart = ({ data }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <PieChartIcon className="w-5 h-5 text-blue-600" />
      <h3 className="font-bold text-lg text-gray-900">Ventes par catégorie</h3>
    </div>

    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="categorie"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ categorie, percent }) => `${categorie}: ${(percent * 100).toFixed(0)}%`}
          isAnimationActive={true}
          animationDuration={800}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px" }}
          formatter={(value) => `${value} Ar`}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
)

export default CategoryStatsChart
