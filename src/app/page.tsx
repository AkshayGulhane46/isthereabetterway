"use client";
import { useState, useEffect, useRef } from "react";
import { Mistral } from "@mistralai/mistralai";
import "./globals.css";

export default function Home() {
  const [chat, setChat] = useState<{ prompt: string; answer: string }[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const formatResponse = (text: string): string => {
    return text
      .replace(/\n/g, "<br />") // Preserve line breaks
      .replace(/•\s/g, "🔹 ") // Replace bullet points
      .replace(/(\d+)\.\s/g, "<strong>$1.</strong> "); // Bold numbered lists
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    generateAnswer(suggestion); // Pass the suggestion directly to generateAnswer
  };

  const generateAnswer = async (inputPrompt?: string): Promise<void> => {
    const query = inputPrompt || prompt.trim();
    if (!query) return;

    setLoading(true);

    const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
    if (!apiKey) {
      console.error("API key is missing.");
      setChat([...chat, { prompt: query, answer: "API key is missing." }]);
      setLoading(false);
      return;
    }

    const client = new Mistral({ apiKey });

    try {
      const chatResponse = await client.complete({
        model: "mistral-tiny",
        prompt: query,
      });

      let content = chatResponse?.choices?.[0]?.text || "No response received from the AI.";
      const formattedAnswer = formatResponse(content);

      setChat((prevChat) => [...prevChat, { prompt: query, answer: formattedAnswer }]);
      setPrompt(""); // Reset input field

      let index = 0;
      const words = content.split(" ");
      const typingInterval = setInterval(() => {
        setChat((prevChat) => {
          const updatedChat = [...prevChat];
          const latestIndex = updatedChat.length - 1;

          if (updatedChat[latestIndex]) {
            updatedChat[latestIndex].answer = words.slice(0, index + 1).join(" ");
          }

          return updatedChat;
        });

        index++;
        if (index === words.length) {
          clearInterval(typingInterval);
          setLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error("API Error:", error);
      setChat((prevChat) => [...prevChat, { prompt: query, answer: "Failed to fetch response." }]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chat]);

  const suggestions = [
    "What are some signs of a healthy relationship?",
    "How do I maintain a strong relationship with my partner?",
    "How can I support my partner's personal growth?",
    "What are the key elements of a successful relationship?",
  ];

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center p-4 sm:p-6 md:p-3 overscroll-none dark:bg-white">
      <div className="p-6 rounded-lg w-[90vw] flex flex-col h-[90vh]">
        <h1
          className="text-3xl sm:text-3xl font-bold mb-4 text-center"
          style={{
            background: "linear-gradient(to right, #0894FF, #C959DD, #FF2E54, #FF9004)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontFamily: "Poppins",
          }}
        >
          Ask Amica
        </h1>

        {chat.length === 0 && (
          <div className="flex flex-col flex-wrap gap-2 mb-4 text-sm">
            <h2
              style={{
                background: "linear-gradient(to right, #0894FF, #C959DD, #0894FF, #FF9004)",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontWeight: 500,
                fontStyle: "italic",
              }}
            >
              Confused? Start with these instead:
            </h2>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="px-4 py-2 rounded-lg bg-gray-300 opacity-70 text-black text-left text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="flex-grow overflow-y-auto rounded-lg mb-12" ref={chatContainerRef}>
          {chat.map((item, index) => (
            <div key={index} className="mb-4">
              <div className="text-right">
                <p
                  className="text-black-600 text-sm font-normal bg-rose-300 p-2 rounded-lg inline-block max-w-[75%]"
                  style={{
                    background: "linear-gradient(to right, #0894FF, #C959DD, #0894FF, #FF9004)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    border: "1px dashed oklch(0.81 0.117 11.638)",
                  }}
                >
                  {item.prompt}
                </p>
              </div>
              <div className="text-left mt-2">
                <p
                  className="text-gray-700 text-sm font-medium bg-fuchsia-300 p-2 rounded-lg inline-block max-w-[75%]"
                  style={{
                    WebkitBackgroundClip: "text",
                    color: "#C959DD",
                    border: "1px solid oklch(0.833 0.145 321.434)",
                  }}
                >
                  <span dangerouslySetInnerHTML={{ __html: item.answer }} />
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex items-center space-x-2 w-full p-4 bg-white fixed bottom-0 left-0"
          style={{ borderTop: "1px solid #ffe1da" }}
        >
          <input
            type="text"
            className="border-2 border-transparent bg-gray-50 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none focus:border-2 focus:border-transparent"
            placeholder="Ask Anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
            style={{
              borderWidth: 0.7,
              borderImage: "linear-gradient(to right, #ff7e5f, #feb47b, #6a11cb) 1",
            }}
          />
          <button
            type="button"
            onClick={() => generateAnswer()}
            className="text-white bg-black focus:ring-4 focus:outline-none focus:ring-fuchsia-300 font-light rounded-full text-sm p-2.5"
            disabled={loading}
          >
            {loading ? <span className="animate-spin">⏳</span> : "➡️"}
          </button>
        </div>
      </div>
    </div>
  );
}