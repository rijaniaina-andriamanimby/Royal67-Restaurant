import React from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css'
import BaseLayout from './layout/BaseLayout'
import Menu from './pages/Menu'
import Commande from './pages/Commande'

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<BaseLayout/>}>
        <Route index element={<h1>Acceuil</h1>}/>
        <Route path='menu' element={<Menu/>}/>
        <Route path='commande' element={<Commande/>}/>
      </Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App