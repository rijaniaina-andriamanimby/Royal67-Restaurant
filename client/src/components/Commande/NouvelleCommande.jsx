import { useEffect, useState } from "react"
import api from "../../service/api"
import { groupCommande } from "../../utils/groupCommande"
import { Plus, Minus, Trash2, ArrowLeft, ShoppingCart, DollarSign, Filter, Check, AlertCircle, Map, UtensilsCrossed } from "lucide-react"
import { pdf } from "@react-pdf/renderer"
import Recu from "../pdf/Recu"

const NouvelleCommande = ({ onClose, setCommandes }) => {
    const [menusList, setMenusList] = useState([])
    const [menus, setMenus] = useState([])
    const [categories, setCategories] = useState([])
    const [categorieSelected, setCategorieSelected] = useState(0)
    const [panier, setPanier] = useState([])
    const [nomTable, setNomTable] = useState("")
    const [payer, setPayer] = useState("")
    const [typePaiement, setTypePaiement] = useState("Espèce")
    const [loading, setLoading] = useState(true)
    const [activeStep, setActiveStep] = useState("menu")

    useEffect(() => {
        setLoading(true)
        Promise.all([api.get("/menu"), api.get("/categorie")]).then(([menuRes, catRes]) => {
            setMenusList(menuRes.data)
            setMenus(menuRes.data)
            setCategories(catRes.data)
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        if (categorieSelected === 0) {
            setMenus(menusList)
        } else {
            setMenus(menusList.filter((m) => m.categorie === categorieSelected))
        }
    }, [categorieSelected, menusList])

    const addToPanier = (menu) => {
        const exist = panier.find((p) => p.idMenu === menu.id)
        if (exist) {
            setPanier((prev) =>
                prev.map((p) => (p.idMenu === menu.id ? { ...p, quantite: p.quantite + 1 } : p))
            )
        } else {
            setPanier((prev) => [
                ...prev,
                { idMenu: menu.id, nom: menu.nom, prix: menu.prix, quantite: 1 },
            ])
        }
    }

    const updateQty = (idMenu, qte) => {
        if (qte < 1) return
        setPanier((prev) =>
            prev.map((p) => (p.idMenu === idMenu ? { ...p, quantite: qte } : p))
        )
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
        const idCommande = response.data.idCommande

        if (setCommandes) {
            api.get("/commande").then((res) => {
                setCommandes(groupCommande(res.data))
            })

        }
        // 🖨️ impression automatique
        await printPDF(idCommande, payload, panier)
        if (onClose) {
            onClose()
        } else {
            window.history.back()
        }
    }

    const printPDF = async (idCommande, payload, panier) => {
        const blob = await pdf(
            <Recu
                idCommande={idCommande}
                data={{
                    ...payload,
                    commandeDetail: panier, // nom + prix + quantite
                }}
            />
        ).toBlob()

        const url = URL.createObjectURL(blob)
        // 👇 affiche dans le navigateur
        window.open(url, "_blank")
        const iframe = document.createElement("iframe")
        iframe.style.display = "none"
        iframe.src = url

        document.body.appendChild(iframe)

        iframe.onload = () => {
            iframe.contentWindow.focus()
            iframe.contentWindow.print()

            // nettoyage
            setTimeout(() => {
                URL.revokeObjectURL(url)
                document.body.removeChild(iframe)
            }, 1000)
        }
    }


    const isValidTable = nomTable.trim().length > 0
    const canSubmit = panier.length > 0 && isValidTable && payer && payer >= total

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
            {/* HEADER */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50 px-4 sm:px-6 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                                aria-label="Retour"
                            >
                                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <ShoppingCart
                                    size={28}
                                    className="text-blue-600 dark:text-blue-400 animate-bounce"
                                />
                                Nouvelle Commande
                            </h1>
                        </div>
                    </div>
                    {panier.length > 0 && (
                        <div className="hidden sm:flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                                {panier.length} article{panier.length > 1 ? "s" : ""}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* TABLE INFO CARD */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 shadow-md dark:text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <Map size={24} />
                        <h2 className="text-xl sm:text-2xl font-bold">Table</h2>
                    </div>
                    <input
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-white/50 focus:border-transparent transition text-lg font-semibold"
                        value={nomTable}
                        onChange={(e) => setNomTable(e.target.value)}
                        required
                    />
                </div>

                {/* CATEGORIES FILTER */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md sticky top-18 z-50">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Filter size={20} className="text-blue-600 dark:text-blue-400" />
                        Parcourir les menus
                    </h3>
                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                        <button
                            type="button"
                            onClick={() => setCategorieSelected(0)}
                            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${categorieSelected === 0
                                ? "bg-blue-600 text-white shadow-md scale-105"
                                : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                                }`}
                        >
                            Tous
                        </button>
                        {categories.map((c) => (
                            <button
                                type="button"
                                key={c.id}
                                onClick={() => setCategorieSelected(c.id)}
                                className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${categorieSelected === c.id
                                    ? "bg-blue-600 text-white shadow-md scale-105"
                                    : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                                    }`}
                            >
                                {c.nom}
                            </button>
                        ))}
                    </div>
                </div>

                {/* MAIN CONTENT */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin">
                            <ShoppingCart size={48} className="text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* MENUS SECTION */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <UtensilsCrossed size={22} className="text-blue-600 dark:text-blue-400" />
                                    Menus disponibles ({menus.length})
                                </h3>

                                {menus.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                                        <p className="text-lg">Aucun menu disponible dans cette catégorie</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {menus.map((menu) => (
                                            <button
                                                type="button"
                                                key={menu.id}
                                                onClick={() => addToPanier(menu)}
                                                className="group relative p-5 border-2 border-gray-200 dark:border-slate-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg dark:hover:shadow-blue-500/20 bg-gray-50 dark:bg-slate-700/50 text-left transition-all duration-300 hover:scale-105 active:scale-95"
                                            >
                                                <div className="flex justify-between items-start gap-3 mb-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition text-base">
                                                            {menu.nom}
                                                        </h4>
                                                    </div>
                                                    <Plus
                                                        size={20}
                                                        className="text-blue-600 dark:text-blue-400 group-hover:scale-125 transition-transform shrink-0 group-hover:rotate-90"
                                                    />
                                                </div>
                                                <p className="text-xl font-bold text-blue-600 dark:text-blue-300 flex items-baseline gap-1">
                                                    {menu.prix}
                                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Ar</span>
                                                </p>

                                                {panier.find((p) => p.idMenu === menu.id) && (
                                                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                                        <Check size={16} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PANIER STICKY */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-70 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border-2 border-blue-200 dark:border-blue-900/50">
                                <div className="flex items-center justify-between gap-2 mb-4">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                        <ShoppingCart size={20} className="text-blue-600 dark:text-blue-400" />
                                        Panier
                                    </h3>
                                    {panier.length > 0 && (
                                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            {panier.length}
                                        </span>
                                    )}
                                </div>

                                {panier.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <ShoppingCart size={40} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Commencez à ajouter des menus</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                                        {panier.map((p) => (
                                            <div
                                                key={p.idMenu}
                                                className="p-4 bg-linear-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-lg border border-gray-200 dark:border-slate-600 hover:shadow-md transition"
                                            >
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <h5 className="font-semibold text-gray-900 dark:text-white flex-1 text-sm">
                                                        {p.nom}
                                                    </h5>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(p.idMenu)}
                                                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-500 dark:text-red-400 transition shrink-0"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQty(p.idMenu, p.quantite - 1)}
                                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                                                        >
                                                            <Minus size={14} className="text-gray-600 dark:text-gray-400" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={p.quantite}
                                                            onChange={(e) => updateQty(p.idMenu, +e.target.value)}
                                                            className="w-12 text-center bg-transparent text-gray-900 dark:text-white text-sm font-bold border-0"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQty(p.idMenu, p.quantite + 1)}
                                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                                                        >
                                                            <Plus size={14} className="text-gray-600 dark:text-gray-400" />
                                                        </button>
                                                    </div>

                                                    <span className="font-bold text-blue-600 dark:text-blue-300 text-sm">
                                                        {p.prix * p.quantite} Ar
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* SUMMARY */}
                                {panier.length > 0 && (
                                    <div className="space-y-3 bg-linear-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 p-5 rounded-lg text-white border-0">
                                        <div className="flex justify-between items-center pb-3 border-b border-white/30">
                                            <span className="font-semibold text-white/90">Total</span>
                                            <span className="text-2xl font-bold">{total} Ar</span>
                                        </div>

                                        {payer && (
                                            <>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-semibold text-white/90">Montant payé</span>
                                                    <span className="font-bold">{payer} Ar</span>
                                                </div>
                                                <div
                                                    className={`flex justify-between items-center py-2 px-3 rounded-lg ${rendu >= 0
                                                        ? "bg-emerald-400/20 border border-emerald-400/50"
                                                        : "bg-red-400/20 border border-red-400/50"
                                                        }`}
                                                >
                                                    <span className="font-semibold text-white/90">Rendu</span>
                                                    <span className="font-bold text-lg">{rendu} Ar</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* PAYMENT SECTION */}
                {panier.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md space-y-4">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            <DollarSign size={22} className="text-blue-600 dark:text-blue-400" />
                            Finaliser le paiement
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Type de paiement
                                </label>
                                <select
                                    value={typePaiement}
                                    onChange={(e) => setTypePaiement(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition font-medium"
                                >
                                    <option value="Espèce">Espèce</option>
                                    <option value="Mvola">Mvola</option>
                                    <option value="Orange Money">Orange Money</option>
                                    <option value="Airtel Money">Airtel Money</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Montant payé
                                </label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={payer}
                                    onChange={(e) => setPayer(+e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition text-lg font-semibold"
                                    required
                                />
                            </div>
                        </div>

                        {payer && rendu < 0 && (
                            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 rounded-lg text-red-700 dark:text-red-300">
                                <AlertCircle size={18} />
                                <span className="font-semibold">Montant insuffisant : il manque {Math.abs(rendu)} Ar</span>
                            </div>
                        )}
                    </div>
                )}

                {/* ACTIONS */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 pb-2">
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="order-2 sm:order-1 px-6 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition font-bold text-base"
                        >
                            Annuler
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className={`order-1 sm:order-2 px-8 py-3 rounded-lg font-bold text-white text-base transition-all duration-300 ${canSubmit
                            ? "bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                            : "bg-gray-400 dark:bg-gray-600 opacity-60 cursor-not-allowed"
                            }`}
                    >
                        {!isValidTable
                            ? "Indiquer la table"
                            : panier.length === 0
                                ? "Ajouter un menu"
                                : !payer
                                    ? "Saisir le montant"
                                    : rendu < 0
                                        ? "Montant insuffisant"
                                        : "Valider la commande"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default NouvelleCommande

// Styles CSS personnalisés
const style = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slide-up {
    animation: slideUp 0.3s ease-out;
  }
`

if (typeof document !== "undefined") {
    const styleEl = document.createElement("style")
    styleEl.textContent = style
    document.head.appendChild(styleEl)
}
