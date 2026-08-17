import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ChildcareReservationModal.module.scss';
import emailjs from 'emailjs-com';
import { SERVICE_RADIUS_KM } from '../../config/serviceArea';


const API_KEY = '4468c4b7d849402486dcf4fba366d260';
const ERAGNY_COORDINATES = { lat: 49.0139, lng: 2.1003 };
const HOURLY_RATE = 29.99;
const MIN_CHILD_AGE = 3;
const MIN_TIME = '06:00';
const MAX_TIME = '23:00';
const MIN_TIME_MINUTES = 6 * 60;
const MAX_TIME_MINUTES = 23 * 60;
const TOMORROW_BOOKING_CUTOFF_HOUR = 17;
const SAME_DAY_MIN_HOURS_AHEAD = 5;

const formatPrice = (price) => price.toFixed(2).replace('.', ',');

const PAYMENT_STEP = {
  title: 'Paiement',
  type: 'payment',
  fields: [],
};

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
    clientType: '',
    companyName: '',
    siret: '',
    totalPrice: 0,
  });
  const [addressError, setAddressError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [dateError, setDateError] = useState('');
  const [ageError, setAgeError] = useState('');
  const [reservationValidated, setReservationValidated] = useState(false);
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false);
  const [reservationError, setReservationError] = useState('');

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


  const toLocalISODate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseISODate = (isoDate) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const isSunday = (isoDate) => parseISODate(isoDate).getDay() === 0;

  const getTodayISO = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return toLocalISODate(today);
  };

  const getTomorrowISO = () => {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toLocalISODate(tomorrow);
  };

  const getMinBookingDateISO = () => {
    const minDate = new Date();
    minDate.setHours(0, 0, 0, 0);
    if (minDate.getDay() === 0) {
      minDate.setDate(minDate.getDate() + 1);
    }
    return toLocalISODate(minDate);
  };

  const validateGuardDate = (isoDate) => {
    if (!isoDate) {
      setDateError('');
      return false;
    }

    if (isSunday(isoDate)) {
      setDateError('Les réservations ne sont pas possibles le dimanche.');
      return false;
    }

    const todayISO = getTodayISO();
    const tomorrowISO = getTomorrowISO();
    const selected = parseISODate(isoDate);
    const today = parseISODate(todayISO);
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selected < today) {
      setDateError('La date sélectionnée est passée.');
      return false;
    }

    if (isoDate === tomorrowISO) {
      const now = new Date();
      if (now.getHours() >= TOMORROW_BOOKING_CUTOFF_HOUR) {
        setDateError('La réservation pour demain est possible jusqu\'à 17h.');
        return false;
      }
    }

    setDateError('');
    return true;
  };

  const validateSameDayStartTime = (isoDate, startTime) => {
    if (!isoDate || !startTime || isoDate !== getTodayISO()) {
      return true;
    }

    const now = new Date();
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDateTime = new Date();
    startDateTime.setHours(hours, minutes, 0, 0);
    const minStartTime = new Date(now.getTime() + SAME_DAY_MIN_HOURS_AHEAD * 60 * 60 * 1000);

    if (startDateTime < minStartTime) {
      setTimeError(
        `Pour une garde le jour même, la réservation doit être faite au minimum ${SAME_DAY_MIN_HOURS_AHEAD} heures avant le début de la garde.`
      );
      return false;
    }

    return true;
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
        { name: "startTime", label: "Heure de début", type: "time", min: MIN_TIME, max: MAX_TIME },
        { name: "endTime", label: "Heure de fin", type: "time", min: MIN_TIME, max: MAX_TIME },
      ]
    },
    PAYMENT_STEP,
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
          { name: "startTime", label: "Heure de début", type: "time", min: MIN_TIME, max: MAX_TIME },
          { name: "endTime", label: "Heure de fin", type: "time", min: MIN_TIME, max: MAX_TIME },
          { name: "specialNeeds", label: "Veuillez préciser votre besoin", type: "textarea" },
        ]
      },
      PAYMENT_STEP,
    ] : [
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
        title: "Date et durée de la garde",
        fields: [
          { name: "guardDate", label: "Date de garde", type: "date" },
          {
            name: "durationInMinutes",
            label: "Durée de la garde (en minutes)",
            type: "number",
            min: 30,
            max: 720,
            step: 30
          }
        ]
      },
      {
        title: "Horaires de la garde",
        fields: [
          { name: "startTime", label: "Heure de début", type: "time", min: MIN_TIME, max: MAX_TIME },
          { name: "endTime", label: "Heure de fin", type: "time", min: MIN_TIME, max: MAX_TIME },
        ]
      },
      PAYMENT_STEP,
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
    setTotalPrice(0);
    setIsNextButtonEnabled(false);
    setAddressError('');
    setTimeError('');
    setDateError('');
    setAgeError('');
    setReservationValidated(false);
    setIsSubmittingReservation(false);
    setReservationError('');
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  useEffect(() => {
    setIsNextButtonEnabled(isStepValid());
  }, [formData, step, dateError, timeError, ageError]);

  useEffect(() => {
    emailjs.init("6DJEMOzCfQsfBentq");
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;

    // Synchroniser childrenDetails quand nombreEnfants change
    if (name === 'nombreEnfants') {
      const count = parseInt(value);

      // Permettre la saisie vide temporairement (quand l'utilisateur efface le champ)
      if (value === '' || isNaN(count)) {
        setFormData(prevState => ({ ...prevState, nombreEnfants: '' }));
        return;
      }

      const validCount = Math.max(1, Math.min(10, count));
      setFormData(prevState => {
        const existingDetails = prevState.childrenDetails || [];
        const updatedDetails = [...Array(validCount)].map((_, i) =>
          existingDetails[i] || { prenom: '', nom: '', age: '' }
        );
        return { ...prevState, nombreEnfants: validCount, childrenDetails: updatedDetails };
      });
      return;
    }

    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    if (name === 'durationInMinutes' || name === 'startTime') {
      if (formData.startTime && value) {
        const [hours, minutes] = formData.startTime.split(':');
        const startDate = new Date(2000, 0, 1, hours, minutes);
        const endDate = new Date(startDate.getTime() + parseInt(formData.durationInMinutes || value) * 60000);
        const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

        setFormData(prevState => ({
          ...prevState,
          endTime: endTime
        }));
      }
    }

    if (name === 'startTime' || name === 'endTime') {
      validateTime(name, value);

      const newPrice = calculatePrice(
        name === 'startTime' ? value : formData.startTime,
        name === 'endTime' ? value : formData.endTime
      );

      setTotalPrice(newPrice);
      console.log(`Updated Total Price: ${newPrice}`);
    }
  };


  const validateTime = (field, time) => {
    const startTime = field === 'startTime' ? time : formData.startTime;
    const endTime = field === 'endTime' ? time : formData.endTime;

    if (startTime) {
      const [startHours, startMinutes] = startTime.split(':');
      const startTotalMinutes = parseInt(startHours, 10) * 60 + parseInt(startMinutes, 10);
      if (startTotalMinutes < MIN_TIME_MINUTES || startTotalMinutes > MAX_TIME_MINUTES) {
        setTimeError('Les horaires doivent être entre 6h00 et 23h00.');
        return;
      }
    }

    if (endTime) {
      const [endHours, endMinutes] = endTime.split(':');
      const endTotalMinutes = parseInt(endHours, 10) * 60 + parseInt(endMinutes, 10);
      if (endTotalMinutes < MIN_TIME_MINUTES || endTotalMinutes > MAX_TIME_MINUTES) {
        setTimeError('Les horaires doivent être entre 6h00 et 23h00.');
        return;
      }
    }

    if (formData.guardDateISO && startTime && !validateSameDayStartTime(formData.guardDateISO, startTime)) {
      return;
    }

    setTimeError('');
  };

  const handleChildDetailsChange = (index, field, value) => {
    const updatedChildrenDetails = [...formData.childrenDetails];
    if (!updatedChildrenDetails[index]) {
      updatedChildrenDetails[index] = { prenom: '', nom: '', age: '' };
    }
    updatedChildrenDetails[index][field] = value;
    setFormData(prevState => ({ ...prevState, childrenDetails: updatedChildrenDetails }));

    if (field === 'age') {
      const age = parseInt(value, 10);
      if (value !== '' && (!Number.isNaN(age) && age < MIN_CHILD_AGE)) {
        setAgeError(`L'âge minimum accepté est de ${MIN_CHILD_AGE} ans.`);
      } else {
        setAgeError('');
      }
    }
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

        if (distance > SERVICE_RADIUS_KM) {
          setAddressError(`L'adresse est située à ${Math.round(distance)} km d'Éragny, au-delà de la limite de ${SERVICE_RADIUS_KM} km.`);
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

    const currentQuestion = questions[step];
    const hasDateField = currentQuestion.fields?.some((field) => field.type === 'date');
    if (hasDateField && formData.guardDateISO) {
      if (!validateGuardDate(formData.guardDateISO)) return;
    }

    const hasTimeField = currentQuestion.fields?.some((field) => field.type === 'time');
    if (hasTimeField && formData.guardDateISO && formData.startTime) {
      if (!validateSameDayStartTime(formData.guardDateISO, formData.startTime)) return;
    }

    if (isStepValid()) {
      setStep(prevStep => prevStep + 1);
    }
  };

  const handlePrevious = () => {
    if (questions[step]?.type === 'payment') {
      setReservationValidated(false);
      setReservationError('');
    }
    setStep(prevStep => prevStep - 1);
  };

  const handleStripePayment = async () => {
    try {
      const [startHours, startMinutes] = formData.startTime.split(':');
      const [endHours, endMinutes] = formData.endTime.split(':');
      const startTotalMinutes = parseInt(startHours) * 60 + parseInt(startMinutes);
      const endTotalMinutes = parseInt(endHours) * 60 + parseInt(endMinutes);
      const durationInMinutes = endTotalMinutes - startTotalMinutes;

      let paymentLink;
      switch (durationInMinutes) {
        case 30:
          paymentLink = 'https://buy.stripe.com/bJe5kD0JKbejex0ed12Nq0d';
          break;
        case 60:
          paymentLink = 'https://buy.stripe.com/28E14n3VWgyD3Sm5Gv2Nq0e';
          break;
        case 90:
          paymentLink = 'https://buy.stripe.com/28E9ATfEE8274Wqed12Nq0f';
          break;
        case 120:
          paymentLink = 'https://buy.stripe.com/8x23cvcss3LRagK2uj2Nq0g';
          break;
        case 150:
          paymentLink = 'https://buy.stripe.com/5kQ00jgIIfuzex06Kz2Nq0h';
          break;
        case 180:
          paymentLink = 'https://buy.stripe.com/6oU3cvboogyD1Ke2uj2Nq0i';
          break;
        case 210:
          paymentLink = 'https://buy.stripe.com/7sYbJ13VWcinagK3yn2Nq0j';
          break;
        case 240:
          paymentLink = 'https://buy.stripe.com/cNi7sLeAAcindsWb0P2Nq0k';
          break;
        case 270:
          paymentLink = 'https://buy.stripe.com/00wdR96442HNbkOed12Nq0l';
          break;
        case 300:
          paymentLink = 'https://buy.stripe.com/dRm14ncss6Y3gF8b0P2Nq0m';
          break;
        case 330:
          paymentLink = 'https://buy.stripe.com/6oUcN5644aafagKfh52Nq0n';
          break;
        case 360:
          paymentLink = 'https://buy.stripe.com/bJecN50JK5TZ88C9WL2Nq0o';
          break;
        default:
          throw new Error('Durée non prise en charge');
      }

      window.location.href = paymentLink;
    } catch (error) {
      console.error('Une erreur s\'est produite lors de la redirection vers le paiement:', error);
    }
  };


  const handleValidateReservation = async () => {
    if (formData.guardDateISO && !validateGuardDate(formData.guardDateISO)) {
      return;
    }
    if (
      formData.guardDateISO &&
      formData.startTime &&
      !validateSameDayStartTime(formData.guardDateISO, formData.startTime)
    ) {
      return;
    }

    setIsSubmittingReservation(true);
    setReservationError('');

    try {
      const formattedChildrenDetails = formData.childrenDetails.map((child, index) =>
        `Enfant ${index + 1} : Prénom - ${child.prenom}, Nom - ${child.nom}, Age - ${child.age}`
      ).join('\n');

      const templateParams = {
        ...formData,
        formattedChildrenDetails,
        selectedService,
        totalPrice,
        paymentMethod: 'Paiement par carte avant la prestation',
      };

      const response = await emailjs.send("service_k8sukr2", "template_054obuv", templateParams);

      if (response.status === 200) {
        setReservationValidated(true);
      } else {
        setReservationError('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setReservationError('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSubmittingReservation(false);
    }
  };

  const handleProceedToPayment = () => {
    handleStripePayment();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const isStepValid = () => {
    const currentQuestion = questions[step];

    if (currentQuestion.type === 'payment') {
      return true;
    }

    const currentFields = currentQuestion.fields;
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
          child.age !== '' &&
          parseInt(child.age, 10) >= MIN_CHILD_AGE
        );
      }
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'number') return !isNaN(value) && value !== '';
      if (Array.isArray(value)) return value.length > 0;
      return value !== '' && value !== null && value !== undefined;
    }) && !timeError && !dateError && !ageError;
  };

  const renderChildrenFields = () => {
    return [...Array(Number(formData.nombreEnfants) || 1)].map((_, index) => (
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
        <label htmlFor={`childAge-${index}`}>Âge (minimum {MIN_CHILD_AGE} ans)</label>
        <input
          id={`childAge-${index}`}
          type="number"
          min={MIN_CHILD_AGE}
          value={formData.childrenDetails[index]?.age || ''}
          onChange={(e) => handleChildDetailsChange(index, 'age', e.target.value)}
          required
        />
      </div>
    ));
  };

  const renderPaymentStep = () => {
    return (
      <>
        <div className={styles.paymentInfo}>
          <p>
            <span className={styles.paymentHighlight}>Paiement par carte obligatoire avant la prestation.</span>
          </p>
          <p>
            Cela garantit la confirmation de votre réservation, quelle que soit la nounou assignée à votre garde.
          </p>
          <p>
            Prenez le temps de vérifier les informations ci-dessous, puis validez votre réservation.
            Vous pourrez ensuite accéder au paiement sécurisé Stripe.
          </p>
          <p className={styles.cmgHint}>
            <strong>Bon à savoir :</strong> à partir de 16 heures de garde dans le mois, vous pouvez bénéficier
            du Complément de libre choix du mode de garde (CMG) pour réduire vos frais de garde.
          </p>
          {totalPrice > 0 && (
            <p>Montant à régler : <strong>{formatPrice(totalPrice)} €</strong></p>
          )}
        </div>
        {reservationValidated && (
          <div className={styles.reservationSuccess}>
            <p>Votre réservation a bien été enregistrée.</p>
            <p>Cliquez sur le bouton ci-dessous lorsque vous êtes prêt(e) à effectuer le paiement.</p>
          </div>
        )}
        {reservationError && (
          <p className={styles.errorMessage}>{reservationError}</p>
        )}
      </>
    );
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

          {currentQuestion.type === 'payment' && renderPaymentStep()}

          {currentQuestion.type !== 'payment' && currentQuestion.fields.map((field, index) => {
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
                        validateGuardDate(isoDate);
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
                      min={getMinBookingDateISO()}
                      required
                    />
                    <p className={styles.dateHint}>
                      Garde de dernière minute : réservation pour demain jusqu'à 17h,
                      ou pour aujourd'hui au minimum 5 h avant le début. Hors dimanche.
                    </p>
                    <input
                      id="durationInMinutes"
                      type="number"
                      name="durationInMinutes"
                      placeholder="Durée en minutes (par tranche de 30 minutes)"
                      min={30}
                      max={720}
                      step={30}
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
                ) : field.name === 'nombreEnfants' ? (
                  <input
                    id={field.name}
                    type="number"
                    name={field.name}
                    value={formData.nombreEnfants}
                    onChange={handleChange}
                    min={1}
                    max={10}
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
            );
          })}
          {currentQuestion.type !== 'payment' &&
            currentQuestion.fields.some(field => field.type === 'time') &&
            formData.startTime && formData.endTime && !timeError && (
            <div className={styles.priceInfo}>
              <p>Tarif horaire : {formatPrice(HOURLY_RATE)}€/heure</p>
              <p>Prix total estimé : {formatPrice(totalPrice)}€</p>
            </div>
          )}
          {currentQuestion.type === 'payment' && totalPrice > 0 && (
            <div className={styles.priceInfo}>
              <p>Tarif horaire : {formatPrice(HOURLY_RATE)}€/heure</p>
              <p>Prix total estimé : {formatPrice(totalPrice)}€</p>
            </div>
          )}
          {step === 0 && addressError && (
            <p className={styles.errorMessage}>{addressError}</p>
          )}
          {timeError && (
            <p className={styles.errorMessage}>{timeError}</p>
          )}
          {dateError && (
            <p className={styles.errorMessage}>{dateError}</p>
          )}
          {ageError && (
            <p className={styles.errorMessage}>{ageError}</p>
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
            ) : currentQuestion.type === 'payment' ? (
              reservationValidated ? (
                <button
                  type="button"
                  className="submitButton enabled"
                  onClick={handleProceedToPayment}
                >
                  Accéder au paiement sécurisé
                </button>
              ) : (
                <button
                  type="button"
                  className={`submitButton ${isSubmittingReservation ? 'disabled' : 'enabled'}`}
                  onClick={handleValidateReservation}
                  disabled={isSubmittingReservation}
                >
                  {isSubmittingReservation ? 'Validation en cours…' : 'Valider ma réservation'}
                </button>
              )
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