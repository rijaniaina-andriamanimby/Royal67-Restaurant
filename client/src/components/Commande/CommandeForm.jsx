import React, { useEffect, useState } from 'react'
import api from '../../service/api'

const CommandeForm = ({ onClose, setCommandes }) => {
    const [menus, setMenus] = useState([])
    const [nomTable, setNomTable] = useState('')
    const [panier, setPanier] = useState([])
    const [payer, setPayer] = useState('')
    const [typePaiement, setTypePaiement] = useState('Espèce')

    /* 🔄 Charger menus */
    useEffect(() => {
        api.get('/menu').then(res => setMenus(res.data))
    }, [])

    /* ➕ Ajouter menu au panier */
    const addToPanier = (menu) => {
        const exist = panier.find(p => p.idMenu === menu.id)
        if (exist) {
            setPanier(prev =>
                prev.map(p =>
                    p.idMenu === menu.id
                        ? { ...p, quantite: p.quantite + 1 }
                        : p
                )
            )
        } else {
            setPanier(prev => [
                ...prev,
                { idMenu: menu.id, nom: menu.nom, prix: menu.prix, quantite: 1 }
            ])
        }
    }

    /* ➖ Modifier quantité */
    const updateQty = (idMenu, qte) => {
        setPanier(prev =>
            prev.map(p =>
                p.idMenu === idMenu ? { ...p, quantite: qte } : p
            )
        )
    }

    /* ❌ Supprimer du panier */
    const removeItem = (idMenu) => {
        setPanier(prev => prev.filter(p => p.idMenu !== idMenu))
    }

    /* 💰 Total */
    const total = panier.reduce((s, p) => s + p.prix * p.quantite, 0)
    const rendu = payer ? payer - total : 0

    /* ✅ Soumission */
    const handleSubmit = async (e) => {
        e.preventDefault()

        const payload = {
            nomTable,
            commandeDetail: panier.map(p => ({
                idMenu: p.idMenu,
                quantite: p.quantite
            })),
            payer,
            rendu,
            typePaiement
        }

        await api.post('/commande', payload)
        onClose()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Nom table */}
            <div>
                <label className="text-sm text-gray-600">Nom de la table</label>
                <input
                    className="border rounded-lg p-2 w-full"
                    placeholder="Table 1"
                    value={nomTable}
                    onChange={e => setNomTable(e.target.value)}
                    required
                />
            </div>

            {/* Layout menus + panier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 🍽 MENUS */}
                <div>
                    <h3 className="font-medium mb-2">Menus</h3>

                    <div className="border rounded-lg p-2 max-h-60 overflow-y-auto grid grid-cols-1 gap-2">
                        {menus.map(menu => (
                            <button
                                type="button"
                                key={menu.id}
                                onClick={() => addToPanier(menu)}
                                className="flex justify-between items-center border rounded p-2 hover:bg-emerald-50 transition"
                            >
                                <span>{menu.nom}</span>
                                <span className="font-semibold">{menu.prix} Ar</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 🛒 PANIER */}
                <div>
                    <h3 className="font-medium mb-2">Panier</h3>

                    <div className="border rounded-lg p-2 space-y-2 max-h-60 overflow-y-auto">
                        {panier.length === 0 && (
                            <p className="text-sm text-gray-400">Aucun menu ajouté</p>
                        )}

                        {panier.map(p => (
                            <div
                                key={p.idMenu}
                                className="flex items-center gap-2 border-b pb-2"
                            >
                                <span className="flex-1">{p.nom}</span>

                                <input
                                    type="number"
                                    min="1"
                                    value={p.quantite}
                                    onChange={e => updateQty(p.idMenu, +e.target.value)}
                                    className="w-14 border rounded p-1"
                                />

                                <span className="font-semibold">
                                    {p.prix * p.quantite} Ar
                                </span>

                                <button
                                    type="button"
                                    onClick={() => removeItem(p.idMenu)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Paiement */}
            <div className="grid grid-cols-2 gap-4">
                <select
                    value={typePaiement}
                    onChange={e => setTypePaiement(e.target.value)}
                    className="border rounded p-2"
                >
                    <option value={'Espèce'}>Espèce</option>
                    <option value={'Mvola'}>Mvola</option>
                    <option value='Orange Money'>Orange Money</option>
                    <option value="Airtel Money">Airtel Money</option>
                </select>

                <input
                    type="number"
                    placeholder="Montant payé"
                    value={payer}
                    onChange={e => setPayer(+e.target.value)}
                    className="border rounded p-2"
                    required
                />
            </div>

            {/* Total */}
            <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{total} Ar</span>
            </div>

            <div className="flex justify-between text-sm">
                <span>Rendu</span>
                <span>{rendu} Ar</span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="border rounded-lg px-4 py-2"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={panier.length === 0 || payer < total}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                    Valider
                </button>
            </div>

        </form>

    )
}

export default CommandeForm
