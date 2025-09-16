import pool from "../database/db.js";

const tokenTracker = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const now = new Date();

    // 1. Get user's subscription info
    const [subResult] = await pool.query(`
      SELECT 
        us.plan_id, us.start_date, us.next_bill_date, us.status,
        sp.token_quota
      FROM user_subscriptions_tbl us
      JOIN subscription_plans_tbl sp ON sp.id = us.plan_id
      WHERE us.user_id = ? AND us.status IN ('active', 'free')
      ORDER BY us.created_at DESC
      LIMIT 1
    `, [userId]);

    if (!subResult.length) {
      return res.status(403).json({ success: false, message: "No active subscription" });
    }

    const { token_quota: quota, next_bill_date, status } = subResult[0];

    let usageStart, usageEnd;

    if (status === 'free' || !next_bill_date) {
      // Fallback to calendar month for free users
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      usageStart = firstOfMonth;
      usageEnd = firstOfNextMonth;
    } else {
      usageEnd = new Date(next_bill_date);
      usageStart = new Date(usageEnd);
      usageStart.setMonth(usageStart.getMonth() - 1);
    }

    // 2. Check current usage for billing window
    const [usageRows] = await pool.query(`
      SELECT total_tokens 
      FROM token_usage_tbl
      WHERE user_id = ? AND usage_start = ? AND usage_end = ?
      LIMIT 1
    `, [userId, usageStart.toISOString().slice(0, 10), usageEnd.toISOString().slice(0, 10)]);

    const usedTokens = usageRows[0]?.total_tokens || 0;

    if (usedTokens >= quota) {
      return res.status(413).json({
        success: false,
        message: "Token limit exceeded",
        reason: "TOKEN_EXCEEDED",
      });
    }

    // 3. Everything is okay — move on
    return next();

  } catch (err) {
    console.error('Token tracker error:', err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export {tokenTracker}