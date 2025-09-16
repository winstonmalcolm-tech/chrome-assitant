const webhook = async (req, res) => {

  try {
    const payload = req.body;
    const event = payload.alert_name;

    const passThrough = JSON.parse(payload.passthrough || '{}');
    const userId = passThrough.userId;

    console.log(`Webhook received: ${event} for user ${userId}`);

    switch (event) {
    case 'payment_succeeded':
      console.log("Payment succeeded");
      break;
    case 'subscription_created':
      console.log("subscription created");
      break;
    case 'subscription_payment_succeeded':
      console.log("subscription_payment_succeeded");
      break;
      

    case 'subscription_cancelled':
      // Handle subscription cancellation
      break;
  }

  } catch(error) {
     res.status(500).json({ error: 'Failed to create checkout session' });
  }
}


export {
  webhook
}