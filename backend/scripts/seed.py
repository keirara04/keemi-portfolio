"""One-time idempotent seed of CMS tables from the current lib/content.ts values.

Run with: python -m scripts.seed  (from backend/, with DATABASE_URL etc set)
Safe to re-run: upserts by natural key instead of blindly inserting.
"""

import asyncio

from sqlalchemy import select

from app.auth import hash_password
from app.config import settings
from app.db import Base, async_session, engine
from app.models import (
    AdminUser,
    Interest,
    Note,
    Profile,
    Project,
    SchoolReport,
    SkillGroup,
    Spec,
)

PROFILE = {
    "name": "Hakeemi Ridza",
    "short_name": "Keemi",
    "title": "Computer Science Student & Freelance Developer",
    "school": "Computer Science Student, Korea University",
    "bio": (
        "I'm a Computer Science student from Malaysia who enjoys turning ideas into working "
        "projects. I'm interested in software engineering, machine learning, and building useful "
        "applications that make life a little easier. Always learning, experimenting, and trying "
        "out new things in tech."
    ),
    "freelance_note": (
        "Open for freelance & contract work for full-stack apps, AI/LLM integrations, and automation."
    ),
    "email": "hakeemiridza@gmail.com",
    "whatsapp": "+821059378068",
    "github_url": "https://github.com/keirara04",
    "linkedin_url": "https://linkedin.com/in/HakeemiRidza",
}

SPECS = [
    {"label": "Chip", "value": "Computer Science student at Korea University"},
    {"label": "Focus", "value": "AI/ML, Computer Vision, Full-Stack Dev"},
    {"label": "Availability", "value": "Open to freelance & Make website to your needs "},
    {"label": "Memory", "value": "Unlimited curiosity, mostly monster and caffeine-powered"},
]

SKILL_GROUPS = [
    {"category": "Frontend", "items": ["React", "Next.js", "Tailwind CSS"]},
    {"category": "Backend & Data", "items": ["Node.js", "Supabase", "PostgreSQL", "REST APIs"]},
    {"category": "AI / LLM", "items": ["OpenAI API", "Groq LLM", "n8n workflow automation"]},
    {
        "category": "Languages",
        "items": ["Python", "TypeScript", "JavaScript", "Java", "C", "SQL", "PHP (Laravel)"],
    },
    {"category": "Infra & Tools", "items": ["Git / GitHub", "Vercel", "Cloudflare", "Upstash Redis"]},
]

INTERESTS = [
    "Scalable web applications",
    "AI integration",
    "Authentication systems",
    "Database design",
    "Progressive Web Apps (PWAs)",
    "CI/CD",
]

PROJECTS = [
    {
        "id": "shelterlab",
        "name": "ShelterLab",
        "tagline": "Full-stack campus marketplace PWA for verified university students",
        "description": (
            "A secure Progressive Web App marketplace built for 10+ South Korean universities, "
            "gating access behind .ac.kr email verification and 8-digit OTPs so every user is a "
            "verified student. Built on the bleeding edge with Next.js 16 and React 19 (Server "
            "Actions, concurrent rendering) ahead of their stable releases to cut client-side overhead."
        ),
        "highlights": [
            '"LabCred" : a special proprietary trust-scoring algorithm that rates user credibility '
            "in real time from transaction history and 1-5 star peer reviews",
            '"LabGigs" : an exclusive secondary service-based economy with its own management '
            "dashboard, real-time state tracking, and automated archiving for peer-to-peer campus "
            "service exchanges",
            "Groq LLM (Mixtral-8x7b) integration for real-time AI pricing suggestions across 20 categories",
            "Bot/abuse protection via Upstash Redis sliding-window rate limits (e.g. 120 searches/min) "
            "and Cloudflare DNS management",
            "PIPA-compliant data handling: 24-hour automatic account deletion on request, 3-business-day "
            "dispute resolution SLA",
            "Automated notification pipeline (Brevo SMTP + Web Push API) for transactional emails and "
            "identity verification, cutting manual admin work by an estimated 70%",
        ],
        "stack": ["Next.js 16", "React 19", "Supabase", "PostgreSQL", "Groq LLM", "Upstash Redis", "Cloudflare"],
        "live_url": "https://shelterlab.shop",
        "repo_url": "https://github.com/keirara04/ShelterLab",
        "screenshots": [
            {"src": "/shelterlab-homepage.png", "alt": "ShelterLab home feed"},
            {"src": "/shelterlab-loginpage.png", "alt": "ShelterLab .ac.kr email login"},
            {"src": "/shelterlab-profilepage.png", "alt": "ShelterLab user profile with LabCred score"},
            {"src": "/shelterlab-sellpage.png", "alt": "ShelterLab sell listing flow"},
        ],
        "placeholder": False,
        "internal": False,
        "sort_order": 0,
    },
    {
        "id": "hr-management-system",
        "name": "HR Management System",
        "tagline": "Field work-logging app for energy sector staff and contractors",
        "description": (
            "An internal Next.js tool built during my Digital Internship at ERS Energy Sdn Bhd, "
            "letting field staff and contractors log daily work entries — time in/out, project, "
            "task type, photo proof, and GPS location — from the field. Rebuilt from an existing "
            "AppSheet + Google Sheets system, using the original as the UI/UX reference so the new "
            "app kept the flow field staff were already used to."
        ),
        "highlights": [
            "Time in/out logging tied to project and task type, matching the original AppSheet flow",
            "Photo proof capture attached to each work entry",
            "GPS location capture for field verification",
            "Rebuilt the AppSheet + Google Sheets workflow as a standalone web app",
        ],
        "stack": ["Next.js", "React", "PHP (Laravel)", "MySQL", "Upstash Redis", "Cloudflare"],
        "live_url": None,
        "repo_url": None,
        "screenshots": [
            {"src": "/hrms-loginpage.png", "alt": "HR Management System login"},
            {"src": "/hrms-timeinpage.png", "alt": "HR Management System time in/out entry"},
            {"src": "/hrms-historypage.png", "alt": "HR Management System entry history"},
            {"src": "/hrms-leavepage.png", "alt": "HR Management System leave request"},
            {"src": "/hrms-otleavepage.png", "alt": "HR Management System overtime & leave"},
        ],
        "placeholder": False,
        "internal": True,
        "sort_order": 1,
    },
    {
        "id": "lyns-little-kitchen",
        "name": "Cookie Business System (Lyn's Little Kitchen)",
        "tagline": "Online ordering system for a home-based cookie business",
        "description": (
            "Full-stack app for a home cookie business in Jasin, Melaka. Customers browse products, "
            "place orders, pay online, and track order status. Admins manage products, inventory, "
            "orders, and analytics."
        ),
        "highlights": [
            "Customer-facing storefront with online ordering and order tracking",
            "Admin dashboard for product, inventory, and order management with analytics",
            "Image/file storage via Cloudinary",
            "Token-based auth with Laravel Sanctum",
        ],
        "stack": [
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
        "live_url": "https://lynslittlekitchen.vercel.app",
        "repo_url": "https://github.com/keirara04/lynslittlekitchen",
        "screenshots": [
            {"src": "/LLK-1.png", "alt": "Lyn's Little Kitchen homepage hero"},
            {"src": "/LLK-2.png", "alt": "Lyn's Little Kitchen product listing and kitchen story"},
            {"src": "/LLK-3.png", "alt": "Lyn's Little Kitchen order steps overview and footer"},
            {"src": "/LLK-4.png", "alt": "Lyn's Little Kitchen how-to-order page with step-by-step guide"},
            {"src": "/LLK-5.png", "alt": "Admin dashboard with sales, orders, and stock overview"},
            {"src": "/LLK-6.png", "alt": "Admin products page listing cookies with stock and status"},
        ],
        "placeholder": False,
        "internal": False,
        "sort_order": 2,
    },
    {
        "id": "that-fridge",
        "name": "That Fridge",
        "tagline": "AI-powered kitchen assistant that tracks groceries and cuts food waste",
        "description": (
            "Snap a photo of groceries or a receipt and That Fridge tracks what you own, where it's "
            "stored (fridge/freezer/pantry), and when it expires — surfacing recipes from what's "
            "fresh, a shopping list, and expiry alerts before food goes to waste. Built around 4 "
            '"agent" personas: Guardian (freshness alerts), Shopkeeper (low stock), Chef (recipes), '
            "and Organizer (fridge layout). Two-person build — I own the data/auth/CRUD track, my "
            "teammate owns ingestion/AI."
        ),
        "highlights": [
            "Photo/receipt capture pipeline that extracts and tracks grocery items automatically",
            "Location-aware inventory across fridge, freezer, and pantry with expiry tracking",
            "4 agent personas driving alerts, restock suggestions, recipes, and layout organization",
            "Sanctum Bearer token auth on a Laravel API backend",
        ],
        "stack": [
            "Next.js 16",
            "React",
            "TypeScript",
            "PHP (Laravel 13)",
            "Laravel Sanctum",
            "PostgreSQL",
            "Redis",
            "Docker",
        ],
        "live_url": None,
        "repo_url": "https://github.com/naufalkmd/ThatFridge",
        "screenshots": [
            {"src": "/TF-1.webp", "alt": "That Fridge home dashboard with fridge inventory and crew"},
            {"src": "/TF-2.webp", "alt": "That Fridge quick chat answering what to cook tonight"},
            {"src": "/TF-3.webp", "alt": "That Fridge recipe suggestions from crew tab"},
        ],
        "placeholder": False,
        "internal": False,
        "sort_order": 3,
    },
]

SCHOOL_REPORTS = [
    {
        "title": "Korean Sign Language Report",
        "course": "Korea University",
        "date": "2026",
        "description": (
            "Research report on Korean Sign Language (KSL) and its applications in computer vision "
            "and AI, including gesture recognition and accessibility tools."
        ),
        "file_url": "/DeepLearning_team11_report.pdf",
    },
]

NOTES = [
    {
        "title": "About this site",
        "date": "July 2026",
        "body": (
            "I built this portfolio as a working macOS desktop where windows you can drag, a dock, "
            "Spotlight, even a terminal. Stack: Next.js, Tailwind, and Motion. No UI libraries for "
            "the desktop itself; the window manager is hand-rolled.\n\nIf you're reading this in the "
            "Notes app: yes, everything here actually works. Try Cmd+K."
        ),
        "is_secret": False,
    },
    {
        "title": "What I'm up to now",
        "date": "July 2026",
        "body": (
            "3rd year CS at Korea University, second semester.\n\nCurrently taking on freelance gigs, "
            "mostly full-stack web apps and AI/LLM integrations. If you have a project in mind, the "
            "Mail app on the dock is the fastest way to reach me. ^~^"
        ),
        "is_secret": False,
    },
    {
        "title": "Tools I usually use",
        "date": "July 2026",
        "body": (
            "Frontend: React, Next.js, Tailwind CSS.\nBackend: Node.js, Supabase, PostgreSQL.\n\n"
            "Deploy on Vercel, cache on Upstash, DNS on Cloudflare. Boring choices on purpose because "
            "they let me ship fast and sleep at night lol. But do tell me if you want to implement a "
            "system with a different stack; I can adapt. (I also have some experience with Laravel, "
            "Python, and Java.)"
        ),
        "is_secret": False,
    },
    {
        "title": "Dear Diary...",
        "date": "July 2026",
        "body": (
            "I miss the days when I could just code for fun without worrying about deadlines or "
            "clients. But I guess that's part of growing up, right? Still, I try to keep a little "
            "time each week to tinker with new tech and side projects. Keeps the passion alive. Also "
            "living in South Korea made me miss nasi lemak and teh tarik.... sigh...."
        ),
        "is_secret": False,
    },
    {
        "title": "🎮 You found it",
        "date": "???",
        "body": (
            "Congrats, you actually tried the Konami code on a portfolio site. That's either genuine "
            "curiosity or years of muscle memory — either way, I respect it.\n\nThere are a couple "
            "more easter eggs scattered around. Try clicking the Apple logo a few times, or poke "
            "around the Terminal."
        ),
        "is_secret": True,
    },
]


async def seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        result = await session.execute(select(Profile).limit(1))
        if result.scalar_one_or_none() is None:
            session.add(Profile(**PROFILE))

        for spec in SPECS:
            result = await session.execute(select(Spec).where(Spec.label == spec["label"]))
            if result.scalar_one_or_none() is None:
                session.add(Spec(**spec, sort_order=SPECS.index(spec)))

        for group in SKILL_GROUPS:
            result = await session.execute(select(SkillGroup).where(SkillGroup.category == group["category"]))
            if result.scalar_one_or_none() is None:
                session.add(SkillGroup(**group, sort_order=SKILL_GROUPS.index(group)))

        for text in INTERESTS:
            result = await session.execute(select(Interest).where(Interest.text == text))
            if result.scalar_one_or_none() is None:
                session.add(Interest(text=text, sort_order=INTERESTS.index(text)))

        for project in PROJECTS:
            result = await session.execute(select(Project).where(Project.id == project["id"]))
            if result.scalar_one_or_none() is None:
                session.add(Project(**project))

        for report in SCHOOL_REPORTS:
            result = await session.execute(select(SchoolReport).where(SchoolReport.title == report["title"]))
            if result.scalar_one_or_none() is None:
                session.add(SchoolReport(**report))

        for note in NOTES:
            result = await session.execute(select(Note).where(Note.title == note["title"]))
            if result.scalar_one_or_none() is None:
                session.add(Note(**note))

        result = await session.execute(select(AdminUser).where(AdminUser.email == settings.admin_email))
        if result.scalar_one_or_none() is None:
            session.add(
                AdminUser(
                    email=settings.admin_email,
                    password_hash=hash_password(settings.admin_password),
                )
            )

        await session.commit()

    print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
