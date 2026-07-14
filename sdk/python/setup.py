from setuptools import setup, find_packages

setup(
    name="agent-api-gateway",
    version="0.1.0",
    description="Python SDK for Agent API Gateway — structured web data for AI agents",
    packages=find_packages(),
    install_requires=[
        "httpx>=0.27.0",
        "pydantic>=2.0.0",
    ],
    python_requires=">=3.10",
    keywords=["agent", "ai", "extraction", "web-scraping", "structured-data"],
)
