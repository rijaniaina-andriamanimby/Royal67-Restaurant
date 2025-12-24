import React from "react"

const StatsFilter = ({ filter, setFilter }) => (
  <div className="flex gap-3">
    {["day","week","month","custom"].map(type => (
      <button
        key={type}
        onClick={() => setFilter(type)}
        className={`px-3 py-1 rounded 
          ${filter === type ? "bg-blue-600 text-white" : "bg-gray-200"}`}
      >
        {type === "day" && "Jour"}
        {type === "week" && "Semaine"}
        {type === "month" && "Mois"}
        {type === "custom" && "Période"}
      </button>
    ))}
  </div>
)

export default StatsFilter
