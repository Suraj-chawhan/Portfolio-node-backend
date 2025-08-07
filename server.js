import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { Resend } from "resend";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { Document } from "langchain/document";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const GROQ_API_KEY = process.env.GROQ_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const resend = new Resend(RESEND_API_KEY);


app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "suraj442915@gmail.com",
      subject: `Message from ${name}`,
      text: `From: ${email}\n\n${message}`,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Email Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


app.post("/temp", async (req, res) => {
  try {
    const { question } = req.body;

    const model = new ChatGroq({
      model: "llama3-70b-8192", // ✅ Correct model name
      apiKey: GROQ_API_KEY,     // ✅ Make sure it's defined before this
    });

    const response = await model.invoke(question); // ✅ Await is necessary
    res.send(response.content); // ✅ Works fine (or use res.json for objects)
  } catch (error) {
    res.send("Internal server error"); // ✅ Optional: log error too
  }
});



app.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;
    if (!prompt) return res.status(400).send("Missing prompt");

    const baseDocs = [
      new Document({
        pageContent: `
Name: Suraj Chawhan
Email: surajchauhan442918@gmail.com
Phone: +91-7840900295
LinkedIn: https://www.linkedin.com/in/suraj-chawhan
GitHub: https://github.com/suraj-chawhan
        `.trim(),
      }),
      new Document({
        pageContent: `
Skills:
Languages: JavaScript, C, C++, C#
Frameworks & Libraries: React.js, Next.js, Express.js, Node.js, React Native Expo
Tools & Technologies: Git, GitHub, Unity Game Engine, Blender
Database & Cloud: Firebase, MongoDB
        `.trim(),
      }),
      new Document({
        pageContent: `
Experience:
Soven Developer (2 months)
- Gained hands-on experience in web development.
        `.trim(),
      }),
      new Document({
        pageContent: `
Projects:

Spotify Clone
Tech: Next.js, Firebase
- Auth with Firebase (email/password, Google, Facebook)
- Custom audio player (play/pause/skip/volume)
- Responsive design with CSS frameworks
GitHub: https://github.com/Suraj-chawhan/Spotify-clone

App Downloading Site
Tech: Next.js, Firebase
- Secure file uploads using Firebase Storage
- File access via secure URLs
- Search functionality
GitHub: https://github.com/Suraj-chawhan/app-download-webapp

Fitness Application
Tech: React Native Expo
- Simple fitness app with integrated calendar and charts
GitHub: https://github.com/Suraj-chawhan/React-Native-Fitness-app

AI Chatbot Web App
Tech: Next.js
- Unified interface for communicating with multiple LLMs
GitHub: https://github.com/Suraj-chawhan/Aichatbot
        `.trim(),
      }),
      new Document({
        pageContent: `
Education:
Bachelor of Engineering in Computer Science
Sant Gadge Baba Amravati University, Amravati
Expected Graduation: 2026
Coursework: OOP, Data Structures & Algorithms, Databases, Discrete Mathematics, Operating Systems, Computer Networks
        `.trim(),
      }),
    ];

    const model = new ChatGroq({
      model: "llama3-70b-8192", // ✅ Correct model name
      apiKey: GROQ_API_KEY,
    });

    const promptTemplate = ChatPromptTemplate.fromTemplate(`
You are a helpful AI assistant. Use the provided resume context to answer the user's question.
Context:
{context}

Question:
{prompt}
    `.trim());

    const chain = await createStuffDocumentsChain({
      llm: model,
      prompt: promptTemplate,
    });

    const answer = await chain.invoke({
      context: baseDocs,
      prompt,
    });

    res.json({ output: answer});
  } catch (err) {
    console.error("❌ API Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(4000, () => {
  console.log("🚀 Server running at http://localhost:4000");
});

