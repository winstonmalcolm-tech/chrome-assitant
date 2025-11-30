import pool from "../database/db.js";

const normalizeDate = (isoString) => {
  return typeof isoString === 'string'
    ? isoString.replace('T', ' ').replace('Z', '')
    : null;
};



const cancelSubscription = async (req, res) => {
  //https://sandbox-api.paddle.com/
  //https://api.paddle.com/subscriptions/{subscription_id}/cancel
  try {
    const userId = req.user.userId;

    let sql = `
      SELECT paddle_subscription_id FROM user_subscriptions_tbl WHERE user_id = ?
    `;

    const [rows] = await pool.query(sql, [userId]);

    const subId = rows[0].paddle_subscription_id;

    const response = await fetch(`https://sandbox-api.paddle.com/subscriptions/${subId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    });

    const result = await response.json();


    sql = `
      UPDATE user_subscriptions_tbl
      SET cancel_at = ?, 
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?;
    `;

    await pool.query(sql, [normalizeDate(result.data.scheduled_change.effective_at), userId]);

    res.status(200).json({success: true, message: "Cancel successful, subscription will stop at the next billing period"});

  } catch (error) {
    console.log(error);
    res.status(500).json({success: false, message: "Server Error"});
  }
}


const resumeSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Get Paddle subscription ID
    let sql = `
      SELECT paddle_subscription_id FROM user_subscriptions_tbl WHERE user_id = ?
    `;
    const [rows] = await pool.query(sql, [userId]);
    const subId = rows[0]?.paddle_subscription_id;

    if (!subId) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    // 2. Call Paddle Update API to clear scheduled cancellation
    const response = await fetch(`https://sandbox-api.paddle.com/subscriptions/${subId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        // Set cancel_url or scheduled_change to null to remove scheduled cancellation
        scheduled_change: null
      })
    });

    const result = await response.json();
  
    if (!response.ok) {
      return res.status(400).json({ success: false, message: result.error?.message || "Failed to resume subscription" });
    }

    // 3. Update your DB
    sql = `
      UPDATE user_subscriptions_tbl
      SET cancel_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?;
    `;
    await pool.query(sql, [userId]);

    res.status(200).json({ success: true, message: "Subscription resumed successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

const webhook = async (req, res) => {

  try {
    const payload = req.body;

    console.log('Paddle webhook received:', payload);
    
    const event = payload.event_type;
    const data = payload.data;
    const userId = payload.data.custom_data.userId;
    let sql = '';


    switch (event) {
      case 'subscription.payment_succeeded':
        // A subscription payment succeeded
        sql = `UPDATE user_subscriptions_tbl
                SET next_bill_date = ?, 
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?;
              `

        await pool.query(sql, [normalizeDate(data.next_billed_at), userId])

        console.log('Payment succeeded:', data);
        break;

      case 'subscription.payment_failed':
        // A subscription payment failed
        sql =  `
          UPDATE user_subscriptions_tbl
          SET status = ?, 
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?;
        `;

        await pool.query(sql, [data.status, userId]);

        console.log('Payment failed:', payload);
        break;

      case 'subscription.created':
        // New subscription created
        sql = `
          UPDATE user_subscriptions_tbl
          SET status = ?, 
              start_date = ?, 
              paddle_subscription_id = ?,
              plan_id = ?, 
              paddle_customer_id = ?, 
              is_recurring = ?, 
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?;
        `;

        await pool.query(sql, [data.status, normalizeDate(data.started_at), data.id, 2, data.customer_id, true, userId]);

        console.log('New subscription created:', payload);
        break;

      case 'subscription.updated':
        // Subscription updated
        sql = `
          UPDATE user_subscriptions_tbl
          SET next_bill_date = ?, 
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?;        
        `
        await pool.query(sql, [normalizeDate(data.next_billed_at), userId]);
        console.log('Subscription updated:', payload);
        break;

      case 'subscription.canceled':
        // Subscription was cancelled
        sql = `
          UPDATE user_subscriptions_tbl
          SET plan_id = ?,
              status = ?, 
              cancel_at = ?,
              next_bill_date = ?, 
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?;
        `
        await pool.query(sql, [1, "active", null, null, userId]);

        console.log('Subscription cancelled:', payload);
        break;

      case 'subscription.past_due':
        // Subscription entered past due state after failed renewal
        sql = `
          UPDATE user_subscriptions_tbl
          SET status = ?, 
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?;
        `

        await pool.query(sql, [data.status, userId])
        console.log('Subscription is past due:', payload);
        break;

      case 'subscription.resumed':
        // Subscription resumed after being past due or paused
        sql = `
          UPDATE user_subscriptions_tbl
          SET status = ?, 
              next_bill_date = ?, 
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?;
        `

        await pool.query(sql, [data.status, normalizeDate(data.next_billed_at), userId]);
        console.log('Subscription resumed:', data);
        break;

      case 'subscription.activated':
        // Trial period ended and subscription is transitioning to paid
        sql = `
          UPDATE user_subscriptions_tbl
          SET status = ?, 
              start_date = ?, 
              next_bill_date = ?, 
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?;
        `

        await pool.query(sql, [data.status, normalizeDate(data.started_at), normalizeDate(data.next_billed_at), userId]);

        sql = `
          INSERT INTO token_usage_tbl
          (user_id, usage_start, usage_end, total_tokens)
          VALUES (?, ?, ?, ?);
        `
        await pool.query(sql, [userId, normalizeDate(data.started_at), normalizeDate(data.next_billed_at), 0]);
        console.log('Subscription Activated', payload);
        break;

      default:
        // Unknown or unhandled alert
        console.log('Unhandled Paddle alert:', payload);
        break;
    }

    res.status(200).send('OK');

  } catch(error) {
    console.log(error);
     res.status(500).json({ error: 'Failed to create checkout session' });
  }
}


export {
  webhook,
  cancelSubscription, 
  resumeSubscription
}