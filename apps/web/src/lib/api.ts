import type {
  AreaCheckResult,
  CheckAreaInput,
  ServiceType,
  TimeSlot
} from "@/features/booking/types";

const supportedAreas = new Map([
  ["10001", "New York"],
  ["11201", "Brooklyn"],
  ["60601", "Chicago"]
]);

const slotTemplates: TimeSlot[] = [
  {
    id: "morning-delivery",
    label: "Morning delivery, 9:00 AM to 11:00 AM",
    mode: "delivery",
    window: "9:00 AM to 11:00 AM",
    available: true
  },
  {
    id: "afternoon-visit",
    label: "Afternoon in-home visit, 1:00 PM to 3:00 PM",
    mode: "visit",
    window: "1:00 PM to 3:00 PM",
    available: true
  },
  {
    id: "evening-delivery",
    label: "Evening delivery, 5:00 PM to 7:00 PM",
    mode: "delivery",
    window: "5:00 PM to 7:00 PM",
    available: false,
    unavailableReason: "Capacity limit reached"
  }
];

function wait(ms = 250) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function checkServiceArea(input: CheckAreaInput): Promise<AreaCheckResult> {
  await wait();

  const city = supportedAreas.get(input.postalCode);
  const available = Boolean(city);

  return {
    postalCode: input.postalCode,
    serviceType: input.serviceType,
    city,
    available,
    message: available
      ? "Service is available in this area."
      : "Service is not available in this area."
  };
}

export async function listTimeSlots(input: {
  postalCode: string;
  serviceType: ServiceType;
}): Promise<TimeSlot[]> {
  await wait();

  if (!supportedAreas.has(input.postalCode)) {
    return [];
  }

  return slotTemplates.map((slot) => ({
    ...slot,
    id: `${input.postalCode}-${input.serviceType}-${slot.id}`
  }));
}
