import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar'

const BaseLayout = () => {
  return (
    <div className='bg-gray-50 dark:bg-slate-900 min-h-screen'>
      <NavBar/>
      <Outlet/>
    </div>
  )
}

export default BaseLayout
