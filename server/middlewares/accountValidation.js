import pool from "../database/db.js";


const accountValidation = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const now = new Date();

    let sql = `
      SELECT status, next_bill_date, cancel_at FROM user_subscriptions_tbl WHERE user_id = ?;
    `
    const [rows] = await pool.query(sql, [userId]);

    const status = rows[0].status;
    const cutOffDate = new Date(rows[0].next_bill_date);

    if (status.toLowerCase() != 'active' && (now >= cutOffDate)) {
      res.status(403).json({success: false, message: "Subscription inactive due to failed payment"});
      return;
    }

    next();

  } catch(error) {
    console.log(error);
    res.status(500).json({success: false, message: "Server Issue"});
  }

}

export {accountValidation};