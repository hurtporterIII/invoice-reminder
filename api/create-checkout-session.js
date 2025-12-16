const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).json({ error: "Method Not Allowed" });
        return;
    }

    try {
        const protocol = req.headers["x-forwarded-proto"] || "https";
        const host = req.headers.host || "";
        const origin = req.headers.origin || (host ? `${protocol}://${host}` : "");

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1
                }
            ],
            success_url: `${origin}/success.html`,
            cancel_url: `${origin}/cancel.html`
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error("Stripe checkout session error", error);
        res.status(500).json({ error: "Unable to create checkout session" });
    }
};
