import { GoogleGenAI } from "@google/genai";
import { marked } from "marked";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

const generateTemplate = async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

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

    res.status(200).json({message: marked(response.text)});


  } catch (e) {
    console.log(e);
    res.status(500).json({message: "Error processing"});
  }
}


const citeUrl = async (req, res) => {
  const { prompt } = req.body;

  
}



export {
  generateTemplate,
  paraphraseText,
  citeUrl
}