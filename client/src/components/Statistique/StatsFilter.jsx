import { Calendar, Clock, BarChart3, Database as DateRange } from "lucide-react"

const StatsFilter = ({ filter, setFilter }) => {
  const filterOptions = [
    { type: "day", label: "Jour", icon: Clock },
    { type: "week", label: "Semaine", icon: BarChart3 },
    { type: "month", label: "Mois", icon: Calendar }
  ]

  return (
    <div className="flex gap-3 flex-wrap">
      {filterOptions.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          onClick={() => setFilter(type)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            filter === type ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  )
}

export default StatsFilter
