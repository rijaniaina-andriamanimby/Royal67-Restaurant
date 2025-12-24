const Card = ({ label, value }) => (
  <div className="border rounded-xl p-4 shadow-sm bg-white">
    <p className="text-sm text-gray-500">{label}</p>
    <h2 className="text-xl font-bold">{value}</h2>
  </div>
)

const StatsCards = ({ data }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

    <Card label="Total global des ventes" value={`${data.total_global || 0} Ar`} />

    <Card label="Total du mois en cours" value={`${data.total_mois || 0} Ar`} />

    <Card label="Nombre total de commandes" value={data.total_commandes || 0} />
  </div>
)

export default StatsCards
