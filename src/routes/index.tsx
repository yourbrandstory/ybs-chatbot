import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { flows, personaOpeners, type Msg } from "@/data/conversations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YBS TeamMap — Your team management advisor" },
      {
        name: "description",
        content:
          "Chat with the YBS assistant and see how TeamMap organizes your team's tasks, milestones, and daily line-up.",
      },
      { property: "og:title", content: "YBS TeamMap — Your team management advisor" },
      {
        property: "og:description",
        content:
          "Tell us about your team and we'll show you exactly how TeamMap solves your biggest workflow problem.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

type UiMsg = Msg & { id: number };

function ChatPage() {
  const [messages, setMessages] = useState<UiMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [phase, setPhase] = useState(0);
  const [currentFlow, setCurrentFlow] = useState<Msg[]>([]);
  const [personaSelected, setPersonaSelected] = useState<string | null>(null);
  const [leadShown, setLeadShown] = useState(false);
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  const nextId = () => ++idRef.current;

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  function pushMsg(role: "bot" | "user", text: string) {
    setMessages((m) => [...m, { id: nextId(), role, text }]);
  }

  function botReply(text: string, delay = 900) {
    setIsTyping(true);
    window.setTimeout(() => {
      setIsTyping(false);
      pushMsg("bot", text);
    }, delay);
  }

  function pickPersona(p: "operator" | "builder" | "deliverer") {
    if (personaSelected) return;
    setPersonaSelected(p);
    const flow = flows[p];
    setCurrentFlow(flow);
    pushMsg("user", personaOpeners[p]);
    setPhase(1);
    botReply(flow[0].text, 900);
  }

  function showLeadForm() {
    if (leadShown) return;
    setLeadShown(true);
    botReply(
      "I'd love to set up a quick 20-minute walkthrough for your team — no slides, just a live look at how TeamMap works for your exact situation.\n\nCan I get a couple of details?",
      700,
    );
  }

  function handleSend(text?: string) {
    const value = (text ?? input).trim();
    if (!value) return;
    setInput("");
    pushMsg("user", value);

    // Advance flow if next in flow is a user step
    let p = phase;
    if (currentFlow.length > 0 && p < currentFlow.length && currentFlow[p].role === "user") {
      p = p + 1;
    }

    if (currentFlow.length > 0 && p < currentFlow.length) {
      const next = currentFlow[p];
      setIsTyping(true);
      window.setTimeout(() => {
        setIsTyping(false);
        pushMsg("bot", next.text);
        const newPhase = p + 1;
        setPhase(newPhase);
        if (newPhase >= currentFlow.length && !leadShown) {
          window.setTimeout(() => showLeadForm(), 900);
        }
      }, 900);
    } else if (!leadShown) {
      // No persona picked yet or flow exhausted — friendly generic + kick off lead form
      if (currentFlow.length === 0) {
        botReply(
          "Great question. Before I dive in — quickly, are you the person leading the team day-to-day, or setting the wider strategy? That helps me tailor the answer.",
          900,
        );
        // Treat the direct-typed opener as the operator flow so the conversation continues.
        setCurrentFlow(flows.operator);
        setPhase(1);
      } else {
        botReply(
          "Good one. Let's cover that on the walkthrough where I can show it live rather than describe it.",
          900,
        );
        window.setTimeout(() => showLeadForm(), 1400);
      }
    } else {
      botReply(
        "Great question — the team will cover that in detail on the walkthrough too. Anything else you want me to note down for them?",
        900,
      );
    }

    // Hide chips once conversation starts (handled by messages.length below)
  }

  function submitLead(data: {
    name: string;
    email: string;
    phone: string;
    teamSize: string;
  }) {
    // For now: log. Wired to Supabase in the next step.
    console.log("[YBS] lead captured:", { ...data, persona: personaSelected });
    window.setTimeout(() => {
      pushMsg(
        "bot",
        "Perfect! I've passed your details to the team. Expect a message within 24 hours. In the meantime, feel free to ask me anything else about TeamMap.",
      );
    }, 900);
  }

  const showIntro = messages.length === 0;
  const showChips = messages.length === 0;

  return (
    <div className="ybs">
      <TopBar current="chat" />

      <div className="chat-wrap">
        <div className="chat-hd">
          <div className="chat-av">Y</div>
          <div className="chat-hd-text">
            <h3>YBS Assistant</h3>
            <p>Your team management advisor</p>
          </div>
          <span className="online-txt">Online</span>
          <div className="online-dot" />
        </div>

        <div className="chat-body" ref={bodyRef}>
          {showIntro && (
            <div className="intro">
              <div className="intro-icon">
                <i className="ti ti-layout-dashboard" aria-hidden="true" />
              </div>
              <h2>Hey, I'm the YBS assistant</h2>
              <p>
                Tell me about your team and I'll show you exactly how TeamMap solves your
                biggest workflow problem.
              </p>
              <div className="persona-row">
                <button className="p-card" onClick={() => pickPersona("operator")}>
                  <div className="p-icon">
                    <i className="ti ti-bolt" aria-hidden="true" />
                  </div>
                  <div className="p-role">The Operator</div>
                  <div className="p-name">Operations lead</div>
                  <div className="p-desc">
                    Campaigns, client work, internal projects — simultaneously. 3–8 people.
                  </div>
                </button>
                <button className="p-card" onClick={() => pickPersona("builder")}>
                  <div className="p-icon">
                    <i className="ti ti-rocket" aria-hidden="true" />
                  </div>
                  <div className="p-role">The Builder</div>
                  <div className="p-name">Growth lead</div>
                  <div className="p-desc">
                    Team doubled in 6 months. Old systems don't scale. 8–15 people.
                  </div>
                </button>
                <button className="p-card" onClick={() => pickPersona("deliverer")}>
                  <div className="p-icon">
                    <i className="ti ti-target" aria-hidden="true" />
                  </div>
                  <div className="p-role">The Deliverer</div>
                  <div className="p-name">Service lead</div>
                  <div className="p-desc">
                    Client commitments, deadlines, recurring work across people.
                  </div>
                </button>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} text={m.text} />
          ))}

          {isTyping && (
            <div className="msg-row bot">
              <div className="msg-av">Y</div>
              <div>
                <div className="bubble" style={{ padding: 0 }}>
                  <div className="typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
          )}

          {leadShown && <LeadFormCard onSubmit={submitLead} />}
        </div>

        {showChips && (
          <div className="chips-row">
            <button className="q-chip" onClick={() => handleSend("How does task assignment work?")}>
              Task assignment
            </button>
            <button className="q-chip" onClick={() => handleSend("Can I see a demo?")}>
              See a demo
            </button>
            <button
              className="q-chip"
              onClick={() => handleSend("What makes you different?")}
            >
              What makes you different
            </button>
            <button className="q-chip" onClick={() => handleSend("Tell me about pricing")}>
              Pricing
            </button>
          </div>
        )}

        <div className="chat-foot">
          <div className="inp-row">
            <input
              type="text"
              placeholder="Ask me anything about TeamMap..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
            <button
              className="send-b"
              onClick={() => handleSend()}
              aria-label="Send"
              disabled={!input.trim()}
            >
              <i className="ti ti-send" aria-hidden="true" />
            </button>
          </div>
          <div className="chat-copyright">Powered by YBS · Your data is private</div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ role, text }: { role: "bot" | "user"; text: string }) {
  return (
    <div className={`msg-row ${role}`}>
      <div className="msg-av">{role === "bot" ? "Y" : "P"}</div>
      <div>
        <div className="bubble">{text}</div>
        <div className="msg-time">Just now</div>
      </div>
    </div>
  );
}

function LeadFormCard({
  onSubmit,
}: {
  onSubmit: (data: { name: string; email: string; phone: string; teamSize: string }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  if (done) {
    return (
      <div className="lead-form">
        <h4 style={{ color: "var(--ybs-green)" }}>You're confirmed.</h4>
        <p>We'll reach out within 24 hours to confirm your walkthrough time.</p>
      </div>
    );
  }

  return (
    <div className="lead-form">
      <h4>Book your walkthrough</h4>
      <p>2 minutes to fill, 20 minutes to change how your team works.</p>
      <div className="form-fields">
        <input
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Work email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <select value={teamSize} onChange={(e) => setTeamSize(e.target.value)}>
          <option value="">Team size</option>
          <option>1–3 people</option>
          <option>3–8 people</option>
          <option>8–15 people</option>
          <option>15+ people</option>
        </select>
        {err && <div style={{ color: "#f87171", fontSize: 11 }}>{err}</div>}
        <button
          className="submit-b"
          onClick={() => {
            if (!name.trim() || !email.trim()) {
              setErr("Please add your name and work email.");
              return;
            }
            setErr("");
            setDone(true);
            onSubmit({ name, email, phone, teamSize });
          }}
        >
          Book my walkthrough →
        </button>
      </div>
    </div>
  );
}

function TopBar({ current }: { current: "chat" | "admin" }) {
  return (
    <div className="top-bar">
      <Link to="/" className={`top-tab ${current === "chat" ? "on" : ""}`}>
        <i className="ti ti-message" aria-hidden="true" /> Chatbot
      </Link>
      <Link to="/admin" className={`top-tab ${current === "admin" ? "on" : ""}`}>
        <i className="ti ti-chart-bar" aria-hidden="true" /> Admin dashboard
      </Link>
    </div>
  );
}
