// src/app/api/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { api } from '~/trpc/server';


const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    console.warn('STRIPE_SECRET_KEY is not set in environment variables');
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });


export async function POST(req: NextApiRequest, res: NextApiResponse) {

    const text = req.body;
    const sig = req.headers['stripe-signature'];

    if (typeof sig !== 'string') {
        return res.status(400).send('Webhook Error: Stripe signature missing or invalid.');
    }

    let event;

    try {
        const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!stripeWebhookSecret) {
            console.warn('STRIPE_WEBHOOK_SECRET is not set in environment variables');
            throw new Error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
        }

        event = stripe.webhooks.constructEvent(text, sig, stripeWebhookSecret);
    } catch (err) {
        // Assume err is of type Error
        const error = err as Error;
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        console.log('Checkout session completed!', session);

        const { id: userId } = await api.user.getUserId.query({ email: session.customer_email });

        if (!userId) {
            return res.status(400).send('User not found');
        }

        if (!session.amount_total || session.amount_total <= 0) {
            return res.status(400).send('Invalid amount');
        }

        await api.user.addCredits.mutate({ id: userId, amount: session.amount_total * 300 });

    } else {
        console.log(`Unhandled event type ${event.type}`);
    }
    res.status(200).json({ received: true });
}