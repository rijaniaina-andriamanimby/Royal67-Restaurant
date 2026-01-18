import MenuForm from "./MenuForm"
import { X } from "lucide-react"

const MenuModal = ({ onClose, menu, setMenuList, categories }) => {
  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
        >
          <X size={24} />
        </button>

        <MenuForm menu={menu} setMenuList={setMenuList} onClose={onClose} categorieList={categories} />
      </div>
    </div>
  )
}

export default MenuModal