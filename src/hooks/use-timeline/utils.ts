import {
  type TimelineEvent,
  type ExpectedTimelineEvent,
  type TimelineEventStatuses,
} from "./types";

export function hasMatchingStatusCode<T>(
  expecetedEvent: ExpectedTimelineEvent<T>,
  receivedEvent: T,
): boolean {
  return (
    receivedEvent === expecetedEvent.successCode ||
    receivedEvent === expecetedEvent.errorCode
  );
}

// TODO: Room for optimizations
/**
 * Utility function that checks if the `TimelineEvent` corresponds to the `ExpectedTimelineEvent`
 *
 * Events are considered to be corresponding if the `displayMessage` of the timeline event matches
 * either the `pendingDisplayMessage`, `successDisplayMessage`, or `errorDisplayMessage` of the `ExpectedTimelineEvent`
 */
export function isCorrespondingEvents<T>(
  expectedTimelineEvent: ExpectedTimelineEvent<T>,
  timelineEvent: TimelineEvent,
): boolean {
  if (
    timelineEvent.displayMessage === expectedTimelineEvent.pendingDisplayMessage
  ) {
    return true;
  } else if (
    timelineEvent.displayMessage === expectedTimelineEvent.successDisplayMessage
  ) {
    return true;
  } else if (
    timelineEvent.displayMessage === expectedTimelineEvent.errorDisplayMessage
  ) {
    return true;
  }
  return false;
}

/**
 * Used to map an event id to a timeline event status
 *
 * This is done by checking if the `eventID` matches either the success or error status codes of the `ExpectedTimelineEvent`
 * @param {any} eventID: The event id that we received
 * @param {any} expectedTimelineEvent:ExpectedTimelineEvent<T>
 * @returns {any}
 */
export function mapEventIDToStatus<T>(
  eventID: T,
  expectedTimelineEvent: ExpectedTimelineEvent<T>,
): TimelineEventStatuses {
  if (expectedTimelineEvent.errorCode === eventID) {
    return "error";
  } else if (expectedTimelineEvent.successCode === eventID) {
    return "success";
  } else {
    throw new Error(
      `Failed to map event id ${String(eventID)} to an errorCode or successCode in the relevant event: ${JSON.stringify(expectedTimelineEvent)}
      This might indicate a bug in the hasMatchingStatusCode function, as this function (mapEventIDToStatus) should only receive
      an ExpectedTimelineEvent which passes that condition. (has an errorCode or successCode that corresponds to the passed event id)
      
      This error may have also occured if you passed an eventID and ExpectedTimelineEvent to this function without checking if they actually
      correspond to one another. (If either one of the ExpectedTimelineEvent's errorCode or successCode matches the passed eventID, 
      remember: The status codes of an event are just members of the union of EventIDS. This union is passed to this function in the type params)`,
    );
  }
}

/**
 * Retrieves the display[Status]Message for an `ExpectedTimelineEvent`
 *
 * IF you pass "error" here, we will return the errorDisplayMessage, same with status, etc..
 * @param {any} correspondingExpectedTimelineEvent:ExpectedTimelineEvent<T>
 * @param {any} status:TimelineEventStatuses
 * @returns {any}
 */
export function getDisplayMessageForStatus<T>(
  correspondingExpectedTimelineEvent: ExpectedTimelineEvent<T>,
  status: TimelineEventStatuses,
): string {
  switch (status) {
    case "pending":
      return correspondingExpectedTimelineEvent.pendingDisplayMessage;
    case "error":
      return correspondingExpectedTimelineEvent.errorDisplayMessage;
    case "success":
      return correspondingExpectedTimelineEvent.successDisplayMessage;
    case "cancelled":
      // We will just return the pending message for the display message of the cancelled state
      return correspondingExpectedTimelineEvent.pendingDisplayMessage;
  }
}

export function isReceivedEventIDOutOfOrder<T>(
  receivedEventID: T,
  expectedEvents: ExpectedTimelineEvent<T>[],
): boolean {
  // Find the index of the received expected event
  const relevantExpectedEventIndex = expectedEvents.findIndex((expectedEvent) =>
    hasMatchingStatusCode(expectedEvent, receivedEventID),
  );

  // Handle the case where we are unable to find the received event in the expected events arraay
  if (relevantExpectedEventIndex === -1) {
    throw new Error(
      `Failed to find an ExpectedTimelineEvent with a status code matching ${String(receivedEventID)}
      in the expectedEvents array: ${JSON.stringify(expectedEvents)}`,
    );
  }

  if (relevantExpectedEventIndex > 0) {
    return true;
  }
  return false;
}

/**
 * Returns a new array with the status of all pending events in the expectedEvents array to changed cancelled
 *
 * Useful when we receive an error event and want to mark all events thereafter as cancelled.
 * @param {any} expectedEvents:ExpectedTimelineEvent<T>[]
 * @returns {any}
 */
export function cancelAllPendingEvents(
  timelineEvents: TimelineEvent[],
): TimelineEvent[] {
  return timelineEvents.map((timelineEvent) => {
    if (timelineEvent.state === "pending") {
      return {
        state: "cancelled",
        displayMessage: timelineEvent.displayMessage,
      };
    }
    return timelineEvent;
  });
}

/**
 * Used to create an initial array of timeline events from the passed ExpectedTimelineEvent[]
 * @param {any} expectedTimelineEvents:ExpectedTimelineEvent<T>
 * @returns {any}
 */
export function getInitialTimelineEvents<T>(
  expectedTimelineEvents: ExpectedTimelineEvent<T>[],
): TimelineEvent[] {
  return expectedTimelineEvents.map((expectedTimelineEvent) => ({
    displayMessage: expectedTimelineEvent.pendingDisplayMessage,
    state: "pending",
  }));
}
