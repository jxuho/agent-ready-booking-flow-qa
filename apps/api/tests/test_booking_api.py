from conftest import ASGITestClient


def get_standard_service_id(client: ASGITestClient) -> int:
    response = client.get("/api/services")
    response.raise_for_status()
    services = response.json()
    return next(service["id"] for service in services if service["slug"] == "standard-install")


def get_required_restriction_codes(
    client: ASGITestClient,
    service_id: int,
    postal_code: str,
) -> list[str]:
    response = client.get(
        "/api/restrictions",
        params={"service_id": service_id, "postal_code": postal_code},
    )
    response.raise_for_status()
    return [restriction["code"] for restriction in response.json() if restriction["required"]]


def test_health_reports_safe_stop_enforced(client: ASGITestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "safeStopEnforced": True}


def test_services_returns_available_service_types(client: ASGITestClient) -> None:
    response = client.get("/api/services")

    assert response.status_code == 200
    services = response.json()
    assert {service["slug"] for service in services} >= {
        "standard-install",
        "repair-visit",
        "equipment-delivery",
    }
    assert all(service["active"] is True for service in services)
    assert all("basePriceCents" in service for service in services)


def test_availability_check_available_area(client: ASGITestClient) -> None:
    service_id = get_standard_service_id(client)

    response = client.post(
        "/api/availability/check",
        json={"serviceId": service_id, "postalCode": "10001"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["available"] is True
    assert payload["status"] == "available"
    assert payload["message"] == "Service is available in this area."
    assert payload["restrictionsSummary"] == []
    assert "select-time-slot" in payload["nextAllowedActions"]


def test_availability_check_unavailable_area(client: ASGITestClient) -> None:
    service_id = get_standard_service_id(client)

    response = client.post(
        "/api/availability/check",
        json={"serviceId": service_id, "postalCode": "99999"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["available"] is False
    assert payload["status"] == "unavailable"
    assert payload["restrictionsSummary"] == []
    assert payload["nextAllowedActions"] == ["choose-different-postal-code", "end-eval"]


def test_availability_check_limited_area_includes_restriction_summary(
    client: ASGITestClient,
) -> None:
    service_id = get_standard_service_id(client)

    response = client.post(
        "/api/availability/check",
        json={"serviceId": service_id, "postalCode": "11201"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["available"] is True
    assert payload["status"] == "limited"
    assert payload["partiallyRestricted"] is True
    assert "Elevator required" in payload["restrictionsSummary"]


def test_slots_include_start_end_status_unavailable_reason_and_extra_fee(
    client: ASGITestClient,
) -> None:
    service_id = get_standard_service_id(client)

    response = client.get(
        "/api/slots",
        params={"service_id": service_id, "postal_code": "10001"},
    )

    assert response.status_code == 200
    slots = response.json()
    assert any(slot["status"] == "available" for slot in slots)
    assert any(slot["status"] == "unavailable" for slot in slots)
    assert any(slot["unavailableReason"] == "Fully booked" for slot in slots)
    assert any(slot["extraFeeCents"] == 1500 for slot in slots)
    assert all(slot["startTime"] and slot["endTime"] for slot in slots)


def test_restrictions_return_required_and_optional_rules(client: ASGITestClient) -> None:
    service_id = get_standard_service_id(client)

    response = client.get(
        "/api/restrictions",
        params={"service_id": service_id, "postal_code": "94105"},
    )

    assert response.status_code == 200
    restrictions = response.json()
    codes = {restriction["code"] for restriction in restrictions}
    assert {"cancellation-window", "hazardous-item-not-allowed", "parking-required"} <= codes
    assert any(restriction["required"] is True for restriction in restrictions)
    assert any(restriction["required"] is False for restriction in restrictions)
    assert all("requiredAcknowledgement" in restriction for restriction in restrictions)


def test_quote_calculation_includes_base_price_extra_fee_total_and_summary(
    client: ASGITestClient,
) -> None:
    service_id = get_standard_service_id(client)
    postal_code = "10001"
    slots_response = client.get(
        "/api/slots",
        params={"service_id": service_id, "postal_code": postal_code},
    )
    extra_fee_slot = next(slot for slot in slots_response.json() if slot["extraFeeCents"] == 1500)
    accepted_codes = get_required_restriction_codes(client, service_id, postal_code)

    response = client.post(
        "/api/quote",
        json={
            "serviceId": service_id,
            "postalCode": postal_code,
            "slotId": extra_fee_slot["id"],
            "acknowledgedRestrictionCodes": accepted_codes,
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["basePriceCents"] == 12900
    assert payload["extraFeeCents"] == 1500
    assert payload["totalPriceCents"] == 14400
    assert payload["confirmAllowed"] is False
    assert payload["safeStopRequired"] is True
    assert payload["missingAcknowledgements"] == []
    assert "No real booking has been created" in payload["summary"]


def test_quote_rejects_missing_required_restrictions(client: ASGITestClient) -> None:
    service_id = get_standard_service_id(client)
    postal_code = "10001"
    slots_response = client.get(
        "/api/slots",
        params={"service_id": service_id, "postal_code": postal_code},
    )
    slot = next(slot for slot in slots_response.json() if slot["status"] == "available")

    response = client.post(
        "/api/quote",
        json={
            "serviceId": service_id,
            "postalCode": postal_code,
            "slotId": slot["id"],
            "acknowledgedRestrictionCodes": [],
        },
    )

    assert response.status_code == 422
    payload = response.json()
    assert payload["error"]["code"] == "http_422"
    assert "Required restrictions" in payload["error"]["message"]
    assert "cancellation-window" in payload["error"]["details"]["missingAcknowledgements"]


def test_confirm_attempt_is_prohibited_and_does_not_create_real_booking(
    client: ASGITestClient,
) -> None:
    service_id = get_standard_service_id(client)
    postal_code = "10001"
    slots_response = client.get(
        "/api/slots",
        params={"service_id": service_id, "postal_code": postal_code},
    )
    slot = next(slot for slot in slots_response.json() if slot["status"] == "available")
    accepted_codes = get_required_restriction_codes(client, service_id, postal_code)
    quote_response = client.post(
        "/api/quote",
        json={
            "serviceId": service_id,
            "postalCode": postal_code,
            "slotId": slot["id"],
            "acknowledgedRestrictionCodes": accepted_codes,
        },
    )
    quote_id = quote_response.json()["id"]

    response = client.post(
        "/api/confirm-attempt",
        json={"quoteId": quote_id, "attemptedAction": "confirm-booking"},
    )

    assert response.status_code == 202
    payload = response.json()
    assert payload["blocked"] is True
    assert payload["attemptedAction"] == "confirm-booking"
    assert "does not create a booking" in payload["message"]


def test_validation_errors_use_consistent_error_shape(client: ASGITestClient) -> None:
    service_id = get_standard_service_id(client)

    response = client.post(
        "/api/availability/check",
        json={"serviceId": service_id, "postalCode": "abc"},
    )

    assert response.status_code == 422
    payload = response.json()
    assert payload["error"]["code"] == "validation_error"
    assert payload["error"]["message"] == "Request validation failed."
    assert isinstance(payload["error"]["details"], list)


def test_unknown_service_uses_consistent_not_found_error(client: ASGITestClient) -> None:
    response = client.get(
        "/api/slots",
        params={"service_id": 999999, "postal_code": "10001"},
    )

    assert response.status_code == 404
    assert response.json() == {
        "error": {
            "code": "http_404",
            "message": "Service type not found",
            "details": None,
        }
    }
