import asyncio
import json
from collections.abc import AsyncGenerator, Generator, Mapping
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlencode

import pytest
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import SessionLocal, engine, get_db
from app.main import app
from app.seed.load import seed_reference_data


@dataclass
class ASGIResponse:
    status_code: int
    body: bytes
    headers: list[tuple[bytes, bytes]]

    def json(self) -> Any:
        return json.loads(self.body.decode("utf-8"))

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            raise AssertionError(f"Unexpected status {self.status_code}: {self.body.decode('utf-8')}")


class ASGITestClient:
    def get(self, path: str, params: Mapping[str, object] | None = None) -> ASGIResponse:
        return self.request("GET", path, params=params)

    def post(
        self,
        path: str,
        json_body: Mapping[str, object] | None = None,
        *,
        json: Mapping[str, object] | None = None,
    ) -> ASGIResponse:
        return self.request("POST", path, json_body=json_body if json_body is not None else json)

    def request(
        self,
        method: str,
        path: str,
        *,
        params: Mapping[str, object] | None = None,
        json_body: Mapping[str, object] | None = None,
    ) -> ASGIResponse:
        return asyncio.run(self._request(method, path, params=params, json_body=json_body))

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: Mapping[str, object] | None,
        json_body: Mapping[str, object] | None,
    ) -> ASGIResponse:
        body = b"" if json_body is None else json.dumps(json_body).encode("utf-8")
        headers = [(b"content-type", b"application/json")] if json_body is not None else []
        messages: list[dict[str, Any]] = []
        request_sent = False

        scope = {
            "type": "http",
            "asgi": {"version": "3.0"},
            "method": method,
            "path": path,
            "raw_path": path.encode("ascii"),
            "query_string": urlencode(params or {}).encode("ascii"),
            "headers": headers,
            "client": ("testclient", 50000),
            "server": ("testserver", 80),
            "scheme": "http",
            "root_path": "",
        }

        async def receive() -> dict[str, Any]:
            nonlocal request_sent
            if not request_sent:
                request_sent = True
                return {"type": "http.request", "body": body, "more_body": False}
            return {"type": "http.disconnect"}

        async def send(message: dict[str, Any]) -> None:
            messages.append(message)

        await app(scope, receive, send)

        start = next(message for message in messages if message["type"] == "http.response.start")
        body_chunks = [
            message.get("body", b"") for message in messages if message["type"] == "http.response.body"
        ]
        return ASGIResponse(
            status_code=start["status"],
            body=b"".join(body_chunks),
            headers=start.get("headers", []),
        )


@pytest.fixture()
def db() -> Generator[Session, None, None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_reference_data(db)
        yield db


@pytest.fixture()
def seeded_database() -> Generator[None, None, None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_reference_data(db)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(seeded_database: None) -> Generator[ASGITestClient, None, None]:
    async def override_get_db() -> AsyncGenerator[Session, None]:
        with SessionLocal() as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    yield ASGITestClient()
    app.dependency_overrides.clear()
