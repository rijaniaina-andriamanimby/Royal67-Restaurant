import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BiFoodMenu, BiCommand, BiStats, BiMoon, BiSun, BiToggleLeft, BiToggleRight } from 'react-icons/bi'
import { useTheme } from '../context/ThemeContext'
const NavBar = () => {
    const location = useLocation()
    const { theme, toggleTheme } = useTheme()
    const isActive = (path) => {
        if (path == location.pathname) return true
        return false
    }
    return (
        <header className='flex justify-between h-16 bg-blue-500 text-white font-semibold py-2 px-4 items-center dark:bg-blue-950 sticky top-0'>
            <div>
                <Link to={'/'}>TIKO'RESTO</Link>
            </div>
            <nav>
                <ul className='flex gap-5'>
                    <li>
                        <Link to={'/'}
                            className={`${isActive('/') ? 'border-b-2' : ''} flex items-center justify-center gap-2`}
                        >
                            <BiStats size={18} />
                            <span>Statistique</span>
                        </Link>
                    </li>
                    <li>
                        <Link to={'/menu'}
                            className={`${isActive('/menu') ? 'border-b-2' : ''} flex items-center justify-center gap-2`}
                        >
                            <BiFoodMenu size={18} />
                            <span>Menu</span>
                        </Link>
                    </li>
                    <li>
                        <Link to={'/commande'} className={`${isActive('/commande') ? 'border-b-2' : ''} flex items-center justify-center gap-2`}>
                            <BiCommand size={18} />
                            <span>Commande</span></Link>
                    </li>
                </ul>
            </nav>
            <button onClick={toggleTheme} className='flex items-center justify-center gap-2'>
                {
                    theme === 'dark' ? <BiMoon size={18} /> : <BiSun size={18} />
                }
                {
                    theme === 'dark' ? <BiToggleRight size={40} /> : <BiToggleLeft size={40} />
                }
            </button>
        </header>
    )
}

export default NavBar
