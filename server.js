import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { Resend } from "resend";
import path from "path";
import fs from "fs/promises";
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


app.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).send("Missing prompt");

    const baseDocs = [
      new Document({
        pageContent: `
Name: Suraj Chawhan
Email: surajchauhan442918@gmail.com
Phone: 7840900295
LinkedIn: https://www.linkedin.com/in/suraj-chawhan
GitHub: https://www.github.com/Suraj-chawhan
        `.trim(),
      }),
      new Document({
        pageContent: `
Summary:
Aspiring web and mobile developer focused on building user-centric applications using modern tools like React, Next.js, and Firebase. Strong interest in full-stack development and scalable UI/UX design.
        `.trim(),
      }),
      new Document({
        pageContent: `
Skills:
Languages: JavaScript, TypeScript, Python
Frameworks and Libraries: React, Next.js, Tailwind CSS, Node.js, Express
Databases: Firebase, MongoDB
Tools: Git, GitHub, Postman, VS Code
Concepts: REST APIs, Authentication, Responsive Design, Cloud Functions
        `.trim(),
      }),
      new Document({
        pageContent: `
Experience:
Role: Frontend Developer
Company: Soven (Internship)
Duration: 2 months
Details:
- Built reusable UI components using React and Tailwind CSS
- Integrated frontend with backend APIs
- Worked in a team to deliver responsive and accessible features
- Collaborated in agile sprint cycles
        `.trim(),
      }),
      new Document({
        pageContent: `
Projects:
Spotify Clone:
Tech Stack: Next.js, Tailwind CSS, Supabase, PostgreSQL
Description:
- Built authentication flow with Supabase for login, registration, and role-based access
- Designed and implemented a custom audio player
- GitHub: [your repo link]

File Sharing App:
Tech Stack: Firebase, React, Node.js
Description:
- Secure file uploads/downloads with Firebase Storage
- User auth and history tracking
- GitHub: [your repo link]

AI Chatbot with LLM:
Tech Stack: LangChain, Hugging Face, MemoryVectorStore
Description:
- Embedded text file into memory vector store
- Used LLM with document retrieval for chat
- GitHub: [your repo link]
        `.trim(),
      }),
      new Document({
        pageContent: `
Education:
Bachelor of Engineering in Computer Science
University: Sant Gadge Baba Amravati University (SGBAU)
Expected Graduation: 2026
Relevant Coursework: Data Structures, Operating Systems, Computer Networks, DBMS
        `.trim(),
      }),
    ];

    const model = new ChatGroq({
      model: "llama-3.3-70b-versatile", // ✅ Use correct Groq model
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

    res.json({ output: answer || "No answer generated" });
  } catch (err) {
    console.error("❌ API Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(4000, () => {
  console.log("🚀 Server running at http://localhost:4000");
});
      
