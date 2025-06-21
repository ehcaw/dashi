"use client";

import { useCopilotChat } from "@copilotkit/react-core";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import { useState } from "react";
import { Mic, MicOff } from "lucide-react";

export function Overlay() {
  const {
    visibleMessages,
    appendMessage,
    setMessages,
    deleteMessage,
    reloadMessages,
    stopGeneration,
    isLoading,
  } = useCopilotChat();

  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const sendMessage = (content: string) => {
    appendMessage(new TextMessage({ content, role: Role.User }));
  };

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1001,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Mic size={24} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        padding: "10px",
        background: "rgba(0, 0, 0, 0.2)",
        borderRadius: "25px",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
      }}
    >
      <button
        onClick={toggleRecording}
        style={{
          background: isRecording ? "red" : "green",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
      <div
        style={{ width: "200px", height: "30px", background: "transparent" }}
      >
        {/* Placeholder for visualizer or text */}
      </div>
      <button
        onClick={() => setIsOpen(false)}
        style={{
          background: "rgba(255,255,255,0.2)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "30px",
          height: "30px",
          cursor: "pointer",
        }}
      >
        X
      </button>
    </div>
  );
}
