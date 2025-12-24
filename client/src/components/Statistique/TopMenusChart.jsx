import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Award } from "lucide-react"

const TopMenusChart = ({ data }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <Award className="w-5 h-5 text-blue-600" />
      <h3 className="font-bold text-lg text-gray-900">Top 5 menus les plus vendus (7 derniers jours)</h3>
    </div>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="nom" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px" }}
          cursor={{ fill: "rgba(37, 99, 235, 0.1)" }}
        />
        <Bar
          dataKey="total"
          fill="#2563eb"
          radius={[8, 8, 0, 0]}
          isAnimationActive={true}
          animationBegin={200}
          animationDuration={1500}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
)

export default TopMenusChart
