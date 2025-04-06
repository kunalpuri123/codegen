"use client";
import { useState, useRef, useEffect } from "react";
import { Paperclip, Mic, CornerDownLeft, History, Plus } from "lucide-react";
import { chatSession } from "./GeminiAIModal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import cpp from "highlight.js/lib/languages/cpp";
import java from "highlight.js/lib/languages/java";
import csharp from "highlight.js/lib/languages/csharp";
import go from "highlight.js/lib/languages/go";
import "highlight.js/styles/monokai.css";
import { TextShimmer } from "./TextShimmer";
import { db } from "@/utils/db";
import { UserChatSessions } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";
import { Copy } from "lucide-react"; 
import 'highlight.js/styles/github-dark.css'; 
import Link from 'next/link';
import { UserButton} from '@clerk/nextjs';
import { Pencil, Trash } from "lucide-react";
import { Edit } from "lucide-react";


import { useRouter } from "next/navigation";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("java", java);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("go", go);

const isCodingProblem = (message) => {
  const trimmed = message.trim();
  const words = trimmed.split(/\s+/);
  if (words.length === 1) {
    const bannedWords = new Set(["hi", "hello", "hey", "thanks", "bye", "goodbye", "please"]);
    if (bannedWords.has(trimmed.toLowerCase())) return false;
    return true;
  }
  const codingKeywords = /\b(function|array|loop|algorithm|sort|search|data structure|linked list|tree|graph|time complexity|space complexity|brute force|optimal|code|problem|program|coding|fibonacci)\b/i;
  return codingKeywords.test(trimmed);
};

const generatePrompt = (problemStatement, language) => {
  return `Provide the following information for the given coding problem statement, specifically in ${language}:

Problem Statement: ${problemStatement}

1. Brute Force Approach:
   - Code implementation
   - Explanation/Intution (In short)
   - Time and Space Complexity
  

2. Better Approach:
   - Code implementation
   - Explanation/Intution (In short)
   - Time and Space Complexity
   

3. Optimal Approach:
   - Code implementation
   - Explanation/Intution (In short)
   - Time and Space Complexity
   

4. Edge Cases:
   - Mention edge cases

Respond in a clear and structured format. Use code blocks (\`\`\`${language} ... \`\`\`) for code implementations, matching the selected language. If a code implementation is not possible, clearly explain the approach. Ensure the code is directly copyable. Return code in separate code blocks from explanations.
Also suggest articles link or youtube link related to problem.Dont ask me to search u search and directly give me link.`;
};

export default function CodeGenAI() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const [sessions, setSessions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const messageContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const router = useRouter();

  const messages = sessions[currentSessionIndex]?.messages || [];

  const fetchChatHistory = async () => {
    if (!userEmail) return;
    try {
      const dbChats = await db
        .select()
        .from(UserChatSessions)
        .where(eq(UserChatSessions.userEmail, userEmail))
        .execute();

      const chatSessions = dbChats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        messages: chat.messages,
      }));

      setSessions(chatSessions);
      setCurrentSessionIndex(chatSessions.length > 0 ? 0 : -1);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [userEmail]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
      });
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + " " + transcript);
      };

      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const saveChatToDB = async (session) => {
    try {
      const existing = await db
        .select()
        .from(UserChatSessions)
        .where(eq(UserChatSessions.userEmail, userEmail))
        .where(eq(UserChatSessions.title, session.title))
        .execute();

      if (existing.length > 0) {
        await db
          .update(UserChatSessions)
          .set({ messages: session.messages, updatedAt: new Date() })
          .where(eq(UserChatSessions.id, existing[0].id))
          .execute();
      } else {
        await db
          .insert(UserChatSessions)
          .values({
            userEmail,
            title: session.title,
            messages: session.messages,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .execute();
      }
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };

  const addMessageToCurrentSession = async (newMessage) => {
    const updatedSessions = [...sessions];
    updatedSessions[currentSessionIndex].messages.push(newMessage);
    setSessions(updatedSessions);
    await saveChatToDB(updatedSessions[currentSessionIndex]);
  };

  const handleSendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage) return;

    await addMessageToCurrentSession({ id: Date.now(), content: userMessage, sender: "user" });
    setInput("");

    if (!isCodingProblem(userMessage)) {
      await addMessageToCurrentSession({
        id: Date.now(),
        content: "Invalid input. Please provide a coding problem statement.",
        sender: "ai",
      });
      return;
    }

    setIsLoading(true);
    try {
      const prompt = generatePrompt(userMessage, selectedLanguage);
      const result = await chatSession.sendMessage(prompt);
      const aiResponse = await result.response.text();

      await addMessageToCurrentSession({ id: Date.now(), content: aiResponse, sender: "ai" });
    } catch (error) {
      console.error("Error:", error);
      await addMessageToCurrentSession({
        id: Date.now(),
        content: "Error: Could not process the request.",
        sender: "ai",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported.");
      return;
    }
    if (isRecording) recognitionRef.current.stop();
    else recognitionRef.current.start();
    setIsRecording(!isRecording);
  };

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  function YouTubeEmbed({ url }) {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return (
      <div className="my-4">
        <iframe
          className="w-full aspect-video rounded-lg border-2 border-blue-400"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          frameBorder="0"
          allowFullScreen
        />
      </div>
    );
  }

  

  const handleNewChat = async () => {
    const newSession = {
      id: Date.now(),
      title: `Chat ${sessions.length + 1}`,
      messages: [{ id: 1, content: "Hello! Please provide a coding problem statement.", sender: "ai" }],
    };

    const updated = [...sessions, newSession];
    setSessions(updated);
    setCurrentSessionIndex(updated.length - 1);
    await saveChatToDB(newSession);
  };

  const handleSessionSelect = (index) => {
    setCurrentSessionIndex(index);
  };


  const handleDeleteSession = async (id) => {

    const confirmDelete = confirm("Are you sure you want to delete this chat?");
    if (!confirmDelete) return;
  
    try {
      // Delete from database using Drizzle
      await db.delete(UserChatSessions).where(eq(UserChatSessions.id, id));
  
      // Remove from local state
      const updatedSessions = sessions.filter((s) => s.id !== id);
      setSessions(updatedSessions);
  
      // Update current index
      if (currentSessionIndex >= updatedSessions.length) {
        setCurrentSessionIndex(updatedSessions.length - 1);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
      alert("Error deleting chat!");
    }
  };

  const handleRenameSession = async (id) => {
    const newTitle = prompt("Enter a new title:");
    if (!newTitle || newTitle.trim() === "") return;
  
    try {
      await db
        .update(UserChatSessions)
        .set({ 
          title: newTitle, 
          updatedAt: new Date() // required since it's NOT NULL
        })
        .where(eq(UserChatSessions.id, id));
  
      // Update local state
      const updatedSessions = sessions.map((s) =>
        s.id === id ? { ...s, title: newTitle } : s
      );
      setSessions(updatedSessions);
    } catch (error) {
      console.error("Failed to rename chat:", error);
      alert("Error renaming chat!");
    }
  };

  const handleClick = () => {
    window.location.href = "/"; // Full reload to homepage
  };
  

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#1c1c1c", color: "#fff" }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{
          width: "250px",
          backgroundColor: "#2a2a2a",
          padding: "20px",
          boxShadow: "2px 0 6px rgba(0,0,0,0.5)",
          overflowY: "auto",
          transition: "transform 0.3s ease-in-out",
        }}>
          <button onClick={() => setSidebarOpen(false)} style={{
            background: "transparent",
            color: "#fff",
            border: "none",
            fontSize: "20px",
            marginBottom: "10px"
          }}>×</button>


      <h1
        className="text-base md:text-2xl font-normal leading-[36px] text-left group hover:scale-105 transition-all duration-500 mb-4"

          style={{
            fontFamily: 'Nasalization, sans-serif',
            letterSpacing: '-0.05em',
          }}
        >
          <span className="text-white">CodeGen</span>
          <i
            className="bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text animate-gradient-move"
            style={{ display: 'inline-block' }}
          >
            AI
          </i>
        </h1>
  


          <button onClick={handleNewChat} style={{
            backgroundColor: "#4c4cff",
            color: "#fff",
            padding: "10px 15px",
            borderRadius: "8px",
            marginBottom: "20px",
            width: "100%",
            fontWeight: "bold",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <Plus size={16} /> New Chat
          </button>

          <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>History</h3>
          {sessions.map((session, index) => (
  <div
    key={session.id}
    style={{
      padding: "10px",
      borderRadius: "6px",
      backgroundColor: index === currentSessionIndex ? "#3a3a3a" : "transparent",
      cursor: "pointer",
      marginBottom: "8px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px"
    }}
  >
    <div
      onClick={() => handleSessionSelect(index)}
      style={{
        flex: 1,
        overflow: "hidden",
        textOverflow: "ellipsis"
      }}
    >
      {session.title}
    </div>

    <Trash
  size={16}
  style={{ color: "#ff4d4f", cursor: "pointer" }}
  onClick={() => handleDeleteSession(session.id)}
/>
<Edit onClick={() => handleRenameSession(session.id)} />


  </div>
))}

        </div>
      )}

      {/* Chat Area */}
      <div
  ref={messageContainerRef}
  style={{
    flex: 1,
    overflowY: "auto",
    padding: "0 20px 120px", // Removed top padding (was 80px)
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  }}
>

        {/* Sidebar Toggle Button */}
        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            backgroundColor: "#4c4cff",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: "6px",
            zIndex: 999
          }}>
            ☰
          </button>
        )}

<nav style={{
  height: "60px",
  backgroundColor: "#2d2d2d",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 20px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.5)"
}}>
  {/* Back Icon Button */}
  <button
      onClick={handleClick}
      style={{
        background: "none",
        border: "none",
        color: "#fff",
        fontSize: "22px",
        cursor: "pointer",
        marginLeft: "30px", // Pushes it a bit away from sidebar
      }}
    >
      ←
    </button>

  

  {/* Title */}
  <h1 style={{
    fontFamily: 'Nasalization, sans-serif',
    fontSize: "24px",
    letterSpacing: '-0.05em',
    color: "#fff"
  }}>
    <span>CodeGen</span>
    <span style={{
      background: "linear-gradient(to right, #a855f7, #9333ea)",
      WebkitBackgroundClip: "text",
      color: "transparent"
    }}>AI</span>
  </h1>

  <div className="flex justify-end">
        {user ? (
          // If the user is logged in, show the UserButton from Clerk
          <UserButton />
        ) : (
          // Otherwise, show a Login button
          <Link href="/sign-in">
            <button
              className="w-[100px] h-[40px] text-[14px] md:w-[140px] md:h-[50px] md:text-[18px] font-semibold rounded-full bg-[#535DAB] hover:bg-[#6b76d1] transition-all text-white"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              Login
            </button>
          </Link>
        )}
      </div>
</nav>


        {/* Chat Messages */}
        <div ref={messageContainerRef} style={{ flex: 1, overflowY: "auto", padding: "80px 20px 120px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {messages.map((message) => (
            <div key={message.id} style={{
              alignSelf: message.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: message.sender === "user" ? "#007bff" : "#333",
              padding: "12px",
              borderRadius: "12px",
              maxWidth: "70%",
              whiteSpace: "pre-wrap"
            }}>
 <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const uniqueKey = Math.random();

            if (!inline && match) {
              const highlighted = hljs.highlight(codeString, {
                language: match[1],
              }).value;

              return (
                <div className="relative group my-4">
                  <button
                    onClick={() => handleCopy(codeString, uniqueKey)}
                    className="absolute top-2 right-2 bg-gray-700 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedIndex === uniqueKey ? "Copied!" : "Copy"}
                  </button>
                  <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                    <code
                      className={`hljs language-${match[1]}`}
                      dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                  </pre>
                </div>
              );
            }

            return (
              <code className="bg-gray-800 text-green-400 px-1 py-0.5 rounded">
                {children}
              </code>
            );
          },

          a({ href, children }) {
            if (href?.match(/youtube\.com|youtu\.be/)) {
              return (
                <div className="my-4">
                  <iframe
                    className="w-full aspect-video rounded-lg"
                    src={href.replace("watch?v=", "embed/")}
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {children}
              </a>
            );
          },

          strong({ children }) {
            return <strong className="text-purple-400">{children}</strong>;
          },

          em({ children }) {
            return <em className="text-pink-400 italic">{children}</em>;
          },
        }}
      >
        {message.content}
      </ReactMarkdown>
    </div>
            </div>
          ))}
          {isLoading && (
            <div style={{
              alignSelf: "flex-start",
              backgroundColor: "#333",
              padding: "12px",
              borderRadius: "12px",
              maxWidth: "70%",
              color: "#fff"
            }}>
              <TextShimmer>Generating code...</TextShimmer>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "800px",
          padding: "12px 18px",
          backgroundColor: "#2d2d2d",
          borderRadius: "30px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.5)"
        }}>
          <input
            type="text"
            placeholder="Type a coding problem statement..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#333",
              color: "white",
              borderRadius: "20px",
              border: "none",
              fontSize: "16px",
              outline: "none"
            }}
          />
          <button onClick={handleVoiceInput} style={{ backgroundColor: "transparent", border: "none", color: "#fff" }}>
            <Mic color={isRecording ? "red" : "white"} />
          </button>
          <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "5px",
            backgroundColor: "#333",
            color: "white",
            border: "none",
          }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="csharp">C#</option>
          <option value="go">Go</option>
        </select>
          <button onClick={handleSendMessage} style={{
            backgroundColor: "#4c4cff",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "20px",
            border: "none",
            fontWeight: "bold"
          }}>
            <CornerDownLeft />
          </button>
        </div>
      </div>
    </div>
  );
}
