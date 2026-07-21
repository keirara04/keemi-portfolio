export const profile = {
  name: "Hakeemi Ridza",
  shortName: "Keemi",
  title: "Computer Science Student & Freelance Developer",
  school: "Computer Science Student, Korea University",
  bio: "I'm a Computer Science student from Malaysia who enjoys turning ideas into working projects. I’m interested in software engineering, machine learning, and building useful applications that make life a little easier. Always learning, experimenting, and trying out new things in tech.",
  freelanceNote:
    "Open for freelance & contract work for full-stack apps, AI/LLM integrations, and automation.",
  email: "hakeemiridza@gmail.com",
  links: {
    github: "https://github.com/keirara04",
    linkedin: "https://linkedin.com/in/HakeemiRidza",
  },
};

export const specs = [
  { label: "Chip", value: "CS Student at Korea University" },
  { label: "Focus", value: "AI/ML, Computer Vision, Full-Stack Dev" },
  { label: "Availability", value: "Open to freelance & contract gigs" },
  { label: "Memory", value: "Unlimited curiosity, mostly monster and caffeine-powered" },
];

export type SkillGroup = {
  category: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    category: "Backend & Data",
    items: ["Node.js", "Supabase", "PostgreSQL", "REST APIs"],
  },
  {
    category: "AI / LLM",
    items: ["OpenAI API", "Groq LLM", "n8n workflow automation"],
  },
  {
    category: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "Java", "C", "SQL", "PHP (Laravel)"],
  },
  {
    category: "Infra & Tools",
    items: ["Git / GitHub", "Vercel", "Cloudflare", "Upstash Redis"],
  },
];

export const interests = [
  "Scalable web applications",
  "AI integration",
  "Authentication systems",
  "Database design",
  "Progressive Web Apps (PWAs)",
  "CI/CD",
];

export type Project = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
  placeholder: boolean;
};

export const projects: Project[] = [
  {
    id: "shelterlab",
    name: "ShelterLab",
    tagline: "PLACEHOLDER — one-line description to be replaced",
    description:
      "[PLACEHOLDER — swap in real project description, problem solved, and outcome/result for ShelterLab.]",
    stack: ["Next.js", "Supabase", "PostgreSQL"], // PLACEHOLDER — confirm actual stack
    liveUrl: undefined,
    repoUrl: undefined,
    placeholder: true,
  },
  {
    id: "hr-management-system",
    name: "HR Management System",
    tagline: "PLACEHOLDER — one-line description to be replaced",
    description:
      "[PLACEHOLDER — swap in real project description, problem solved, and outcome/result for the HR Management System.]",
    stack: ["React", "Node.js", "PostgreSQL"], // PLACEHOLDER — confirm actual stack
    liveUrl: undefined,
    repoUrl: undefined,
    placeholder: true,
  },
];

export type Note = {
  id: string;
  title: string;
  date: string;
  body: string;
};

export const notes: Note[] = [
  {
    id: "about-this-site",
    title: "About this site",
    date: "July 2026",
    body: "I built this portfolio as a working macOS desktop where windows you can drag, a dock, Spotlight, even a terminal. Stack: Next.js, Tailwind, and Motion. No UI libraries for the desktop itself; the window manager is hand-rolled.\n\nIf you're reading this in the Notes app: yes, everything here actually works. Try Cmd+K.",
  },
  {
    id: "now",
    title: "What I'm up to now",
    date: "July 2026",
    body: "3rd year CS at Korea University, second semester.\n\nCurrently taking on freelance gigs, mostly full-stack web apps and AI/LLM integrations. If you have a project in mind, the Mail app on the dock is the fastest way to reach me. ^~^",
  },
  {
    id: "stack",
    title: "Tools I usually use",
    date: "July 2026",
    body: "Frontend: React, Next.js, Tailwind CSS.\nBackend: Node.js, Supabase, PostgreSQL.\n\nDeploy on Vercel, cache on Upstash, DNS on Cloudflare. Boring choices on purpose because they let me ship fast and sleep at night lol. But do tell me if you want to implement a system with a different stack; I can adapt. (I also have some experience with Laravel, Python, and Java.)",
  },
  {
    id: "Diary",
    title: "Dear Diary...",
    date: "July 2026",
    body: "I miss the days when I could just code for fun without worrying about deadlines or clients. But I guess that's part of growing up, right? Still, I try to keep a little time each week to tinker with new tech and side projects. Keeps the passion alive. Also living in South Korea made me miss nasi lemak and teh tarik.... sigh....",
  },
];
