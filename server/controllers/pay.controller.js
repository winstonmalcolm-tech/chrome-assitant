const webhook = async (req, res) => {

  try {
    const payload = req.body;
    const event = payload.event_type;

    const passThrough = JSON.parse(payload.passthrough || '{}');
    const userId = passThrough.userId;

    console.log(`Webhook received: ${event} for user ${userId}`);

    switch (event) {
      case 'subscription.payment_succeeded':
        // A subscription payment succeeded
        console.log('Payment succeeded:', payload);
        break;

      case 'subscription.payment_failed':
        // A subscription payment failed
        console.log('Payment failed:', payload);
        break;

      case 'subscription.created':
        // New subscription created
        console.log('New subscription created:', payload);
        break;

      case 'subscription.updated':
        // Subscription updated
        console.log('Subscription updated:', payload);
        break;

      case 'subscription.cancelled':
        // Subscription was cancelled
        console.log('Subscription cancelled:', payload);
        break;

      case 'subscription.past_due':
        // Subscription entered past due state after failed renewal
        console.log('Subscription is past due:', payload);
        break;

      case 'subscription.resumed':
        // Subscription resumed after being past due or paused
        console.log('Subscription resumed:', payload);
        break;

      case 'subscription.paused':
        // Subscription was manually paused
        console.log('Subscription paused:', payload);
        break;

      case 'subscription.trial_ended':
        // Trial period ended and subscription is transitioning to paid
        console.log('Trial ended:', payload);
        break;

      default:
        // Unknown or unhandled alert
        console.log('Unhandled Paddle alert:', payload);
        break;
    }

    res.status(200).send('OK');

  } catch(error) {
     res.status(500).json({ error: 'Failed to create checkout session' });
  }
}


export {
  webhook
}