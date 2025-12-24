import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const SalesByDayChart = ({ data }) => (
  <div className="border rounded-xl p-4 bg-white shadow-sm">
    <h3 className="font-semibold mb-2">Ventes par jour</h3>

    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis
          dataKey="jour"
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short"
            })
          }
        />
        <YAxis />
        <Tooltip
          labelFormatter={(value) =>
            new Date(value).toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "2-digit",
              month: "long"
            })
          }
        />
        <Line dataKey="total" />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

export default SalesByDayChart
