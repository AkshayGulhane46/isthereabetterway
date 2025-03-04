"use client";
import { useState, useEffect, useRef } from "react";
// Import Mistral SDK
import { Mistral } from "@mistralai/mistralai";
import './globals.css'

export default function Home() {
  const [chat, setChat] = useState<{ prompt: string; answer: string }[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // Loading state for button
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const formatResponse = (text: string): string => {
    return text
      .replace(/\n/g, "<br />") // Preserve line breaks
      .replace(/•\s/g, "🔹 ") // Replace bullet points
      .replace(/(\d+)\.\s/g, "<strong>$1.</strong> "); // Bold numbered lists
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion); // Set the prompt to the suggestion
    generateAnswer(); // Automatically generate the answer based on the suggestion
    setTimeout(generateAnswer, 0);
  };

  const generateAnswer = async (): Promise<void> => {
    if (!prompt.trim()) {
      return;
    }

    setLoading(true); // Start loading
    const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY || "oRGfdY1SpTAUujDjSqfNB08rrPL58ot8";
    const client = new Mistral({ apiKey });

    try {
      const chatResponse = await client.chat.complete({
        model: "mistral-tiny",
        messages: [{ role: "user", content: prompt }],
      });

      let content = "No response received from the AI.";
      if (chatResponse?.choices && chatResponse.choices.length > 0) {
        content = typeof chatResponse.choices[0].message.content === "string"
          ? chatResponse.choices[0].message.content
          : "Invalid response received.";
      }
      console.log(chatResponse);
      setChat([...chat, { prompt, answer: formatResponse(content) }]);

      setPrompt(""); // Reset prompt

      const words = content.split(" ");
      let index = 0;
      const typingInterval = setInterval(() => {
        setChat((prevChat) => {
          const updatedChat = [...prevChat];
          const latestIndex = updatedChat.length - 1;
          updatedChat[latestIndex].answer = words.slice(0, index + 1).join(" ");
          return updatedChat;
        });

        index++;
        if (index === words.length) {
          clearInterval(typingInterval); // Stop typing when message is fully typed
          setLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error("API Error:", error);
      setChat([...chat, { prompt, answer: "Failed to fetch response." }]);
      setPrompt("");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chat]);

  // Array of suggested prompts
  const suggestions = [
    "What are some signs of a healthy relationship?",
    "How do I maintain a strong relationship with my partner?",
    "How can I support my partner's personal growth?",
    "What are the key elements of a successful relationship?"
  ];

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center p-4 sm:p-6 md:p-3 overscroll-none dark:bg-white">
      <div className="p-6 rounded-lg w-[90vw] flex flex-col h-[90vh]">
        <h1
          className="text-3xl sm:text-3xl font-bold mb-4 text-center z-10"
          style={{
            background: "linear-gradient(to right, #0894FF, #C959DD, #FF2E54, #FF9004)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontFamily:"poppins"
          }}
        >
          Ask Amica
        </h1>

        {/* Show suggested prompts if chat is empty */}
        {chat.length === 0 && (
          <div className="flex flex-col flex-wrap gap-2 mb-4 text-sm">
            <div><h2   style={{
            background: "linear-gradient(to right, #0894FF, #C959DD, #0894FF, #FF9004)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontWeight:500,
            fontStyle:"italic",
          }}>Confused ? Start with these insted, </h2></div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="px-4 py-2 rounded-lg bg-gray-300 opacity-70 text-black text-left text-sm"
                onClick={()=>handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Chat container with scrollable area */}
        <div
          className="flex-grow overflow-y-auto rounded-lg mb-12"
          ref={chatContainerRef}
        >
          {chat.map((item, index) => (
            <div key={index} className="mb-4">
              <div className="text-right">
                <p className="text-black-600 text-sm font-normal bg-rose-300  p-2 rounded-lg inline-block max-w-[75%]"
                
                style={{
                background: "linear-gradient(to right, #0894FF, #C959DD, #0894FF, #FF9004)",
                WebkitBackgroundClip: "text",
                color: "transparent",
                border:"1px dashed oklch(0.81 0.117 11.638)"
                 }}>
                  {item.prompt}
                </p>
              </div>
              <div className="text-left mt-2">
                <p className="text-gray-700 text-sm font-medium bg-fuchsia-300  p-2 rounded-lg inline-block max-w-[75%]"
                 style={{
                  WebkitBackgroundClip: "text",
                  color: "#C959DD",
                  border:"1px solid oklch(0.833 0.145 321.434)"
                  
                   }}>
                  <span dangerouslySetInnerHTML={{ __html: item.answer }} />
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input section */}
        <div className="flex items-center space-x-2 w-full p-4 bg-white fixed bottom-0 left-0"
        style={{
          borderTop: "1px solid #ffe1da"
          
        }}
       >
        <input
            type="text"
            className="border-2 border-transparent bg-gray-50 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
            bg-clip-padding focus:outline-none focus:border-2 focus:border-transparent"
            placeholder="Ask Anything..."
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
            required
            style={{
              borderWidth:0.7,
              borderImage: "linear-gradient(to right, #ff7e5f, #feb47b, #6a11cb) 1",
            }}
          />
          <button
            type="button"
            onClick={generateAnswer}
            className="text-white bg-black focus:ring-4 focus:outline-none focus:ring-fuchsia-300 font-light rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 :bg-blue-600"
            disabled={loading}
          >
            {loading ? (
              <svg
                aria-hidden="true"
                className="w-8 h-8 text-black animate-spin fill-fuchsia-300"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 [...]
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 [...]
                  fill="currentFill"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}