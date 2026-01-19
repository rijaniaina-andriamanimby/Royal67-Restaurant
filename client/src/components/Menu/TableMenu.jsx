import { Edit2, Trash2 } from "lucide-react"

const TableMenu = ({ menuList, setSelectedMenu, handleDelete }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-600">
      <table className="w-full bg-white dark:bg-slate-800 shadow-sm">
        <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
          <tr>
            <th className="p-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Nom</th>
            <th className="p-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Catégorie</th>
            <th className="p-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Prix</th>
            <th className="p-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
          {menuList.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <td className="p-4 text-slate-900 dark:text-white font-medium">{item.nom}</td>
              <td className="p-4 text-center">
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm font-medium">
                  {item.cnom}
                </span>
              </td>
              <td className="p-4 text-center text-slate-900 dark:text-white font-semibold">{item.prix} Ar</td>
              <td className="p-4 flex justify-center gap-2">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableMenu