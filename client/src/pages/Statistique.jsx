import React, { useEffect, useState } from "react"
import api from "../service/api"
import StatsCards from "../components/Statistique/StatsCards"
import TopMenusChart from "../components/Statistique/TopMenusChart"

import StatsFilter from "../components/Statistique/StatsFilter"
import SalesByDayChart from "../components/Statistique/SalesByDayChart "
import CategoryStatsChart from "../components/Statistique/CategoryStatsChart"
import PaymentsHistory from "../components/Statistique/PaymentsHistory "

const Statistique = () => {
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState("month")
  const [sales, setSales] = useState([])
  const [categories, setCategories] = useState([])
  const [payments, setPayments] = useState([])

  const loadStats = async () => {
    const res = await api.get("/stats")
    setStats(res.data)

    const now = new Date()
    let start

    if (filter === "day") start = new Date(now.setHours(0, 0, 0)).toDateString()
    if (filter === "week") start = new Date(now.setDate(now.getDate() - 7)).toLocaleDateString()
    if (filter === "month") start = new Date(now.setMonth(now.getMonth() - 1)).toLocaleDateString()

    const resSales = await api.get(`/stats/period`, {
      params: { start, end: new Date() }
    })

    const resCat = await api.get("/stats/category")
    const resPay = await api.get("/stats/payments")

    setSales(resSales.data)
    setCategories(resCat.data)
    setPayments(resPay.data)
  }

  useEffect(() => { loadStats() }, [filter])

  if (!stats) return <p>Chargement...</p>

  return (
    <div className="space-y-6 p-5 z-0">
      <h1 className="text-2xl font-bold">Statistiques globales</h1>

      <StatsCards data={stats.totals} />

      <TopMenusChart data={stats.topMenus} />

      <StatsFilter filter={filter} setFilter={setFilter} />

      <SalesByDayChart data={sales} />

      <PaymentsHistory data={payments} />
    </div>
  )
}

export default Statistique
