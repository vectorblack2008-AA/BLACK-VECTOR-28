import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  if (!stripeSecret || stripeSecret === 'your_stripe_sk') {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2025-02-24.acacia' });
  const body = await req.json();
  const { userId, userEmail, priceId } = body;

  if (!userId || !userEmail) {
    return NextResponse.json({ error: 'Missing user info' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: { userId },
      customer_email: userEmail,
      success_url: `${origin}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe session error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
