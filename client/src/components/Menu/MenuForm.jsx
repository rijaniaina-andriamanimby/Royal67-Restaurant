import { useState } from "react"
import api from "../../service/api"
import { Save, X } from "lucide-react"

const MenuForm = ({ menu, setMenuList, onClose, categorieList }) => {
  const [nom, setNom] = useState(menu?.nom || "")
  const [categorie, setCategorie] = useState(menu?.categorie || "")
  const [prix, setPrix] = useState(menu?.prix || "")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (menu) {
      const res = await api.put(`/menu/${menu.id}`, { nom, categorie, prix })
      setMenuList((prev) => prev.map((item) => (item.id === menu.id ? res.data : item)))
    } else {
      const res = await api.post("/menu", { nom, categorie, prix })
      setMenuList((prev) => [...prev, res.data])
    }

    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
        {menu ? "Modifier le menu" : "Ajouter un nouveau menu"}
      </h2>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nom</label>
        <input
          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-all"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Catégorie</label>
        <select
          name="categorie"
          id="categorie"
          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-all"
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
        >
          <option value="">Choisir</option>
          {
            categorieList.map((item)=>(
              <option value={item.id} key={item.id}>{item.nom}</option>
            ))
          }
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Prix (Ar)</label>
        <input
          type="number"
          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-all"
          value={prix}
          onChange={(e) => setPrix(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-600">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
          <X size={18} />
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
        >
          <Save size={18} />
          {menu ? "Modifier" : "Ajouter"}
        </button>
      </div>
    </form>
  )
}

export default MenuForm