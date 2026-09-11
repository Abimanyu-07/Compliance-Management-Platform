from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class SuccessResponse(BaseModel):
    success: bool = True
    data: Any = None
    message: str = "Operation successful"


class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorBody


class UserRegister(BaseModel):
    email: str = Field(..., examples=["user@innovx.com"])
    password: str = Field(..., min_length=6, examples=["password123"])
    full_name: str = Field(..., examples=["Arun Kumar"])
    role: str = Field(default="OWNER")
    # Optional business details to create on signup
    company_name: Optional[str] = None
    sector: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    investment: Optional[float] = None
    employees: Optional[int] = None
    stage: Optional[str] = None


class UserLogin(BaseModel):
    email: str = Field(..., examples=["user@innovx.com"])
    password: str = Field(..., examples=["password123"])


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class BusinessBase(BaseModel):
    name: str = Field(..., examples=["Arun Manufacturing Pvt. Ltd."])
    business_type: str = Field(default="Private Limited Company")
    sector: str = Field(..., examples=["Food Manufacturing"])
    state: str = Field(..., examples=["Tamil Nadu"])
    district: str = Field(..., examples=["Coimbatore"])
    investment: float = Field(..., examples=[5000000])
    employees: int = Field(..., examples=[25])
    stage: str = Field(default="Starting Business")


class BusinessCreate(BusinessBase):
    pass


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    business_type: Optional[str] = None
    sector: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    investment: Optional[float] = None
    employees: Optional[int] = None
    stage: Optional[str] = None


class BusinessOut(BusinessBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class ApplicationCreate(BaseModel):
    business_id: int = Field(..., examples=[1])
    requirement_id: int = Field(..., examples=[3])


class ApplicationStatusPatch(BaseModel):
    status: str = Field(..., examples=["SUBMITTED"])


class GrievanceCreate(BaseModel):
    business_id: int
    application_id: Optional[int] = None
    category: str = Field(..., examples=["Application Delay"])
    description: str
    priority: str = Field(default="MEDIUM", examples=["HIGH"])


class GrievancePatch(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None


class CopilotChatIn(BaseModel):
    business_id: int = Field(..., examples=[1])
    message: str = Field(..., examples=["What should I do next?"])
