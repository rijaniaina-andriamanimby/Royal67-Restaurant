import React from 'react'
import MenuForm from './MenuForm'
import { BiX } from 'react-icons/bi'

const MenuModal = ({ onClose, menu, setMenuList }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative animate-fade">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          <BiX size={24} />
        </button>

        <MenuForm
          menu={menu}
          setMenuList={setMenuList}
          onClose={onClose}
        />
      </div>
    </div>
  )
}

export default MenuModal
