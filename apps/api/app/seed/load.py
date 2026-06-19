from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.booking import Restriction, ServiceArea, ServiceType, TimeSlot
from app.seed.data import AREA_STATUS_BY_POSTAL_CODE, GLOBAL_RESTRICTIONS, POSTAL_RESTRICTIONS, SERVICES, SLOT_TEMPLATES


def seed_reference_data(db: Session) -> None:
    existing = db.scalar(select(ServiceType).limit(1))
    if existing:
        return

    services: list[ServiceType] = []
    for service_data in SERVICES:
        service = ServiceType(**service_data, active=True)
        db.add(service)
        services.append(service)
    db.flush()

    for service in services:
        for postal_code, (city, area_status, message) in AREA_STATUS_BY_POSTAL_CODE.items():
            db.add(
                ServiceArea(
                    service_type_id=service.id,
                    postal_code=postal_code,
                    city=city,
                    status=area_status,
                    message=message,
                )
            )

            if area_status == "unavailable":
                continue

            for slot_template in SLOT_TEMPLATES:
                db.add(
                    TimeSlot(
                        id=f"{service.slug}-{postal_code}-{slot_template['suffix']}",
                        service_type_id=service.id,
                        postal_code=postal_code,
                        label=slot_template["label"],
                        mode=slot_template["mode"],
                        window=slot_template["window"],
                        available=slot_template["available"],
                        fully_booked=slot_template["fully_booked"],
                        extra_fee_cents=slot_template["extra_fee_cents"],
                        unavailable_reason=slot_template["unavailable_reason"],
                    )
                )

        for restriction_data in GLOBAL_RESTRICTIONS:
            db.add(Restriction(service_type_id=service.id, postal_code=None, **restriction_data))

        for postal_code, restrictions in POSTAL_RESTRICTIONS.items():
            for restriction_data in restrictions:
                db.add(Restriction(service_type_id=service.id, postal_code=postal_code, **restriction_data))

    db.commit()
