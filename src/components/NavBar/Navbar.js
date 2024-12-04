import React, { useState } from 'react';
import styles from './Navbar.module.scss';
import logo from '../../Assets/images/logo2.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <a href="/" className={styles.logo}>
          <img src={logo} alt="Logo de l'entreprise" />
        </a>
      </div>
      <div className={`${styles.navbarRight} ${isOpen ? styles.open : ''}`}>
        <button className={`${styles.menuButton} ${isOpen ? styles.active : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul className={styles.navLinks}>
          <li><a href="#a-propos" onClick={toggleMenu}>À propos</a></li>
          <li><a href="#reservation-particuliers" onClick={toggleMenu}>Réservation particuliers</a></li>
          <li><a href="#entreprises-sap" onClick={toggleMenu}>Entreprises SAP</a></li>
          <li><a href="#footer" onClick={toggleMenu}>Contact</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;