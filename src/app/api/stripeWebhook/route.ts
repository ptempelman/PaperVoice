// src/app/api/stripeWebhook.ts
import { buffer } from 'micro';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { api } from '~/trpc/react';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    console.log('STRIPE_SECRET_KEY is not set in environment variables');
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const config = {
    api: {
        bodyParser: false,
    },
};


const stripe = new Stripe(stripeSecretKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("stripeWebhook.ts: handler() called.")
    if (req.method === 'POST') {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];

        if (typeof sig !== 'string') {
            return res.status(400).send('Webhook Error: Stripe signature missing or invalid.');
        }


        let event;

        try {
            const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
            if (!stripeWebhookSecret) {
                throw new Error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
            }

            event = stripe.webhooks.constructEvent(buf, sig, stripeWebhookSecret);
        } catch (err) {
            // Assume err is of type Error
            const error = err as Error;
            return res.status(400).send(`Webhook Error: ${error.message}`);
        }

        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            console.log('Checkout session completed!', session);

            const { data } = api.user.getUserId.useQuery({ email: session.customer_email });
            if (!data?.id) {
                return res.status(400).send('User not found');
            }

            if (!session.amount_total || session.amount_total <= 0) {
                return res.status(400).send('Invalid amount');
            }

            const mutation = api.user.addCredits.useMutation();
            mutation.mutate({ id: data.id, amount: session.amount_total * 300 });
        }

        // Return a 200 response to acknowledge receipt of the event
        res.json({ received: true });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end('Method Not Allowed BINGBINGBING');
    }
};
