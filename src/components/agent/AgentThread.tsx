"use client";

import {
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  type ReasoningMessagePartComponent,
} from "@assistant-ui/react";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import { ArrowUp, ChevronDown, Square } from "lucide-react";
import { useAgentPanel } from "./AgentContext";
import styles from "./agent.module.css";

/* Openers for a cold thread. Phrased as a visitor would ask them, since the
 * common case is a recruiter or hiring manager sizing up fit.
 *
 * Each one is chosen to land on something the corpus can actually answer with a
 * specific — a decision, a constraint, a number — rather than on a topic the
 * model would have to generalise about. The two blunt ones are deliberate: the
 * failures and the poor-fit list are the most persuasive things in here, because
 * they're the answers a portfolio site normally won't give. */
const SUGGESTIONS = [
  "What kind of work are you best at?",
  "Why did you take credit limits off a homepage?",
  "Tell me about something that didn't work",
  "How do you actually work with engineers?",
  "How are you using AI in your own work?",
  "Where would you not be a good fit?",
];

/* Assistant text arrives as markdown — lists and emphasis are how it explains a
 * career — so it renders through the markdown primitive rather than raw text. */
const MarkdownText = () => <MarkdownTextPrimitive />;

/* Rendered when the assistant's turn has started but nothing has arrived yet —
 * the gap between hitting send and the first token. */
const Pending = () => (
  <div className={styles.pending} role="status" aria-label="Thinking">
    <span className={styles.pendingDot} />
    <span className={styles.pendingDot} />
    <span className={styles.pendingDot} />
  </div>
);

/* Both models stream a summary of their own reasoning ahead of the answer.
 * Showing it turns the wait into something to read, and it's the honest version
 * of a loading state: this is what the model is actually doing.
 *
 * Collapsed by default via native <details> — no state to manage, and the
 * disclosure is keyboard-accessible for free. Left open while the answer is
 * still streaming so it doesn't snap shut mid-thought. */
const Reasoning: ReasoningMessagePartComponent = ({ text, status }) => {
  const running = status.type === "running";

  /* A question easy enough to need no thinking still opens a reasoning part,
     just an empty one — and its arrival retires the pending dots. So an empty
     part falls back to the dots while the turn runs, and to nothing once the
     answer has landed. */
  if (!text.trim()) return running ? <Pending /> : null;

  return (
    <details className={styles.reasoning} open={running}>
      <summary className={styles.reasoningSummary}>
        <span className={running ? styles.reasoningLabelRunning : undefined}>
          {running ? "Thinking" : "Thought process"}
        </span>
        <ChevronDown
          className={styles.reasoningChevron}
          width={13}
          height={13}
          strokeWidth={2}
          aria-hidden
        />
      </summary>
      <p className={styles.reasoningBody}>{text}</p>
    </details>
  );
};

function UserMessage() {
  return (
    <MessagePrimitive.Root className={styles.userMessage}>
      <MessagePrimitive.Parts />
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className={styles.assistantMessage}>
      <MessagePrimitive.Parts
        components={{ Text: MarkdownText, Reasoning, Empty: Pending }}
      />

      <MessagePrimitive.Error>
        <ErrorPrimitive.Root className={styles.messageError}>
          <ErrorPrimitive.Message />
        </ErrorPrimitive.Root>
      </MessagePrimitive.Error>
    </MessagePrimitive.Root>
  );
}

export function AgentThread() {
  /* The panel never unmounts — it slides off-screen — so the cold thread can't
     animate on mount. It keys off the open state instead: the class goes on when
     the drawer opens and comes off when it closes, which is also what lets the
     entrance replay on every reopen rather than only the first. */
  const { isOpen } = useAgentPanel();

  return (
    <ThreadPrimitive.Root className={styles.thread}>
      <ThreadPrimitive.Viewport className={styles.viewport}>
        <ThreadPrimitive.Empty>
          <div className={`${styles.empty} ${isOpen ? styles.emptyEntering : ""}`}>
            <p className={styles.emptyTitle}>Ask me anything about Rajiv</p>
            <p className={styles.emptyBody}>
              I represent him, and I answer in his own words — his work, his
              projects, and the thinking behind them. Ask whatever you&rsquo;d ask
              him directly.
            </p>

            <div className={styles.suggestions}>
              {SUGGESTIONS.map((prompt) => (
                <ThreadPrimitive.Suggestion
                  key={prompt}
                  className={styles.suggestion}
                  prompt={prompt}
                  send
                >
                  {prompt}
                </ThreadPrimitive.Suggestion>
              ))}
            </div>
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages>
          {({ message }) =>
            message.role === "user" ? <UserMessage /> : <AssistantMessage />
          }
        </ThreadPrimitive.Messages>

        {/* Holds the last turn clear of the composer that overlays the viewport's
            bottom edge, so a finished answer isn't tucked under it. */}
        <div className={styles.viewportTail} />
      </ThreadPrimitive.Viewport>

      <ComposerPrimitive.Root className={styles.composer}>
        <ComposerPrimitive.Input
          className={styles.composerInput}
          placeholder="Ask about my work, life, or fit…"
          rows={1}
        />

        {/* Send and Cancel swap on the same spot: one button's worth of layout,
            whichever the thread's state calls for. */}
        <ThreadPrimitive.If running={false}>
          <ComposerPrimitive.Send className={styles.composerAction} aria-label="Send">
            <ArrowUp width={16} height={16} strokeWidth={2.25} aria-hidden />
          </ComposerPrimitive.Send>
        </ThreadPrimitive.If>

        <ThreadPrimitive.If running>
          <ComposerPrimitive.Cancel
            className={styles.composerAction}
            aria-label="Stop generating"
          >
            <Square width={12} height={12} strokeWidth={2.25} fill="currentColor" aria-hidden />
          </ComposerPrimitive.Cancel>
        </ThreadPrimitive.If>
      </ComposerPrimitive.Root>
    </ThreadPrimitive.Root>
  );
}
