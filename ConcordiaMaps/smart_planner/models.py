from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class LocationType(str, Enum):
    CAMPUS_INDOOR = "campus_indoor"
    CAMPUS_OUTDOOR = "campus_outdoor"
    OFF_CAMPUS = "off_campus"
    UNKNOWN = "unknown"

class TaskCategory(str, Enum):
    CLASS = "class"
    MEETING = "meeting"
    STUDY = "study"
    MEAL = "meal"
    ADMIN = "admin"
    SOCIAL = "social"
    OTHER = "other"

class TaskPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Location(BaseModel):
    type: LocationType
    name: str
    building_id: Optional[str] = None
    room_id: Optional[str] = None
    description: Optional[str] = None
    has_indoor_navigation: bool = False
    google_maps_query: Optional[str] = None

class Task(BaseModel):
    id: str
    title: str
    description: str
    category: TaskCategory = TaskCategory.OTHER
    priority: TaskPriority = TaskPriority.MEDIUM
    location: Location
    location_type: LocationType
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    fixed_time: Optional[datetime] = None  # Legacy field for backward compatibility
    estimated_duration: int = Field(..., description="Estimated duration in minutes")
    estimated_walking_time: Optional[int] = Field(None, description="Walking time in minutes")
    weather_sensitive: bool = False
    needs_resolution: bool = False
    needs_review: bool = False
    google_maps_query: Optional[str] = None
    review_reason: Optional[str] = None

# API Request/Response Models
class TaskParseRequest(BaseModel):
    tasks: List[str]

class TaskParseResponse(BaseModel):
    parsed_tasks: List[Dict[str, Any]]

class OptimizePlanRequest(BaseModel):
    tasks: List[Task]
    current_location: Optional[Location] = None
    weather_conditions: Optional[Dict[str, Any]] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class PlanStep(BaseModel):
    task_id: str
    start_time: datetime
    end_time: datetime
    location: Location
    walking_directions: Optional[Dict[str, Any]] = None

class OptimizedPlan(BaseModel):
    steps: List[PlanStep]
    total_duration: int
    total_walking_time: int
    weather_exposure_time: int

class OptimizePlanResponse(BaseModel):
    plan: OptimizedPlan