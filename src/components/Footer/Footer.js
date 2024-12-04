import React from 'react';
import styles from './Footer.module.scss'; // Importez le module CSS
import logoDev from '../../Assets/images/logoPikcel.svg'; // Assurez-vous d'avoir cette image

const Footer = () => {
  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogo}>
        <h2>
        {/* <span style={{ marginRight: '8px', verticalAlign: 'middle' }}>🕒</span> */}
        Express Nounou
      </h2>
        </div>
        <nav className={styles.footerNav}>
          <ul>
            <li><a href="#services">Nos Services</a></li>
            <li><a href="#about">À Propos</a></li>
            <li><a href="#contact">Contactez-Nous</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </nav>
        <div className={styles.footerContact}>
          <p>Contactez-nous : 01 23 45 67 89</p>
          <p>Email : contact@expressnounou.fr</p>
        </div>
        <div className={styles.legalMentions}>
          <h3>Mentions Légales</h3>
          <p>Pour plus d'informations sur nos conditions d'utilisation et notre politique de confidentialité, veuillez consulter nos mentions légales.</p>
          <p><a href="#mentions-legales">Voir les mentions légales</a></p>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} Express Nounou. Tous droits réservés.</p>
        <div className={styles.devInfo}>
          <span className={styles.devText}>Site réalisé par </span>
          <img src={logoDev} alt="Logo du développeur" className={styles.logoDev} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;