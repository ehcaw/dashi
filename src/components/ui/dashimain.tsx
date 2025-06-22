"use client";

import { motion, useCycle } from "framer-motion";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import imdashianimate from "../../../public/imdashianimate.json";
import { useVoiceRecorder } from "@/lib/tts";
import { generate_response } from "@/lib/letta";

interface AnimatedVectorBoxProps {
  width?: number;
  height?: number;
  vectorPath?: string;
  vectorPaths?: string[];
  vectorColor?: string;
  boxColor?: string;
  borderRadius?: number;
  leftMargin?: number;
}

// First vector path for the animated vectors
const path1 =
  "M11.751 0.271729C11.9716 0.232967 12.1985 0.246425 12.4131 0.310791L21.7881 3.12329H21.7871C21.9681 3.17449 22.1374 3.26082 22.2852 3.3772C22.4356 3.49569 22.5606 3.64323 22.6533 3.81079C22.746 3.97833 22.8048 4.16243 22.8252 4.35278C22.8456 4.54315 22.8275 4.73581 22.7725 4.91919C22.7174 5.10267 22.6259 5.27341 22.5039 5.42114C22.382 5.56879 22.2321 5.69073 22.0625 5.77954C21.8928 5.86837 21.7065 5.92272 21.5156 5.93872C21.3248 5.95468 21.1323 5.9326 20.9502 5.87329V5.87231L13.4375 3.61841V18.5618C13.4386 19.9643 12.9586 21.3253 12.0771 22.4163C11.1957 23.5072 9.96614 24.2623 8.59473 24.5559C7.22317 24.8495 5.79186 24.6632 4.54102 24.0286C3.29034 23.3939 2.29474 22.3497 1.72168 21.0696C1.14861 19.7894 1.03276 18.351 1.39258 16.9954C1.75243 15.6398 2.56673 14.4488 3.69922 13.6213C4.83174 12.7939 6.21434 12.3803 7.61523 12.4495C8.66635 12.5015 9.68017 12.8229 10.5625 13.3752V1.68774C10.5626 1.46368 10.6152 1.24243 10.7158 1.04224C10.8165 0.84203 10.9628 0.668145 11.1426 0.534424C11.3223 0.400826 11.5304 0.310513 11.751 0.271729ZM8.55664 15.5598C7.96284 15.3139 7.30909 15.2499 6.67871 15.3752C6.04844 15.5006 5.46912 15.8096 5.01465 16.2639C4.56024 16.7183 4.25046 17.2977 4.125 17.928C3.99962 18.5583 4.06371 19.2121 4.30957 19.8059C4.55556 20.3998 4.97238 20.9078 5.50684 21.2649C6.04129 21.622 6.66972 21.8127 7.3125 21.8127C8.17439 21.8127 9.00087 21.47 9.61035 20.8606C10.2198 20.2512 10.5624 19.4246 10.5625 18.5627C10.5625 17.92 10.3717 17.2915 10.0146 16.7571C9.6576 16.2227 9.15036 15.8058 8.55664 15.5598Z";

// Second vector path (different shape)
const path2 =
  "M36.1963 18.0381C36.3804 17.992 36.5731 17.9881 36.7588 18.0273C36.8982 18.0568 37.0313 18.1096 37.1523 18.1836L37.2686 18.2637L37.376 18.3574C37.4771 18.4567 37.5605 18.5732 37.623 18.7012C37.7064 18.872 37.75 19.0599 37.75 19.25V32.375C37.7503 33.2387 37.4618 34.0776 36.9307 34.7588C36.3994 35.44 35.6554 35.9246 34.8174 36.1348C33.9795 36.3449 33.0955 36.2688 32.3057 35.9189C31.5158 35.569 30.8654 34.965 30.458 34.2031C30.0507 33.4413 29.9091 32.565 30.0566 31.7139C30.2043 30.8628 30.6325 30.0851 31.2725 29.5049C31.9125 28.9248 32.7284 28.5753 33.5898 28.5117C34.158 28.4698 34.7239 28.5561 35.25 28.7559V20.8516L25.75 23.2266V35.375C25.7503 36.2387 25.4618 37.0776 24.9307 37.7588C24.3994 38.44 23.6554 38.9246 22.8174 39.1348C21.9795 39.3449 21.0955 39.2688 20.3057 38.9189C19.5158 38.569 18.8654 37.965 18.458 37.2031C18.0507 36.4413 17.9091 35.565 18.0566 34.7139C18.2043 33.8628 18.6325 33.0851 19.2725 32.5049C19.9125 31.9248 20.7284 31.5753 21.5898 31.5117C22.158 31.4698 22.7239 31.5561 23.25 31.7559V22.25C23.25 21.9713 23.3431 21.7002 23.5146 21.4805C23.6862 21.2608 23.9269 21.1047 24.1973 21.0371L36.1963 18.0381ZM21.6064 34.0264C21.3398 34.0795 21.0946 34.2101 20.9023 34.4023C20.7101 34.5946 20.5795 34.8398 20.5264 35.1064C20.4733 35.3732 20.5004 35.6501 20.6045 35.9014C20.7086 36.1526 20.8852 36.3675 21.1113 36.5186C21.3374 36.6695 21.6032 36.75 21.875 36.75C22.2397 36.75 22.5898 36.6055 22.8477 36.3477C23.1055 36.0898 23.25 35.7397 23.25 35.375C23.25 35.1032 23.1695 34.8374 23.0186 34.6113C22.8675 34.3852 22.6526 34.2086 22.4014 34.1045C22.1501 34.0004 21.8732 33.9733 21.6064 34.0264ZM33.6064 31.0264C33.3398 31.0795 33.0946 31.2101 32.9023 31.4023C32.7101 31.5946 32.5795 31.8398 32.5264 32.1064C32.4733 32.3732 32.5004 32.6501 32.6045 32.9014C32.7086 33.1526 32.8852 33.3675 33.1113 33.5186C33.3374 33.6695 33.6032 33.75 33.875 33.75C34.2397 33.75 34.5898 33.6055 34.8477 33.3477C35.1055 33.0898 35.25 32.7397 35.25 32.375C35.25 32.1032 35.1695 31.8374 35.0186 31.6113C34.8675 31.3852 34.6526 31.2086 34.4014 31.1045C34.1501 31.0004 33.8732 30.9733 33.6064 31.0264Z";

// Third vector path (star-like shape)
const path3 = "M2.99971 24C11.8526 19.5051 17.9996 3 4.99984 3";

const vectorPaths = [
  "M34.4363 58.929C35.531 57.78 37.3466 57.6793 38.5633 58.7259C39.8191 59.8065 39.9612 61.7014 38.8807 62.9573L38.6199 63.2542C35.9001 66.289 32.5388 68.1077 28.8582 68.1077C25.1873 68.1076 21.803 66.298 19.0232 63.2864L18.7557 62.9915L18.656 62.8734C17.6643 61.6344 17.8083 59.8215 19.0086 58.7562C20.2093 57.6908 22.0264 57.7642 23.1385 58.8968L23.2439 59.0091L23.6238 59.4212C25.5177 61.3948 27.3384 62.1076 28.8582 62.1077C30.4697 62.1077 32.3858 61.3061 34.3328 59.0433L34.4363 58.929Z",
  "M10.9998 46.0003C13.2089 46.0003 14.9998 47.7912 14.9998 50.0003C14.9996 52.2093 13.2088 54.0003 10.9998 54.0003H9.9998C7.79084 54.0003 6.00003 52.2092 5.9998 50.0003C5.9998 47.7912 7.7907 46.0004 9.9998 46.0003H10.9998Z",
  "M47.9998 46.0003C50.2089 46.0003 51.9998 47.7912 51.9998 50.0003C51.9996 52.2093 50.2088 54.0003 47.9998 54.0003H46.9998C44.7908 54.0003 43 52.2092 42.9998 50.0003C42.9998 47.7912 44.7907 46.0004 46.9998 46.0003H47.9998Z",
  "M14.576 3.09992C22.7629 -0.37136 32.0812 -0.855216 39.5291 1.28742C46.7916 3.37686 53.1167 8.32172 53.5262 16.2259L53.5418 16.6048V16.7591C53.505 18.3458 52.2292 19.6427 50.6248 19.6868C48.9689 19.7322 47.5896 18.4257 47.5437 16.7698C47.4228 12.3788 44.0147 8.8217 37.8709 7.05402C31.7968 5.30651 23.8891 5.66836 16.9178 8.62433C10.292 11.4339 8.21574 15.6995 8.15214 19.4446C8.11527 21.6222 8.75174 23.7768 9.80937 25.6107C14.1745 23.733 19.0447 22.3322 23.8641 21.4495C32.2293 19.9175 41.0304 19.8392 47.3621 21.9622C53.1083 23.8889 56.7656 26.6279 57.1258 30.4964C57.3 32.369 56.6025 33.9505 55.7947 35.0736C54.9927 36.1884 53.9539 37.0448 53.0057 37.595C48.585 40.1599 41.8361 41.4447 34.4041 41.1292C26.8911 40.8103 18.3552 38.8474 10.2156 34.5657L10.076 34.4915L9.94316 34.4036C9.34618 34.0039 8.7721 33.5572 8.22441 33.0706C6.98364 33.7723 5.84552 34.5166 4.83476 35.2982C3.52412 36.3114 1.64022 36.0705 0.626751 34.7601C-0.386569 33.4494 -0.145623 31.5656 1.16484 30.5521C2.17972 29.7673 3.28124 29.0252 4.45195 28.3255C2.96215 25.6369 2.09922 22.5254 2.15312 19.3431C2.2618 12.9398 6.0436 6.71785 14.576 3.09992ZM45.4549 27.6507C40.4866 25.9849 32.8331 25.907 24.9441 27.3519C21.3892 28.003 17.9062 28.9415 14.7195 30.1126C21.4908 33.3558 28.4834 34.873 34.659 35.1351C41.4364 35.4227 46.9145 34.1922 49.9939 32.4056C50.3086 32.223 50.6778 31.9112 50.9236 31.5696C51.1601 31.2409 51.154 31.0756 51.1521 31.053C51.1508 31.0387 51.1431 30.9654 51.0594 30.8216C50.9699 30.6682 50.7801 30.4128 50.3894 30.0823C49.5836 29.4007 48.0851 28.5326 45.4549 27.6507Z",
];

// Helper to scale SVG path (basic numeric scaling)
function scalePath(path: string, scale: number): string {
  return path.replace(/([0-9]*\.?[0-9]+)/g, (match: string) => {
    const num = parseFloat(match);
    return isNaN(num) ? match : (num * scale).toFixed(4);
  });
}

export default function AnimatedVectorBox({
  width = 100,
  vectorPath = "",
  vectorPaths = [],
  height = 100,
  boxColor = "black",
  borderRadius = 16,
  leftMargin = 20,
}: AnimatedVectorBoxProps) {
  const { startRecording, stopAndTranscribe, isRecording, error } =
    useVoiceRecorder();

  // Track if Dashi has been moved to the left position
  const [hasMovedLeft, setHasMovedLeft] = useState(false);

  // Track opacity states
  const [isActivated, setIsActivated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // New state for the activated state (Cmd+Opt+T)
  const [isActivatedState, setIsActivatedState] = useState(false);

  // Track initial animation state
  const [isInitialAnimation, setIsInitialAnimation] = useState(true);
  const [isJsonAnimationComplete, setIsJsonAnimationComplete] = useState(false);

  // Chat interface state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ text: string; isUser: boolean }>
  >([]);

  // Reset animation state
  const [isResetting, setIsResetting] = useState(false);

  // State to track when positions should be set to default
  const [positionsSetToDefault, setPositionsSetToDefault] = useState(false);

  // Animation state for vector 1
  const [anim1, cycle1] = useCycle(
    { d: path1, fill: "#8CEBE5" },
    { d: scalePath(path1, 1.2), fill: "#D500D8" }
  );

  // Animation state for vector 2
  const [anim2, cycle2] = useCycle(
    { d: scalePath(path2, 1.2), fill: "#D500D8" },
    { d: path2, fill: "#8CEBE5" }
  );

  // Voice recording state
  const [transcription, setTranscription] = useState<string | null>(null);

  // Voice response state
  const [voiceResponse, setVoiceResponse] = useState<string>("");
  const [isGeneratingVoiceResponse, setIsGeneratingVoiceResponse] =
    useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      cycle1();
      cycle2();
    }, 1000);
    return () => clearInterval(interval);
  }, [cycle1, cycle2]);

  // Initial animation sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialAnimation(false);
    }, 3000); // Total animation duration: 3 seconds

    return () => clearTimeout(timer);
  }, []);

  // Update hasMovedLeft when expansion state changes
  useEffect(() => {
    if (isExpanded) {
      setHasMovedLeft(true);
    }
  }, [isExpanded]);

  // Handle reset with fade animations
  const handleReset = () => {
    setIsResetting(true);
    setPositionsSetToDefault(false);

    // Wait for fade out animation to complete before resetting state
    setTimeout(() => {
      setIsActivated(false);
      setIsExpanded(false);
      setIsActivatedState(false);
      setHasMovedLeft(false);
      setChatMessages([]);
      setVoiceResponse("");
      setIsGeneratingVoiceResponse(false);
      setPositionsSetToDefault(true);
      setIsResetting(false);
    }, 800); // Match the fade out duration
  };

  // Keyboard event listener for Command + Option + V and Command + Option + T
  useEffect(() => {
    console.log(
      "Component state - isActivated:",
      isActivated,
      "isExpanded:",
      isExpanded,
      "isActivatedState:",
      isActivatedState,
      "isRecording:",
      isRecording
    );

    const handleKeyDown = async (event: KeyboardEvent) => {
      console.log(
        "Key pressed:",
        event.key,
        "KeyCode:",
        event.keyCode,
        "Meta:",
        event.metaKey,
        "Alt:",
        event.altKey,
        "Ctrl:",
        event.ctrlKey
      );

      // Check for ESC key to reset to default mode
      if (event.key === "Escape" || event.keyCode === 27) {
        console.log("ESC key detected - resetting to default mode");
        handleReset();
        return;
      }

      // Command + Option + T (chat mode)
      const isTKey =
        event.key === "t" || event.key === "T" || event.keyCode === 84;
      if ((event.metaKey || event.ctrlKey) && event.altKey && isTKey) {
        console.log("Command + Option + T detected!");
        if (isActivated && !isActivatedState) {
          console.log("Activating chat mode...");
          setIsActivatedState(true);
        }
      }

      // Command + Option + V (voice mode)
      const isVKey =
        event.key === "v" || event.key === "V" || event.keyCode === 86;
      if ((event.metaKey || event.ctrlKey) && event.altKey && isVKey) {
        if (!isExpanded) {
          setIsExpanded(true);
        }
        if (!isRecording) {
          try {
            await startRecording();
          } catch (err) {
            alert("Failed to start recording: " + err);
          }
        }
      }

      // Also try just 'v' key for testing
      if (isVKey && !event.metaKey && !event.altKey && !event.ctrlKey) {
        console.log("Just V key pressed for testing");
        if (isActivated && !isExpanded && !isActivatedState) {
          console.log("Expanding with V key...");
          setIsExpanded(true);
        }
      }

      // Also try just 't' key for testing
      if (isTKey && !event.metaKey && !event.altKey && !event.ctrlKey) {
        console.log("Just T key pressed for testing");
        if (isActivated && !isActivatedState) {
          console.log("Activating chat mode with T key...");
          setIsActivatedState(true);
        }
      }
    };

    const handleKeyUp = async (event: KeyboardEvent) => {
      const isVKey =
        event.key === "v" || event.key === "V" || event.keyCode === 86;
      if ((event.metaKey || event.ctrlKey) && event.altKey && isVKey) {
        if (isRecording) {
          try {
            const result = await stopAndTranscribe();
            setTranscription(result);
            if (result) {
              setChatMessages((prev) => [
                ...prev,
                { text: result, isUser: true },
              ]);
              setIsGeneratingVoiceResponse(true);
              setVoiceResponse("");
              const dashiResponseStream = await generate_response(result);
              setChatMessages((prev) => [...prev, { text: "", isUser: false }]);
              for await (const chunk of dashiResponseStream) {
                if (
                  chunk.messageType === "assistant_message" &&
                  typeof chunk.content === "string" &&
                  chunk.content !== "undefined"
                ) {
                  setVoiceResponse((prev) => prev + chunk.content);
                  setChatMessages((prev) => {
                    const updated = [...prev];
                    if (updated.length > 0) {
                      updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        text:
                          (updated[updated.length - 1].text || "") +
                          chunk.content,
                      };
                    }
                    return updated;
                  });
                }
              }
              setIsGeneratingVoiceResponse(false);
            }
          } catch (err) {
            alert("Failed to transcribe: " + err);
            setIsGeneratingVoiceResponse(false);
          }
        }
      }
    };

    console.log("Adding keyboard event listener to document");
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keyup", handleKeyUp, true);
    return () => {
      console.log("Removing keyboard event listener from document");
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("keyup", handleKeyUp, true);
    };
  }, [isActivated, isExpanded, isActivatedState, isRecording]);

  // Handle first click - activate Dashi
  const handleFirstClick = () => {
    if (!isActivated && !isResetting) {
      setIsActivated(true);
    }
  };

  // Handle second click - expand box and show music notes
  const handleSecondClick = () => {
    if (isActivated && !isExpanded && !isActivatedState && !isResetting) {
      setIsExpanded(true);
    }
  };

  // Handle chat input submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      const newMessage = { text: chatInput.trim(), isUser: true };
      setChatMessages((prev) => [...prev, newMessage]);
      setChatInput("");

      // Dashi responds with "idk"
      setTimeout(async () => {
        const dashiResponseStream = await generate_response(chatInput);
        setChatMessages((prev) => [...prev, { text: "", isUser: false }]);
        for await (const chunk of dashiResponseStream) {
          if (
            chunk.messageType === "assistant_message" &&
            typeof chunk.content === "string" &&
            chunk.content !== "undefined"
          ) {
            setChatMessages((prev) => {
              const updated = [...prev];
              if (updated.length > 0) {
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  text:
                    (updated[updated.length - 1].text || "") + chunk.content,
                };
              }
              return updated;
            });
          }
        }
      }, 500);
    }
  };

  // Determine current width, height, and position based on states
  const currentWidth = isResetting
    ? isActivatedState
      ? 400
      : isExpanded
      ? 300
      : 100
    : isActivatedState
    ? 400
    : isExpanded
    ? 300
    : isActivated
    ? 100
    : 100;

  // Calculate width for voice response
  const getVoiceResponseWidth = () => {
    if (!voiceResponse && !isGeneratingVoiceResponse) return currentWidth;

    // Base width: Dashi (60px) + gap (20px) + minimum text width (200px)
    const baseWidth = 280;

    // Estimate text width (rough calculation: ~8px per character)
    const estimatedTextWidth = Math.min(
      voiceResponse.length * 8,
      window.innerWidth * 0.5 - baseWidth
    );

    // Calculate total width, capped at 50% of screen width
    const totalWidth = Math.min(
      baseWidth + estimatedTextWidth,
      window.innerWidth * 0.5
    );

    return Math.max(totalWidth, currentWidth);
  };

  const finalWidth = getVoiceResponseWidth();

  const currentHeight = isResetting
    ? isActivatedState
      ? 600
      : height
    : isActivatedState
    ? 600
    : height;
  const currentLeft = isResetting
    ? isActivatedState
      ? "calc(50% - 200px)"
      : "0px"
    : isActivatedState
    ? "calc(50% - 200px)"
    : "0px";

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Initial animation - imdashianimate.json */}
      {isInitialAnimation && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: isJsonAnimationComplete ? 0 : 1,
            y: 0,
          }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "75%",
            left: "1%",
            transform: "translateX(-50%)",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <Lottie
            animationData={imdashianimate}
            loop={false}
            onComplete={() => setIsJsonAnimationComplete(true)}
            style={{
              width: "100px",
              height: "100px",
            }}
          />
        </motion.div>
      )}

      <motion.div
        animate={{
          width: finalWidth,
          height: currentHeight,
          left: currentLeft,
          opacity: isResetting
            ? 0
            : isInitialAnimation
            ? 0.3
            : isActivated
            ? 0.3
            : 0.1,
        }}
        transition={{
          duration: isResetting ? 0.8 : 0.5,
          ease: "easeInOut",
          opacity: {
            duration: isResetting ? 0.8 : 0.5,
            ease: "easeInOut",
          },
        }}
        style={{
          backgroundColor: boxColor,
          borderRadius: `${borderRadius}px`,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
        }}
        onClick={!isActivated ? handleFirstClick : undefined}
      ></motion.div>

      {/* Chat interface - positioned outside the box to avoid opacity issues */}
      {isActivatedState && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isResetting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: currentLeft === "calc(50% - 200px)" ? "20px" : "0px",
            left:
              currentLeft === "calc(50% - 200px)" ? "calc(50% - 200px)" : "0px",
            width: "400px",
            height: "600px",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            color: "white",
            zIndex: 15,
            pointerEvents: isResetting ? "none" : "auto",
          }}
        >
          {/* Chat messages area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              marginBottom: "20px",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            {chatMessages.map((message, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "10px",
                  textAlign: message.isUser ? "right" : "left",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    backgroundColor: message.isUser ? "#8CEBE5" : "#D500D8",
                    color: message.isUser ? "#000" : "#fff",
                    maxWidth: "80%",
                    wordWrap: "break-word",
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat input form */}
          <form
            onSubmit={handleChatSubmit}
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#8CEBE5",
                color: "#000",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Send
            </button>
          </form>
        </motion.div>
      )}

      {/* Box opacity animation during initial sequence */}
      {isInitialAnimation && (
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.1 }}
          transition={{
            duration: 1,
            ease: "easeInOut",
            delay: 2.5, // Start fading after JSON animation completes
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: boxColor,
            borderRadius: `${borderRadius}px`,
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      )}

      {/* Music notes - positioned outside the box but relative to it */}
      {(isExpanded &&
        !isActivatedState &&
        !voiceResponse &&
        !isGeneratingVoiceResponse) ||
      (isRecording && !isActivatedState) ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: isResetting ? 0 : 1,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: isResetting ? 0.8 : 0.5,
            ease: "easeInOut",
            delay: isResetting ? 0 : 0.3,
          }}
          style={{
            position: "absolute",
            top: "55%",
            left: `calc(${leftMargin}px + 80px)`,
            transform: "translateY(-50%)",
            height: "50px",
            width: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {/* First animated vector */}
          <motion.svg
            width="40"
            height="40"
            viewBox="0 0 25 45"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.path
              d={anim1.d}
              fill={anim1.fill}
              animate={{ d: anim1.d, fill: anim1.fill }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </motion.svg>

          {/* Second animated vector */}
          <motion.svg
            width="40"
            height="40"
            viewBox="0 0 50 50"
            style={{
              position: "absolute",
              top: "60%",
              left: "70%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.path
              d={anim2.d}
              fill={anim2.fill}
              animate={{ d: anim2.d, fill: anim2.fill }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </motion.svg>
        </motion.div>
      ) : null}

      {/* Third vector - positioned between music notes and Dashi */}
      {isExpanded &&
        !isActivatedState &&
        !voiceResponse &&
        !isGeneratingVoiceResponse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: isResetting ? 0 : 1,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: isResetting ? 0.8 : 0.5,
              ease: "easeInOut",
              delay: isResetting ? 0 : 0.3,
            }}
            style={{
              position: "absolute",
              top: "75%",
              left: `calc(${leftMargin}px + 65px)`,
              transform: "translateY(-50%)",
              height: "50px",
              width: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <motion.svg
              width="40"
              height="40"
              viewBox="0 0 50 50"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.path
                d={path3}
                fill="none"
                stroke="#8CEBE5"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.div>
        )}

      {/* Dashi and voice response row (only during voice response generation) */}
      {(voiceResponse || isGeneratingVoiceResponse) && !isActivatedState && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: finalWidth,
            height: "120px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            zIndex: 20,
            pointerEvents: "none",
            transform: "translateY(-50%)",
          }}
        >
          {/* Dashi on the left edge */}
          <motion.div
            initial={{ opacity: 0, left: 0 }}
            animate={{ opacity: 1, left: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              position: "relative",
              height: "60px",
              width: "60px",
              minWidth: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: `${leftMargin}px`,
            }}
          >
            <motion.svg
              viewBox="0 0 100 100"
              style={{ height: "100%", aspectRatio: "1" }}
            >
              <defs>
                <linearGradient
                  id="vectorGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#D500D8" />
                  <stop offset="100%" stopColor="#8CEBE5" />
                </linearGradient>
              </defs>
              {vectorPaths ? (
                vectorPaths.map((path, index) => (
                  <motion.path
                    key={index}
                    d={path}
                    fill="url(#vectorGradient)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 1,
                      ease: "easeInOut",
                      delay: index * 0.2,
                    }}
                  />
                ))
              ) : (
                <motion.path
                  d={vectorPath}
                  fill="url(#vectorGradient)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              )}
            </motion.svg>
          </motion.div>

          {/* Voice response text on the right, no background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              marginLeft: 24,
              color: "#8CEBE5",
              fontSize: "16px",
              lineHeight: "1.4",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              maxHeight: "120px",
              overflowX: "auto",
              overflowY: "hidden",
              borderRadius: 0,
              background: "none",
              border: "none",
              flex: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            {isGeneratingVoiceResponse && !voiceResponse
              ? "Generating response..."
              : voiceResponse}
          </motion.div>
        </div>
      )}

      {/* Dashi - positioned outside the box but relative to it */}
      <motion.div
        initial={{
          left: "65%",
          transform: "translate(-50%, -50%)",
          opacity: isInitialAnimation ? 0 : 0.1,
        }}
        animate={{
          left: isResetting
            ? isActivatedState
              ? "calc(50% - 180px)"
              : hasMovedLeft
              ? `calc(${leftMargin}px + 20px)`
              : "65%"
            : isActivatedState
            ? "calc(50% - 180px)"
            : hasMovedLeft
            ? `calc(${leftMargin}px + 20px)`
            : "65%",
          top: isResetting
            ? isActivatedState
              ? "30px"
              : "65%"
            : isActivatedState
            ? "30px"
            : "65%",
          transform: isResetting
            ? isActivatedState
              ? "none"
              : hasMovedLeft
              ? "translateY(-50%)"
              : "translate(-50%, -50%)"
            : isActivatedState
            ? "none"
            : hasMovedLeft
            ? "translateY(-50%)"
            : "translate(-50%, -50%)",
          opacity: isResetting
            ? 0
            : isInitialAnimation
            ? 1
            : isActivated
            ? 1
            : 0.1,
        }}
        transition={{
          duration: isResetting ? 0.8 : isInitialAnimation ? 1 : 0.5,
          ease: "easeInOut",
          opacity: {
            duration: isResetting ? 0.8 : isInitialAnimation ? 2 : 0.5,
            ease: "easeInOut",
          },
          left: {
            duration: isResetting ? 0 : isInitialAnimation ? 1 : 0.5,
            ease: "easeInOut",
          },
          top: {
            duration: isResetting ? 0 : isInitialAnimation ? 1 : 0.5,
            ease: "easeInOut",
          },
          transform: {
            duration: isResetting ? 0 : isInitialAnimation ? 1 : 0.5,
            ease: "easeInOut",
          },
        }}
        style={{
          position: "absolute",
          height: isActivatedState ? "60px" : "80%",
          width: isActivatedState ? "60px" : "auto",
          display:
            (voiceResponse || isGeneratingVoiceResponse) && !isActivatedState
              ? "none"
              : "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <motion.svg
          viewBox="0 0 100 100"
          style={{
            height: "100%",
            aspectRatio: "1",
          }}
        >
          {/* Define the vertical gradient */}
          <defs>
            <linearGradient
              id="vectorGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#D500D8" />
              <stop offset="100%" stopColor="#8CEBE5" />
            </linearGradient>
          </defs>

          {/* Render multiple paths if vectorPaths is provided, otherwise use single vectorPath */}
          {vectorPaths ? (
            vectorPaths.map((path, index) => (
              <motion.path
                key={index}
                d={path}
                fill="url(#vectorGradient)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 1,
                  ease: "easeInOut",
                  delay: index * 0.2,
                }}
              />
            ))
          ) : (
            <motion.path
              d={vectorPath}
              fill="url(#vectorGradient)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          )}
        </motion.svg>
      </motion.div>

      {/* Recording indicator */}
    </div>
  );
}
