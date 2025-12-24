import { Edit2, Trash2, UtensilsCrossed } from "lucide-react"

const MenuCards = ({ menuList, setSelectedMenu, handleDelete }) => {
  return (
    <div className="grid gap-4 md:hidden">
      {menuList.map((item) => (
        <div
          key={item.id}
          className="bg-white dark:bg-slate-800 rounded-xl shadow hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700 p-5 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{item.nom}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.categorie}</p>
            </div>
            <UtensilsCrossed size={24} className="text-blue-600 dark:text-blue-400" />
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">Prix</p>
            <p className="font-bold text-xl text-blue-600 dark:text-blue-400">{item.prix} Ar</p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedMenu(item)}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              aria-label="Modifier"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              aria-label="Supprimer"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MenuCards