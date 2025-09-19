import pool from "../database/db.js";


const accountValidation = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    let sql = `
      SELECT status FROM user_subscriptions_tbl WHERE user_id = ?;
    `
    const [rows] = await pool.query(sql, [userId]);

    const status = rows[0].status;

    if (status.toLowerCase() != 'active') {
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