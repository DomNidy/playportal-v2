import { useState } from "react";
import {
  type UseTimelineReturn,
  type ExpectedTimelineEvent,
  type UseTimelineProps,
  type TimelineEvent,
} from "./types";
import {
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

    // Update the timeline
    const newTimeline: TimelineEvent[] = timeline.map((timelineEvent) => {
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

    setTimeline(newTimeline);

    // Remove the relevantExpectedEvent from the expected events array as we no longer care about it after we've received its status
    // We do this by removing all elements that match the successCode of the relevantExpectedEvent
    //* Note: This logic relies on the assumption that the user did not pass in multiple events with the same status code
    // We might want to refactor the ExpectedTimelineEvents to have a constructor that generates some unique id
    setExpectedTimelineEvents(
      expectedTimelineEvents.filter(
        (expectedEv) =>
          expectedEv.successCode !== relevantExpectedEvent.successCode,
      ),
    );
  };

  return { timeline, updateWithEvent };
}
