import { Edit2, Trash2, ShoppingCart } from "lucide-react"

const CommandeCards = ({ commandes, setSelectedCommande, handleDelete }) => {
  return (
    <div className="grid gap-4 md:hidden">
      {commandes.map((cmd) => {
        const cmdTotal = cmd.details.reduce((s, d) => s + d.prix * d.quantite, 0)
        return (
          <div
            key={cmd.id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700 p-5 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Table {cmd.nomTable}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {new Date(cmd.date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <ShoppingCart size={24} className="text-blue-600 dark:text-blue-400" />
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">Articles ({cmd.details.length})</p>
              <div className="mt-2 space-y-1">
                {cmd.details.slice(0, 2).map((d, i) => (
                  <p key={i} className="text-sm text-slate-600 dark:text-slate-300">
                    {d.nom} ×{d.quantite}
                  </p>
                ))}
                {cmd.details.length > 2 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">+{cmd.details.length - 2} autre(s)</p>
                )}
              </div>
            </div>

            <div className="bg-linear-to-r from-blue-50 dark:from-slate-700 to-blue-100 dark:to-slate-600 rounded-lg p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
              <p className="font-bold text-xl text-blue-600 dark:text-blue-400">{cmdTotal} Ar</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              {setSelectedCommande && (
                <button
                  onClick={() => setSelectedCommande(cmd)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  aria-label="Modifier"
                >
                  <Edit2 size={18} />
                </button>
              )}
              {handleDelete && (
                <button
                  onClick={() => handleDelete(cmd.id)}
                  className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  aria-label="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CommandeCards
