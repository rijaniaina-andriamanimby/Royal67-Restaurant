import { Plus } from 'lucide-react'
import React from 'react'

const Input = () => {
    return (
        <div className='flex items-center justify-center gap-2'>
            <input type='text'
                className='w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition'
                name="Categorie"
                placeholder='Ex: Boisson, Soupe, ....' />
            <button
                onClick={() => {}}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex gap-2 items-center justify-center transition-colors font-medium shadow-lg hover:shadow-xl">
                <Plus size={20} />
                Ajouter
            </button>
        </div>
    )
}

export default Input
