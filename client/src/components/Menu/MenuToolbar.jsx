import { Search, Filter } from "lucide-react"

const MenuToolbar = ({ search, setSearch, sort, setSort }) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      <div className="relative flex items-center gap-2 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 w-full md:w-1/3 bg-white dark:bg-slate-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <Search size={18} className="text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Rechercher un menu..."
          value={search}
          id="search"
          onChange={(e) => setSearch(e.target.value)}
          className="focus:outline-none w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
          autoComplete="off"
        />
      </div>

      <div className="relative flex items-center gap-2 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 w-full md:w-1/3 bg-white dark:bg-slate-700">
        <Filter size={18} className="text-slate-400 dark:text-slate-500" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full focus:outline-none bg-transparent text-slate-900 dark:text-white"
        >
          <option value="" className="bg-white dark:bg-slate-800">
            Trier par
          </option>
          <option value="nom" className="bg-white dark:bg-slate-800">
            Nom
          </option>
          <option value="prix_asc" className="bg-white dark:bg-slate-800">
            Prix croissant
          </option>
          <option value="prix_desc" className="bg-white dark:bg-slate-800">
            Prix décroissant
          </option>
          <option value="categorie" className="bg-white dark:bg-slate-800">
            Catégorie
          </option>
        </select>
      </div>
    </div>
  )
}

export default MenuToolbar
