import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  UserDB,
  ConversationDB,
  SessionDB,
  ResourceDB,
} from "./database/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Replace the entire middleware section with this:

// Simple middleware to handle user sessions without complex foreign key constraints
app.use(async (req, res, next) => {
  if (req.path === "/api/health") return next();

  let userId = req.headers["user-id"] || req.body.userId;

  if (!userId) {
    try {
      // Create new user for this session
      userId = await UserDB.createUser();
      console.log(`👤 Created new user: ${userId}`);
    } catch (error) {
      console.error("Error creating user:", error);
      // Fallback to a simple user ID
      userId = `temp-user-${Date.now()}`;
    }
  }

  // Ensure user exists in database before proceeding
  try {
    let user = await UserDB.getUser(userId);
    if (!user) {
      // User doesn't exist, create them
      await UserDB.createUser(userId);
      user = await UserDB.getUser(userId);
    }
    await UserDB.updateUserActivity(userId);
  } catch (error) {
    console.error("Error ensuring user exists:", error);
  }

  req.userId = userId;
  next();
});
// Store active sessions in memory (in production, use Redis)
const activeSessions = new Map();

// AI Response Handler with enhanced capabilities
class StudentSupportAI {
  constructor() {
    this.conversationContext = new Map();
  }

  async generateResponse(userId, message, previousContext = []) {
    const lowerMessage = message.toLowerCase();

    // Get recent conversation context from database
    const recentMessages = await ConversationDB.getRecentConversations(
      userId,
      2
    ); // Last 2 hours
    const context = recentMessages.map((msg) => ({
      role: msg.message_type,
      content: msg.message_type === "user" ? msg.message : msg.response,
    }));

    // AI response logic based on message content and context
    let response = this.analyzeMessage(lowerMessage, context);

    return response;
  }

  analyzeMessage(message, context) {
    // Check context for follow-up questions
    const lastInteraction = context[context.length - 1];

    // Stress-related queries
    if (
      message.includes("stress") ||
      message.includes("anxious") ||
      message.includes("overwhelmed") ||
      message.includes("pressure")
    ) {
      if (
        lastInteraction &&
        lastInteraction.role === "assistant" &&
        lastInteraction.content.includes("stress")
      ) {
        return this.getStressFollowUp(message);
      }
      return this.getStressResponse(message);
    }

    // Financial queries
    if (
      message.includes("financial") ||
      message.includes("money") ||
      message.includes("budget") ||
      message.includes("scholarship") ||
      message.includes("tuition")
    ) {
      if (
        lastInteraction &&
        lastInteraction.role === "assistant" &&
        lastInteraction.content.includes("financial")
      ) {
        return this.getFinancialFollowUp(message);
      }
      return this.getFinancialResponse(message);
    }

    // Academic queries
    if (
      message.includes("study") ||
      message.includes("exam") ||
      message.includes("assignment") ||
      message.includes("grade") ||
      message.includes("course") ||
      message.includes("homework")
    ) {
      if (
        lastInteraction &&
        lastInteraction.role === "assistant" &&
        lastInteraction.content.includes("academic")
      ) {
        return this.getAcademicFollowUp(message);
      }
      return this.getAcademicResponse(message);
    }

    // Resource queries
    if (
      message.includes("resource") ||
      message.includes("service") ||
      message.includes("help") ||
      message.includes("support") ||
      message.includes("campus")
    ) {
      return this.getResourceResponse(message);
    }

    // Mental health queries
    if (
      message.includes("mental") ||
      message.includes("depress") ||
      message.includes("anxiety") ||
      message.includes("counseling")
    ) {
      return this.getMentalHealthResponse(message);
    }

    // Time management queries
    if (
      message.includes("time") ||
      message.includes("schedule") ||
      message.includes("procrastinat") ||
      message.includes("deadline")
    ) {
      return this.getTimeManagementResponse(message);
    }

    // Greetings
    if (
      message.includes("hello") ||
      message.includes("hi") ||
      message.includes("hey") ||
      message.includes("greeting")
    ) {
      return "Hello! I'm your Student Support Assistant. I can help you with stress management, financial guidance, academic support, and connecting you with university resources. What would you like to talk about today?";
    }

    // Thanks
    if (
      message.includes("thank") ||
      message.includes("thanks") ||
      message.includes("appreciate")
    ) {
      return "You're welcome! I'm glad I could help. Is there anything else you'd like to discuss?";
    }

    // Default response with context awareness
    if (lastInteraction) {
      return "I want to make sure I understand correctly. Could you provide more details about what you're looking for?";
    }

    return "I understand you're looking for support. Could you tell me more about what you're experiencing? I can help with stress management, financial concerns, academic challenges, or connect you with specific university resources.";
  }

  getStressResponse(message) {
    const responses = [
      "I understand you're dealing with stress. This is very common among students. Have you tried any relaxation techniques like deep breathing or mindfulness exercises?",
      "Academic stress can feel overwhelming. Let me suggest breaking tasks into smaller, manageable steps and taking regular breaks. Would you like some specific stress management techniques?",
      "I can connect you with our campus counseling services. They offer free, confidential sessions for students. Would you like more information about that?",
      "Remember to maintain a healthy routine with proper sleep, exercise, and nutrition. These can significantly impact your stress levels. What specifically is causing you stress right now?",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  getStressFollowUp(message) {
    const responses = [
      "For immediate stress relief, try the 4-7-8 breathing technique: breathe in for 4 seconds, hold for 7 seconds, and exhale for 8 seconds. Repeat 4 times.",
      "The counseling center is open weekdays 9am-5pm. You can walk in or call (555) 123-HELP for an appointment. They also have emergency after-hours support.",
      "Consider joining a stress management workshop. They're held every Thursday at 3pm in the Student Wellness Center. Would you like me to send you more details?",
      "Physical activity is great for stress relief. The campus gym offers yoga classes and has a relaxation room. Have you visited the recreation center recently?",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  getFinancialResponse(message) {
    const responses = [
      "For financial guidance, I recommend visiting the Financial Aid Office in Admin Building Room 101. They can help with scholarships, loans, and budgeting advice.",
      "There are several budgeting apps designed for students like Mint and YNAB. Would you like recommendations for managing your expenses?",
      "The university offers emergency financial assistance for qualifying students. Shall I provide more details about eligibility and application process?",
      "Many students find part-time work on campus helpful. The Career Center has listings for student-friendly jobs with flexible hours. Interested in exploring this option?",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ... (keep all the other response methods from previous version)
  getFinancialFollowUp(message) {
    const responses = [
      "To apply for emergency funds, you'll need to complete the Emergency Aid Application form available at the Financial Aid Office. They typically process applications within 3-5 business days.",
      "The student food pantry is located in the Student Union basement and is open Monday-Friday 10am-4pm. They provide free groceries for students in need.",
      "For budgeting help, the Financial Literacy Center offers one-on-one sessions. You can book an appointment through the student portal under 'Campus Services'.",
      "Work-study positions pay $15-18 per hour and work around your class schedule. Check the 'Student Employment' section in the career portal for current openings.",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  getAcademicResponse(message) {
    const responses = [
      "For academic support, we have tutoring services available for most subjects. The Tutoring Center is located in Library Room 205 and offers both drop-in and appointment-based help.",
      "Time management is key for academic success. Would you like some tips for creating an effective study schedule that balances your coursework?",
      "Our Writing Center offers help with essays, research papers, and citations. They're available in-person and online. What specific writing challenge are you facing?",
      "Don't forget about professor office hours! They're a great resource for clarifying concepts and getting personalized help. Have you tried reaching out to your instructors?",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  getAcademicFollowUp(message) {
    const responses = [
      "The Tutoring Center requires appointments for specific subjects. You can book through their website or by calling (555) 123-TUTOR. Drop-in hours are for general study help.",
      "For time management, try the Pomodoro technique: study for 25 minutes, then take a 5-minute break. After four sessions, take a longer 15-20 minute break.",
      "The Writing Center can help with outlining, thesis development, and citation formatting. Bring your assignment instructions and any work you've started.",
      "Study groups are forming for many courses. Check the bulletin board outside the Library or post in your course's online forum to connect with classmates.",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  getResourceResponse(message) {
    const responses = [
      "The Resource Center in Student Union Room 300 has information about all campus services. Are you looking for health services, academic support, or something specific?",
      "I can connect you with various university departments. What type of assistance are you seeking - health, academic, financial, or something else?",
      "Our student portal has a comprehensive directory of campus resources. You can filter by category like 'Health & Wellness' or 'Academic Support'. Would you like me to guide you?",
      "Many students find the Peer Mentor program helpful. Upperclassmen mentors provide guidance on navigating university life. Would you like information about connecting with a mentor?",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  getMentalHealthResponse(message) {
    const responses = [
      "Your mental health is important. The University Counseling Center provides free, confidential services. They're located in Wellness Center Room 102.",
      "There's a 24/7 mental health hotline available at (555) 123-SUPPORT. You can call anytime to speak with a trained counselor.",
      "Wellness workshops on topics like mindfulness and anxiety management are held weekly. Would you like the current schedule?",
      "Remember that seeking help is a sign of strength. Many students use counseling services - you're not alone in this.",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  getTimeManagementResponse(message) {
    const responses = [
      "Effective time management starts with prioritizing tasks. Try creating a weekly schedule that blocks out time for classes, studying, and self-care.",
      "The Academic Success Center offers time management workshops every Monday at 2pm. They cover techniques like task batching and priority matrix.",
      "Digital tools like Google Calendar or Todoist can help you stay organized. Would you like tips for setting up an effective digital planner?",
      "Breaking large projects into smaller tasks can make them feel more manageable. What specific project are you working on?",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

const aiAssistant = new StudentSupportAI();

// Middleware to handle user sessions
app.use(async (req, res, next) => {
  if (req.path === "/api/health") return next();

  let userId = req.headers["user-id"] || req.body.userId;

  if (!userId) {
    // Create new user for this session
    userId = await UserDB.createUser();
    activeSessions.set(userId, {
      sessionId: await SessionDB.startSession(userId),
      startTime: new Date(),
    });
  } else {
    // Update existing user activity
    await UserDB.updateUserActivity(userId);
    if (!activeSessions.has(userId)) {
      activeSessions.set(userId, {
        sessionId: await SessionDB.startSession(userId),
        startTime: new Date(),
      });
    }
  }

  req.userId = userId;
  next();
});

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "Server is running",
    timestamp: new Date().toISOString(),
    service: "Student Support API with SQLite",
    database: "Connected",
  });
});

// AI Chat endpoint with database storage

// AI Chat endpoint with database storage
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Ensure user exists before saving conversation
    try {
      await UserDB.createUser(userId);
    } catch (error) {
      console.error("Error ensuring user exists for conversation:", error);
    }

    // Generate AI response
    const response = await aiAssistant.generateResponse(userId, message, []);

    // Save both user message and AI response to database
    try {
      await ConversationDB.saveMessage(userId, message, response, "user");
      console.log(`💾 Saved conversation for user: ${userId}`);
    } catch (error) {
      console.error("Error saving conversation:", error);
      // Continue even if saving fails - don't break the chat experience
    }

    res.json({
      response,
      userId,
      timestamp: new Date().toISOString(),
      messageId: Date.now(),
      type: "ai_response",
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Please try again in a moment",
    });
  }
});
// Get conversation history
app.get("/api/chat/history", async (req, res) => {
  try {
    const userId = req.userId;
    const history = await ConversationDB.getConversationHistory(userId, 20);

    res.json({
      userId,
      history: history.map((msg) => ({
        id: msg.id,
        type: msg.message_type,
        message: msg.message_type === "user" ? msg.message : msg.response,
        timestamp: msg.timestamp,
      })),
      totalMessages: history.length,
    });
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Resource data endpoint - now using database
app.get("/api/resources", async (req, res) => {
  try {
    const resources = await ResourceDB.getAllResources();

    // Group by category
    const groupedResources = resources.reduce((acc, resource) => {
      if (!acc[resource.category]) {
        acc[resource.category] = [];
      }
      acc[resource.category].push(resource);
      return acc;
    }, {});

    res.json(groupedResources);
  } catch (error) {
    console.error("Resources error:", error);
    // Fallback to static data if database fails
    const fallbackResources = {
      academic: [
        {
          name: "Tutoring Center",
          description: "One-on-one tutoring for various subjects",
          contact: "tutoring@university.edu",
          location: "Library Room 205",
          hours: "Mon-Fri 9am-7pm, Sat 10am-2pm",
        },
        // ... other fallback resources
      ],
      // ... other categories
    };
    res.json(fallbackResources);
  }
});

// User profile endpoint
app.get("/api/user/profile", async (req, res) => {
  try {
    const userId = req.userId;
    const user = await UserDB.getUser(userId);
    const history = await ConversationDB.getConversationHistory(userId, 5);

    res.json({
      userId,
      createdAt: user.created_at,
      lastActive: user.last_active,
      recentConversations: history.length,
      sessionActive: activeSessions.has(userId),
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Resource data endpoint
app.get("/api/resources", (req, res) => {
  const resources = {
    academic: [
      {
        name: "Tutoring Center",
        description: "One-on-one tutoring for various subjects",
        contact: "tutoring@university.edu",
        location: "Library Room 205",
        hours: "Mon-Fri 9am-7pm, Sat 10am-2pm",
      },
      // ... (keep existing resource data)
    ],
    // ... (other categories)
  };

  res.json(resources);
});

app.listen(PORT, () => {
  console.log(`🚀 Student Support API with SQLite running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});
