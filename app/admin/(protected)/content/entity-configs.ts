export type FieldType = "text" | "textarea" | "number" | "boolean" | "stringList" | "imageList";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  readOnlyOnEdit?: boolean;
  hiddenOnCreate?: boolean;
};

export type ListColumn = { name: string; label: string };

export type EntityConfig = {
  key: string;
  label: string;
  apiPath: string;
  fields: FieldConfig[];
  titleField: string;
  listColumns?: ListColumn[];
};

export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
  specs: {
    key: "specs",
    label: "Specs",
    apiPath: "/admin/specs",
    titleField: "label",
    listColumns: [
      { name: "label", label: "Label" },
      { name: "value", label: "Value" },
    ],
    fields: [
      { name: "label", label: "Label", type: "text" },
      { name: "value", label: "Value", type: "text" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  "skill-groups": {
    key: "skill-groups",
    label: "Skill groups",
    apiPath: "/admin/skill-groups",
    titleField: "category",
    listColumns: [
      { name: "category", label: "Category" },
      { name: "items", label: "Items" },
    ],
    fields: [
      { name: "category", label: "Category", type: "text" },
      { name: "items", label: "Items (comma-separated)", type: "stringList" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  interests: {
    key: "interests",
    label: "Interests",
    apiPath: "/admin/interests",
    titleField: "text",
    listColumns: [{ name: "text", label: "Text" }],
    fields: [
      { name: "text", label: "Text", type: "text" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  projects: {
    key: "projects",
    label: "Projects",
    apiPath: "/admin/projects",
    titleField: "name",
    listColumns: [
      { name: "name", label: "Name" },
      { name: "tagline", label: "Tagline" },
      { name: "stack", label: "Stack" },
    ],
    fields: [
      { name: "id", label: "ID (slug)", type: "text", readOnlyOnEdit: true, hiddenOnCreate: true },
      { name: "name", label: "Name", type: "text" },
      { name: "tagline", label: "Tagline", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "highlights", label: "Highlights (comma-separated)", type: "stringList" },
      { name: "stack", label: "Stack (comma-separated)", type: "stringList" },
      { name: "live_url", label: "Live URL", type: "text" },
      { name: "repo_url", label: "Repo URL", type: "text" },
      { name: "placeholder", label: "Placeholder", type: "boolean" },
      { name: "internal", label: "Internal", type: "boolean" },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "screenshots", label: "Screenshots", type: "imageList" },
    ],
  },
  "school-reports": {
    key: "school-reports",
    label: "School reports",
    apiPath: "/admin/school-reports",
    titleField: "title",
    listColumns: [
      { name: "title", label: "Title" },
      { name: "course", label: "Course" },
      { name: "date", label: "Date" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "course", label: "Course", type: "text" },
      { name: "date", label: "Date", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "file_url", label: "File URL", type: "text" },
    ],
  },
  notes: {
    key: "notes",
    label: "Notes",
    apiPath: "/admin/notes",
    titleField: "title",
    listColumns: [
      { name: "title", label: "Title" },
      { name: "date", label: "Date" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "date", label: "Date", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
      { name: "is_secret", label: "Secret (Konami egg)", type: "boolean" },
    ],
  },
};

export const ENTITY_ORDER = ["specs", "skill-groups", "interests", "projects", "school-reports", "notes"];
