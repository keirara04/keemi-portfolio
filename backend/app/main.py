from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import admin, admin_cms, analytics, content, contact, uploads

app = FastAPI(title="keemi-portfolio backend")

# Same-origin in production (the reverse proxy routes /api/* to this
# service), so this only matters for local dev where Next runs on a
# different port.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(content.router)
app.include_router(contact.router)
app.include_router(analytics.router)
app.include_router(admin.router)
app.include_router(admin_cms.router)
app.include_router(uploads.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
