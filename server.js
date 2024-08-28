// server.js

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const cors = require("cors");
const app = express();
const server = http.createServer(app);

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("AIzaSyC-jOY-oR0jDfmp1a_L-W6c2ZT4vYlRGSo");

async function AI_GEMINI(prompt) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // const prompt = "What is melanoma?";

  const result = await model.generateContent(prompt, { wordLimit: 100 });
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;
}






app.use(cors());
app.use(express.static("public"));
const io = new socketIo.Server(server, {
  cors: {
    origin: "http://localhost:3000",
  }
});
app.use(express.json());
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("message", async (message) => {
    try {
      // Call LLM-based API
      //   const botResponse = await getLLMResponse(message);
      const botResponse = await AI_GEMINI(message);
      console.log(botResponse);

      // Emit bot's response to the sender's socket
      socket.emit("res_message", { text: botResponse, sender: "bot" });
    } catch (error) {
      console.error("Error fetching bot response:", error.message);
      // Emit error message to the sender's socket if API call fails
      socket.emit("message", {
        text: "Sorry, an error occurred while processing your request.",
        sender: "bot",
      });
    }
  });
});

// Function to call LLM-based API
const getLLMResponse = async (message) => {
  try {
    // Replace 'https://xyz' with your actual LLM API endpoint
    const response = await axios.post("https://xyz", { message });
    return response.data;
  } catch (error) {
    throw new Error("Error calling LLM-based API: " + error.message);
  }
};

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
