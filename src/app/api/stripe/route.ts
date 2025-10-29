import prisma from "@/lib/db";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(req: Request) {
  // verify webhook signature
  let event;
  try {
    const body = await req.text();
    const signature = req.headers.get("Stripe-Signature");
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Error verifying webhook signature:", err);
    return Response.json(null, { status: 400 });
  }
  //   fufil order
  switch (event.type) {
    case "checkout.session.completed":
      await prisma.user.update({
        where: { email: event.data.object.customer_email },
        data: { hasAccess: true },
      });
      break;
    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }

  return Response.json(null, { status: 200 });
}
