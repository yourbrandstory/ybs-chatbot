import { useEffect, useRef } from "react";
import type { Message } from "../../lib/groq";
import type { ChipItem } from "./QuickChips";
import MessageBubble from "./MessageBubble";
import PersonaCards from "./PersonaCards";
import TypingIndicator from "./TypingIndicator";
import LeadFormCard from "./LeadFormCard";
import QuickChips from "./QuickChips";

interface Props {
  messages: Message[];
  isTyping: boolean;
  personaSelected: boolean;
  leadShown: boolean;
  onPersonaSelect: (persona: string) => void;
  onLeadSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    team_size: string;
    current_tools: string;
  }) => void;
  initialChips?: ChipItem[];
  onChipSelect?: (text: string) => void;
  dynamicChips?: string[];
}

export default function ChatBody({
  messages,
  isTyping,
  personaSelected,
  leadShown,
  onPersonaSelect,
  onLeadSubmit,
  initialChips,
  onChipSelect,
  dynamicChips,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages, isTyping]);

  const showIntro = messages.length === 0;

  return (
    <div className="chat-body" ref={ref}>
      {showIntro && (
        <div className="intro">
          <div className="intro-icon">
            <i className="ti ti-layout-dashboard" aria-hidden="true" />
          </div>
          <h2>Hey, I'm the YBS assistant</h2>
          <p>
            Tell me about your team and I'll show you exactly how TeamMap solves your biggest
            workflow problem.
          </p>
          <PersonaCards onSelect={onPersonaSelect} disabled={personaSelected} />

          {initialChips && initialChips.length > 0 && (
            <>
              <div className="intro-divider" />
              <div className="intro-chips-label">Or jump straight in:</div>
              <QuickChips chips={initialChips} onSelect={onChipSelect || (() => {})} />
            </>
          )}
        </div>
      )}

      {messages.map((m, i) => {
        const isLastBot = i === messages.length - 1 && m.role === "assistant" && isTyping;
        return <MessageBubble key={i} role={m.role} content={m.content} isBotTyping={isLastBot} />;
      })}

      {isTyping && <TypingIndicator />}

      {dynamicChips && dynamicChips.length > 0 && (
        <div className="inline-chips">
          {dynamicChips.map((chip, i) => (
            <button
              key={i}
              className="inline-chip"
              onClick={() => onChipSelect?.(chip)}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {leadShown && <LeadFormCard onSubmit={onLeadSubmit} />}
    </div>
  );
}
