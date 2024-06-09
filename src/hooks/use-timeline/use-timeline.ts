import { useState } from "react";
import {
  type UseTimelineReturn,
  type ExpectedTimelineEvent,
  type UseTimelineProps,
  type TimelineEvent,
} from "./types";
import {
  cancelAllPendingEvents,
  getDisplayMessageForStatus,
  hasMatchingStatusCode,
  isCorrespondingEvents,
  isReceivedEventIDOutOfOrder,
  mapEventIDToStatus,
} from "./utils";

/**
 *
 * @param EventIDS - Should be a literal union type that contains all possible events our expectedTimelineEvents can receive
 * For instance, we might have the literal union `upload_success` | `download_success` | `upload_fail` | `download_fail`
 */
export default function useTimeline<EventIDS>({
  expectedTimeline,
  errorOnlyEvents,
  onUnexpectedEventReceived,
}: UseTimelineProps<EventIDS>): UseTimelineReturn<EventIDS> {
  // This is used to store the initial expected timeline events passed in props
  // We will remove expected events from this array as they occur
  const [expectedTimelineEvents, setExpectedTimelineEvents] =
    useState<ExpectedTimelineEvent<EventIDS>[]>(expectedTimeline);

  // User to store events that were initially received out of order
  const [outOfOrderEvents, setOutOfOrderEvents] = useState<EventIDS[]>([]);

  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  // Function that updates the state of the expectedTimelineEvents by acknowleding the passed event has occured
  // TODO: Maybe memoize this with useCallback?
  const updateWithEvent = (receivedEventID: EventIDS) => {
    // Update the expectedTimelineEvents
    // * We could modify the ExpectedTimelineEvent to be mapped to a new internal structure which has a set containing its success and error codes for faster access
    // * This might not even be a net performance increase though since we only have two strings we are comparing currently

    // Create a copy of the `ExpectedTimelineEvent` that our `receivedEvent` corresponds to
    const relevantExpectedEvent = expectedTimelineEvents.find((expectedEvent) =>
      hasMatchingStatusCode(expectedEvent, receivedEventID),
    );

    // Handle the case where we were not expecting to receive the provided event
    if (!relevantExpectedEvent) {
      // If the received event was not in our expected events array, check the errorOnlyEvents array
      if (
        errorOnlyEvents.find((errEv) => receivedEventID === errEv.errorCode)
      ) {
        // If we received an error only event, cancel all remaining pending events
        const newTimeline = cancelAllPendingEvents(timeline);
        setTimeline(newTimeline);
      }

      onUnexpectedEventReceived?.(receivedEventID);
      return;
    }

    // If we received an event out of order, (if the received event is not the first element in the expectedTimelineEvents)
    // Then we will add it to an array which we will try to re-process later
    if (isReceivedEventIDOutOfOrder(receivedEventID, expectedTimelineEvents)) {
      console.warn("Received out of order event", receivedEventID);
      setOutOfOrderEvents((prev) => [...prev, receivedEventID]);
    }

    // Determine the status that the receivedEvent indicates
    // We will update the related `TimelineEvent` with this status
    const newTimelineEventStatus = mapEventIDToStatus<EventIDS>(
      receivedEventID,
      relevantExpectedEvent,
    );

    // Create new timeline with updated state
    let newTimeline: TimelineEvent[] = timeline.map((timelineEvent) => {
      if (isCorrespondingEvents(relevantExpectedEvent, timelineEvent)) {
        return {
          displayMessage: getDisplayMessageForStatus(
            relevantExpectedEvent,
            newTimelineEventStatus,
          ),
          state: newTimelineEventStatus,
        };
      }

      return timelineEvent;
    });

    // If the event status we received indicated an error occured,
    // cancel all pending events and remove all expected events
    if (newTimelineEventStatus === "error") {
      console.debug(
        "Timeline received an error event, cancelling all pending events and clearing expected events.",
      );
      newTimeline = cancelAllPendingEvents(newTimeline);
      setExpectedTimelineEvents([]);
    } else {
      // Remove the relevantExpectedEvent from the expected events array as we no longer care about it after we've received its status once
      //* Note: This logic relies on the assumption that the user did not pass in multiple events with the same status code
      // We might want to refactor the ExpectedTimelineEvents to have a constructor that generates some unique id
      setExpectedTimelineEvents(
        expectedTimelineEvents.filter(
          (expectedEv) =>
            expectedEv.successCode !== relevantExpectedEvent.successCode,
        ),
      );
    }

    setTimeline(newTimeline);
  };

  return { timeline, updateWithEvent };
}
