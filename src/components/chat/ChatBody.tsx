import { useEffect, useRef } from "react";
import type { Message } from "../../lib/groq";
import MessageBubble from "./MessageBubble";
import PersonaCards from "./PersonaCards";
import TypingIndicator from "./TypingIndicator";
import LeadFormCard from "./LeadFormCard";

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
}

export default function ChatBody({
  messages,
  isTyping,
  personaSelected,
  leadShown,
  onPersonaSelect,
  onLeadSubmit,
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
        </div>
      )}

      {messages.map((m, i) => {
        const isLastBot = i === messages.length - 1 && m.role === "assistant" && isTyping;
        return <MessageBubble key={i} role={m.role} content={m.content} isBotTyping={isLastBot} />;
      })}

      {isTyping && <TypingIndicator />}

      {leadShown && <LeadFormCard onSubmit={onLeadSubmit} />}
    </div>
  );
}
