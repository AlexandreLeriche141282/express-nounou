// Importation des dépendances
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000' // Ajustez selon votre frontend
}));

// Route pour créer une session de paiement
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { serviceName, totalPrice } = req.body;

    if (!serviceName || !totalPrice) {
      return res.status(400).json({ 
        error: 'serviceName et totalPrice sont requis' 
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: serviceName,
            },
            unit_amount: Math.round(totalPrice * 100), // Conversion en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cancel`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});