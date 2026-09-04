"use client";

import {
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  type ReasoningMessagePartComponent,
} from "@assistant-ui/react";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import { useState } from "react";
import { ArrowUp, ChevronDown, Square } from "lucide-react";
import { track } from "@vercel/analytics";
import { useAgentPanel } from "./AgentContext";
import styles from "./agent.module.css";

/* Openers for a cold thread, grouped so one category shows at a time instead of a
 * flat wall. The grouping isn't only tidiness: a flat list has to spend its few
 * slots on the broadest possible questions, and behind a category each one can be
 * specific.
 *
 * Every question is named — "the LazyPay homepage", "Ada at Zinc" — rather than
 * left generic. Ten years across two fintechs means "a homepage" or "a 0-to-1
 * product" could be any of half a dozen things, and a question that doesn't say
 * which one invites the model to pick, or to hedge across all of them.
 *
 * Each one is also chosen to land on something the corpus can answer with a
 * specific — a decision, a constraint, a number.
 *
 * They're phrased as invitations rather than as tests. An opener is Rajiv asking
 * the question on the visitor's behalf, so "tell me about something that didn't
 * work" reads as him volunteering a failure before anyone asked for one. The
 * assistant will still answer it honestly when a visitor types it; it just isn't
 * something to hand them. The one exception is "where would you not be a good
 * fit?" — that's a claim about the shape of the work, not an admission, and it's
 * more useful to a hiring manager than any of the strengths. */
const TOPICS = [
  {
    label: "Work",
    questions: [
      "What kind of work are you best at?",
      "Where would you not be a good fit?",
      "What are you building at Zinc right now?",
      "What did you own at LazyPay?",
      "How big a design team have you led?",
      "Are you a manager or an IC these days?",
    ],
  },
  {
    label: "Projects",
    questions: [
      "Why did you take credit limits off the LazyPay homepage?",
      "How did LazyCard get to 325K customers?",
      "Tell me about Ada, the AI counsellor at Zinc",
      "How did you rebuild repayments at LazyPay?",
      "How did you evaluate a dozen ideas at Zinc?",
      "What did you design for Porter's driver-partners?",
    ],
  },
  {
    label: "How I work",
    questions: [
      "How do you actually work with engineers?",
      "How are you using AI in your own work?",
      "How much research does a decision deserve?",
      "How do you design for products that don't exist yet?",
      "What do you do when the problem isn't defined?",
      "How do you decide what to cut?",
    ],
  },
  {
    label: "Life",
    questions: [
      "How did you end up in design?",
      /* A real typographic apostrophe, not `&rsquo;` — these are string values
         rendered as text, so an entity would show up literally. */
      "What’s it like working with you?",
      "What do you do outside work?",
      "What did you want to be before design?",
      "How did you end up in Singapore?",
      "What keeps you interested in this work?",
    ],
  },
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

/* Lead-in before the questions start, when the whole panel is arriving. Long
   enough to fall after the greeting and the chips; skipped entirely on a category
   tap, where the visitor is already looking at the list and any delay reads as
   lag rather than as sequence. */
const OPEN_LEAD_MS = 320;

export function AgentThread() {
  /* The panel never unmounts — it slides off-screen — so the cold thread can't
     animate on mount. It keys off the open state instead: the class goes on when
     the drawer opens and comes off when it closes, which is also what lets the
     entrance replay on every reopen rather than only the first. */
  const { isOpen } = useAgentPanel();
  const [topic, setTopic] = useState(0);

  /* Which of the two triggers is running the stagger. A tap means the visitor is
     already looking at the list, so the questions start immediately; an open means
     they're arriving behind the greeting and the chips and should wait for them.

     Reset here, during render on a changed open state, rather than in an effect:
     an effect would set state after painting one frame at the wrong delay, and
     it's the pattern React documents for exactly this. */
  const [tapped, setTapped] = useState(false);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    setTapped(false);
  }

  const lead = tapped ? 0 : OPEN_LEAD_MS;
  const active = TOPICS[topic];

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

            <div className={styles.topics} role="tablist" aria-label="Question topics">
              {TOPICS.map((entry, i) => (
                <button
                  key={entry.label}
                  type="button"
                  role="tab"
                  aria-selected={i === topic}
                  className={`${styles.topic} ${i === topic ? styles.topicActive : ""}`}
                  onClick={() => {
                    setTopic(i);
                    setTapped(true);
                    /* Which categories people reach for says what they came to
                       find out, including from the visitors who read the openers
                       and never ask anything. */
                    track("chat_topic", { topic: entry.label });
                  }}
                >
                  {entry.label}
                </button>
              ))}
            </div>

            {/* Keyed on the topic and the open state so both remount the list,
                which is what restarts the CSS stagger — the questions deal
                themselves out again on every switch rather than swapping
                instantly. --lead carries the offset the delays build on. */}
            <div
              key={`${active.label}-${isOpen}`}
              className={styles.suggestions}
              style={{ "--lead": `${lead}ms` } as React.CSSProperties}
            >
              {active.questions.map((prompt) => (
                <ThreadPrimitive.Suggestion
                  key={prompt}
                  className={styles.suggestion}
                  prompt={prompt}
                  send
                  /* The server sees the question text but not where it came from.
                     This is what separates an opener I wrote from something a
                     visitor thought to ask — which is the difference between the
                     openers working and them being all anyone ever asks.
                     `onClick` is composed with the primitive's own handler, not
                     replacing it, so the question still sends. */
                  onClick={() => track("chat_opener", { topic: active.label, prompt })}
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
