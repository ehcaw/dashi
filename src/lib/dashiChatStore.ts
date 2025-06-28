import { create } from "zustand";

interface ChatState {
  chatInput: string;
  chatMessages: Array<{ text: string; isUser: boolean }>;
  transcription: string | null;
  voiceResponse: string;
  isGeneratingVoiceResponse: boolean;
  // Actions to update state
  setChatInput: (input: string) => void;
  addChatMessage: (message: { text: string; isUser: boolean }) => void;
  setChatMessages: (messages: Array<{ text: string; isUser: boolean }>) => void;
  setTranscription: (transcription: string | null) => void;
  setVoiceResponse: (response: string) => void;
  setIsGeneratingVoiceResponse: (isGenerating: boolean) => void;

  resetChatState: () => void;
}

const useDashiChatStore = create<ChatState>((set) => ({
  // Initial state
  chatInput: "",
  chatMessages: [],
  transcription: null,
  voiceResponse: "",
  isGeneratingVoiceResponse: false,
  // Actions
  setChatInput: (input) => set({ chatInput: input }),
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  setTranscription: (transcription) => set({ transcription }),
  setVoiceResponse: (response) => set({ voiceResponse: response }),
  setIsGeneratingVoiceResponse: (isGenerating) =>
    set({ isGeneratingVoiceResponse: isGenerating }),
  resetChatState: () =>
    set({
      chatInput: "",
      chatMessages: [],
      transcription: null,
      voiceResponse: "",
      isGeneratingVoiceResponse: false,
    }),
}));

export default useDashiChatStore;
