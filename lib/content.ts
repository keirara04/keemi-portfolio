export const profile = {
  name: "Hakeemi Ridza",
  shortName: "Keemi",
  title: "Computer Science Student & Freelance Developer",
  school: "Computer Science Student, Korea University",
  bio: "I'm a Computer Science student from Malaysia who enjoys turning ideas into working projects. I’m interested in software engineering, machine learning, and building useful applications that make life a little easier. Always learning, experimenting, and trying out new things in tech.",
  freelanceNote:
    "Open for freelance & contract work for full-stack apps, AI/LLM integrations, and automation.",
  email: "hakeemiridza@gmail.com",
  whatsapp: "+821059378068",
  links: {
    github: "https://github.com/keirara04",
    linkedin: "https://linkedin.com/in/HakeemiRidza",
  },
};

export function whatsappUrl(message: string): string {
  const digits = profile.whatsapp.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const specs = [
  { label: "Chip", value: "Computer Science student at Korea University" },
  { label: "Focus", value: "AI/ML, Computer Vision, Full-Stack Dev" },
  { label: "Availability", value: "Open to freelance & Make website to your needs " },
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

export type ProjectScreenshot = {
  src: string;
  alt: string;
};

export type Project = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  highlights?: string[];
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
  screenshots?: ProjectScreenshot[];
  placeholder: boolean;
  /** Internal/company tool with no public live link or repo — show a note instead of TBD links. */
  internal?: boolean;
};

export const projects: Project[] = [
  {
    id: "shelterlab",
    name: "ShelterLab",
    tagline: "Full-stack campus marketplace PWA for verified university students",
    description:
      "A secure Progressive Web App marketplace built for 10+ South Korean universities, gating access behind .ac.kr email verification and 8-digit OTPs so every user is a verified student. Built on the bleeding edge with Next.js 16 and React 19 (Server Actions, concurrent rendering) ahead of their stable releases to cut client-side overhead.",
    highlights: [
      `"LabCred" : a special proprietary trust-scoring algorithm that rates user credibility in real time from transaction history and 1–5 star peer reviews`,
      `"LabGigs" : an exclusive secondary service-based economy with its own management dashboard, real-time state tracking, and automated archiving for peer-to-peer campus service exchanges`,
      "Groq LLM (Mixtral-8x7b) integration for real-time AI pricing suggestions across 20 categories",
      "Bot/abuse protection via Upstash Redis sliding-window rate limits (e.g. 120 searches/min) and Cloudflare DNS management",
      "PIPA-compliant data handling: 24-hour automatic account deletion on request, 3-business-day dispute resolution SLA",
      "Automated notification pipeline (Brevo SMTP + Web Push API) for transactional emails and identity verification, cutting manual admin work by an estimated 70%",
    ],
    stack: [
      "Next.js 16",
      "React 19",
      "Supabase",
      "PostgreSQL",
      "Groq LLM",
      "Upstash Redis",
      "Cloudflare",
    ],
    liveUrl: "https://shelterlab.shop",
    repoUrl: "https://github.com/keirara04/ShelterLab",
    screenshots: [
      { src: "/shelterlab-homepage.png", alt: "ShelterLab home feed" },
      { src: "/shelterlab-loginpage.png", alt: "ShelterLab .ac.kr email login" },
      { src: "/shelterlab-profilepage.png", alt: "ShelterLab user profile with LabCred score" },
      { src: "/shelterlab-sellpage.png", alt: "ShelterLab sell listing flow" },
    ],
    placeholder: false,
  },
  {
    id: "hr-management-system",
    name: "HR Management System",
    tagline: "Field work-logging app for energy sector staff and contractors",
    description:
      "An internal Next.js tool built during my Digital Internship at ERS Energy Sdn Bhd, letting field staff and contractors log daily work entries — time in/out, project, task type, photo proof, and GPS location — from the field. Rebuilt from an existing AppSheet + Google Sheets system, using the original as the UI/UX reference so the new app kept the flow field staff were already used to.",
    highlights: [
      "Time in/out logging tied to project and task type, matching the original AppSheet flow",
      "Photo proof capture attached to each work entry",
      "GPS location capture for field verification",
      "Rebuilt the AppSheet + Google Sheets workflow as a standalone web app",
    ],
    stack: ["Next.js", "React", "PHP (Laravel)", "MySQL", "Upstash Redis", "Cloudflare"],
    liveUrl: undefined,
    repoUrl: undefined,
    screenshots: [
      { src: "/hrms-loginpage.png", alt: "HR Management System login" },
      { src: "/hrms-timeinpage.png", alt: "HR Management System time in/out entry" },
      { src: "/hrms-historypage.png", alt: "HR Management System entry history" },
      { src: "/hrms-leavepage.png", alt: "HR Management System leave request" },
      { src: "/hrms-otleavepage.png", alt: "HR Management System overtime & leave" },
    ],
    placeholder: false,
    internal: true,
  },
  {
    id: "lyns-little-kitchen",
    name: "Cookie Business System (Lyn's Little Kitchen)",
    tagline: "Online ordering system for a home-based cookie business",
    description:
      "Full-stack app for a home cookie business in Jasin, Melaka. Customers browse products, place orders, pay online, and track order status. Admins manage products, inventory, orders, and analytics.",
    highlights: [
      "Customer-facing storefront with online ordering and order tracking",
      "Admin dashboard for product, inventory, and order management with analytics",
      "Image/file storage via Cloudinary",
      "Token-based auth with Laravel Sanctum",
    ],
    stack: [
      "Nuxt 4",
      "Vue 3",
      "TypeScript",
      "Tailwind CSS",
      "Pinia",
      "Laravel",
      "Laravel Sanctum",
      "PostgreSQL",
      "Cloudinary",
    ],
    liveUrl: "https://lynslittlekitchen.vercel.app",
    repoUrl: "https://github.com/keirara04/lynslittlekitchen",
    screenshots: [
      { src: "/LLK-1.png", alt: "Lyn's Little Kitchen homepage hero" },
      { src: "/LLK-2.png", alt: "Lyn's Little Kitchen product listing and kitchen story" },
      { src: "/LLK-3.png", alt: "Lyn's Little Kitchen order steps overview and footer" },
      { src: "/LLK-4.png", alt: "Lyn's Little Kitchen how-to-order page with step-by-step guide" },
      { src: "/LLK-5.png", alt: "Admin dashboard with sales, orders, and stock overview" },
      { src: "/LLK-6.png", alt: "Admin products page listing cookies with stock and status" },
    ],
    placeholder: false,
  },
];

export type SchoolReport = {
  id: string;
  title: string;
  course: string;
  date: string;
  description: string;
  fileUrl?: string;
};

export const schoolReports: SchoolReport[] = [
  {
    id: "korean-sign-language",
    title: "Korean Sign Language Report",
    course: "Korea University",
    date: "2026",
    description:
      "Research report on Korean Sign Language (KSL) and its applications in computer vision and AI, including gesture recognition and accessibility tools.",
    fileUrl: "/DeepLearning_team11_report.pdf",
  },
];

export type ScheduleItem = {
  time: string;
  activity: string;
};

// Desktop clutter, not a real schedule — see the DailyScheduleWidget.
export const dailySchedule: ScheduleItem[] = [
  { time: "09:00", activity: "Wake up, check for client emails (0 new)" },
  { time: "11:00", activity: "Lecture and pretend to pay attention" },
  { time: "14:00", activity: "Debug code that worked yesterday" },
  { time: "18:00", activity: "LinkedIn/Tiktok doomscroll for jobs" },
  { time: "23:00", activity: `"I'll sleep after this one more commit"` },
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

// Unlocked by the Konami code — see KonamiListener. Not part of the default `notes` list.
export const secretNote: Note = {
  id: "secret",
  title: "🎮 You found it",
  date: "???",
  body: "Congrats, you actually tried the Konami code on a portfolio site. That's either genuine curiosity or years of muscle memory — either way, I respect it.\n\nThere are a couple more easter eggs scattered around. Try clicking the Apple logo a few times, or poke around the Terminal.",
};
