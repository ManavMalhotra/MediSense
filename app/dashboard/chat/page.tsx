// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Send, Mic, Bot, User } from "lucide-react";
// import AgoraChat from "agora-chat"; // make sure to `npm i agora-chat`

// // ---------- CONFIG (change as needed) ----------
// const AGORA_APP_KEY = "411422945#1623987"; // your AppKey
// // Agora real frontend user
// const FRONTEND_USER_ID = "ayushs2811002";
// const FRONTEND_USER_TOKEN =
//   "007eJxTYDBbYiGXLrPKW03MT6Pfv9mrYe7vJUxKIVvXP9j9rDXHpluBwTQt0TjNzNQ8OS3FxMTcwtzCxNLcwNjQ1CLZMM3MINGYe4J4ZkMgI8PVu2WsjAysDIxACOKrMJgamBkmpxgY6CYbWprqGhqmGehaWKaa6KYZJiWaGqeZmJmbGQEAUOYkTg==";
// const BOT_USER_ID = "bot123"; // backend will act as this bot user
// // ------------------------------------------------

// export default function AiChatPage() {
//   const [messages, setMessages] = useState<
//     { id: number; sender: "ai" | "user" | string; text: string }[]
//   >([
//     {
//       id: 1,
//       sender: "ai",
//       text: "Hello! I'm your Smart Health Assistant. How can I help you today?",
//     },
//     {
//       id: 2,
//       sender: "user",
//       text: "Show me my today's medication schedule.",
//     },
//   ]);
//   const [input, setInput] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement | null>(null);

//   // Agora connection instance
//   const connRef = useRef<any | null>(null);

//   useEffect(() => {
//     // Scroll to bottom helper
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isTyping]);

//   useEffect(() => {
//     // Initialize Agora Chat connection
//     try {
//       const conn = new AgoraChat.connection({ appKey: AGORA_APP_KEY });
//       connRef.current = conn;

//       // open / login
//       conn
//         .open({
//           user: FRONTEND_USER_ID,
//           agoraToken: FRONTEND_USER_TOKEN,
//         })

//         .then(() => {
//           console.log("Agora frontend logged in as", FRONTEND_USER_ID);
//         })
//         .catch((err: any) => {
//           console.error("Agora open error:", err);
//         });

//       // Handler: If SDK emits 'textMessage' events (some versions) -> process
//       conn.on &&
//         conn.on("textMessage", (msg: any) => {
//           // message payload may vary by SDK version; adapt as needed
//           const from = msg.from || msg.fromId || msg.fromUser || "bot";
//           const body =
//             msg.msg ||
//             msg.body?.msg ||
//             msg.body?.content ||
//             msg.data ||
//             JSON.stringify(msg);

//           setMessages((prev) => [
//             ...prev,
//             { id: Date.now(), sender: from, text: String(body) },
//           ]);
//         });

//       // Handler: also listen for generic 'messageReceived' if present
//       conn.on &&
//         conn.on("messageReceived", (msg: any) => {
//           // the structure depends on SDK: try a few fallbacks
//           let from = msg.from || msg?.fromId || msg?.fromUser || "bot";
//           let body =
//             (msg?.body && (msg.body.msg || msg.body.content || msg.body)) ||
//             msg?.msg ||
//             (msg?.data && JSON.stringify(msg.data)) ||
//             "";
//           // sometimes the message object is nested: try deeper
//           if (!body && msg?.payload) {
//             body = msg.payload?.content || JSON.stringify(msg.payload);
//           }

//           setMessages((prev) => [
//             ...prev,
//             { id: Date.now(), sender: from, text: String(body) },
//           ]);
//         });

//       // Optional: presence / typing events - SDK dependent
//       conn.on &&
//         conn.on("typing", (ev: any) => {
//           // You can adapt this depending on the event payload
//           setIsTyping(Boolean(ev?.isTyping ?? true));
//           // remove typing after a short delay if no further events
//           setTimeout(() => setIsTyping(false), 2500);
//         });

//       // Cleanup on unmount
//       return () => {
//         try {
//           if (connRef.current) {
//             // close or logout if method exists
//             connRef.current.close && connRef.current.close();
//             connRef.current.logout && connRef.current.logout();
//             connRef.current = null;
//           }
//         } catch (err) {
//           console.warn("Error closing Agora connection:", err);
//         }
//       };
//     } catch (err) {
//       console.error("Failed to initialize Agora:", err);
//     }
//   }, []);

//   const sendMessage = async () => {
//     const text = input?.trim();
//     if (!text) return;

//     // optimistic UI
//     setMessages((prev) => [
//       ...prev,
//       { id: Date.now(), sender: FRONTEND_USER_ID, text },
//     ]);

//     setInput("");

//     try {
//       const conn = connRef.current;
//       if (!conn) {
//         console.warn("Agora connection not initialized");
//         return;
//       }

//       // FIX: Add message ID
//       const msgId = AgoraChat.utils.getUniqueId();

//       const msgPayload = {
//         id: msgId,
//         type: "txt",
//         chatType: "singleChat",
//         to: BOT_USER_ID,
//         msg: text,
//       };

//       if (typeof conn.send === "function") {
//         await conn.send(msgPayload);
//       } else if (typeof conn.sendMessage === "function") {
//         await conn.sendMessage(msgPayload);
//       }
//     } catch (err) {
//       console.error("Failed to send message via Agora:", err);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto h-[720px] border rounded-md shadow-sm flex flex-col">
//       <div className="p-4 border-b flex items-center gap-3">
//         <Bot />
//         <div>
//           <div className="font-semibold">Smart Health Assistant</div>
//           <div className="text-xs text-muted-foreground">
//             Chat with the medical bot
//           </div>
//         </div>
//       </div>

//       {/* Messages area */}
//       <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
//         {messages.map((m) => (
//           <div
//             key={m.id}
//             className={`mb-3 flex ${
//               m.sender === FRONTEND_USER_ID ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`px-4 py-2 rounded-md max-w-[70%] text-sm ${
//                 m.sender === FRONTEND_USER_ID
//                   ? "bg-purple-600 text-white"
//                   : "bg-white text-gray-900"
//               }`}
//             >
//               <div className="whitespace-pre-wrap">{m.text}</div>
//               <div className="text-xs text-gray-400 mt-1">
//                 {m.sender === FRONTEND_USER_ID ? "You" : m.sender}
//               </div>
//             </div>
//           </div>
//         ))}

//         {isTyping && (
//           <div className="flex items-center gap-2 mb-3">
//             <Bot size={18} />
//             <div className="animate-pulse text-sm">Assistant is typing…</div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input Bar */}
//       <div className="p-4 border-t bg-white flex items-center gap-3">
//         <input
//           className="flex-1 border rounded-md p-3 text-sm outline-none focus:ring-2 focus:ring-purple-400"
//           placeholder="Ask something…"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") sendMessage();
//           }}
//         />
//         <button
//           className="p-3 rounded-md bg-gray-200 hover:bg-gray-300"
//           onClick={() => {
//             /* future: implement mic */
//           }}
//         >
//           <Mic size={20} />
//         </button>
//         <button
//           className="p-3 rounded-md bg-purple-600 text-white hover:bg-purple-700"
//           onClick={sendMessage}
//         >
//           <Send size={20} />
//         </button>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Mic, Bot, User } from "lucide-react";

export default function AiChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I'm your Smart Health Assistant. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: userMsg.text }),
      });

      const data = await res.json();

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: data.reply || "I could not understand that.",
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: "ai",
          text: "⚠ Error: Unable to reach Gemini server.",
        },
      ]);
    }

    setTyping(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50">
      {/* Chat UI (unchanged) */}
      <div className="flex flex-col flex-1">
        <header className="p-4 border-b bg-white flex items-center gap-3">
          <Bot className="text-purple-600" size={24} />
          <h1 className="text-xl font-semibold">AI Health Assistant</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-lg text-sm shadow-sm ${
                  msg.sender === "user"
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 border rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex items-center gap-2 text-gray-500">
              <Bot size={18} />
              <div className="animate-pulse text-sm">Assistant is typing…</div>
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white flex items-center gap-3">
          <input
            className="flex-1 border rounded-md p-3 text-sm outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Ask something…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="p-3 rounded-md bg-gray-200 hover:bg-gray-300">
            <Mic size={20} />
          </button>
          <button
            className="p-3 rounded-md bg-purple-600 text-white hover:bg-purple-700"
            onClick={sendMessage}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
