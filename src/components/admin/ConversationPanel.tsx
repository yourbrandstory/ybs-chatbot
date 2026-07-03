import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Props {
  conversationId: string;
  onClose: () => void;
}

export default function ConversationPanel({ conversationId, onClose }: Props) {
  const [conv, setConv] = useState<{
    session_id: string;
    persona_type: string;
    message_count: number;
  } | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string; created_at: string }[]>(
    [],
  );

  useEffect(() => {
    supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single()
      .then(({ data }) => {
        if (data) setConv(data as any);
      });
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as any);
      });
  }, [conversationId]);

  return (
    <div className="side-panel-scrim" onClick={onClose}>
      <div className="side-panel" onClick={(e) => e.stopPropagation()}>
        <div className="side-panel-hd">
          <div className="conv-av">{conv ? conv.session_id[0]?.toUpperCase() || "?" : "?"}</div>
          <div>
            <h3>{conv ? `Session ${conv.session_id.slice(0, 8)}` : "Loading…"}</h3>
            <p>{conv ? `${conv.persona_type} · ${conv.message_count} messages` : ""}</p>
          </div>
          <button className="side-panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="side-panel-body">
          {messages.map((m, i) => (
            <div key={i} className={`msg-row ${m.role === "user" ? "user" : "bot"}`}>
              <div className="msg-av">{m.role === "assistant" ? "Y" : "P"}</div>
              <div>
                <div className="bubble">{m.content}</div>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <p style={{ color: "var(--mist)", fontSize: 12, textAlign: "center" }}>
              No messages in this conversation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
