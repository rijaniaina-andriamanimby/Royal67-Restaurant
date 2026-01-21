import { useEffect, useState } from "react"
import api from "../service/api"
import StatsCards from "../components/Statistique/StatsCards"
import TopMenusChart from "../components/Statistique/TopMenusChart"
import StatsFilter from "../components/Statistique/StatsFilter"
import SalesByDayChart from "../components/Statistique/SalesByDayChart "
import PaymentsHistory from "../components/Statistique/PaymentsHistory "
import { BarChart3 } from "lucide-react"

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

    if (filter === "day") {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      start = d.toISOString().split("T")[0]
    }
    if (filter === "week") {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      start = d.toISOString().split("T")[0]
    }
    if (filter === "month") {
      const d = new Date()
      d.setMonth(d.getMonth() - 1)
      start = d.toISOString().split("T")[0]
    }

    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)

    const end = endDate.toISOString()


    const resSales = await api.get(`/stats/period`, {
      params: { start, end },
    })

    const resCat = await api.get("/stats/category")
    const resPay = await api.get("/stats/payments")

    setSales(resSales.data)
    setCategories(resCat.data)
    setPayments(resPay.data)
  }

  useEffect(() => {
    loadStats()
  }, [filter])

  if (!stats)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des statistiques...</p>
        </div>
      </div>
    )

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200">Statistiques globales</h1>
        </div>

        {/* Stats Cards */}
        <StatsCards data={stats.totals} />

        {/* Top Menus */}
        <TopMenusChart data={stats.topMenus} />

        {/* Filter */}
        <div className="flex justify-center">
          <StatsFilter filter={filter} setFilter={setFilter} />
        </div>

        {/* Sales Chart */}
        <SalesByDayChart data={sales} />

        {/* Category Chart
        <CategoryStatsChart data={categories} />
        */}

        {/* Payments History */}
        <PaymentsHistory data={payments} />
      </div>
    </div>
  )
}

export default Statistique
