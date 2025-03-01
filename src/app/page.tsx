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

  const generateAnswer = async (): Promise<void> => {
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

      // Add the prompt to chat history
      setChat([...chat, { prompt, answer: "" }]);
      setPrompt(""); // Reset prompt

      const words = content.split(" ");
      // Simulate typing effect by adding one word at a time
      let index = 0;
      const typingInterval = setInterval(() => {
        setChat((prevChat) => {
          const updatedChat = [...prevChat];
          const latestIndex = updatedChat.length - 1;
          updatedChat[latestIndex].answer = words.slice(0, index + 1).join(" "); // Join words up to the current index
          return updatedChat;
        });

        index++;
        if (index === words.length) {
          clearInterval(typingInterval); // Stop typing when the message is fully typed
          setLoading(false); // End loading once typing is complete
        }
      }, 200); // Adjust speed of typing (200ms between words)
    } catch (error) {
      console.error("API Error:", error);
      setChat([...chat, { prompt, answer: "Failed to fetch response." }]);
      setPrompt("");
      setLoading(false); // End loading in case of an error
    }
  };

  // Automatically scroll to the bottom when chat updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  // Smooth scroll effect after chat updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chat]); // Trigger scroll when chat is updated

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-4 sm:p-6 md:p-8">
      <div className="bg-white p-6 dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">Ask Amica</h1>
        <div
          className="mb-4 h-64 overflow-y-auto bg-white p-6 dark:bg-gray-800 p-4 rounded-lg"
          ref={chatContainerRef}
        >
          {chat.map((item, index) => (
            <div key={index} className="mb-4">
              <div className="text-right">
                <p className="text-black-600 font-medium bg-rose-300 dark:bg-gray-800 p-2 rounded-lg inline-block max-w-[75%]">
                  {item.prompt}
                </p>
              </div>
              <div className="text-left mt-2">
                <p className="text-gray-700 font-medium bg-fuchsia-300 dark:bg-fuchsia-700 dark:text-white p-2 rounded-lg inline-block max-w-[75%]">
                  {item.answer || " "} {/* Prevent undefined showing */}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="shadow-xs bg-gray-50 border-4 border-transparent text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-xs-light 
                bg-clip-border border-image-[linear-gradient(45deg,_#ff0000,_#ff7300,_#fffb00,_#00ff00,_#0073ff,_#8a00ff,_#ff0000)]"
            placeholder="Ask Anything..."
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
          />
          <button
            type="button"
            onClick={generateAnswer}
            className="text-white bg-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            disabled={loading} // Disable button when loading
          >
            {loading ? (
              <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
            ) : (
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
