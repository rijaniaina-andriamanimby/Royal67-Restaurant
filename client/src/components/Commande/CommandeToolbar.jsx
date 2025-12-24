import { Search, SortAsc } from "lucide-react"

const CommandeToolbar = ({ search, setSearch, sort, setSort }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
      <div className="flex-1 relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
          size={20}
        />
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
          placeholder="Rechercher par table..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <SortAsc className="text-gray-400 dark:text-gray-500" size={20} />
        <select
          className="px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Trier par</option>
          <option value="date_desc">Date récente</option>
          <option value="date_asc">Date ancienne</option>
          <option value="total_desc">Montant décroissant</option>
        </select>
      </div>
    </div>
  )
}

export default CommandeToolbar