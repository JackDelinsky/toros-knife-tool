export const START_QUICK_REPLIES = [
  "Help me choose a knife",
  "Compare two knives",
  "How do I maintain my knife?",
  "What blade steel should I choose?",
  "Are these knives legal?",
] as const;

export type QuickReplyLabel = (typeof START_QUICK_REPLIES)[number];

export type FinderStep = "idle" | "use_case" | "budget" | "blade_style" | "preferences";

export type FinderContext = {
  useCase?: string;
  budget?: string;
  bladeStyle?: string;
  preferences?: string;
};

export type AssistantTurn = {
  assistantMessages: string[];
  quickReplies: string[];
  nextStep: FinderStep;
  context: FinderContext;
};

const USE_CASE_OPTIONS = [
  "Camping & bushcraft",
  "Hunting",
  "Everyday carry",
  "Collection / display",
  "Backup / neck carry",
];

const BUDGET_OPTIONS = ["Under $150", "$150 – $250", "$250+", "Flexible"];

const BLADE_STYLE_OPTIONS = ["Fixed blade", "Folding knife", "Neck knife", "Not sure — help me pick"];

const PREFERENCE_OPTIONS = [
  "Natural materials (wood, stag)",
  "Synthetic grip (micarta)",
  "Compact & lightweight",
  "No strong preference",
];

export const WELCOME_MESSAGE =
  "I'm the Knife Finder Assistant. I can help you narrow down a Toros blade by use case, budget, and style — or answer common knife questions. What would you like to explore?";

function normalizeInput(text: string): string {
  return text.trim().toLowerCase();
}

function matchesOption(input: string, options: string[]): string | undefined {
  const normalized = normalizeInput(input);
  return options.find((option) => normalizeInput(option) === normalized);
}

export function buildRecommendation(context: FinderContext): string {
  const { useCase, budget, bladeStyle, preferences } = context;

  if (bladeStyle === "Neck knife" || useCase === "Backup / neck carry") {
    return (
      "For backup carry, start with the **Toros Jellybean** series — compact neck knives built for light weight and fast access. They're ideal when you want a blade that stays out of the way until you need it.\n\nBrowse neck knives in the shop or view the Jellybean on our site."
    );
  }

  if (bladeStyle === "Folding knife" || useCase === "Everyday carry") {
    return (
      "For everyday carry, the **Kam Ram** folder is a strong match: N690 steel, a distinctive micarta handle, and Ottoman-inspired quick-deploy mechanics.\n\nIf you want something even lighter, explore our folding knives category for shepherd-style and lockback options."
    );
  }

  if (useCase === "Hunting" || preferences === "Natural materials (wood, stag)") {
    return (
      "For hunting or natural handle character, consider the **BOS Stag Golden Horn** — antler handle, full fixed-blade profile, and a polished field-ready build.\n\nThe **BOS Stag Frontier** is another classic stag option at a slightly different size and feel."
    );
  }

  if (useCase === "Camping & bushcraft" || bladeStyle === "Fixed blade") {
    if (budget === "Under $150" || budget === "$150 – $250") {
      return (
        "For camp and bushcraft in the mid range, the **BOS Recurve Survivor** is a workhorse: micarta grip, recurve profile, and a blade length built for real use.\n\nThe **BOS Deri** is a lighter fixed blade if you want something more compact for detail work around camp."
      );
    }
    return (
      "For hard-use fixed blades, the **BOS Recurve Survivor** handles camp tasks beautifully. If you want more heirloom character, the **BOS Stag Golden Horn** pairs natural antler with a refined fixed-blade profile."
    );
  }

  if (useCase === "Collection / display") {
    return (
      "For display-worthy pieces, look at **BOS Stag Golden Horn** and **Toros Ceviz** — both showcase Turkish craft and natural materials with profiles collectors love.\n\nCustom commissions are also available if you want something one-of-a-kind."
    );
  }

  return (
    "Based on what you shared, I'd start with our **featured fixed blades** — especially the BOS Recurve Survivor for all-around field use, or the Kam Ram if you prefer a folder.\n\nBrowse the shop by category or tell me more about how you'll use the knife."
  );
}

function demoResponses(label: QuickReplyLabel): string[] {
  switch (label) {
    case "Compare two knives":
      return [
        "Here's a quick comparison of two popular Toros fixed blades:",
        "**BOS Stag Golden Horn** — Antler handle, classic hunting profile, polished presentation. Best for hunters and collectors who want natural materials and a refined fixed blade (~$185 range).",
        "**BOS Recurve Survivor** — Micarta handle, recurve belly, built for grip and hard camp use. Best for bushcraft, camping, and all-day field work (~$140 range).",
        "Golden Horn leans heritage and display; Recurve Survivor leans utility and heavy handling. Both use N690 steel and Turkish BOS craftsmanship.",
      ];
    case "How do I maintain my knife?":
      return [
        "Toros blades are built to last with simple care:",
        "• Rinse and **dry immediately** after use — especially carbon-touch areas.\n• Apply a light **food-safe oil** on the blade after drying.\n• Keep leather sheaths dry; condition leather periodically.\n• Micarta and antler handles need minimal care — avoid prolonged soaking.\n• Store in a dry place, not loose in a damp pack.",
        "A well-maintained knife keeps its edge longer and avoids patina turning into corrosion.",
      ];
    case "What blade steel should I choose?":
      return [
        "Most Toros knives use **N690** — a stainless steel that balances edge retention, corrosion resistance, and ease of sharpening. It's a practical choice for field knives and folders.",
        "**Carbon steel** can take a sharper edge and develop character over time, but needs more diligent drying and oiling.",
        "For camping and hunting, N690 is an easy recommendation. For users who enjoy maintaining blades and want maximum sharpness, carbon options can be worth the extra care.",
      ];
    case "Are these knives legal?":
      return [
        "Knife laws vary by **state, city, and how you carry** (open vs concealed, blade length, automatic folders, etc.). Toros sells fixed blades, folders, and neck knives — each can fall under different rules.",
        "We can't provide legal advice. Check your local and state regulations before carrying, especially for folders in urban areas and neck knives.",
        "For travel, research restrictions for your destination — airports and some venues prohibit knives entirely.",
      ];
    default:
      return [WELCOME_MESSAGE];
  }
}

export function processUserInput(
  input: string,
  step: FinderStep,
  context: FinderContext,
): AssistantTurn {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      assistantMessages: ["Please choose an option or type a message."],
      quickReplies: step === "idle" ? [...START_QUICK_REPLIES] : getQuickRepliesForStep(step),
      nextStep: step,
      context,
    };
  }

  const normalized = normalizeInput(trimmed);
  const isStartQuickReply = START_QUICK_REPLIES.some((reply) => normalizeInput(reply) === normalized);

  if (isStartQuickReply && trimmed !== "Help me choose a knife") {
    return {
      assistantMessages: demoResponses(trimmed as QuickReplyLabel),
      quickReplies: [...START_QUICK_REPLIES],
      nextStep: "idle",
      context: {},
    };
  }

  if (trimmed === "Help me choose a knife" || normalized === "help me choose a knife") {
    return {
      assistantMessages: [
        "Let's find a good match. First — **what will you mainly use the knife for?**",
      ],
      quickReplies: USE_CASE_OPTIONS,
      nextStep: "use_case",
      context: {},
    };
  }

  if (step === "use_case") {
    const useCase = matchesOption(trimmed, USE_CASE_OPTIONS) ?? trimmed;
    return {
      assistantMessages: ["Great. **What's your budget range?**"],
      quickReplies: BUDGET_OPTIONS,
      nextStep: "budget",
      context: { ...context, useCase },
    };
  }

  if (step === "budget") {
    const budget = matchesOption(trimmed, BUDGET_OPTIONS) ?? trimmed;
    return {
      assistantMessages: ["**Which blade style are you leaning toward?**"],
      quickReplies: BLADE_STYLE_OPTIONS,
      nextStep: "blade_style",
      context: { ...context, budget },
    };
  }

  if (step === "blade_style") {
    const bladeStyle = matchesOption(trimmed, BLADE_STYLE_OPTIONS) ?? trimmed;
    return {
      assistantMessages: ["Last one — **any handle or carry preferences?**"],
      quickReplies: PREFERENCE_OPTIONS,
      nextStep: "preferences",
      context: { ...context, bladeStyle },
    };
  }

  if (step === "preferences") {
    const preferences = matchesOption(trimmed, PREFERENCE_OPTIONS) ?? trimmed;
    const finalContext = { ...context, preferences };
    return {
      assistantMessages: [
        "Here's what I'd suggest based on your answers:",
        buildRecommendation(finalContext),
        "Want to explore more? Pick another topic below or start the finder again.",
      ],
      quickReplies: [...START_QUICK_REPLIES],
      nextStep: "idle",
      context: finalContext,
    };
  }

  // idle free text
  return {
    assistantMessages: [
      "I can help with knife recommendations and common questions. Try one of the quick options below.",
    ],
    quickReplies: [...START_QUICK_REPLIES],
    nextStep: "idle",
    context,
  };
}

function getQuickRepliesForStep(step: FinderStep): string[] {
  switch (step) {
    case "use_case":
      return USE_CASE_OPTIONS;
    case "budget":
      return BUDGET_OPTIONS;
    case "blade_style":
      return BLADE_STYLE_OPTIONS;
    case "preferences":
      return PREFERENCE_OPTIONS;
    default:
      return [...START_QUICK_REPLIES];
  }
}
