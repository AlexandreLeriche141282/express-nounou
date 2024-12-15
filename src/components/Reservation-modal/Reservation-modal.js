import React, { useState, useEffect } from 'react';
import styles from './ChildcareReservationModal.module.scss';

const ReservationModal = ({ isOpen, onClose, onSubmit, selectedService }) => {
  const [step, setStep] = useState(0);
  const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(false);
  const [formData, setFormData] = useState({
    parentFirstName: '',
    parentLastName: '',
    childAge: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    guardDate: '',
    startTime: '',
    endTime: '',
    specialNeeds: ''
  });

  const questions = [
    {
      title: "Adresse",
      fields: [
        { name: "address", label: "Adresse", type: "text" },
        { name: "city", label: "Ville", type: "text" },
        { name: "postalCode", label: "Code postal", type: "text" },
      ]
    },
    {
      title: "Informations sur l'enfant",
      fields: [
        { name: "childAge", label: "Âge de l'enfant", type: "number" },
      ]
    },
    {
      title: "Date et horaires de la garde",
      fields: [
        { name: "guardDate", label: "Date de garde", type: "date" },
        { name: "startTime", label: "Heure de début", type: "time" },
        { name: "endTime", label: "Heure de fin", type: "time" },
        { name: "specialNeeds", label: "Besoins spécifiques ou commentaires", type: "textarea" },
      ]
    },
    {
      title: "Informations sur le parent",
      fields: [
        { name: "parentFirstName", label: "Prénom du parent", type: "text" },
        { name: "parentLastName", label: "Nom du parent", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Numéro de téléphone", type: "tel" },
      ]
    },
  ];

  const resetForm = () => {
    setStep(0);
    setFormData({
      parentFirstName: '',
      parentLastName: '',
      childAge: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      guardDate: '',
      startTime: '',
      endTime: '',
      specialNeeds: ''
    });
    setIsNextButtonEnabled(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, selectedService]);

  useEffect(() => {
    setIsNextButtonEnabled(isStepValid());
  }, [formData, step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const isStepValid = () => {
    const currentFields = questions[step].fields;
    return currentFields.every(field => formData[field.name].trim() !== '');
  };

  const handleNext = () => {
    if (isStepValid()) {
      setStep(prevStep => prevStep + 1);
    }
  };

  const handlePrevious = () => {
    setStep(prevStep => prevStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isStepValid()) {
      onSubmit({ service: selectedService, ...formData });
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentQuestion = questions[step];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>✖</button>
        <h2>Réservation - {selectedService}</h2>
        <form onSubmit={handleSubmit}>
          <h3>{currentQuestion.title}</h3>
          {currentQuestion.fields.map((field, index) => (
            <div key={index} className={styles.formRow}>
              <label htmlFor={field.name}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              ) : (
                <input
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              )}
            </div>
          ))}
          <div className={styles.formActions}>
            {step > 0 && (
              <button type="button" onClick={handlePrevious}>Précédent</button>
            )}
            {step < questions.length - 1 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                disabled={!isNextButtonEnabled}
                className={`${styles.nextButton} ${isNextButtonEnabled ? styles.enabled : styles.disabled}`}
              >
                Suivant
              </button>
            ) : (
              <button 
                type="submit"
                disabled={!isNextButtonEnabled}
                className={`${styles.submitButton} ${isNextButtonEnabled ? styles.enabled : styles.disabled}`}
              >
                Réserver
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
