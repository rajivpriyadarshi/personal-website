"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";

type AgentPanel = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const AgentPanelContext = createContext<AgentPanel | null>(null);

export function useAgentPanel() {
  const panel = useContext(AgentPanelContext);
  if (!panel) throw new Error("useAgentPanel must be used inside <AgentProvider>");
  return panel;
}

/* Owns both halves of the assistant: the open/closed state the entry card and
 * the panel share, and the assistant-ui runtime itself.
 *
 * The runtime lives here rather than inside the panel so the thread survives
 * being closed — a visitor can dismiss the sidebar mid-answer, carry on reading
 * the page, and reopen to the same conversation. useChatRuntime doesn't talk to
 * the network until a message is sent, so mounting it up front costs nothing.
 *
 * It posts to /api/chat by default, which is where the Gemini call lives. */
export function AgentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const runtime = useChatRuntime();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((wasOpen) => !wasOpen), []);

  const panel = useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AgentPanelContext.Provider value={panel}>{children}</AgentPanelContext.Provider>
    </AssistantRuntimeProvider>
  );
}
