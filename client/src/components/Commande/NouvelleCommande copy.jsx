import { useEffect, useState } from "react"
import api from "../../service/api"
import { Plus, Minus, Trash2, ArrowLeft } from "lucide-react"
import { BiLeftArrow } from "react-icons/bi"

const NouvelleCommande = () => {
    const [menusList, setMenusList] = useState([])
    const [menus, setMenus] = useState([])
    const [categories, setCategories] = useState([])
    const [categorieSelected, setCategorieSelected] = useState(0)

    const [panier, setPanier] = useState([])
    const [nomTable, setNomTable] = useState("")
    const [payer, setPayer] = useState(0)
    const [typePaiement, setTypePaiement] = useState("Espèce")

    useEffect(() => {
        api.get("/menu").then(res => {
            setMenusList(res.data)
            setMenus(res.data)
        })
        api.get("/categorie").then(res => setCategories(res.data))
    }, [])

    useEffect(() => {
        if (categorieSelected === 0) {
            setMenus(menusList)
        } else {
            setMenus(menusList.filter(m => m.categorie === categorieSelected))
        }
    }, [categorieSelected, menusList])

    const addToPanier = (menu) => {
        const exist = panier.find(p => p.idMenu === menu.id)
        if (exist) {
            setPanier(prev =>
                prev.map(p =>
                    p.idMenu === menu.id ? { ...p, quantite: p.quantite + 1 } : p
                )
            )
        } else {
            setPanier(prev => [
                ...prev,
                { idMenu: menu.id, nom: menu.nom, prix: menu.prix, quantite: 1 }
            ])
        }
    }

    const updateQty = (idMenu, qte) => {
        if (qte < 1) return
        setPanier(prev =>
            prev.map(p => (p.idMenu === idMenu ? { ...p, quantite: qte } : p))
        )
    }

    const removeItem = (idMenu) => {
        setPanier(prev => prev.filter(p => p.idMenu !== idMenu))
    }

    const total = panier.reduce((s, p) => s + p.prix * p.quantite, 0)
    const rendu = payer - total

    const handleSubmit = async () => {
        await api.post("/commande", {
            nomTable,
            payer,
            rendu,
            typePaiement,
            commandeDetail: panier.map(p => ({
                idMenu: p.idMenu,
                quantite: p.quantite
            }))
        })
        window.history.back()
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
                <button>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold mb-6">Nouvelle Commande</h1>
            </div>

            {/* CATEGORIES TABS */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <button
                    onClick={() => setCategorieSelected(0)}
                    className={`px-4 py-2 rounded-lg ${categorieSelected === 0
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100"
                        }`}
                >
                    Tous
                </button>
                {categories.map(c => (
                    <button
                        key={c.id}
                        onClick={() => setCategorieSelected(c.id)}
                        className={`px-4 py-2 rounded-lg ${categorieSelected === c.id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100"
                            }`}
                    >
                        {c.nom}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* MENUS */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {menus.map(menu => (
                        <button
                            key={menu.id}
                            onClick={() => addToPanier(menu)}
                            className="border rounded-xl p-4 text-left hover:bg-blue-50 transition"
                        >
                            <h3 className="font-semibold">{menu.nom}</h3>
                            <p className="text-blue-600 font-bold">{menu.prix} Ar</p>
                        </button>
                    ))}
                </div>

                {/* PANIER STICKY */}
                <div className="sticky top-6 h-fit bg-white border rounded-xl p-4 space-y-4">
                    <input
                        type="text"
                        placeholder="Nom de la table"
                        value={nomTable}
                        onChange={e => setNomTable(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {panier.map(p => (
                            <div key={p.idMenu} className="flex items-center gap-2">
                                <span className="flex-1">{p.nom}</span>
                                <button onClick={() => updateQty(p.idMenu, p.quantite - 1)}>
                                    <Minus size={14} />
                                </button>
                                <span>{p.quantite}</span>
                                <button onClick={() => updateQty(p.idMenu, p.quantite + 1)}>
                                    <Plus size={14} />
                                </button>
                                <span className="w-16 text-right">
                                    {p.prix * p.quantite} Ar
                                </span>
                                <button onClick={() => removeItem(p.idMenu)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>{total} Ar</span>
                        </div>

                        <input
                            type="number"
                            placeholder="Montant payé"
                            value={payer}
                            onChange={e => setPayer(+e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />

                        <div className="flex justify-between">
                            <span>Rendu</span>
                            <span className={rendu >= 0 ? "text-green-600" : "text-red-600"}>
                                {rendu} Ar
                            </span>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={panier.length === 0 || payer < total}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
                        >
                            Valider la commande
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NouvelleCommande
