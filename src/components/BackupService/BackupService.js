import React, { useState } from 'react';
import styles from './BackupService.module.scss';

const BackupService = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Ajoutez ici la logique d'envoi du formulaire
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className={styles.container} id="entreprises-sap">
      <div className={styles.header}>
        <h2>Fiche de contact pour les entreprises SAP</h2>
        <div className={styles.features}>
          <div className={styles.featureItem}>
            <div className={styles.dot}></div>
            <span className={styles.featureText}>Service de garde d'enfants</span>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.dot}></div>
            <span className={styles.featureText}>Intervention rapide</span>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.dot}></div>
            <span className={styles.featureText}>Éragny et alentours (30km)</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <input
              type="text"
              name="name"
              placeholder="Nom"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.input}
            />
            <input
              type="email"
              name="email"
              placeholder="Email professionnel"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          
          <input
            type="text"
            name="company"
            placeholder="Nom de l'entreprise"
            value={formData.company}
            onChange={handleChange}
            required
            className={styles.input}
          />
          
          <textarea
            name="message"
            placeholder="Votre message"
            value={formData.message}
            onChange={handleChange}
            required
            className={styles.textarea}
          />
          
          <button type="submit" className={styles.button}>
            Envoyer la demande
          </button>
        </form>
      </div>
    </div>
  );
};

export default BackupService;