import React from 'react'
import { Outlet } from 'react-router-dom'

const BaseLayout = () => {
  return (
    <div>
      <h1>Hey</h1>
      <Outlet/>
    </div>
  )
}

export default BaseLayout
