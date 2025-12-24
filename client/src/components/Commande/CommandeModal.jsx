import { X } from "lucide-react"
import CommandeForm from "./CommandeForm"

const CommandeModal = ({ onClose, setCommandes }) => {
  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-800 w-full max-w-3xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-linear-to-r from-blue-600 dark:from-blue-700 to-blue-700 dark:to-blue-800 border-b border-blue-700 dark:border-blue-900">
          <h2 className="text-xl font-bold text-white">Nouvelle commande</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-70px)] px-6 py-4">
          <CommandeForm onClose={onClose} setCommandes={setCommandes} />
        </div>
      </div>
    </div>
  )
}

export default CommandeModal
