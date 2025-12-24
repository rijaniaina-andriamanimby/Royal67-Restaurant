import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const SalesByDayChart = ({ data }) => (
  <div className="border rounded-xl p-4 bg-white shadow-sm">
    <h3 className="font-semibold mb-2">Ventes par jour</h3>

    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="jour" />
        <YAxis />
        <Tooltip />
        <Line dataKey="total" />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

export default SalesByDayChart
