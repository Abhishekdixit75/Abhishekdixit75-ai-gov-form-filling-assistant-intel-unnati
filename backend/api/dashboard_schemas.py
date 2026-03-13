from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ActivityItem(BaseModel):
    id: int
    form_type: str
    status: str
    created_at: datetime
    
    class Config:
        orm_mode = True

class ProfileItem(BaseModel):
    entity_key: str
    value: str
    source: str
    last_updated: datetime

    class Config:
        orm_mode = True

class DashboardStats(BaseModel):
    saved_fields_count: int
    active_applications_count: int
    recent_activities: List[ActivityItem]
    stored_data: List[ProfileItem]
