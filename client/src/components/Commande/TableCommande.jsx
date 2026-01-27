import { Clock, Edit2, Trash2, CreditCard } from "lucide-react"

const TableCommande = ({ commandes, setSelectedCommande, handleDelete }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-600">
      <table className="w-full bg-white dark:bg-slate-800 shadow-sm">
        <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
          <tr>
            <th className="p-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Table</th>
            <th className="p-4 text-left text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={16} /> Date
            </th>
            <th className="p-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Résumé</th>
            <th className="p-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Total</th>
            <th className="p-4 text-center text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <CreditCard size={16} /> Paiement
            </th>
            <th className="p-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
          {commandes.map((cmd) => (
            <tr key={cmd.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <td className="p-4">
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm font-medium">
                  {cmd.nomTable}
                </span>
              </td>
              <td className="p-4 text-slate-700 dark:text-slate-300 text-sm">
                {new Date(cmd.date).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  year: '2-digit'
                })}
              </td>
              <td className="p-4 text-slate-700 dark:text-slate-300 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{cmd.details?.length || 0} article(s)</span>
                  {cmd.details?.[0] && (
                    <span className="text-xs bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded">
                      {cmd.details.map((item)=>(
                        <p key={item.nom}>{item.nom} (x{item.quantite})</p>
                      ))}
                    </span>
                  )}
                </div>
              </td>
              <td className="p-4 text-right font-bold text-blue-600 dark:text-blue-400">
                {cmd.details?.reduce((s, d) => s + (d.prix * d.quantite || 0), 0) || 0} Ar
              </td>
              <td className="p-4 text-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  {cmd.paiement?.typePaiement || "En attente"}
                </span>
              </td>
              <td className="p-4 flex justify-center items-center">
                <button
                  onClick={() => handleDelete?.(cmd.id)}
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

export default TableCommande