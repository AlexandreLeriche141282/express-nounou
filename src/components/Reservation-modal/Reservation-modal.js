import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ChildcareReservationModal.module.scss';

const API_KEY = 'a9463cb081434344b0a3e1e0ab8b5a33';
const ERAGNY_COORDINATES = { lat: 49.0139, lng: 2.1003 };

const ReservationModal = ({ isOpen, onClose, onSubmit, selectedService }) => {
  const [step, setStep] = useState(0);
  const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(false);
  const [formData, setFormData] = useState({
    prenomParent: '',
    nomParent: '',
    nombreEnfants: 1,
    childrenDetails: [{ prenom: '', nom: '', age: '' }],
    email: '',
    telephone: '',
    addresse: '',
    city: '',
    postalCode: '',
    guardDate: '',
    startTime: '',
    endTime: '',
    specialNeeds: ''
  });
  const [addressError, setAddressError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const questions = selectedService === 'Aide ménagère' ? [
    {
      title: "Adresse",
      fields: [
        { name: "addresse", label: "Adresse", type: "text" },
        { name: "city", label: "Ville", type: "text" },
        { name: "postalCode", label: "Code postal", type: "text" },
      ]
    },
    {
      title: "Date et horaires de la prestation",
      fields: [
        { name: "guardDate", label: "Date de prestation", type: "date" },
        { name: "startTime", label: "Heure de début", type: "time", min: "05:00", max: "23:30" },
        { name: "endTime", label: "Heure de fin", type: "time", min: "05:00", max: "23:30" },
      ]
    },
  ] : [
    {
      title: "Adresse",
      fields: [
        { name: "addresse", label: "Adresse", type: "text" },
        { name: "city", label: "Ville", type: "text" },
        { name: "postalCode", label: "Code postal", type: "text" },
      ]
    },
    {
      title: "Informations sur les enfants",
      fields: [
        { name: "nombreEnfants", label: "Nombre d'enfants", type: "number" },
        { name: "childrenDetails", label: "Détails des enfants", type: "children" }
      ]
    },
    {
      title: "Date et horaires de la garde",
      fields: [
        { name: "guardDate", label: "Date de garde", type: "date" },
        { name: "startTime", label: "Heure de début", type: "time", min: "05:00", max: "23:30" },
        { name: "endTime", label: "Heure de fin", type: "time", min: "05:00", max: "23:30" },
        { name: "specialNeeds", label: "Veuillez préciser votre besoin", type: "textarea" },
      ]
    },
    {
      title: "Informations sur le parent",
      fields: [
        { name: "prenomParent", label: "Prénom du parent", type: "text" },
        { name: "nomParent", label: "Nom du parent", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "telephone", label: "Numéro de téléphone", type: "tel" },
      ]
    },
  ];

  const resetForm = () => {
    setStep(0);
    setFormData({
      prenomParent: '',
      nomParent: '',
      nombreEnfants: 1,
      childrenDetails: [{ prenom: '', nom: '', age: '' }],
      email: '',
      telephone: '',
      addresse: '',
      city: '',
      postalCode: '',
      guardDate: '',
      startTime: '',
      endTime: '',
      specialNeeds: ''
    });
    setIsNextButtonEnabled(false);
    setAddressError('');
    setTimeError('');
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  useEffect(() => {
    setIsNextButtonEnabled(isStepValid());
  }, [formData, step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    if (name === 'nombreEnfants') {
      const nombreEnfants = parseInt(value, 10) || 0;
      const updatedDetailsEnfants = [...formData.childrenDetails];
      while (updatedDetailsEnfants.length < nombreEnfants) {
        updatedDetailsEnfants.push({ prenom: '', nom: '', age: '' });
      }
      updatedDetailsEnfants.length = nombreEnfants;
      setFormData(prevState => ({
        ...prevState,
        childrenDetails: updatedDetailsEnfants
      }));
    }

    if (name === 'startTime' || name === 'endTime') {
      validateTime(name, value);
    }
  };

  const validateTime = (field, time) => {
    const [hours, minutes] = time.split(':');
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);

    if (totalMinutes < 5 * 60 || totalMinutes > 23 * 60 + 30) {
      setTimeError(`Les horaires doivent être entre 5h00 et 23h30.`);
    } else {
      setTimeError('');
    }
  };

  const handleChildDetailsChange = (index, field, value) => {
    const updatedChildrenDetails = [...formData.childrenDetails];
    updatedChildrenDetails[index][field] = value;
    setFormData(prevState => ({
      ...prevState,
      childrenDetails: updatedChildrenDetails
    }));
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRadians = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const validateAddressWithGeolocation = async () => {
    const { addresse, city, postalCode } = formData;
    if (!addresse || !city || !postalCode) {
      setAddressError("Veuillez remplir tous les champs de l'adresse.");
      return false;
    }
    try {
      const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
        params: {
          q: `${addresse}, ${city}, ${postalCode}`,
          key: API_KEY,
          language: 'fr',
          pretty: 1,
        },
      });
      const { results } = response.data;
      if (results && results.length > 0) {
        const { geometry } = results[0];
        const distance = calculateDistance(
          ERAGNY_COORDINATES.lat, ERAGNY_COORDINATES.lng,
          geometry.lat, geometry.lng
        );
        if (distance > 30) {
          setAddressError(`L'adresse est située à ${Math.round(distance)} km d'Éragny, au-delà de la limite de 30 km.`);
          return false;
        }
        setAddressError('');
        return true;
      } else {
        setAddressError("L'adresse saisie est introuvable. Veuillez vérifier les informations.");
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la validation de l\'adresse :', error);
      setAddressError("Une erreur s'est produite lors de la vérification de l'adresse.");
      return false;
    }
  };

  const handleNext = async () => {
    if (step === 0) {
      const isAddressValid = await validateAddressWithGeolocation();
      if (!isAddressValid) return;
    }
    if (isStepValid()) {
      setStep(prevStep => prevStep + 1);
    }
  };

  const handlePrevious = () => {
    setStep(prevStep => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isStepValid()) {
      try {
        const response = await axios.post('https://formspree.io/f/xanygezw', formData);
        if (response.status === 200) {
          setShowConfirmation(true);
          setTimeout(() => {
            setShowConfirmation(false);
            onSubmit({ service: selectedService, ...formData });
            onClose();
          }, 3000); // Close after 3 seconds
        } else {
          console.error('Erreur d\'envoi vers Formspree:', response);
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi vers Formspree:', error);
      }
    }
  };

  const isStepValid = () => {
    const currentFields = questions[step].fields;
    return currentFields.every(field => {
      const value = formData[field.name];
      if (field.name === 'specialNeeds') {
        return true;
      }
      if (field.type === 'children') {
        const childrenDetails = formData.childrenDetails;
        return childrenDetails.every(child =>
          child.prenom.trim() !== '' &&
          child.nom.trim() !== '' &&
          child.age !== ''
        );
      }
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'number') return !isNaN(value) && value !== '';
      if (Array.isArray(value)) return value.length > 0;
      return value !== '' && value !== null && value !== undefined;
    }) && !timeError;
  };

  const renderChildrenFields = () => {
    return [...Array(Number(formData.nombreEnfants))].map((_, index) => (
      <div key={index} className={styles.formRow}>
        <h4>Enfant {index + 1}</h4>
        <label htmlFor={`childFirstName-${index}`}>Prénom</label>
        <input
          id={`childFirstName-${index}`}
          type="text"
          value={formData.childrenDetails[index]?.prenom || ''}
          onChange={(e) => handleChildDetailsChange(index, 'prenom', e.target.value)}
          required
        />
        <label htmlFor={`childLastName-${index}`}>Nom</label>
        <input
          id={`childLastName-${index}`}
          type="text"
          value={formData.childrenDetails[index]?.nom || ''}
          onChange={(e) => handleChildDetailsChange(index, 'nom', e.target.value)}
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

  if (!isOpen) return null;

  const currentQuestion = questions[step];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>✖</button>
        <h2>Réservation - {selectedService}</h2>
        {showConfirmation && (
          <div className={styles.confirmationMessage}>
            <p>Votre demande de réservation a bien été prise en compte !</p>
          </div>
        )}
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
              ) : field.type === 'time' ? (
                <input
                  id={field.name}
                  type="time"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  min={field.min}
                  max={field.max}
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
          {timeError && (
            <p className={styles.errorMessage}>{timeError}</p>
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
