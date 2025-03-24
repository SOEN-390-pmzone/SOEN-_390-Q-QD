# This file makes the directory a Python package
# Import the router directly, without smart_planner prefix
from api import router

__all__ = ['router']