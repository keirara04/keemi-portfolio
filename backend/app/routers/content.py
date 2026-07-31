from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Interest, Note, Profile, Project, SchoolReport, SkillGroup, Spec
from app.schemas import (
    InterestOut,
    NoteOut,
    ProfileOut,
    ProjectOut,
    SchoolReportOut,
    SkillGroupOut,
    SpecOut,
)

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/profile", response_model=ProfileOut | None)
async def get_profile(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Profile).limit(1))
    return result.scalar_one_or_none()


@router.get("/specs", response_model=list[SpecOut])
async def get_specs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Spec).order_by(Spec.sort_order))
    return result.scalars().all()


@router.get("/skill-groups", response_model=list[SkillGroupOut])
async def get_skill_groups(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SkillGroup).order_by(SkillGroup.sort_order))
    return result.scalars().all()


@router.get("/interests", response_model=list[InterestOut])
async def get_interests(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Interest).order_by(Interest.sort_order))
    return result.scalars().all()


@router.get("/projects", response_model=list[ProjectOut])
async def get_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).order_by(Project.sort_order))
    return result.scalars().all()


@router.get("/school-reports", response_model=list[SchoolReportOut])
async def get_school_reports(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SchoolReport))
    return result.scalars().all()


@router.get("/notes", response_model=list[NoteOut])
async def get_notes(db: AsyncSession = Depends(get_db)):
    # Secret (easter-egg) notes are withheld from the public listing;
    # they're only ever surfaced through the Konami-code trigger client-side.
    result = await db.execute(select(Note).where(Note.is_secret.is_(False)))
    return result.scalars().all()
