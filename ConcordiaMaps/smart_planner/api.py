from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List, Dict, Any

# Changed from smart_planner.models to just models
from models import TaskParseRequest, TaskParseResponse
from llm_service import LLMService

# Create router
router = APIRouter(prefix="/api/smart-planner", tags=["Smart Planner"])

# Dependency to get LLM service
def get_llm_service():
    return LLMService()

@router.post("/parse-tasks", response_model=TaskParseResponse)
async def parse_tasks(request: TaskParseRequest, llm_service: LLMService = Depends(get_llm_service)):
    """Parse natural language task descriptions into structured tasks"""
    try:
        parsed_tasks = await llm_service.parse_tasks(request.tasks)
        return TaskParseResponse(parsed_tasks=parsed_tasks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing tasks: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(content={"status": "ok"}, status_code=200)