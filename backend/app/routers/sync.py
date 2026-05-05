"""Sync endpoints — bidirectional propagation between SWS and departments."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import SWSApplication, DepartmentRecord, SyncEvent, SyncDirection, SyncStatus
from app.services.sync_engine import sync_sws_to_departments, sync_department_to_sws

router = APIRouter()


class SWSToDeptRequest(BaseModel):
    sws_application_id: str
    department_names: list[str] | None = None  # If None, sync to all matching


class DeptToSWSRequest(BaseModel):
    department_name: str
    dept_record_id: str | None = None  # If None, sync all pending changes


@router.post("/sws-to-dept")
async def trigger_sws_to_dept(req: SWSToDeptRequest, db: Session = Depends(get_db)):
    """Push an SWS application/change to matching department systems."""
    app = db.query(SWSApplication).filter(SWSApplication.id == req.sws_application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="SWS Application not found")

    result = sync_sws_to_departments(app, db, department_names=req.department_names)

    return {
        "ubid": app.ubid,
        "sws_reference_no": app.sws_reference_no,
        "departments_synced": result["departments_synced"],
        "conflicts_detected": result["conflicts_detected"],
        "sync_events": result["sync_event_ids"],
    }


@router.post("/dept-to-sws")
async def trigger_dept_to_sws(req: DeptToSWSRequest, db: Session = Depends(get_db)):
    """Pull changes from a department system into SWS."""
    result = sync_department_to_sws(
        db,
        department_name=req.department_name,
        dept_record_id=req.dept_record_id,
    )

    return {
        "department": req.department_name,
        "records_synced": result["records_synced"],
        "conflicts_detected": result["conflicts_detected"],
        "sync_events": result["sync_event_ids"],
    }


@router.get("/events")
def list_sync_events(
    ubid: str | None = None,
    direction: str | None = None,
    status: str | None = None,
    department: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Audit trail — list all sync events with filtering."""
    query = db.query(SyncEvent)

    if ubid:
        query = query.filter(SyncEvent.ubid == ubid)
    if direction:
        query = query.filter(SyncEvent.direction == SyncDirection(direction))
    if status:
        query = query.filter(SyncEvent.status == SyncStatus(status))
    if department:
        query = query.filter(SyncEvent.department_name == department)

    total = query.count()
    events = query.order_by(SyncEvent.initiated_at.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "events": [
            {
                "id": e.id,
                "direction": e.direction,
                "status": e.status,
                "department_name": e.department_name,
                "ubid": e.ubid,
                "event_type": e.event_type,
                "has_conflict": e.has_conflict,
                "attempt_count": e.attempt_count,
                "initiated_at": e.initiated_at.isoformat() if e.initiated_at else None,
                "completed_at": e.completed_at.isoformat() if e.completed_at else None,
                "error_message": e.error_message,
            }
            for e in events
        ],
    }
