"""Data models for Agent API Gateway responses."""

from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class UsageInfo(BaseModel):
    queries_used: int
    queries_limit: int
    remaining: int
    tier: str
    requests_by_schema: dict[str, int]


class ProductData(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    in_stock: Optional[bool] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    description: Optional[str] = None
    image: Optional[str] = None
    specs: dict[str, str] = {}
    availability: Optional[str] = None


class ArticleData(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    date: Optional[str] = None
    reading_time: Optional[int] = None
    excerpt: Optional[str] = None
    content_summary: Optional[str] = None
    topics: list[str] = []


class CompanyData(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    founded: Optional[str] = None
    size: Optional[str] = None
    funding_total: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    competitors: list[str] = []


class ExtractResponse(BaseModel):
    success: bool
    data: dict
    usage: UsageInfo
    cached: bool
    latency_ms: int


class SchemaField(BaseModel):
    name: str
    type: str
    description: str


class SchemaInfo(BaseModel):
    name: str
    description: str
    fields: list[SchemaField]


class ApiError(Exception):
    def __init__(self, message: str, status: int, code: Optional[str] = None):
        super().__init__(message)
        self.status = status
        self.code = code


class AuthError(ApiError):
    def __init__(self, message: str = "Invalid or missing API key"):
        super().__init__(message, 401, "invalid_api_key")


class RateLimitError(ApiError):
    def __init__(self, message: str = "Rate limit exceeded", retry_after: int = 60):
        super().__init__(message, 429, "rate_limit_exceeded")
        self.retry_after = retry_after
