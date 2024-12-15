import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ChildcareReservationModal.module.scss';
import useDebounce from '../../Hooks/useDebounce';

const API_KEY = 'a9463cb081434344b0a3e1e0ab8b5a33'; // Remplacez par votre clé API

const ReservationModal = ({ isOpen, onClose, onSubmit, selectedService }) => {
  const [step, setStep] = useState(0);
  const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(false);
  const [formData, setFormData] = useState({
    parentFirstName: '',
    parentLastName: '',
    numberOfChildren: 1, // Nombre d'enfants sélectionné
    childrenDetails: [
      { firstName: '', lastName: '', age: '' }
    ],
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
  const [addressError, setAddressError] = useState(''); // Pour afficher les erreurs de validation d'adresse

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Modifications conditionnelles en fonction du service sélectionné
  const questions = selectedService === 'Aide ménagère' ? [
    {
      title: "Adresse",
      fields: [
        { name: "address", label: "Adresse", type: "text" },
        { name: "city", label: "Ville", type: "text" },
        { name: "postalCode", label: "Code postal", type: "text" },
      ]
    },
    {
      title: "Date et horaires de la prestation",
      fields: [
        { name: "guardDate", label: "Date de prestation", type: "date" },
        { name: "startTime", label: "Heure de début", type: "time" },
        { name: "endTime", label: "Heure de fin", type: "time" },
      ]
    },
  ] : [
    {
      title: "Adresse",
      fields: [
        { name: "address", label: "Adresse", type: "text" },
        { name: "city", label: "Ville", type: "text" },
        { name: "postalCode", label: "Code postal", type: "text" },
      ]
    },
    {
      title: "Informations sur les enfants",
      fields: [
        { name: "numberOfChildren", label: "Nombre d'enfants", type: "number" },
        { name: "childrenDetails", label: "Détails des enfants", type: "children" }
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
      numberOfChildren: 1,
      childrenDetails: [{ firstName: '', lastName: '', age: '' }],
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
    setAddressError('');
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

  const handleChildDetailsChange = (index, field, value) => {
    const updatedChildrenDetails = [...formData.childrenDetails];
    updatedChildrenDetails[index][field] = value;
    setFormData(prevState => ({
      ...prevState,
      childrenDetails: updatedChildrenDetails
    }));
  };

  const renderChildrenFields = () => {
    return [...Array(Number(formData.numberOfChildren))].map((_, index) => (
      <div key={index} className={styles.formRow}>
        <h4>Enfant {index + 1}</h4>
        <label htmlFor={`childFirstName-${index}`}>Prénom</label>
        <input
          id={`childFirstName-${index}`}
          type="text"
          value={formData.childrenDetails[index]?.firstName || ''}
          onChange={(e) => handleChildDetailsChange(index, 'firstName', e.target.value)}
          required
        />

        <label htmlFor={`childLastName-${index}`}>Nom</label>
        <input
          id={`childLastName-${index}`}
          type="text"
          value={formData.childrenDetails[index]?.lastName || ''}
          onChange={(e) => handleChildDetailsChange(index, 'lastName', e.target.value)}
          required
        />

        <label htmlFor={`childAge-${index}`}>Âge</label>
        <input
          id={`childAge-${index}`}
          type="number"
          value={formData.childrenDetails[index]?.age || ''}
          onChange={(e) => handleChildDetailsChange(index, 'age', e.target.value)}
          required
        />
      </div>
    ));
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

  const isStepValid = () => {
    const currentFields = questions[step].fields;

    return currentFields.every(field => {
      const value = formData[field.name];

      if (field.type === 'children') {
        const childrenDetails = formData.childrenDetails;
        return childrenDetails.every(child => 
          child.firstName.trim() !== '' && child.lastName.trim() !== '' && child.age !== ''
        );
      }

      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      if (typeof value === 'number') {
        return !isNaN(value) && value !== '';
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== '' && value !== null && value !== undefined;
    });
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
              ) : field.type === 'date' ? (
                <input
                  id={field.name}
                  type="date"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  min={getTomorrow()}
                  required
                />
              ) : field.type === 'children' ? (
                renderChildrenFields()
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
          {step === 0 && addressError && (
            <p className={styles.errorMessage}>{addressError}</p>
          )}
          <div className={styles.formActions}>
            {step > 0 && (
              <button type="button" onClick={handlePrevious}>Précédent</button>
            )}
            {step < questions.length - 1 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                disabled={!isNextButtonEnabled}
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                className={`submitButton ${!isNextButtonEnabled ? 'disabled' : 'enabled'}`}
                disabled={!isNextButtonEnabled}
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
