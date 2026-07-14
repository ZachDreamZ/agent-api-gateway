"""HTTP client for Agent API Gateway."""

from __future__ import annotations
from typing import Optional
import httpx

from .models import (
    ExtractResponse,
    ProductData,
    ArticleData,
    CompanyData,
    SchemaInfo,
    UsageInfo,
    AuthError,
    RateLimitError,
    ApiError,
)


class AgentApi:
    """Client for the Agent API Gateway."""

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.agent-api-gateway.dev/v1",
    ):
        if not api_key:
            raise ValueError("API key is required")
        self.base_url = base_url.rstrip("/")
        self._client = httpx.Client(
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            timeout=30.0,
        )

    def _request(self, method: str, endpoint: str, body: Optional[dict] = None):
        url = f"{self.base_url}{endpoint}"
        response = self._client.request(method, url, json=body)
        if response.status_code == 401:
            raise AuthError()
        if response.status_code == 429:
            retry_after = int(response.headers.get("Retry-After", 60))
            raise RateLimitError(retry_after=retry_after)
        if response.is_error:
            raise ApiError(response.text, response.status_code)
        return response.json()

    def extract(
        self,
        url: str,
        schema: str,
        wait_for: Optional[str] = None,
        country: Optional[str] = None,
    ) -> ExtractResponse:
        """Extract structured data from a URL."""
        body: dict = {"url": url, "schema": schema}
        options: dict = {}
        if wait_for:
            options["wait_for"] = wait_for
        if country:
            options["country"] = country
        if options:
            body["options"] = options
        data = self._request("POST", "/extract", body)
        data["usage"] = UsageInfo(**data["usage"])
        return ExtractResponse(**data)

    def extract_product(
        self,
        url: str,
        wait_for: Optional[str] = None,
        country: Optional[str] = None,
    ) -> ProductData:
        """Extract product data from a URL."""
        result = self.extract(url, "product", wait_for, country)
        return ProductData(**result.data)

    def extract_article(
        self,
        url: str,
        wait_for: Optional[str] = None,
    ) -> ArticleData:
        """Extract article data from a URL."""
        result = self.extract(url, "article", wait_for)
        return ArticleData(**result.data)

    def extract_company(
        self,
        url: str,
        wait_for: Optional[str] = None,
    ) -> CompanyData:
        """Extract company data from a URL."""
        result = self.extract(url, "company", wait_for)
        return CompanyData(**result.data)

    def list_schemas(self) -> list[SchemaInfo]:
        """List all available extraction schemas."""
        data = self._request("GET", "/schemas")
        return [SchemaInfo(**s) for s in data]

    def get_usage(self) -> UsageInfo:
        """Get current API usage stats."""
        data = self._request("GET", "/usage")
        return UsageInfo(**data)
