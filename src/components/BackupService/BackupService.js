import React, { useState } from 'react';
import styles from './BackupService.module.scss';

const BackupService = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Envoi des données au serveur Formspree
    try {
      const response = await fetch('https://formspree.io/f/xvggayvz', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmissionStatus('Votre message a été envoyé avec succès !');
        // Réinitialiser le formulaire
        setFormData({
          name: '',
          email: '',
          company: '',
          message: ''
        });
      } else {
        setSubmissionStatus('Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du formulaire:', error);
      setSubmissionStatus('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Autres éléments */}
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
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
          
          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
          </button>
        </form>
        
        {submissionStatus && <p>{submissionStatus}</p>}
      </div>
    </div>
  );
};

export default BackupService;
