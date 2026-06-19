SERVICES = [
    {
        "slug": "standard-install",
        "name": "Appliance installation",
        "description": "Simulated appliance setup visit for agent-ready flow testing.",
        "base_price_cents": 12900,
    },
    {
        "slug": "repair-visit",
        "name": "Internet technician visit",
        "description": "Simulated diagnostic visit with access restrictions and arrival window checks.",
        "base_price_cents": 9900,
    },
    {
        "slug": "equipment-delivery",
        "name": "Large item pickup",
        "description": "Simulated pickup flow with capacity and extra-fee slot examples.",
        "base_price_cents": 4900,
    },
]

AREA_STATUS_BY_POSTAL_CODE = {
    "10001": ("New York", "available", "Service is available in this area."),
    "11201": ("Brooklyn", "restricted", "Service is available with building-access restrictions."),
    "60601": ("Chicago", "available", "Service is available in this area."),
    "94105": ("San Francisco", "restricted", "Service is available with parking and call-ahead requirements."),
    "99999": ("Unsupported Area", "unavailable", "Service is not available in this area."),
}

SLOT_TEMPLATES = [
    {
        "suffix": "morning-delivery",
        "label": "Morning delivery, 9:00 AM to 11:00 AM",
        "mode": "delivery",
        "window": "9:00 AM to 11:00 AM",
        "available": True,
        "fully_booked": False,
        "extra_fee_cents": 0,
        "unavailable_reason": None,
    },
    {
        "suffix": "afternoon-visit",
        "label": "Afternoon in-home visit, 1:00 PM to 3:00 PM",
        "mode": "visit",
        "window": "1:00 PM to 3:00 PM",
        "available": True,
        "fully_booked": False,
        "extra_fee_cents": 1500,
        "unavailable_reason": None,
    },
    {
        "suffix": "evening-delivery",
        "label": "Evening delivery, 5:00 PM to 7:00 PM",
        "mode": "delivery",
        "window": "5:00 PM to 7:00 PM",
        "available": False,
        "fully_booked": True,
        "extra_fee_cents": 0,
        "unavailable_reason": "Fully booked",
    },
]

GLOBAL_RESTRICTIONS = [
    {
        "code": "cancellation-window",
        "label": "Cancellation window",
        "description": "Changes must be made at least 24 hours before the selected time slot.",
        "required_acknowledgement": True,
        "severity": "info",
    },
    {
        "code": "hazardous-item-not-allowed",
        "label": "Hazardous item not allowed",
        "description": "The simulated service cannot include hazardous, flammable, or restricted items.",
        "required_acknowledgement": True,
        "severity": "warning",
    },
]

POSTAL_RESTRICTIONS = {
    "11201": [
        {
            "code": "elevator-required",
            "label": "Elevator required",
            "description": "Buildings above the second floor require working elevator access.",
            "required_acknowledgement": True,
            "severity": "warning",
        }
    ],
    "94105": [
        {
            "code": "parking-required",
            "label": "Parking required",
            "description": "A legal loading or parking area must be available within one block.",
            "required_acknowledgement": True,
            "severity": "warning",
        },
        {
            "code": "visit-call-required",
            "label": "Visit call requirement",
            "description": "The technician must call before entering the building.",
            "required_acknowledgement": False,
            "severity": "info",
        },
    ],
}
