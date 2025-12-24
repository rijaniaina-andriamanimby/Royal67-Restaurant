import React from 'react'
import { BiX } from 'react-icons/bi'
import CommandeForm from './CommandeForm'

const CommandeModal = ({ onClose, setCommandes }) => {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">

            {/* zone cliquable pour fermer */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* contenu modal */}
            <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-xl overflow-hidden">

                {/* header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold">Nouvelle commande</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500"
                    >
                        <BiX size={24} />
                    </button>
                </div>

                {/* body scrollable */}
                <div className="overflow-y-auto max-h-[calc(90vh-70px)] px-6 py-4">
                    <CommandeForm onClose={onClose} setCommandes={setCommandes} />
                </div>

            </div>
        </div>
    )
}

export default CommandeModal
