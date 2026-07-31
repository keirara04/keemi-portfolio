"""Generic CRUD routes for the CMS entities, mounted under /admin/<entity>.

Every CMS table (profile, specs, skill_groups, interests, projects,
school_reports, notes) needs the same create/list/update/delete shape, so
this is one parametrized router builder instead of seven near-identical
copies.
"""

import re
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_admin
from app.db import get_db
from app.models import Interest, Note, Profile, Project, SchoolReport, SkillGroup, Spec
from app.schemas import (
    InterestIn,
    NoteIn,
    ProfileIn,
    ProjectIn,
    SchoolReportIn,
    SkillGroupIn,
    SpecIn,
)

router = APIRouter(prefix="/admin", tags=["admin-cms"])


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "item"


def _register_crud(
    *,
    path: str,
    model: type,
    create_schema: type[BaseModel],
    id_source_field: str | None = None,
) -> None:
    tag = model.__tablename__

    @router.get(f"/{path}", name=f"list_{tag}")
    async def list_items(
        db: AsyncSession = Depends(get_db),
        _admin: str = Depends(get_current_admin),
    ) -> list[dict[str, Any]]:
        result = await db.execute(select(model))
        return [_row_to_dict(row) for row in result.scalars().all()]

    @router.post(f"/{path}", status_code=status.HTTP_201_CREATED, name=f"create_{tag}")
    async def create_item(
        payload: create_schema,  # type: ignore[valid-type]
        db: AsyncSession = Depends(get_db),
        _admin: str = Depends(get_current_admin),
    ) -> dict[str, Any]:
        data = payload.model_dump()

        if id_source_field is not None and not data.get("id"):
            base_slug = _slugify(str(data[id_source_field]))
            slug = base_slug
            suffix = 2
            while await db.get(model, slug) is not None:
                slug = f"{base_slug}-{suffix}"
                suffix += 1
            data["id"] = slug

        row = model(**data)
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return _row_to_dict(row)

    @router.put(f"/{path}/{{item_id}}", name=f"update_{tag}")
    async def update_item(
        item_id: str,
        payload: create_schema,  # type: ignore[valid-type]
        db: AsyncSession = Depends(get_db),
        _admin: str = Depends(get_current_admin),
    ) -> dict[str, Any]:
        row = await db.get(model, item_id)
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{tag} not found")
        for field, value in payload.model_dump().items():
            setattr(row, field, value)
        await db.commit()
        await db.refresh(row)
        return _row_to_dict(row)

    @router.delete(f"/{path}/{{item_id}}", status_code=status.HTTP_204_NO_CONTENT, name=f"delete_{tag}")
    async def delete_item(
        item_id: str,
        db: AsyncSession = Depends(get_db),
        _admin: str = Depends(get_current_admin),
    ) -> None:
        row = await db.get(model, item_id)
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{tag} not found")
        await db.delete(row)
        await db.commit()


def _row_to_dict(row: object) -> dict[str, Any]:
    return {c.name: getattr(row, c.name) for c in row.__table__.columns}  # type: ignore[attr-defined]


_register_crud(path="profile", model=Profile, create_schema=ProfileIn)
_register_crud(path="specs", model=Spec, create_schema=SpecIn)
_register_crud(path="skill-groups", model=SkillGroup, create_schema=SkillGroupIn)
_register_crud(path="interests", model=Interest, create_schema=InterestIn)
_register_crud(path="projects", model=Project, create_schema=ProjectIn, id_source_field="name")
_register_crud(path="school-reports", model=SchoolReport, create_schema=SchoolReportIn)
_register_crud(path="notes", model=Note, create_schema=NoteIn)
