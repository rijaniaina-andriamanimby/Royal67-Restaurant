import { useEffect, useState } from "react"
import api from "../../service/api"
import { groupCommande } from "../../utils/groupCommande"
import { Plus, Minus, Trash2, DollarSign } from "lucide-react"
import { pdf } from "@react-pdf/renderer"
import Recu from "../pdf/Recu"

const CommandeForm = ({ onClose, setCommandes, categorieList }) => {
  const [menusList, setMenusList] = useState([])
  const [menus, setMenus] = useState([])
  const [nomTable, setNomTable] = useState("")
  const [panier, setPanier] = useState([])
  const [payer, setPayer] = useState("")
  const [typePaiement, setTypePaiement] = useState("Espèce")
  const [categorieSelected, setCategorieSelected] = useState(0)
  useEffect(() => {
    api.get("/menu").then((res) => {
      setMenusList(res.data)
      setMenus(res.data)
    })
  }, [])

  const addToPanier = (menu) => {
    const exist = panier.find((p) => p.idMenu === menu.id)
    if (exist) {
      setPanier((prev) => prev.map((p) => (p.idMenu === menu.id ? { ...p, quantite: p.quantite + 1 } : p)))
    } else {
      setPanier((prev) => [...prev, { idMenu: menu.id, nom: menu.nom, prix: menu.prix, quantite: 1 }])
    }
  }

  const updateQty = (idMenu, qte) => {
    if (qte < 1) return
    setPanier((prev) => prev.map((p) => (p.idMenu === idMenu ? { ...p, quantite: qte } : p)))
  }

  const removeItem = (idMenu) => {
    setPanier((prev) => prev.filter((p) => p.idMenu !== idMenu))
  }

  const total = panier.reduce((s, p) => s + p.prix * p.quantite, 0)
  const rendu = payer ? payer - total : 0

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      nomTable,
      commandeDetail: panier.map((p) => ({
        idMenu: p.idMenu,
        quantite: p.quantite,
      })),
      payer,
      rendu,
      typePaiement,
    }

    const response = await api.post("/commande", payload)
    api.get("/commande").then((res) => {
      setCommandes(groupCommande(res.data))
    })

    // Génération automatique et téléchargement du PDF
    //const blob = await pdf(
    //  <Recu
    //    idCommande={response.data.idCommande}
    //    data={{
    //      ...payload,
    //      commandeDetail: panier // ← inclut nom / prix
    //    }}
    //  />
    //).toBlob();

    //const url = URL.createObjectURL(blob);
    //const link = document.createElement("a");
    //link.href = url;
    //link.download = `recu_${response.data.idCommande}.pdf`;
    //link.click();
    //URL.revokeObjectURL(url);

    const blob = await pdf(
      <Recu
        idCommande={response.data.idCommande}
        data={{ ...payload, commandeDetail: panier }}
      />
    ).toBlob();

    const arrayBuffer = await blob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    await window.electronAPI.printPdf(uint8);

    onClose()
  }

  useEffect(() => {
    if (categorieSelected == 0) return setMenus(menusList)
    const menu = menusList.filter((val) => (
      val.categorie == categorieSelected
    ))
    setMenus(menu)
  }, [categorieSelected])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de la table</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
            placeholder="Table 1"
            value={nomTable}
            onChange={(e) => setNomTable(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categorie</label>
          <select name="categorie" id="categorie" className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
            value={categorieSelected}
            onChange={(e) => setCategorieSelected(e.target.value)}>
            <option value={0}>Séléctionner</option>
            {
              categorieList.map((item) => (
                <option value={item.id} key={item.id}>{item.nom}</option>
              ))
            }
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Menus */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Plus size={18} className="text-blue-600 dark:text-blue-400" />
            Menus disponibles
          </h3>

          <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-3 max-h-80 overflow-y-auto space-y-2 bg-gray-50 dark:bg-slate-700">
            {menus.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">Aucun menu disponible</p>
            )}

            {menus.map((menu) => (
              <button
                type="button"
                key={menu.id}
                onClick={() => addToPanier(menu)}
                className="w-full flex justify-between items-center p-3 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition bg-white dark:bg-slate-800"
              >
                <span className="text-gray-900 dark:text-white font-medium">{menu.nom}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{menu.prix} Ar</span>
              </button>
            ))}
          </div>
        </div>

        {/* Panier */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />
            Panier ({panier.length})
          </h3>

          <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-3 max-h-80 overflow-y-auto space-y-2 bg-gray-50 dark:bg-slate-700">
            {panier.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">Aucun menu ajouté</p>
            )}

            {panier.map((p) => (
              <div
                key={p.idMenu}
                className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg hover:shadow-md transition"
              >
                <span className="flex-1 text-gray-900 dark:text-white font-medium">{p.nom}</span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateQty(p.idMenu, p.quantite - 1)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                  >
                    <Minus size={14} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={p.quantite}
                    onChange={(e) => updateQty(p.idMenu, +e.target.value)}
                    className="w-12 text-center border border-gray-200 dark:border-slate-600 rounded py-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => updateQty(p.idMenu, p.quantite + 1)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                  >
                    <Plus size={14} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <span className="font-bold text-blue-600 dark:text-blue-400 min-w-16 text-right">
                  {p.prix * p.quantite} Ar
                </span>

                <button
                  type="button"
                  onClick={() => removeItem(p.idMenu)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-500 dark:text-red-400 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de paiement</label>
          <select
            value={typePaiement}
            onChange={(e) => setTypePaiement(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
          >
            <option value="Espèce">Espèce</option>
            <option value="Mvola">Mvola</option>
            <option value="Orange Money">Orange Money</option>
            <option value="Airtel Money">Airtel Money</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Montant payé</label>
          <input
            type="number"
            placeholder="0"
            value={payer}
            onChange={(e) => setPayer(+e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
            required
          />
        </div>
      </div>

      <div className="space-y-3 bg-linear-to-r from-blue-50 dark:from-slate-700 to-blue-100 dark:to-slate-600 p-4 rounded-lg border border-blue-200 dark:border-slate-600">
        <div className="flex justify-between text-lg">
          <span className="font-semibold text-gray-900 dark:text-white">Total</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{total} Ar</span>
        </div>

        <div className="flex justify-between text-lg">
          <span className="font-semibold text-gray-900 dark:text-white">Rendu</span>
          <span
            className={`font-bold ${rendu >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
          >
            {rendu} Ar
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition font-medium"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={panier.length === 0 || payer < total}
          className="px-6 py-2 bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          Valider
        </button>
      </div>
    </form>
  )
}

export default CommandeForm