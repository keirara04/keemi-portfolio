import Image from "next/image";

export function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

export function FinderFaceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <defs>
        <linearGradient id="finder-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="finder-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#finder-left)" />
      <path d="M50 0 H78 Q100 0 100 22 V78 Q100 100 78 100 H50 Z" fill="url(#finder-right)" />
      <rect x="29" y="30" width="7" height="18" rx="3.5" fill="#1d4ed8" />
      <rect x="64" y="30" width="7" height="18" rx="3.5" fill="#ffffff" />
      <path
        d="M24 60 Q50 80 76 60"
        stroke="#1e40af"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function MailAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <defs>
        <linearGradient id="mail-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#mail-bg)" />
      <rect x="18" y="30" width="64" height="44" rx="7" fill="#ffffff" />
      <path
        d="M21 35 L50 58 L79 35"
        stroke="#bfdbfe"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function TerminalAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <defs>
        <linearGradient id="term-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#334155" />
          <stop offset="0.12" stopColor="#0f172a" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#term-bg)" />
      <path
        d="M24 32 L44 50 L24 68"
        stroke="#ffffff"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="50" y="62" width="26" height="8" rx="4" fill="#ffffff" />
    </svg>
  );
}

export function FolderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 80" aria-hidden className={className}>
      <defs>
        <linearGradient id="folder-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <path
        d="M8 18 Q8 12 14 12 H36 L44 20 H86 Q92 20 92 26 V64 Q92 70 86 70 H14 Q8 70 8 64 Z"
        fill="url(#folder-bg)"
      />
      <path d="M8 30 H92 V64 Q92 70 86 70 H14 Q8 70 8 64 Z" fill="#0ea5e9" opacity="0.25" />
    </svg>
  );
}

export function NotesAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <defs>
        <linearGradient id="notes-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="#ffffff" />
      <path d="M0 22 Q0 0 22 0 H78 Q100 0 100 22 V30 H0 Z" fill="url(#notes-top)" />
      <g stroke="#d4d4d8" strokeWidth="4" strokeLinecap="round">
        <line x1="18" y1="46" x2="82" y2="46" />
        <line x1="18" y1="60" x2="82" y2="60" />
        <line x1="18" y1="74" x2="60" y2="74" />
      </g>
    </svg>
  );
}

export function HomeworkAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <defs>
        <linearGradient id="homework-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#homework-bg)" />
      <path
        d="M18 34 Q18 28 24 28 H40 L46 34 H82 Q88 34 88 40 V70 Q88 76 82 76 H24 Q18 76 18 70 Z"
        fill="#ffffff"
      />
      <path d="M18 42 H88 V70 Q88 76 82 76 H24 Q18 76 18 70 Z" fill="#fde68a" opacity="0.6" />
    </svg>
  );
}

export function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className={className}>
      <path d="M2 7.5 L8 2.5 L14 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 6.5 V13 H12 V6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ControlCenterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden className={className}>
      <rect x="1" y="2.5" width="14" height="4.6" rx="2.3" />
      <circle cx="5" cy="4.8" r="1.5" fill="currentColor" stroke="none" />
      <rect x="1" y="8.9" width="14" height="4.6" rx="2.3" />
      <circle cx="11" cy="11.2" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WifiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 15 11" fill="none" aria-hidden className={className}>
      <path
        d="M7.5 10.5 L5.2 7.9 a3.4 3.4 0 0 1 4.6 0 Z M3.4 6 a6.2 6.2 0 0 1 8.2 0 L10.4 7.4 a4.4 4.4 0 0 0 -5.8 0 Z M1.5 3.9 a9 9 0 0 1 12 0 L12.3 5.3 a7.2 7.2 0 0 0 -9.6 0 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BatteryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 25 12" fill="none" aria-hidden className={className}>
      <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" opacity="0.5" />
      <rect x="2" y="2" width="15" height="8" rx="1.5" fill="currentColor" />
      <path d="M23 4 v4 a2 2 0 0 0 0 -4" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function SignalBarsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 12" fill="currentColor" aria-hidden className={className}>
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
      <rect x="10" y="3" width="3" height="9" rx="1" />
      <rect x="15" y="0" width="3" height="12" rx="1" opacity="0.4" />
    </svg>
  );
}

export function ResumeAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <rect width="100" height="100" rx="22" fill="#ffffff" />
      <g stroke="#d4d4d8" strokeWidth="5" strokeLinecap="round">
        <line x1="22" y1="30" x2="78" y2="30" />
        <line x1="22" y1="46" x2="78" y2="46" />
        <line x1="22" y1="62" x2="56" y2="62" />
      </g>
      <rect x="52" y="70" width="34" height="18" rx="6" fill="#dc2626" />
      <text
        x="69"
        y="83.5"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="#ffffff"
        fontFamily="inherit"
      >
        PDF
      </text>
    </svg>
  );
}

export function MinesweeperAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <defs>
        <linearGradient id="mines-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a3e635" />
          <stop offset="1" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#mines-bg)" />
      <g fill="#ffffff" opacity="0.35">
        <rect x="14" y="14" width="24" height="24" rx="4" />
        <rect x="62" y="14" width="24" height="24" rx="4" />
        <rect x="38" y="38" width="24" height="24" rx="4" />
        <rect x="14" y="62" width="24" height="24" rx="4" />
        <rect x="62" y="62" width="24" height="24" rx="4" />
      </g>
      <circle cx="50" cy="50" r="13" fill="#18181b" />
      <g stroke="#18181b" strokeWidth="4" strokeLinecap="round">
        <line x1="50" y1="30" x2="50" y2="70" />
        <line x1="30" y1="50" x2="70" y2="50" />
        <line x1="36" y1="36" x2="64" y2="64" />
        <line x1="64" y1="36" x2="36" y2="64" />
      </g>
      <circle cx="45" cy="45" r="3.5" fill="#ffffff" />
    </svg>
  );
}

export function QuoteAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <defs>
        <linearGradient id="quote-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#quote-bg)" />
      <text
        x="50"
        y="67"
        textAnchor="middle"
        fontSize="48"
        fontWeight="700"
        fill="#ffffff"
        fontFamily="inherit"
      >
        $
      </text>
    </svg>
  );
}

export function InvoiceAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <defs>
        <linearGradient id="invoice-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fb7185" />
          <stop offset="1" stopColor="#be123c" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#invoice-bg)" />
      <path
        d="M26 16 H68 L80 28 V84 Q80 88 76 88 H26 Q22 88 22 84 V20 Q22 16 26 16 Z"
        fill="#ffffff"
      />
      <path d="M68 16 V24 Q68 28 72 28 H80 Z" fill="#fecdd3" />
      <g stroke="#e11d48" strokeWidth="4" strokeLinecap="round">
        <line x1="32" y1="42" x2="64" y2="42" />
        <line x1="32" y1="54" x2="64" y2="54" />
        <line x1="32" y1="66" x2="50" y2="66" />
      </g>
    </svg>
  );
}

export function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden className={className}>
      <path d="M8.5 1 L1.5 8 L8.5 15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MagnifierIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className={className}>
      <circle cx="6.5" cy="6.5" r="4.5" />
      <path d="M10 10 L14 14" strokeLinecap="round" />
    </svg>
  );
}

export function AboutAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <defs>
        <linearGradient id="about-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#about-bg)" />
      <circle cx="50" cy="38" r="16" fill="#ffffff" />
      <path d="M18 88a32 32 0 0 1 64 0Z" fill="#ffffff" />
    </svg>
  );
}

export function ProfileTileIcon({ className }: { className?: string }) {
  return (
    <span className={`relative block overflow-hidden ${className ?? ""}`}>
      <Image src="https://keemi-spaces-1.sgp1.cdn.digitaloceanspaces.com/images/portfolio-profile.jpg" alt="" fill sizes="80px" className="object-cover" />
    </span>
  );
}

export function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}
