import React from 'react'
import { Link } from 'react-router-dom'

const NavBar = () => {
  return (
    <header>
        <Link to={'/'}>Restaurant</Link>
        <nav>
            <ul>
                <li>
                    <Link to={'/menu'}>Menu</Link>
                </li>
                <li>
                    <Link to={'/commande'}>Commande</Link>
                </li>
            </ul>
        </nav>
    </header>
  )
}

export default NavBar
