import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import BaseLayout from './layout/BaseLayout'
import { ThemeProvider } from './context/ThemeContext'

const Menu = lazy(() => import('./pages/Menu'))
const Commande = lazy(() => import('./pages/Commande'))
const Statistique = lazy(() => import('./pages/Statistique'))
const NouvelleCommande = lazy(() => import('./components/Commande/NouvelleCommande'))

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        }>
          <Routes>
            <Route path='/' element={<BaseLayout />}>
              <Route index element={<Statistique/>} />
              <Route path='menu' element={<Menu />} />
              <Route path='commande' element={<Commande />} />
              <Route path='commande/nouvelle' element={<NouvelleCommande/>}/>
            </Route>
          </Routes>
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App