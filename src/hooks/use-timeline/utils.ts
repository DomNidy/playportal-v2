import {
  type TimelineEvent,
  type ExpectedTimelineEvent,
  type TimelineEventStatuses,
  type OutOfOrderEvent,
} from "./types";

export function hasMatchingStatusCode<T extends string>(
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
export function isCorrespondingEvents<T extends string>(
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
export function mapEventIDToStatus<T extends string>(
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
export function getDisplayMessageForStatus<T extends string>(
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

export function isReceivedEventIDOutOfOrder<T extends string>(
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
        ...timelineEvent,
        metadata: {
          _updatedByEventID: timelineEvent.metadata._updatedByEventID,
          _relevantEventIDS: timelineEvent.metadata._relevantEventIDS,
          _displayMessagesMap: {
            ...timelineEvent.metadata._displayMessagesMap,
          },
        },
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
export function getInitialTimelineEvents<T extends string>(
  expectedTimelineEvents: ExpectedTimelineEvent<T>[],
): TimelineEvent[] {
  return expectedTimelineEvents.map((expectedTimelineEvent) => ({
    displayMessage: expectedTimelineEvent.pendingDisplayMessage,
    state: "pending",
    metadata: {
      _relevantEventIDS: new Set([
        expectedTimelineEvent.errorCode,
        expectedTimelineEvent.successCode,
      ]),
      _displayMessagesMap: {
        error: expectedTimelineEvent.errorDisplayMessage,
        pending: expectedTimelineEvent.pendingDisplayMessage,
        success: expectedTimelineEvent.successDisplayMessage,
        // We are just using the pending display message here
        cancelled: expectedTimelineEvent.pendingDisplayMessage,
      },
    },
  }));
}

export function processOutOfOrderEvents<T extends string>(
  nextExpectedEvent: ExpectedTimelineEvent<T> | undefined,
  outOfOrderEvents: OutOfOrderEvent<T>[],
  timeline: TimelineEvent[],
) {
  let newTimeline: TimelineEvent[] = timeline;

  const newOutOfOrderEvents = outOfOrderEvents.filter((outOfOrderEvent) => {
    // If we are expecting no more events, and we still have out of order events, we'll drop these out of order events
    if (!nextExpectedEvent) {
      console.debug(`Tried to process out of order event ${String(outOfOrderEvent)} but we aren't expecting to receive anymore events
        , we will update the timeline with this event if we can find a matching event in the timeline)`);

      // Find the timeline event corresponding to the out of order event, and update it if it can be found

      newTimeline = timeline.map((timelineEvent) => {
        console.log(
          timelineEvent.metadata._relevantEventIDS,
          outOfOrderEvent.eventID,
        );
        if (
          timelineEvent.metadata._relevantEventIDS.has(outOfOrderEvent.eventID)
        ) {
          console.log(
            `Found matching TimelineEvent with a matching relevant event id for out of order event ${String(outOfOrderEvent)}`,
          );

          return {
            metadata: {
              _updatedByEventID: String(outOfOrderEvent),
              _relevantEventIDS: timelineEvent.metadata._relevantEventIDS,
              _displayMessagesMap: timelineEvent.metadata._displayMessagesMap,
            },
            displayMessage:
              timelineEvent.metadata._displayMessagesMap[
                outOfOrderEvent.indicatesState
              ],
            state: outOfOrderEvent.indicatesState,
          };
        }
        return timelineEvent;
      });

      console.log(newTimeline, "updated");
    }
    // If the next event we are expecting matches this out of order event, move this event back to the expectedTimelineEvents
    else if (
      hasMatchingStatusCode(nextExpectedEvent, outOfOrderEvent.eventID) &&
      newTimeline[0]
    ) {
      console.log("Next event matches");
      newTimeline[0] = {
        displayMessage:
          newTimeline[0].metadata._displayMessagesMap[
            outOfOrderEvent.indicatesState
          ],
        state: outOfOrderEvent.indicatesState,
        metadata: {
          _displayMessagesMap: newTimeline[0].metadata._displayMessagesMap,
          _relevantEventIDS: newTimeline[0].metadata._relevantEventIDS,
          _updatedByEventID: newTimeline[0].metadata._updatedByEventID,
        },
      };
      return false;
    }

    console.log(
      `Event ${String(outOfOrderEvent.eventID)} is still out of order.`,
    );
    // If this event is still out of order, leave it in here
    return true;
  });

  return {
    newTimeline,
    newOutOfOrderEvents,
  };
}
