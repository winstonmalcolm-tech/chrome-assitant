import pool from "../database/db.js";

const normalizeDate = (isoString) => {
  return typeof isoString === 'string'
    ? isoString.replace('T', ' ').replace('Z', '')
    : null;
};

const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;

    let sql = `
      SELECT paddle_subscription_id FROM user_subscriptions_tbl WHERE user_id = ?
    `;

    const [rows] = await pool.query(sql, [userId]);

    if (!rows.length || !rows[0].paddle_subscription_id) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    const subId = rows[0].paddle_subscription_id;

    // Polar API: Cancel subscription at period end
    const response = await fetch(`https://sandbox-api.polar.sh/v1/subscriptions/${subId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.POLAR_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cancel_at_period_end: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(400).json({
        success: false,
        message: error.detail || error.message || "Failed to cancel subscription"
      });
    }

    const result = await response.json();

    // Update database with cancellation date
    sql = `
      UPDATE user_subscriptions_tbl
      SET cancel_at = ?,
          next_bill_date = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?;
    `;

    // Polar returns the subscription with current_period_end as the cancellation date
    const cancelDate = result.current_period_end || result.ended_at;

    await pool.query(sql, [normalizeDate(cancelDate), userId]);

    res.status(200).json({
      success: true,
      message: "Cancellation successful. Subscription will remain active until the end of the billing period.",
      cancel_at: cancelDate
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

const resumeSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;

    let sql = `
      SELECT paddle_subscription_id FROM user_subscriptions_tbl WHERE user_id = ?
    `;
    const [rows] = await pool.query(sql, [userId]);
    const subId = rows[0]?.paddle_subscription_id;

    if (!subId) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    const response = await fetch(`https://sandbox-api.polar.sh/v1/subscriptions/${subId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.POLAR_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Try sending it as part of a cancel action object
        cancel_at_period_end: false
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Polar API Error:', result);
      return res.status(400).json({
        success: false,
        message: result.detail || result.message || "Failed to resume subscription",
        error: result
      });
    }

    // 4. Update your DB
    sql = `
      UPDATE user_subscriptions_tbl
      SET cancel_at = NULL,
          status = 'active',
          next_bill_date = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?;
    `;
    await pool.query(sql, [normalizeDate(result.current_period_end), userId]);

    res.status(200).json({
      success: true,
      message: "Subscription resumed successfully",
      subscription: result
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const webhook = async (req, res) => {
  try {
    const payload = req.body;

    // Polar sends event type differently than Paddle
    const event = payload.type; // Polar uses 'type' instead of 'event_type'
    const data = payload.data;
    const userId = data.metadata?.userId; // User ID from metadata
    let sql = '';

    switch (event) {
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

        console.log('New subscription created');
        break;

      case 'subscription.updated':
        // Subscription updated
        sql = `
            UPDATE user_subscriptions_tbl
            SET 
                status = ?,
                next_bill_date = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?;        
          `
        await pool.query(sql, [data.status, normalizeDate(data.current_period_end), userId]);

        console.log('Subscription updated');
        break;

      case 'subscription.active':
        // Subscription activated
        sql = `
            UPDATE user_subscriptions_tbl
            SET 
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?;        
          `
        await pool.query(sql, [data.status, userId]);

        sql = `
          INSERT INTO token_usage_tbl
          (user_id, usage_start, usage_end, total_tokens)
          VALUES (?, ?, ?, ?);
        `
        await pool.query(sql, [userId, normalizeDate(data.current_period_start), normalizeDate(data.current_period_end), 0]);

        console.log('Subscription activated');
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
        await pool.query(sql, [2, "active", normalizeDate(data.current_period_end), null, userId]);

        console.log('Subscription cancelled');
        break;

      case 'subscription.revoked':
        // Subscription was revoked
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

        console.log('Subscription revoked');
        break;

      case 'subscription.uncanceled':
        // Subscription was uncanceled
        sql = `
          UPDATE user_subscriptions_tbl
          SET plan_id = ?,
              status = ?, 
              cancel_at = ?,
              start_date = ?,
              next_bill_date = ?, 
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?;
        `
        await pool.query(sql, [2, data.status, null, normalizeDate(data.current_period_start), normalizeDate(data.current_period_end), userId]);

        console.log('Subscription uncanceled');
        break;


      default:
        // Unknown or unhandled event
        console.log('Unhandled Polar event:', event, payload);
        break;
    }

    res.status(200).send('OK');

  } catch (error) {
    console.log('Webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
};


export {
  webhook,
  cancelSubscription,
  resumeSubscription
}


/*
// const event = payload.event_type;
    // const data = payload.data;
    // const userId = payload.data.custom_data.userId;
    // let sql = '';


    // switch (event) {
    //   case 'subscription.payment_succeeded':
    //     // A subscription payment succeeded
    //     sql = `UPDATE user_subscriptions_tbl
    //             SET next_bill_date = ?, 
    //                 updated_at = CURRENT_TIMESTAMP
    //             WHERE user_id = ?;
    //           `

    //     await pool.query(sql, [normalizeDate(data.next_billed_at), userId])

    //     console.log('Payment succeeded:', data);
    //     break;

    //   case 'subscription.payment_failed':
    //     // A subscription payment failed
    //     sql =  `
    //       UPDATE user_subscriptions_tbl
    //       SET status = ?, 
    //           updated_at = CURRENT_TIMESTAMP
    //       WHERE user_id = ?;
    //     `;

    //     await pool.query(sql, [data.status, userId]);

    //     console.log('Payment failed:', payload);
    //     break;

    //   case 'subscription.created':
    //     // New subscription created
    //     sql = `
    //       UPDATE user_subscriptions_tbl
    //       SET status = ?, 
    //           start_date = ?, 
    //           paddle_subscription_id = ?,
    //           plan_id = ?, 
    //           paddle_customer_id = ?, 
    //           is_recurring = ?, 
    //           updated_at = CURRENT_TIMESTAMP
    //       WHERE user_id = ?;
    //     `;

    //     await pool.query(sql, [data.status, normalizeDate(data.started_at), data.id, 2, data.customer_id, true, userId]);

    //     console.log('New subscription created:', payload);
    //     break;

    //   case 'subscription.updated':
    //     // Subscription updated
    //     sql = `
    //       UPDATE user_subscriptions_tbl
    //       SET next_bill_date = ?, 
    //           updated_at = CURRENT_TIMESTAMP
    //       WHERE user_id = ?;        
    //     `
    //     await pool.query(sql, [normalizeDate(data.next_billed_at), userId]);
    //     console.log('Subscription updated:', payload);
    //     break;

    //   case 'subscription.canceled':
    //     // Subscription was cancelled
    //     sql = `
    //       UPDATE user_subscriptions_tbl
    //       SET plan_id = ?,
    //           status = ?, 
    //           cancel_at = ?,
    //           next_bill_date = ?, 
    //           updated_at = CURRENT_TIMESTAMP
    //       WHERE user_id = ?;
    //     `
    //     await pool.query(sql, [1, "active", null, null, userId]);

    //     console.log('Subscription cancelled:', payload);
    //     break;

    //   case 'subscription.past_due':
    //     // Subscription entered past due state after failed renewal
    //     sql = `
    //       UPDATE user_subscriptions_tbl
    //       SET status = ?, 
    //           updated_at = CURRENT_TIMESTAMP
    //       WHERE user_id = ?;
    //     `

    //     await pool.query(sql, [data.status, userId])
    //     console.log('Subscription is past due:', payload);
    //     break;

    //   case 'subscription.resumed':
    //     // Subscription resumed after being past due or paused
    //     sql = `
    //       UPDATE user_subscriptions_tbl
    //       SET status = ?, 
    //           next_bill_date = ?, 
    //           updated_at = CURRENT_TIMESTAMP
    //       WHERE user_id = ?;
    //     `

    //     await pool.query(sql, [data.status, normalizeDate(data.next_billed_at), userId]);
    //     console.log('Subscription resumed:', data);
    //     break;

    //   case 'subscription.activated':
    //     // Trial period ended and subscription is transitioning to paid
    //     sql = `
    //       UPDATE user_subscriptions_tbl
    //       SET status = ?, 
    //           start_date = ?, 
    //           next_bill_date = ?, 
    //           updated_at = CURRENT_TIMESTAMP
    //       WHERE user_id = ?;
    //     `

    //     await pool.query(sql, [data.status, normalizeDate(data.started_at), normalizeDate(data.next_billed_at), userId]);

    //     sql = `
    //       INSERT INTO token_usage_tbl
    //       (user_id, usage_start, usage_end, total_tokens)
    //       VALUES (?, ?, ?, ?);
    //     `
    //     await pool.query(sql, [userId, normalizeDate(data.started_at), normalizeDate(data.next_billed_at), 0]);
    //     console.log('Subscription Activated', payload);
    //     break;

    //   default:
    //     // Unknown or unhandled alert
    //     console.log('Unhandled Paddle alert:', payload);
    //     break;
    // }
    */