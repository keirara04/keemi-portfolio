"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  profile as staticProfile,
  specs as staticSpecs,
  skillGroups as staticSkillGroups,
  interests as staticInterests,
  projects as staticProjects,
  schoolReports as staticSchoolReports,
  notes as staticNotes,
  type Project,
  type SchoolReport,
  type Note,
} from "./content";
import { API_BASE_URL } from "./api-base-url";

type Profile = typeof staticProfile;

type ContentState = {
  profile: Profile;
  specs: typeof staticSpecs;
  skillGroups: typeof staticSkillGroups;
  interests: string[];
  projects: Project[];
  schoolReports: SchoolReport[];
  notes: Note[];
};

const STATIC_CONTENT: ContentState = {
  profile: staticProfile,
  specs: staticSpecs,
  skillGroups: staticSkillGroups,
  interests: staticInterests,
  projects: staticProjects,
  schoolReports: staticSchoolReports,
  notes: staticNotes,
};

const ContentContext = createContext<ContentState>(STATIC_CONTENT);

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`${path} responded with ${response.status}`);
  }
  return response.json();
}

type BackendProfile = {
  name: string;
  short_name: string;
  title: string;
  school: string;
  bio: string;
  freelance_note: string;
  email: string;
  whatsapp: string;
  github_url: string;
  linkedin_url: string;
};

function mapProfile(p: BackendProfile): Profile {
  return {
    name: p.name,
    shortName: p.short_name,
    title: p.title,
    school: p.school,
    bio: p.bio,
    freelanceNote: p.freelance_note,
    email: p.email,
    whatsapp: p.whatsapp,
    links: { github: p.github_url, linkedin: p.linkedin_url },
  };
}

type BackendProject = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  stack: string[];
  live_url: string | null;
  repo_url: string | null;
  placeholder: boolean;
  internal: boolean;
  screenshots: { src: string; alt: string }[];
};

function mapProject(p: BackendProject): Project {
  return {
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    highlights: p.highlights,
    stack: p.stack,
    liveUrl: p.live_url ?? undefined,
    repoUrl: p.repo_url ?? undefined,
    screenshots: p.screenshots,
    placeholder: p.placeholder,
    internal: p.internal,
  };
}

type BackendSchoolReport = {
  id: string;
  title: string;
  course: string;
  date: string;
  description: string;
  file_url: string | null;
};

function mapSchoolReport(r: BackendSchoolReport): SchoolReport {
  return {
    id: r.id,
    title: r.title,
    course: r.course,
    date: r.date,
    description: r.description,
    fileUrl: r.file_url ?? undefined,
  };
}

type BackendNote = { id: string; title: string; date: string; body: string };

function mapNote(n: BackendNote): Note {
  return { id: n.id, title: n.title, date: n.date, body: n.body };
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContentState>(STATIC_CONTENT);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [profileR, specsR, skillGroupsR, interestsR, projectsR, schoolReportsR, notesR] =
        await Promise.allSettled([
          fetchJson<BackendProfile | null>("/content/profile"),
          fetchJson<{ label: string; value: string }[]>("/content/specs"),
          fetchJson<{ category: string; items: string[] }[]>("/content/skill-groups"),
          fetchJson<{ text: string }[]>("/content/interests"),
          fetchJson<BackendProject[]>("/content/projects"),
          fetchJson<BackendSchoolReport[]>("/content/school-reports"),
          fetchJson<BackendNote[]>("/content/notes"),
        ]);

      if (cancelled) return;

      // Each entity falls back independently to its static default — a
      // failure or empty table for one shouldn't blank out the rest.
      setState((prev) => ({
        profile:
          profileR.status === "fulfilled" && profileR.value ? mapProfile(profileR.value) : prev.profile,
        specs: isFulfilledNonEmpty(specsR) ? specsR.value : prev.specs,
        skillGroups: isFulfilledNonEmpty(skillGroupsR) ? skillGroupsR.value : prev.skillGroups,
        interests: isFulfilledNonEmpty(interestsR)
          ? interestsR.value.map((i) => i.text)
          : prev.interests,
        projects: isFulfilledNonEmpty(projectsR) ? projectsR.value.map(mapProject) : prev.projects,
        schoolReports: isFulfilledNonEmpty(schoolReportsR)
          ? schoolReportsR.value.map(mapSchoolReport)
          : prev.schoolReports,
        notes: isFulfilledNonEmpty(notesR) ? notesR.value.map(mapNote) : prev.notes,
      }));
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>;
}

function isFulfilledNonEmpty<T>(
  result: PromiseSettledResult<T[]>
): result is PromiseFulfilledResult<T[]> {
  return result.status === "fulfilled" && result.value.length > 0;
}

export function useContent(): ContentState {
  return useContext(ContentContext);
}
