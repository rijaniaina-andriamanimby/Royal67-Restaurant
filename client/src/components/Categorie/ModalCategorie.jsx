import { X } from 'lucide-react'
import React from 'react'
import Input from './Input'
import TableCategorie from './TableCategorie'

const ModalCategorie = ({openCategorie, setOpenCategorie}) => {
  return (
    <div className='fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex justify-center p-4 backdrop-blur-sm'>
        <div className="absolute inset-0"  onClick={()=>setOpenCategorie(false)}/>
      
      <div className="relative bg-white dark:bg-slate-800 w-full max-w-3xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-linear-to-r from-blue-600 dark:from-blue-700 to-blue-700 dark:to-blue-800 border-b border-blue-700 dark:border-blue-900">
          <h2 className="text-xl font-bold text-white">Liste des categories</h2>
          <button
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
            onClick={()=>setOpenCategorie(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-70px)] px-6 py-4">
          <Input/>
          <TableCategorie/>
        </div>
      </div>
    </div>
  )
}

export default ModalCategorie
