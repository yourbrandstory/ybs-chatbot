export type Temp = "Hot" | "Warm" | "Cold";
export type PersonaKey = "operator" | "builder" | "deliverer";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  persona: PersonaKey;
  temp: Temp;
  messages: number;
  when: string;
  teamSize: string;
  currentTools: string;
  preview: string;
};

export const mockLeads: Lead[] = [
  {
    id: "l1",
    name: "Rohan Mehta",
    email: "rohan@agency.in",
    phone: "98xx xx12",
    persona: "operator",
    temp: "Hot",
    messages: 14,
    when: "2m ago",
    teamSize: "3–8 people",
    currentTools: "WhatsApp, Google Sheets",
    preview: "How does milestone tracking work?",
  },
  {
    id: "l2",
    name: "Sneha Kulkarni",
    email: "sneha@brand.co",
    phone: "99xx xx45",
    persona: "builder",
    temp: "Warm",
    messages: 8,
    when: "18m ago",
    teamSize: "8–15 people",
    currentTools: "Notion, Slack",
    preview: "We have 12 people, can it handle that?",
  },
  {
    id: "l3",
    name: "Ankit Desai",
    email: "ankit@startup.io",
    phone: "91xx xx78",
    persona: "deliverer",
    temp: "Warm",
    messages: 6,
    when: "1h ago",
    teamSize: "3–8 people",
    currentTools: "Trello",
    preview: "What's the pricing for a team of 5?",
  },
  {
    id: "l4",
    name: "Priya Thakur",
    email: "priya@co.in",
    phone: "—",
    persona: "operator",
    temp: "Cold",
    messages: 2,
    when: "3h ago",
    teamSize: "1–3 people",
    currentTools: "Email",
    preview: "Just browsing, thanks",
  },
];

export const topQueries: Array<{ text: string; count: number; pct: number }> = [
  { text: "How does task assignment work?", count: 47, pct: 90 },
  { text: "What does it cost?", count: 38, pct: 72 },
  { text: "Can I see a demo?", count: 30, pct: 58 },
  { text: "How many team members?", count: 21, pct: 40 },
  { text: "Milestone + client tracking", count: 15, pct: 28 },
];

export const stats = [
  { label: "Conversations", value: "247", sub: "34% vs last week", tone: "green" as const },
  { label: "Leads captured", value: "38", sub: "12 this week", tone: "green" as const },
  { label: "Hot leads", value: "9", sub: "Follow up today", tone: "amber" as const },
  { label: "Avg messages", value: "6.4", sub: "Per conversation", tone: "mute" as const },
];

export const defaultSystemPrompt = `You are the YBS TeamMap assistant. You help operations, growth, and service leads understand how TeamMap solves their team management problems.

Voice: warm, direct, plain-spoken. No jargon, no fluff. Ask one question at a time. Reflect back what the user said before adding new information.

Product primitives you can talk about:
- Personal task dashboard sorted by priority tiers (Top, Hero, Imp)
- Team Dashboard — one column per person, tasks grouped by priority
- Daily Line Up — each person's tasks for today, in sequence
- Milestones — break big goals into steps, assign, track
- Real-time visibility into who is overloaded vs. free

After 4–5 exchanges, offer to book a 20-minute walkthrough and hand off to the lead capture form. Never invent pricing — say "let's cover pricing on the walkthrough".`;

export const defaultQuickChips = [
  "How does task assignment work?",
  "Can I see a demo?",
  "What makes you different?",
  "Tell me about pricing",
].join(" | ");
