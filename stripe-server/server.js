// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// const app = express();

// // Configuration CORS plus complète
// const corsOptions = {
//     origin: ['https://www.expressnounou.fr', 'https://expressnounou.fr'],
//     methods: ['GET', 'POST', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//     preflightContinue: false,
//     optionsSuccessStatus: 204
// };

// // Appliquer CORS globalement
// app.use(cors(corsOptions));

// // Middleware pour parser le JSON
// app.use(express.json());

// // Route pour créer une session de paiement
// app.post('/api/create-checkout-session', async (req, res) => {
//     try {
//         const { serviceName, totalPrice } = req.body;

//         if (!serviceName || !totalPrice) {
//             return res.status(400).json({ error: 'serviceName et totalPrice sont requis' });
//         }

//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items: [
//                 {
//                     price_data: {
//                         currency: 'eur',
//                         product_data: {
//                             name: serviceName,
//                         },
//                         unit_amount: Math.round(totalPrice * 100),
//                     },
//                     quantity: 1,
//                 },
//             ],
//             mode: 'payment',
//             success_url: `${process.env.FRONTEND_URL}/success`,
//             cancel_url: `${process.env.FRONTEND_URL}/cancel`,
//         });

//         // Ajouter des headers spécifiques pour la réponse
//         res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
//         res.setHeader('Access-Control-Allow-Credentials', 'true');
//         res.json({ id: session.id });
//     } catch (error) {
//         console.error('Erreur création session Stripe:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

// // Route de test
// app.get('/api/test', (req, res) => {
//     res.json({ message: 'Server is running!' });
// });

// // Pas besoin de cette ligne car cors() est déjà configuré globalement
// // app.options('/api/create-checkout-session', cors());

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
