import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import BaseLayout from './layout/BaseLayout'
import Menu from './pages/Menu'
import Commande from './pages/Commande'
import { ThemeProvider } from './context/ThemeContext'
import Statistique from './pages/Statistique'
import NouvelleCommande from './components/Commande/NouvelleCommande'

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path='/' element={<BaseLayout />}>
            <Route index element={<Statistique/>} />
            <Route path='menu' element={<Menu />} />
            <Route path='commande' element={<Commande />} />
            <Route path='commande/nouvelle' element={<NouvelleCommande/>}/>
          </Route>
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App