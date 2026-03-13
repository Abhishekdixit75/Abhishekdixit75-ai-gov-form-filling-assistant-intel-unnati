from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from api import models, database, auth_utils, dashboard_schemas

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

@router.get("/stats", response_model=dashboard_schemas.DashboardStats)
def get_dashboard_stats(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(database.get_db)
):
    # 1. Count Saved Profile Fields
    saved_fields_count = db.query(models.UserProfile).filter(
        models.UserProfile.user_id == current_user.id
    ).count()

    # 2. Count Active Applications (In Progress)
    active_applications_count = db.query(models.Application).filter(
        models.Application.user_id == current_user.id,
        models.Application.status == "in_progress"
    ).count()

    # 3. Recent Activities (Last 5 applications)
    recent_apps = db.query(models.Application).filter(
        models.Application.user_id == current_user.id
    ).order_by(models.Application.created_at.desc()).limit(5).all()

    recent_activities = []
    for app in recent_apps:
        recent_activities.append(dashboard_schemas.ActivityItem(
            id=app.id,
            form_type=app.form_type,
            status=app.status,
            created_at=app.created_at
        ))

    # 4. Fetch Stored Profile Data
    stored_data = []
    user_profile_entries = db.query(models.UserProfile).filter(
        models.UserProfile.user_id == current_user.id
    ).all()

    for entry in user_profile_entries:
        stored_data.append(dashboard_schemas.ProfileItem(
            entity_key=entry.entity_key,
            value=entry.value,
            source=entry.source,
            last_updated=entry.last_updated
        ))

    return {
        "saved_fields_count": saved_fields_count,
        "active_applications_count": active_applications_count,
        "recent_activities": recent_activities,
        "stored_data": stored_data
    }

class UpdateProfileRequest(dashboard_schemas.BaseModel):
    value: str

@router.put("/profile/{key}")
def update_profile_field(
    key: str,
    payload: UpdateProfileRequest,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Updates a specific profile field."""
    entry = db.query(models.UserProfile).filter(
        models.UserProfile.user_id == current_user.id,
        models.UserProfile.entity_key == key
    ).first()

    if not entry:
        # Create if not exists (upsert behavior)
        entry = models.UserProfile(
            user_id=current_user.id,
            entity_key=key,
            value=payload.value,
            source="user_edit"
        )
        db.add(entry)
    else:
        entry.value = payload.value
        entry.source = "user_edit" # Mark as manually edited
        entry.last_updated = datetime.utcnow()
    
    db.commit()
    return {"message": "Field updated", "key": key, "value": payload.value}

@router.delete("/application/{app_id}")
def delete_application(
    app_id: int,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Deletes an application history record."""
    app = db.query(models.Application).filter(
        models.Application.id == app_id,
        models.Application.user_id == current_user.id
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(app)
    db.commit()
    return {"message": "Application deleted"}

@router.delete("/profile/clear")
def clear_all_profile_data(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Deletes ALL profile data entries for the current user."""
    deleted_count = db.query(models.UserProfile).filter(
        models.UserProfile.user_id == current_user.id
    ).delete()

    db.commit()
    return {"message": f"Cleared {deleted_count} profile entries"}
