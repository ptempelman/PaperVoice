// src/app/api/route.ts
import { NextResponse } from 'next/server';
import stripe from "stripe";
import { api } from '~/trpc/server';

export async function POST(request: Request) {
    console.log("Webhook received");

    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event;
    try {
        event = stripe.webhooks.constructEvent(body, sig!, stripeWebhookSecret);
    } catch (err) {
        return NextResponse.json({ message: "Webhook error", error: err });
    }

    console.log("Webhook event", event);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        console.log('Checkout session completed!', session);

        const { id: userId } = await api.user.getUserId.query({ email: session.customer_details?.email });

        if (!userId) {
            return NextResponse.json({ message: "Webhook error", error: "User not found" });
        }

        if (!session.amount_total || session.amount_total <= 0) {
            return NextResponse.json({ message: "Webhook error", error: "Invalid amount" });
        }
        console.log("Adding credits to user", userId, (session.amount_total / 60) * 300);
        await api.user.addCredits.mutate({ id: userId, amount: (session.amount_total / 60) * 300 });
        return NextResponse.json({ message: "OK" });
    }
    return new Response("", { status: 200 });

}