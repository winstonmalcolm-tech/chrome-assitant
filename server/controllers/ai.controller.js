import { GoogleGenAI } from "@google/genai";
import { marked } from "marked";
import pool from "../database/db.js";
import {updateTokenUsage} from "../utils/updateTokenUsage.js";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

const chatModel = ai.getGenerativeModel({
    model: "gemini-2.5-flash", // or "gemini-1.5-flash"
    systemInstruction: {
        role: "system",
        parts: [{
            text: `
            You are Alinea — a friendly, helpful assistant who responds with warmth and clarity. Keep your answers short, direct, and easy to understand. Avoid long explanations or unnecessary detail. Use brief sentences or bullet points when helpful.
            `
        }]
    }
});

const chatAI = async (req, res) => {
  const { prompt } = req.body;

  try {

    if (!prompt) {
      return res.status(400).json({success: false, message: "Please type a prompt"});
    }

    let pastChat = [];
    let sql = "SELECT user_role, content FROM message_tbl WHERE user_id = ?";
    let [messages] = await pool.query(sql, [req.user.userId]);

    if (messages.length > 0) {
      for (let i = 0; i < messages.length; i++) {
        pastChat.push({
          role: messages[i].user_role,
          parts: [{ text: messages[i].content }],
        });
      }
    }

    const chat = chatModel.startChat({
      history: pastChat || [],
    });

    const response = await chat.sendMessage({
      message: prompt,
    });

    sql = "INSERT into message_tbl (user_id, user_role, content) VALUES (?,?,?);";
    await pool.query(sql, [req.user.userId, "user", prompt]);
    await pool.query(sql, [req.user.userId, "model", response.text]);

    const result = await updateTokenUsage(req.user.userId, response.usageMetadata.totalTokenCount);

    if (!result.success) {
      return res.status(500).json({success: false, message: "Error on the server"});
    }

    return res.status(200).json({success: true, response: marked(response.text)});

  } catch (error) {
    console.log(error.message);
    res.status(500).json({success: false, message: "Internal Server Error"});
  }
}

const generateEmailTemplate = async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const result = await updateTokenUsage(req.user.userId, response.usageMetadata.totalTokenCount);

    if (!result.success) {
      return res.status(500).json({success: false, message: "Error on the server"});
    }

    const htmlFormatted = response.text.replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Convert double line breaks to paragraphs
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('');

    res.status(200).json({message: htmlFormatted});
  } catch (e) {
    console.log(e);
    res.status(500).json({message: "Error processing"});
  }
}

const paraphraseText = async (req, res) => {
  const { prompt } = req.body;

  try {

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const result = await updateTokenUsage(req.user.userId, response.usageMetadata.totalTokenCount);

    if (!result.success) {
      return res.status(500).json({success: false, message: "Error on the server"});
    }

    res.status(200).json({message: marked(response.text)});

  } catch (e) {
    console.log(e);
    res.status(500).json({message: "Error processing"});
  }
}


const generateDocTemplate = async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const result = await updateTokenUsage(req.user.userId, response.usageMetadata.totalTokenCount);

    if (!result.success) {
      return res.status(500).json({success: false, message: "Error on the server"});
    }

    const htmlFormatted = response.text.trim();

    res.status(200).json({message: htmlFormatted});
  } catch (e) {
    console.log(e);
    res.status(500).json({message: "Error processing"});
  }
}

const getPastMessages = async (req, res) => {
  try {
    let pastChat = [];
    let sql = "SELECT user_role, content FROM message_tbl WHERE user_id = ?";
    let [messages] = await pool.query(sql, [req.user.userId]);

    if (messages.length > 0) {
      for (let i = 0; i < messages.length; i++) {
        pastChat.push({
          id: messages[i].id,
          role: messages[i].user_role,
          message: messages[i].content,
          time: messages[i].sentAt
        });
      }
    }

    res.status(200).json({success: true, data: pastChat})

  } catch (err) {
    console.log(err);
    res.status(500).json({success: false, message: "Server error"});
  }
}


export {
  chatAI,
  getPastMessages,
  generateEmailTemplate,
  paraphraseText,
  generateDocTemplate
}