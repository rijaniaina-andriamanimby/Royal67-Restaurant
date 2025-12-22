import React, { useEffect, useState } from 'react'
import api from '../service/api'

const Menu = () => {
  const [menuList, setMenuList] = useState([])

  const getMenu = async () => {
    const response = await api.get('/menu')
    setMenuList(response.data)
  }

  useEffect(() => {
    getMenu()
  }, [])

  return (
    <div>
      
    </div>
  )
}

export default Menu
