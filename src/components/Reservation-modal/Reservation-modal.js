import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import styles from './ChildcareReservationModal.module.scss';
import emailjs from 'emailjs-com';


const API_KEY = 'a9463cb081434344b0a3e1e0ab8b5a33';
const ERAGNY_COORDINATES = { lat: 49.0139, lng: 2.1003 };
const HOURLY_RATE = 25;
const stripePromise = loadStripe('pk_test_51QaCU0D3vO200331APFyPB7HE6sL7VVyk2xLTne2Lioz6DM49rhnd4Q01ezwiCWlD7bmVCXVQ2ze1knBU66xUDi200UZm4Z6Rk');

const ReservationModal = ({ isOpen, onClose, onSubmit, selectedService }) => {
  const [step, setStep] = useState(0);
  const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
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
    specialNeeds: '',
    paymentMethod: '',
    clientType: '', // Ajouter ce nouveau champ
    companyName: '', // Pour les entreprises
    siret: '', // Pour les entreprises
    totalPrice: 0,
  });
  const [addressError, setAddressError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const calculatePrice = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startInMinutes = startHours * 60 + startMinutes;
    const endInMinutes = endHours * 60 + endMinutes;

    if (endInMinutes <= startInMinutes) return 0;

    const durationInHours = (endInMinutes - startInMinutes) / 60;
    const price = Math.ceil(durationInHours * HOURLY_RATE);

    console.log(`Start Time: ${startTime}, End Time: ${endTime}, Duration in Hours: ${durationInHours}, Price: ${price}`);

    return price;
  };


  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
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
    {
      title: "Mode de paiement",
      fields: [
        {
          name: "paymentMethod",
          label: "Choisissez votre mode de paiement",
          type: "radio",
          options: [
            { value: "card", label: "Paiement par carte avant la prestation" },
            { value: "cash", label: "Paiement en espèces après la prestation" },
            { value: "sap", label: "Paiement en fin de mois (Entreprises SAP)" }
          ]
        },
      ]
    }
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
      title: "Type de client",
      fields: [
        {
          name: "clientType",
          label: "Vous êtes",
          type: "radio",
          options: [
            { value: "particular", label: "Un particulier" },
            { value: "company", label: "Une entreprise" }
          ]
        }
      ]
    },
    // Questions spécifiques pour les entreprises
    ...(formData.clientType === 'company' ? [
      {
        title: "Informations de l'entreprise",
        fields: [
          { name: "companyName", label: "Nom de l'entreprise", type: "text" },
          { name: "siret", label: "Numéro SIRET", type: "text" },
          { name: "email", label: "Email professionnel", type: "email" },
          { name: "telephone", label: "Numéro de téléphone", type: "tel" },
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
      }
    ] : [
      // Questions pour les particuliers (existantes)
      {
        title: "Informations sur le parent",
        fields: [
          { name: "prenomParent", label: "Prénom du parent", type: "text" },
          { name: "nomParent", label: "Nom du parent", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "telephone", label: "Numéro de téléphone", type: "tel" },
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
        title: "Mode de paiement",
        fields: [
          {
            name: "paymentMethod",
            label: "Choisissez votre mode de paiement",
            type: "radio",
            options: [
              { value: "card", label: "Paiement par carte avant la prestation" },
              { value: "cash", label: "Paiement en espèces après la prestation" }
            ]
          },
        ]
      }
    ])
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
      specialNeeds: '',
      clientType: '',
      companyName: '',
      siret: '',
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

  useEffect(() => {
    emailjs.init("SPeSZLBDJLWstqlcr");
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'guardDate') {
      const [day, month, year] = value.split('/');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
        guardDateISO: isoDate
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
        ...(name === 'paymentMethod' && value !== 'sap' ? { companyName: '', siret: '' } : {})
      }));
    }

    if (name === 'startTime' || name === 'endTime') {
      validateTime(name, value);

      const newPrice = calculatePrice(
        name === 'startTime' ? value : formData.startTime,
        name === 'endTime' ? value : formData.endTime
      );

      setTotalPrice(newPrice);

      // Log the updated total price
      console.log(`Updated Total Price: ${newPrice}`);
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
    setFormData(prevState => ({ ...prevState, childrenDetails: updatedChildrenDetails }));
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
          ERAGNY_COORDINATES.lat,
          ERAGNY_COORDINATES.lng,
          geometry.lat,
          geometry.lng
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

  const handleStripePayment = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: selectedService,
          totalPrice: totalPrice,
          ...formData, // Inclure toutes les données du formulaire
        }),
      });
  
      const { id } = await response.json();
  
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: id
      });
  
      if (error) {
        console.error('Erreur Stripe:', error);
      }
    } catch (error) {
      console.error('Erreur paiement:', error);
    }
  };
  

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isStepValid()) {
      try {
        const formattedChildrenDetails = formData.childrenDetails.map((child, index) =>
          `Enfant ${index + 1} : Prénom - ${child.prenom}, Nom - ${child.nom}, Age - ${child.age}`
        ).join('\n');
  
        const templateParams = {
          ...formData,
          formattedChildrenDetails,
          selectedService,
          totalPrice
        };
  
        // Envoyer l'email de confirmation
        const response = await emailjs.send("service_r0hs8xr", "template_gg6ezb8", templateParams);
        
        if (response.status === 200) {
          // Vérifier le mode de paiement
          if (formData.paymentMethod === 'cash') {
            setShowConfirmationModal(true); // Afficher la modal de confirmation pour paiement en espèces
            setTimeout(() => {
              setShowConfirmationModal(false);
              onClose(); // Fermer la modal principale après un délai
            }, 3000);
          } else if (formData.paymentMethod === 'card') {
            await handleStripePayment(); // Rediriger vers Stripe pour le paiement par carte
          }
        } else {
          console.error('Erreur d\'envoi avec EmailJS:', response);
        }
      } catch (error) {
        console.error('Erreur lors de la soumission:', error);
      }
    }
  };
  

  
  
  const handleCloseConfirmation = () => {
    setShowConfirmationModal(false);
    onClose();
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
  const ConfirmationModal = ({ onClose }) => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Confirmation de réservation</h2>
        <p>Votre demande de réservation a bien été prise en compte !</p>
        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );

  const currentQuestion = questions[step];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>✖</button>
        <h2>Réservation - {selectedService}</h2>
        {showConfirmationModal && <ConfirmationModal onClose={handleCloseConfirmation} />}
        <form onSubmit={handleSubmit}>
          <h3>{currentQuestion.title}</h3>
          {currentQuestion.fields.map((field, index) => {
            if (field.condition && !field.condition(formData)) {
              return null;
            }
            return (
              <div key={index} className={styles.formRow}>
                <label htmlFor={field.name}>{field.label}</label>
                {field.type === 'radio' ? (
                  <div className={styles.radioGroup}>
                    {field.options.map(option => (
                      <div key={option.value} className={styles.radioOption}>
                        <input
                          type="radio"
                          id={option.value}
                          name={field.name}
                          value={option.value}
                          checked={formData[field.name] === option.value}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor={option.value}>{option.label}</label>
                      </div>
                    ))}
                  </div>
                ) : field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                  />
                ) : field.type === 'date' ? (
                  <div>
                    <input
                      id={field.name}
                      type="date"
                      name={field.name}
                      value={formData[`${field.name}ISO`] || ''}
                      onChange={(e) => {
                        const isoDate = e.target.value;
                        const formattedDate = formatDate(isoDate);
                        handleChange({
                          target: {
                            name: field.name,
                            value: formattedDate
                          }
                        });
                        setFormData(prevState => ({
                          ...prevState,
                          [`${field.name}ISO`]: isoDate
                        }));
                      }}
                      min={getTomorrow()}
                      required
                    />
                    <span>{formData[field.name]}</span>
                  </div>
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

            );
          })}
          {currentQuestion.fields.some(field => field.type === 'time') && formData.startTime && formData.endTime && !timeError && (
            <div className={styles.priceInfo}>
              <p>Tarif horaire : {HOURLY_RATE}€/heure</p>
              <p>Prix total estimé : {totalPrice}€</p>
            </div>
          )}
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
                {formData.paymentMethod === 'card' ? 'Réserver et procéder au paiement' : 'Réserver'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );

};

export default ReservationModal;