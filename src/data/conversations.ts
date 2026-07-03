export type Msg = { role: "bot" | "user"; text: string };

export const flows: Record<"operator" | "builder" | "deliverer", Msg[]> = {
  operator: [
    {
      role: "bot",
      text: "Got it — you're running an ops-heavy team juggling campaigns, client work, and internal projects all at once. That's exactly who TeamMap is built for.\n\nQuick question: how does your team currently decide what's urgent versus what can wait until tomorrow?",
    },
    { role: "user", text: "Mostly WhatsApp and a shared sheet. It gets messy — things slip." },
    {
      role: "bot",
      text: "Classic. WhatsApp + sheets works until it suddenly doesn't — and by then something's already on fire.\n\nTeamMap gives every team member a personal task dashboard sorted by priority tiers: Top, Hero, Imp. Everyone knows exactly what to do first, and you can see the full picture across your whole team without calling a meeting.\n\nHow many people are you managing right now?",
    },
    { role: "user", text: "About 6 people." },
    {
      role: "bot",
      text: "Perfect size for TeamMap — big enough to need structure, small enough to move fast.\n\nWith 6 people you'd use the Team Dashboard: one column per person, tasks grouped by priority. You can see at a glance who's overloaded, who has capacity, and what's at risk — without a single status update meeting.\n\nWant to see how milestones work too? That's where bigger goals get broken into trackable steps across the team.",
    },
  ],
  builder: [
    {
      role: "bot",
      text: "Growing fast with a team that doubled in 6 months — I hear this a lot. The old way of working stops scaling and things start falling through the cracks.\n\nWhat's the biggest sign for you that your current system isn't working?",
    },
    {
      role: "user",
      text: "People don't know what they're supposed to be doing each day. Too many side conversations.",
    },
    {
      role: "bot",
      text: "That's the clearest signal — when the team spends more time figuring out what to do than actually doing it.\n\nTeamMap solves this with a daily Line Up for each person: their tasks for today, sorted by priority, with a clear sequence. No ambiguity, no digging through messages.\n\nFor you as a growth lead, the Team Dashboard shows all 8–15 people at once — who's on track, who's behind, what's due today. Like a war room view.\n\nHow does your team currently track client deliverables?",
    },
  ],
  deliverer: [
    {
      role: "bot",
      text: "Client commitments, internal deadlines, recurring work — it's a lot to hold in your head and even more to track across a service team.\n\nWhere does it most often go wrong? Is it tracking promises, or visibility into whether work's actually happening?",
    },
    {
      role: "user",
      text: "Both honestly. We promise things and then lose track. Or someone does the work but I don't know until the client asks.",
    },
    {
      role: "bot",
      text: "That's a delivery confidence problem — and it's really common in service teams.\n\nTeamMap handles this with two things working together: Milestones (for client commitments — break a project into substeps, assign each to people, track progress) and the Task Dashboard (see every team member's active work in real time, no chasing).\n\nYou'd know immediately if a client deliverable is at risk, before they ask.\n\nHow many active client relationships are you managing at once?",
    },
  ],
};

export const personaOpeners: Record<string, string> = {
  operator:
    "I'm an operations lead running a 6-person agency. We juggle campaigns, client work, and internal projects.",
  builder:
    "I'm a growth lead — our team doubled in 6 months and our old system isn't keeping up.",
  deliverer:
    "I'm a service lead at an agency. We have lots of client commitments and recurring work to track.",
};

export const personaLabel: Record<string, string> = {
  operator: "Operator",
  builder: "Builder",
  deliverer: "Deliverer",
};
