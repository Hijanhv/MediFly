import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CustomerCareChat = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sessionToken, setSessionToken] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      const userMessage = {
        id: uuidv4(),
        role: "user",
        parts: [{ type: "text", text: inputValue.trim() }],
      };

      // Add user message to messages
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            sessionToken,
            userId: user?.id,
          }),
          signal: abortControllerRef.current.signal,
        });

        // Extract session token from response headers
        const newSessionToken = response.headers.get("X-Session-Token");
        if (newSessionToken && newSessionToken !== sessionToken) {
          setSessionToken(newSessionToken);
        }

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        // Create assistant message
        const assistantMessage = {
          id: uuidv4(),
          role: "assistant",
          parts: [],
        };

        // Add initial assistant message
        setMessages((prev) => [...prev, assistantMessage]);

        // Read the streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);

                setMessages((prev) => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];

                  if (lastMsg && lastMsg.role === "assistant") {
                    // Create a new parts array to avoid mutation
                    const newParts = [...lastMsg.parts];

                    if (parsed.type === "text-delta" && parsed.delta) {
                      // Find existing text part index
                      const textPartIndex = newParts.findIndex(
                        (p) => p.type === "text"
                      );

                      if (textPartIndex >= 0) {
                        // Create new text part with appended delta
                        newParts[textPartIndex] = {
                          ...newParts[textPartIndex],
                          text: newParts[textPartIndex].text + parsed.delta,
                        };
                      } else {
                        // Add new text part
                        newParts.push({
                          type: "text",
                          text: parsed.delta,
                        });
                      }

                      // Create new message object
                      updated[updated.length - 1] = {
                        ...lastMsg,
                        parts: newParts,
                      };
                    } else if (parsed.type === "tool-input-start") {
                      // Add tool call part
                      newParts.push({
                        type: "tool-call",
                        toolCallId: parsed.toolCallId,
                        toolName: parsed.toolName,
                        input: "",
                      });

                      updated[updated.length - 1] = {
                        ...lastMsg,
                        parts: newParts,
                      };
                    } else if (parsed.type === "tool-input-delta") {
                      // Update tool call input
                      const toolPartIndex = newParts.findIndex(
                        (p) =>
                          p.type === "tool-call" &&
                          p.toolCallId === parsed.toolCallId
                      );

                      if (toolPartIndex >= 0) {
                        newParts[toolPartIndex] = {
                          ...newParts[toolPartIndex],
                          input:
                            newParts[toolPartIndex].input +
                            parsed.inputTextDelta,
                        };

                        updated[updated.length - 1] = {
                          ...lastMsg,
                          parts: newParts,
                        };
                      }
                    } else if (parsed.type === "tool-input-available") {
                      // Update tool call with complete input
                      const toolPartIndex = newParts.findIndex(
                        (p) =>
                          p.type === "tool-call" &&
                          p.toolCallId === parsed.toolCallId
                      );

                      if (toolPartIndex >= 0) {
                        newParts[toolPartIndex] = {
                          ...newParts[toolPartIndex],
                          input: JSON.stringify(parsed.input, null, 2),
                        };

                        updated[updated.length - 1] = {
                          ...lastMsg,
                          parts: newParts,
                        };
                      }
                    } else if (parsed.type === "tool-output-available") {
                      // Add tool result part
                      newParts.push({
                        type: "tool-result",
                        toolCallId: parsed.toolCallId,
                        toolName: parsed.toolName || "unknown",
                        result: JSON.stringify(parsed.output, null, 2),
                      });

                      updated[updated.length - 1] = {
                        ...lastMsg,
                        parts: newParts,
                      };
                    }
                  }

                  return updated;
                });
              } catch (e) {
                console.error("Error parsing SSE data:", e);
              }
            }
          }
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Chat error:", error);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
          aria-label="Open customer care chat"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
            isMinimized ? "w-80 h-14" : "w-80 h-96 md:w-96 md:h-[500px]"
          }`}
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold">MediFly AI agent</h3>
                <p className="text-xs opacity-90">
                  {isLoading ? "Typing..." : "Always here to help"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMinimize}
                className="text-white/80 hover:text-white p-1 rounded"
                aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
              >
                {isMinimized ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={toggleChat}
                className="text-white/80 hover:text-white p-1 rounded"
                aria-label="Close chat"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-4 overflow-y-auto h-64 md:h-80 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">👋</div>
                    <p className="font-medium">
                      Hello! I'm your MediFly assistant
                    </p>
                    <p className="text-sm mt-1">
                      How can I help you with your deliveries today?
                    </p>

                    {/* Sample questions for user guidance */}
                    <div className="mt-6 space-y-2">
                      <p className="text-xs text-gray-400 mb-3">Try asking:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          "What's my order history?",
                          "Check my delivery status",
                          "What medicines do you deliver?",
                          "Find hospitals near me",
                          "Get my delivery statistics",
                        ].map((sample, index) => (
                          <button
                            key={index}
                            onClick={() => setInputValue(sample)}
                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200 text-gray-600 hover:text-gray-800"
                          >
                            {sample}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            message.role === "user"
                              ? "bg-indigo-600 text-white"
                              : "bg-white border border-gray-200 text-gray-800"
                          }`}
                        >
                          {message.parts?.map((part, index) => {
                            if (part.type === "text") {
                              return (
                                <div
                                  key={index}
                                  className="text-sm prose prose-sm max-w-none"
                                >
                                  <ReactMarkdown>{part.text}</ReactMarkdown>
                                </div>
                              );
                            }
                            // Hide tool call indicators from the UI
                            if (
                              part.type === "tool-call" ||
                              part.type === "tool-result"
                            ) {
                              return null;
                            }
                            return null;
                          })}
                          {message.content && !message.parts && (
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleFormSubmit} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about your deliveries..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    disabled={isLoading}
                  />
                  {isLoading ? (
                    <button
                      type="button"
                      onClick={handleStop}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      aria-label="Stop generation"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading || !inputValue.trim()}
                      className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Send message"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </button>
                  )}
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerCareChat;
