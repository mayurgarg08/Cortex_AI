import { Code2, FileText, Globe, ImageIcon, MessageSquare, Presentation, Zap } from "lucide-react"

// `id` is the agent name sent to the backend. `accent` holds the classes for the agent's icon tile.
export const AGENTS = [
    {
        id: "auto",
        label: "Auto",
        icon: Zap,
        description: "Picks the best agent for every request",
        accent: "from-indigo-500/25 to-violet-500/10 text-indigo-300 ring-indigo-400/25",
    },
    {
        id: "chat",
        label: "Chat",
        icon: MessageSquare,
        description: "Answers, explanations and ideas",
        accent: "from-sky-500/25 to-sky-500/5 text-sky-300 ring-sky-400/25",
        example: "Explain how Redis works like I'm new to backend development",
    },
    {
        id: "coding",
        label: "Coding",
        icon: Code2,
        description: "Writes code with a live preview",
        accent: "from-emerald-500/25 to-emerald-500/5 text-emerald-300 ring-emerald-400/25",
        example: "Build a modern landing page for a coffee shop",
    },
    {
        id: "search",
        label: "Search",
        icon: Globe,
        description: "Researches the live web",
        accent: "from-cyan-500/25 to-cyan-500/5 text-cyan-300 ring-cyan-400/25",
        example: "What are the biggest AI announcements this week?",
    },
    {
        id: "pdf",
        label: "PDF",
        icon: FileText,
        description: "Creates polished PDF documents",
        accent: "from-rose-500/25 to-rose-500/5 text-rose-300 ring-rose-400/25",
        example: "Create a PDF study guide on the solar system",
    },
    {
        id: "ppt",
        label: "PPT",
        icon: Presentation,
        description: "Designs ready-to-present slides",
        accent: "from-amber-500/25 to-amber-500/5 text-amber-300 ring-amber-400/25",
        example: "Make a presentation on the future of electric vehicles",
    },
    {
        id: "vision",
        label: "Vision",
        icon: ImageIcon,
        description: "Generates images from your ideas",
        accent: "from-fuchsia-500/25 to-fuchsia-500/5 text-fuchsia-300 ring-fuchsia-400/25",
        example: "Generate an image of a futuristic city at sunset",
    },
]
