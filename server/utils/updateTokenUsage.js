import pool from "../database/db.js";

const updateTokenUsage = async (userId, usedAmount) => {
  try {
    // Step 1: Get the most recent token usage record for the user
    const sql = `
      SELECT id, total_tokens
      FROM token_usage_tbl
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [userId]);

    if (rows.length === 0) {
      // No existing record found — do nothing
      return { success: false, message: "No usage record found for user" };
    }

    // Step 2: Update the latest record
    const latestId = rows[0].id;
    const newTotal = rows[0].total_tokens + usedAmount;

    const updateSql = `
      UPDATE token_usage_tbl
      SET total_tokens = ?
      WHERE id = ?
    `;
    await pool.query(updateSql, [newTotal, latestId]);

    return { success: true, message: "Token usage updated" };

  } catch (e) {
    console.error("Token update error:", e.message);
    return { success: false, message: e.message };
  }
};


export {updateTokenUsage}