from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    short_name: str
    title: str
    school: str
    bio: str
    freelance_note: str
    email: str
    whatsapp: str
    github_url: str
    linkedin_url: str


class SpecOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    label: str
    value: str


class SkillGroupOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    category: str
    items: list[str]


class InterestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    text: str


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    tagline: str
    description: str
    highlights: list[str]
    stack: list[str]
    live_url: str | None
    repo_url: str | None
    placeholder: bool
    internal: bool
    screenshots: list[dict]


class SchoolReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    course: str
    date: str
    description: str
    file_url: str | None


class NoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    date: str
    body: str
    is_secret: bool


class ProfileIn(BaseModel):
    name: str
    short_name: str
    title: str
    school: str
    bio: str
    freelance_note: str
    email: str
    whatsapp: str
    github_url: str
    linkedin_url: str


class SpecIn(BaseModel):
    label: str
    value: str
    sort_order: int = 0


class SkillGroupIn(BaseModel):
    category: str
    items: list[str]
    sort_order: int = 0


class InterestIn(BaseModel):
    text: str
    sort_order: int = 0


class ProjectIn(BaseModel):
    id: str
    name: str
    tagline: str
    description: str
    highlights: list[str] = Field(default_factory=list)
    stack: list[str] = Field(default_factory=list)
    live_url: str | None = None
    repo_url: str | None = None
    placeholder: bool = False
    internal: bool = False
    sort_order: int = 0
    screenshots: list[dict] = Field(default_factory=list)


class SchoolReportIn(BaseModel):
    title: str
    course: str
    date: str
    description: str
    file_url: str | None = None


class NoteIn(BaseModel):
    title: str
    date: str
    body: str
    is_secret: bool = False


class ContactSubmissionIn(BaseModel):
    from_name: str = Field(min_length=1, max_length=200)
    subject: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=5000)


class AnalyticsEventIn(BaseModel):
    event_type: str = Field(min_length=1, max_length=100)
    payload: dict = Field(default_factory=dict)
    session_id: str = Field(min_length=1, max_length=100)
    path: str = Field(min_length=1, max_length=500)


class AdminLoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)
