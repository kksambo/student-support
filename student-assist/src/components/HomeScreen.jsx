import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaRobot,
  FaBook,
  FaBrain,
  FaHandHoldingUsd,
  FaGraduationCap,
  FaUniversity,
  FaHeartbeat,
  FaComments,
  FaArrowRight,
  FaUser,
  FaPaperPlane,
} from "react-icons/fa";
import "./StudentSupport.css";

const StudentSupport = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [aiMessage, setAiMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(
    () => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  // Initialize with welcome message
  useEffect(() => {
    setConversation([
      {
        id: 1,
        type: "ai",
        message:
          "Hello! I'm your Student Support Assistant. I can help you with stress management, financial guidance, academic support, and connecting you with university resources. What would you like to talk about today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (aiMessage.trim() === "") return;

    const userMessage = aiMessage;
    setAiMessage("");
    setIsLoading(true);

    // Add user message to conversation
    const newUserMessage = {
      id: Date.now(),
      type: "user",
      message: userMessage,
      timestamp: new Date().toISOString(),
    };

    setConversation((prev) => [...prev, newUserMessage]);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          UserId: userId,
        },
        body: JSON.stringify({
          message: userMessage,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      // Add AI response to conversation
      const newAiMessage = {
        id: Date.now() + 1,
        type: "ai",
        message: data.response,
        timestamp: data.timestamp,
      };

      setConversation((prev) => [...prev, newAiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Fallback response if server is down
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        message:
          "I'm having trouble connecting right now. Please try again in a moment. In the meantime, you can visit the Resource Center tab for immediate support options.",
        timestamp: new Date().toISOString(),
      };

      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickStressOption = () => {
    setAiMessage("I need help coping with stress.");
    // Trigger the submit automatically
    setTimeout(() => {
      const submitEvent = new Event("submit", { cancelable: true });
      const form = document.querySelector(".message-form");
      if (form) form.dispatchEvent(submitEvent);
    }, 100);
  };

  const quickOptions = [
    { text: "I need help coping with stress.", handler: quickStressOption },
    {
      text: "I'm having financial difficulties.",
      handler: () => setAiMessage("I'm having financial difficulties."),
    },
    {
      text: "I need academic support.",
      handler: () => setAiMessage("I need academic support."),
    },
    {
      text: "Where can I find campus resources?",
      handler: () => setAiMessage("Where can I find campus resources?"),
    },
  ];

  return (
    <div className="student-support">
      {/* Header */}
      <header className="support-header">
        <h1>
          <FaGraduationCap className="header-icon" /> STUDENT SUPPORT
        </h1>
      </header>

      {/* Navigation Tabs */}
      <nav className="support-nav">
        <div
          className={`nav-item ${activeTab === "home" ? "active" : ""}`}
          onClick={() => setActiveTab("home")}
        >
          <FaHome className="nav-icon" />
          <span>Home</span>
        </div>
        <div
          className={`nav-item ${activeTab === "ai" ? "active" : ""}`}
          onClick={() => setActiveTab("ai")}
        >
          <FaRobot className="nav-icon" />
          <span>AI Assistance</span>
        </div>
        <div
          className={`nav-item ${activeTab === "resources" ? "active" : ""}`}
          onClick={() => setActiveTab("resources")}
        >
          <FaBook className="nav-icon" />
          <span>Resource Center</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="support-main">
        {/* Home Tab */}
        {activeTab === "home" && (
          <div className="tab-content home-tab">
            <div className="services-section">
              <h2>Student Support Services</h2>
              <div className="services-grid">
                <div className="service-card">
                  <div className="service-icon">
                    <FaBrain />
                  </div>
                  <h3>Manage Stress</h3>
                  <p>
                    Tools and techniques to help you manage academic stress and
                    maintain mental wellness.
                  </p>
                </div>
                <div className="service-card">
                  <div className="service-icon">
                    <FaRobot />
                  </div>
                  <h3>AI Assistance</h3>
                  <p>
                    Get personalized support and guidance from our AI assistant
                    anytime.
                  </p>
                </div>
                <div className="service-card">
                  <div className="service-icon">
                    <FaHandHoldingUsd />
                  </div>
                  <h3>Financial Guidance</h3>
                  <p>
                    Resources for managing your finances, scholarships, and
                    budgeting during studies.
                  </p>
                </div>
                <div className="service-card">
                  <div className="service-icon">
                    <FaBook />
                  </div>
                  <h3>Resource Center</h3>
                  <p>
                    Access all available university resources and support
                    services in one place.
                  </p>
                </div>
              </div>
            </div>

            <div className="get-support-section">
              <div className="support-cta">
                <h2>Get Support</h2>
                <p>Services</p>
                <button className="cta-button">
                  Connect with Support <FaArrowRight className="button-icon" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Assistance Tab */}
        {activeTab === "ai" && (
          <div className="tab-content ai-tab">
            <div className="ai-header">
              <h2>
                <FaRobot className="tab-title-icon" /> AI Assistance
              </h2>
              <p>How can I help you today?</p>
            </div>

            <div className="ai-chat-container">
              <div className="chat-messages">
                {conversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${
                      msg.type === "user" ? "user-message" : "ai-message"
                    }`}
                  >
                    <div className="message-avatar">
                      {msg.type === "user" ? <FaUser /> : <FaRobot />}
                    </div>
                    <div className="message-content">
                      <p>{msg.message}</p>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message ai-message">
                    <div className="message-avatar">
                      <FaRobot />
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="quick-options">
                <div className="option-label">Quick options:</div>
                <div className="quick-options-grid">
                  {quickOptions.map((option, index) => (
                    <button
                      key={index}
                      className="quick-option"
                      onClick={option.handler}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAiSubmit} className="message-form">
                <div className="input-container">
                  <input
                    type="text"
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className="send-button"
                    disabled={isLoading}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Resource Center Tab */}
        {activeTab === "resources" && (
          <div className="tab-content resources-tab">
            <div className="resources-header">
              <h2>
                <FaBook className="tab-title-icon" /> Resource Center
              </h2>
              <p>Access university resources and support services</p>
            </div>

            <div className="resources-grid">
              <div className="resource-card">
                <div className="resource-icon">
                  <FaGraduationCap />
                </div>
                <h3>Reliable Sources</h3>
                <p>
                  Trusted academic references, research databases, and citation
                  tools.
                </p>
                <button className="resource-button">Explore</button>
              </div>
              <div className="resource-card">
                <div className="resource-icon">
                  <FaUniversity />
                </div>
                <h3>University Services</h3>
                <p>
                  Access all university-provided services, facilities, and
                  administrative support.
                </p>
                <button className="resource-button">Explore</button>
              </div>
              <div className="resource-card">
                <div className="resource-icon">
                  <FaHeartbeat />
                </div>
                <h3>Health & Wellness</h3>
                <p>
                  Resources for maintaining physical and mental health,
                  counseling, and wellness programs.
                </p>
                <button className="resource-button">Explore</button>
              </div>
              <div className="resource-card">
                <div className="resource-icon">
                  <FaBook />
                </div>
                <h3>Academic Support</h3>
                <p>
                  Tutoring, writing centers, academic advising, and study
                  resources.
                </p>
                <button className="resource-button">Explore</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentSupport;
