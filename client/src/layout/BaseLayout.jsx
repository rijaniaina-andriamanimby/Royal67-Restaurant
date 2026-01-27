import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { ToastContainer } from 'react-toastify'

const BaseLayout = () => {
  return (
    <div className='bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors'>
      <NavBar />
      <Outlet />
      <ToastContainer
        position="bottom-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  )
}

export default BaseLayout
