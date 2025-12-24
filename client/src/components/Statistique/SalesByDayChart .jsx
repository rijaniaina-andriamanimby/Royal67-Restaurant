import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { TrendingUp } from "lucide-react"

const SalesByDayChart = ({ data }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <TrendingUp className="w-5 h-5 text-blue-600" />
      <h3 className="font-bold text-lg text-gray-900">Ventes par jour</h3>
    </div>

    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="jour"
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
            })
          }
          stroke="#9ca3af"
        />
        <YAxis stroke="#9ca3af" />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px" }}
          labelFormatter={(value) =>
            new Date(value).toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "2-digit",
              month: "long",
            })
          }
        />
        <Line
          dataKey="total"
          stroke="#2563eb"
          strokeWidth={3}
          dot={{ fill: "#2563eb", r: 5 }}
          activeDot={{ r: 7 }}
          isAnimationActive={true}
          animationDuration={800}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

export default SalesByDayChart
