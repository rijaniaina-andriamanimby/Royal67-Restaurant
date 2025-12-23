import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar'

const BaseLayout = () => {
  return (
    <div className='bg-gray-300 dark:bg-gray-800'>
      <NavBar/>
      <Outlet/>
    </div>
  )
}

export default BaseLayout
