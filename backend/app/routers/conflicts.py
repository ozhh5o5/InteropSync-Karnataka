"""Conflict detection and resolution endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models import ConflictRecord, ConflictResolution

router = APIRouter()


class ResolveConflictRequest(BaseModel):
    resolution: str  # sws_wins, dept_wins, manual, merged
    resolved_value: str
    notes: str = ""


@router.get("/")
def list_conflicts(
    ubid: str | None = None,
    status: str | None = None,
    severity: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List conflicts with optional filters."""
    query = db.query(ConflictRecord)

    if ubid:
        query = query.filter(ConflictRecord.ubid == ubid)
    if status:
        query = query.filter(ConflictRecord.resolution == ConflictResolution(status))
    if severity:
        query = query.filter(ConflictRecord.severity == severity)

    total = query.count()
    conflicts = query.order_by(ConflictRecord.detected_at.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "conflicts": [
            {
                "id": c.id,
                "ubid": c.ubid,
                "field_name": c.field_name,
                "sws_value": c.sws_value,
                "dept_value": c.dept_value,
                "department_name": c.department_name,
                "severity": c.severity,
                "resolution": c.resolution,
                "resolved_value": c.resolved_value,
                "detected_at": c.detected_at.isoformat() if c.detected_at else None,
                "resolved_at": c.resolved_at.isoformat() if c.resolved_at else None,
            }
            for c in conflicts
        ],
    }


@router.put("/{conflict_id}/resolve")
def resolve_conflict(
    conflict_id: str,
    req: ResolveConflictRequest,
    db: Session = Depends(get_db),
):
    """Resolve a conflict with a chosen resolution strategy."""
    conflict = db.query(ConflictRecord).filter(ConflictRecord.id == conflict_id).first()
    if not conflict:
        raise HTTPException(status_code=404, detail="Conflict not found")

    conflict.resolution = ConflictResolution(req.resolution)
    conflict.resolved_value = req.resolved_value
    conflict.resolver_notes = req.notes
    conflict.resolved_at = datetime.now(timezone.utc)

    db.commit()

    return {
        "id": conflict.id,
        "resolution": conflict.resolution,
        "resolved_value": conflict.resolved_value,
        "resolved_at": conflict.resolved_at.isoformat(),
    }


@router.get("/stats")
def conflict_stats(db: Session = Depends(get_db)):
    """Get conflict resolution statistics."""
    from sqlalchemy import func

    total = db.query(ConflictRecord).count()
    unresolved = db.query(ConflictRecord).filter(
        ConflictRecord.resolution == ConflictResolution.UNRESOLVED
    ).count()

    by_severity = dict(
        db.query(ConflictRecord.severity, func.count(ConflictRecord.id))
        .group_by(ConflictRecord.severity)
        .all()
    )

    by_department = dict(
        db.query(ConflictRecord.department_name, func.count(ConflictRecord.id))
        .group_by(ConflictRecord.department_name)
        .all()
    )

    return {
        "total": total,
        "unresolved": unresolved,
        "resolved": total - unresolved,
        "by_severity": by_severity,
        "by_department": by_department,
    }
