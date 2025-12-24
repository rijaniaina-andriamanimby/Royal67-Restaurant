import { useState } from "react"
import { BiStats, BiFoodMenu, BiCommand, BiMoon, BiSun, BiMenu, BiX } from "react-icons/bi"
import { useTheme } from '../context/ThemeContext'
import { Link, useLocation } from "react-router-dom"

const NavBar = () => {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const isActive = (path) => {
    if (path == location.pathname) return true
    return false
  }
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Statistique", icon: BiStats },
    { href: "/menu", label: "Menu", icon: BiFoodMenu },
    { href: "/commande", label: "Commande", icon: BiCommand },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-linear-to-br from-blue-600 to-blue-500 shadow-lg dark:from-blue-900 dark:to-blue-950">
      <nav className="flex items-center justify-between px-6 py-4 md:px-8">
        <div className="flex items-center gap-2">
          <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <BiX size={24} /> : <BiMenu size={24} />}
        </button>
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">TIKO'RESTO</span>
        </div>
        

        <ul className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive(item.href)
                      ? "bg-white/20 text-white backdrop-blur-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <BiMoon size={20} /> : <BiSun size={20} />}
        </button>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-700 border-t border-blue-400/30">
          <ul className="flex flex-col gap-1 px-4 py-3">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive(item.href)
                      ? "bg-white/20 text-white backdrop-blur-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

    </header>
  )
}

export default NavBar
