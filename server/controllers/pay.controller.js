const webhook = async (req, res) => {

  try {
    const payload = req.body;
    const event = payload.alert_name;

    const passThrough = JSON.parse(payload.passthrough || '{}');
    const userId = passThrough.userId;

    console.log(`Webhook received: ${event} for user ${userId}`);

    switch (event) {
      case 'subscription_payment_succeeded':
        // A subscription payment succeeded
        console.log('Payment succeeded:', paddleData);
        break;

      case 'subscription_cancelled':
        // Subscription was cancelled
        console.log('Subscription cancelled:', paddleData);
        break;

      case 'subscription_payment_failed':
        console.log('Payment failed:', paddleData);
        break;

      case 'subscription_created':
        console.log('New subscription created:', paddleData);
        break;

      case 'subscription_updated':
        console.log('Subscription updated:', paddleData);
        break;

      default:
        console.log('Unhandled webhook type:', alertName);
    }

  } catch(error) {
     res.status(500).json({ error: 'Failed to create checkout session' });
  }
}


export {
  webhook
}