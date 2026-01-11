// controllers/authController.js
import crypto from "crypto";
import jwt from "jsonwebtoken";
import pool from "../database/db.js";
import { sendMail } from "../utils/mailHandler.js";
import { generateTokens } from "../utils/tokenGenertor.js";

class AuthController {

  // Send magic link
  async register(req, res) {
    try {
      const { email, name } = req.body;

      if (!email || !name) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Check if user exists, create if not
      let [users] = await pool.query('SELECT id FROM users_tbl WHERE email = ?', [email]);

      if (users.length > 0) {
        return res.status(400).json({ success: false, message: "User with this email Already exists" });
      }

      const [newUser] = await pool.query('INSERT INTO users_tbl (email, name) VALUES (?, ?)', [email, name]);

      await pool.query("INSERT INTO user_subscriptions_tbl (user_id, plan_id, status, is_recurring) VALUES (?, ?, ?, ?);", [newUser.insertId, 1, "active", false]);

      const date = new Date();
      const startDate = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'

      await pool.query(
        'INSERT INTO token_usage_tbl (user_id, usage_start, total_tokens) VALUES (?,?,?)', [newUser.insertId, startDate, 0]
      );

      // Generate token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Delete old unused tokens for this email
      await pool.query(
        'DELETE FROM magic_links_tbl WHERE email = ? AND used = FALSE',
        [email]
      );

      // Store new token
      await pool.query(
        'INSERT INTO magic_links_tbl (email, token, expires_at) VALUES (?, ?, ?)',
        [email, token, expiresAt]
      );

      const url = `${process.env.FRONTEND_BASE_URL}/verify?token=${token}`;

      // Send email
      const result = await sendMail(email, "Welcome to Alinea AI", name, url);

      if (!result.success) {
        return res.status(500).json({ error: result.message });
      }

      res.json({ success: true, message: 'Please verify your email by clicking on the link that was sent to you.' });

    } catch (error) {
      console.error('Send magic link error:', error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async login(req, res) {

    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: "Please enter an email" });
      }

      let sql = "SELECT email, name from users_tbl WHERE email = ?";
      const [users] = await pool.query(sql, [email]);

      if (users.length < 1) {
        return res.status(404).json({ success: false, message: "There is no user with this email." });
      }

      // Generate token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Delete old unused tokens for this email
      sql = 'DELETE FROM magic_links_tbl WHERE email = ? AND used = FALSE';
      await pool.query(sql, [email]);

      // Store new token
      sql = 'INSERT INTO magic_links_tbl (email, token, expires_at) VALUES (?, ?, ?)';
      await pool.query(sql, [email, token, expiresAt]);

      const url = `${process.env.FRONTEND_BASE_URL}/verify?token=${token}`;

      // Send email
      const result = await sendMail(email, "Welcome to Alinea AI", users[0].name, url);

      if (!result.success) {
        return res.status(500).json({ error: result.message });
      }

      res.json({ success: true, message: 'Please verify your email by clicking on the link that was sent to you.' });


    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: "Internal server error" })
    }
  }

  // Verify magic link and login
  async verifyMagicLink(req, res) {
    try {
      const { token } = req.body;

      console.log("TOKEN: ", token);

      if (!token) {
        return res.status(400).json({ success: false, message: 'Token is required' });
      }

      // Check if token is valid
      let sql = `
        SELECT email 
        FROM magic_links_tbl 
        WHERE token = ? 
          AND expires_at > CONVERT_TZ(NOW(), 'UTC', 'America/Jamaica') 
          AND used = FALSE
      `;
      const [links] = await pool.query(sql, [token]);

      if (links.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token' });
      }

      const email = links[0].email;

      // Mark token as used
      sql = 'UPDATE magic_links_tbl SET used = TRUE WHERE token = ?';
      await pool.query(sql, [token]);

      // Get user
      sql = 'SELECT id, email, name FROM users_tbl WHERE email = ?'
      const [users] = await pool.query(sql, [email]);

      const user = users[0];

      const { accessToken, refreshToken } = generateTokens({ userId: user.id, email: user.email });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });

    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }

  // Get current user
  async getUser(req, res) {
    try {
      let sql = `WITH latest_token_usage AS (
                  SELECT user_id, usage_start, usage_end, total_tokens
                  FROM token_usage_tbl
                  WHERE user_id = ?
                  ORDER BY id DESC
                  LIMIT 1
                )

                SELECT 
                  u.name AS "username", 
                  u.email, 
                  u.created_at, 
                  plan.name AS "plan_name", 
                  plan.token_quota,
                  sub.status, 
                  sub.start_date, 
                  sub.next_bill_date, 
                  sub.paddle_subscription_id,
                  sub.cancel_at,
                  token.total_tokens
                FROM 
                  users_tbl AS u
                JOIN 
                  user_subscriptions_tbl AS sub ON u.id = sub.user_id
                JOIN 
                  subscription_plans_tbl AS plan ON sub.plan_id = plan.id
                JOIN 
                  latest_token_usage AS token ON u.id = token.user_id
                WHERE 
                  u.id = ?;`;


      const [users] = await pool.query(sql, [req.user.userId, req.user.userId]);

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: users[0] });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  async refreshToken(req, res) {

    const refreshToken = req.body.refreshToken;

    if (!refreshToken) return res.sendStatus(401);

    try {
      const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
      const { accessToken } = generateTokens({ userId: payload.userId, email: payload.email });

      res.json({ accessToken });

    } catch (err) {
      console.log(err.message)
      return res.sendStatus(403);
    }
  }



}

export default new AuthController();