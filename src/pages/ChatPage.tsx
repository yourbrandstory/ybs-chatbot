import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { sendToGroq, type Message } from "../lib/groq";
import { getTemperature, detectLeadCaptureTrigger } from "../lib/utils";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatHeader from "../components/chat/ChatHeader";
import ChatBody from "../components/chat/ChatBody";
import QuickChips from "../components/chat/QuickChips";
import ChatInput from "../components/chat/ChatInput";

const DEFAULT_SYSTEM_PROMPT = `You are the YBS Assistant — the friendly face of TeamMap, a task and project management tool built for small agencies and growing teams (3–15 people).

TONE: Warm, sharp, direct. Think: smart colleague who gets it immediately. NOT a corporate bot. NOT a paragraph-writing machine.

RESPONSE RULES — follow these strictly:
- Keep every response under 3 sentences maximum
- No long paragraphs. Ever.
- Use line breaks between thoughts
- Ask ONE question per response, not multiple
- Be specific to what they just said
- Use their words back at them
- Occasional warmth: "That's exactly it." / "Yep." / "Classic."

AFTER EACH BOT RESPONSE, end with 2-3 contextual suggestion tags that the user can tap. Format them as a special marker the frontend can parse:

[CHIPS: chip text one | chip text two | chip text three]

This CHIPS line must always be the last line of your response. The frontend will strip it and show as interactive chips.

ABOUT TEAMMAP — know this deeply:
- Task Dashboard: each team member has a column, tasks sorted by mood/priority (Top, Hero, Imp, Creative, Rapid, Share, Follow Up)
- Milestones: big goals broken into substeps, linked to tasks, track % completion
- SM Calendar: social media content calendar with execution and posting date views
- Line Up: daily ordered task list per member
- Client tracking: every task linked to a client, colour-coded throughout
- Team size sweet spot: 3–15 people
- Built for: agencies, consultancies, service teams

THREE PERSONAS you'll encounter:
The Operator (3–8 people): running campaigns + client work + internal projects simultaneously. Pain: things fall through cracks, no single view.
The Builder (8–15 people): team scaled fast, old systems broke down. Pain: no structure, everyone working differently.
The Deliverer (agency/service): client commitments, recurring work, accountability across people. Pain: promised things they can't track.

LEAD CAPTURE TIMING:
After 4–5 exchanges OR when user shows clear interest (asks about pricing, demo, getting started), say:
"I'd love to show you this live — it's 20 minutes and we tailor it to your team exactly. Can I grab your name and email to book it in?
[CHIPS: Yes, book me in | Tell me more first | What's the cost?]"`;

const INITIAL_CHIPS = [
  "Tell me about TeamMap",
  "Show me how tasks work",
  "What team size is this for?",
  "Can I see a demo?",
];

const personaOpeners: Record<string, string> = {
  operator:
    "I'm an operations lead running a 6-person agency. We juggle campaigns, client work, and internal projects simultaneously.",
  builder:
    "I'm a growth lead — our team went from 5 to 12 people in 6 months and our old way of working isn't keeping up.",
  deliverer:
    "I'm a service lead at an agency. About 8 active clients and a lot to track across the team.",
};

function parseChipsFromResponse(response: string): { clean: string; chips: string[] } {
  const match = response.match(/\[CHIPS:\s*(.+?)\]/);
  if (!match) return { clean: response, chips: [] };
  const chips = match[1]
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean);
  const clean = response.replace(/\[CHIPS:.+?\]/g, "").trim();
  return { clean, chips };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [personaSelected, setPersonaSelected] = useState<string | null>(null);
  const [leadShown, setLeadShown] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [dynamicChips, setDynamicChips] = useState<string[]>(INITIAL_CHIPS);

  useEffect(() => {
    let sid = localStorage.getItem("ybs_session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("ybs_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    async function init() {
      const { data: promptRow } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "system_prompt")
        .single();
      if (promptRow) setSystemPrompt(promptRow.value);
      const { data: conv } = await supabase
        .from("conversations")
        .insert({ session_id: sessionId })
        .select()
        .single();
      if (conv) setConversationId(conv.id);
    }
    init();
  }, [sessionId]);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: Message = { role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      if (conversationId) {
        await supabase
          .from("messages")
          .insert({ conversation_id: conversationId, role: "user", content: text });
      }

      try {
        const allMessages = [...messages, userMsg];
        const response = await sendToGroq(allMessages, systemPrompt);

        const { clean, chips } = parseChipsFromResponse(response);

        const botMsg: Message = { role: "assistant", content: clean };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);

        if (chips.length > 0) {
          setDynamicChips(chips);
        } else {
          setDynamicChips([]);
        }

        if (conversationId) {
          await supabase
            .from("messages")
            .insert({ conversation_id: conversationId, role: "assistant", content: clean });
        }

        const newCount = allMessages.length + 1;
        const temp = getTemperature(newCount, leadCaptured);
        if (conversationId) {
          await supabase
            .from("conversations")
            .update({
              message_count: newCount,
              last_message_at: new Date().toISOString(),
              temperature: temp,
            })
            .eq("id", conversationId);
        }

        if (detectLeadCaptureTrigger(clean) && !leadShown && !leadCaptured) {
          setLeadShown(true);
        }
      } catch {
        setIsTyping(false);
        const errMsg: Message = {
          role: "assistant",
          content: "Something went wrong — please try again.",
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    },
    [messages, systemPrompt, conversationId, leadShown, leadCaptured],
  );

  function handlePersonaSelect(persona: string) {
    if (personaSelected) return;
    setPersonaSelected(persona);
    if (conversationId) {
      supabase.from("conversations").update({ persona_type: persona }).eq("id", conversationId);
    }
    const opener = personaOpeners[persona];
    if (opener) sendMessage(opener);
  }

  async function handleLeadSubmit(data: {
    name: string;
    email: string;
    phone: string;
    team_size: string;
    current_tools: string;
  }) {
    if (!conversationId) return;
    await supabase
      .from("leads")
      .insert({
        conversation_id: conversationId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        team_size: data.team_size || null,
        current_tools: data.current_tools || null,
        persona_type: personaSelected,
        temperature: "hot",
      });
    await supabase
      .from("conversations")
      .update({ lead_captured: true, temperature: "hot" })
      .eq("id", conversationId);
    setLeadCaptured(true);
    sendMessage("Thanks! I've shared my contact details for the walkthrough.");
  }

  const showChips = messages.length === 0;

  return (
    <div className="ybs-layout">
      <ChatSidebar />
      <div className="chat-main">
        <ChatHeader />
        <ChatBody
          messages={messages}
          isTyping={isTyping}
          personaSelected={!!personaSelected}
          leadShown={leadShown}
          onPersonaSelect={handlePersonaSelect}
          onLeadSubmit={handleLeadSubmit}
        />
        {showChips && dynamicChips.length > 0 && (
          <QuickChips chips={dynamicChips} onSelect={sendMessage} />
        )}
        {!showChips && dynamicChips.length > 0 && (
          <QuickChips chips={dynamicChips} onSelect={sendMessage} />
        )}
        <ChatInput onSend={sendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}
