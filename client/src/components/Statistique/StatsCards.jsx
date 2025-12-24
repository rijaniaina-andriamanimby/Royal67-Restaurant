import { TrendingUp, ShoppingCart, DollarSign } from "lucide-react"

const Card = ({ label, value, icon: Icon, trend }) => (
  <div className="bg-linear-to-br from-blue-50 to-white border border-blue-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 font-medium mb-2">{label}</p>
        <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
        {trend && <p className="text-xs text-green-600 mt-2">↑ {trend}</p>}
      </div>
      {Icon && <Icon className="w-8 h-8 text-blue-500 opacity-20" />}
    </div>
  </div>
)

const StatsCards = ({ data }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <Card label="Total global des ventes" value={`${data.total_global || 0} Ar`} icon={DollarSign} trend="+12%" />
    <Card label="Total du mois en cours" value={`${data.total_mois || 0} Ar`} icon={TrendingUp} trend="+8%" />
    <Card label="Nombre total de commandes" value={data.total_commandes || 0} icon={ShoppingCart} trend="+5%" />
  </div>
)

export default StatsCards
