import { useCallback, useState } from "react";
import {
  type UseTimelineReturn,
  type ExpectedTimelineEvent,
  type UseTimelineProps,
  type TimelineEvent,
  type OutOfOrderEvent,
} from "./types";
import {
  cancelAllPendingEvents,
  getDisplayMessageForStatus,
  getInitialTimelineEvents,
  hasMatchingStatusCode,
  isCorrespondingEvents,
  isReceivedEventIDOutOfOrder,
  mapEventIDToStatus,
  processOutOfOrderEvents,
} from "./utils";

/**
 *
 * @param EventIDS - Should be a literal union type that contains all possible events our expectedTimelineEvents can receive
 * For instance, we might have the literal union `upload_success` | `download_success` | `upload_fail` | `download_fail`
 */
export default function useTimeline<EventIDS extends string>({
  expectedTimeline,
  errorOnlyEvents,
  onUnexpectedEventReceived,
}: UseTimelineProps<EventIDS>): UseTimelineReturn<EventIDS> {
  // This is used to store the initial expected timeline events passed in props
  // We will remove expected events from this array as they occur
  const [expectedTimelineEvents, setExpectedTimelineEvents] =
    useState<ExpectedTimelineEvent<EventIDS>[]>(expectedTimeline);

  // User to store events that were initially received out of order
  const [outOfOrderEvents, setOutOfOrderEvents] = useState<
    OutOfOrderEvent<EventIDS>[]
  >([]);

  const [timeline, setTimeline] = useState<TimelineEvent[]>(
    getInitialTimelineEvents(expectedTimeline),
  );

  // Function that updates the state of the expectedTimelineEvents by acknowleding the passed event has occured
  // TODO: Maybe memoize this with useCallback?
  const updateWithEvent: (receivedEventID: EventIDS) => void = useCallback(
    (receivedEventID: EventIDS) => {
      // Update the expectedTimelineEvents
      // * We could modify the ExpectedTimelineEvent to be mapped to a new internal structure which has a set containing its success and error codes for faster access
      // * This might not even be a net performance increase though since we only have two strings we are comparing currently

      // Create a copy of the `ExpectedTimelineEvent` that our `receivedEvent` corresponds to
      const relevantExpectedEvent = expectedTimelineEvents.find(
        (expectedEvent) =>
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
        console.warn("Received unexpected event", receivedEventID);
        return;
      }

      const isEventOutOfOrder = isReceivedEventIDOutOfOrder(
        receivedEventID,
        expectedTimelineEvents,
      );

      // Determine the status that the receivedEvent indicates
      // We will update the related `TimelineEvent` with this status
      const newTimelineEventStatus = mapEventIDToStatus<EventIDS>(
        receivedEventID,
        relevantExpectedEvent,
      );

      let newOutOfOrderEvents: OutOfOrderEvent<EventIDS>[] | null = null;

      // If we received an event out of order, (if the received event is not the first element in the expectedTimelineEvents)
      // Then we will add it to an array which we will try to re-process later
      if (isEventOutOfOrder) {
        console.warn("Received out of order event", receivedEventID);
        newOutOfOrderEvents = outOfOrderEvents.map((outOfOrderEvent) => ({
          ...outOfOrderEvent,
          metadata: {
            _originalExpectedEvent:
              outOfOrderEvent.metadata._originalExpectedEvent,
          },
        }));

        newOutOfOrderEvents.push({
          eventID: receivedEventID,
          indicatesState: newTimelineEventStatus,
          metadata: { _originalExpectedEvent: { ...relevantExpectedEvent } },
        });
      }

      // Create new expected events timeline
      let newExpectedTimelineEvents = [...expectedTimelineEvents];

      // Create new timeline with updated state
      let newTimeline: TimelineEvent[] = timeline.map((timelineEvent) => {
        // Don't update events that are out of order
        if (
          isCorrespondingEvents(relevantExpectedEvent, timelineEvent) &&
          !isEventOutOfOrder
        ) {
          return {
            metadata: {
              _updatedByEventID: String(receivedEventID),
              _relevantEventIDS: timelineEvent.metadata._relevantEventIDS,
              _displayMessagesMap: timelineEvent.metadata._displayMessagesMap,
            },
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
      // otherwise, remove the received event from the expected events array
      if (newTimelineEventStatus === "error") {
        console.debug(
          "Timeline received an error event, cancelling all pending events and clearing expected events.",
        );
        newTimeline = cancelAllPendingEvents(newTimeline);
        newExpectedTimelineEvents = [];
      } else {
        console.log("Updating timeline");
        // Remove the relevantExpectedEvent from the expected events array as we no longer care about it after we've received its status once
        //* Note: This logic relies on the assumption that the user did not pass in multiple events with the same status code
        // We might want to refactor the ExpectedTimelineEvents to have a constructor that generates some unique id
        newExpectedTimelineEvents = expectedTimelineEvents.filter(
          (expectedEv) =>
            expectedEv.successCode !== relevantExpectedEvent.successCode,
        );
      }

      console.log("PREV TL", newTimeline);
      console.log("PREV OOE", newOutOfOrderEvents);
      console.log("PREV EET", newExpectedTimelineEvents);

      // Create new arrays with the out of order events processed
      const {
        newTimeline: newTimelineFinal,
        newOutOfOrderEvents: newOutOfOrderEventsFinal,
      } = processOutOfOrderEvents(
        newExpectedTimelineEvents,
        newOutOfOrderEvents ?? outOfOrderEvents,
        newTimeline,
      );

      console.log("NEW TL", newTimelineFinal);
      // FIXME: These (`newOutOfOrderEventsFinal` and `newExpectedTimelineEvents`) both end up being empty arrays
      // FIXME: but, the newTimelineFinal array does not have the updated state?
      console.log("NEW OOE", newOutOfOrderEventsFinal);
      console.log("NEW EET", newExpectedTimelineEvents);

      setTimeline(newTimelineFinal);

      setOutOfOrderEvents(newOutOfOrderEventsFinal);
      setExpectedTimelineEvents(newExpectedTimelineEvents);
    },
    [
      errorOnlyEvents,
      expectedTimelineEvents,
      onUnexpectedEventReceived,
      timeline,
      outOfOrderEvents,
    ],
  );

  const updateWithEventArray = (receivedEventIDS: EventIDS[]) => {
    receivedEventIDS.forEach(updateWithEvent);
  };

  return { timeline, updateWithEvent, updateWithEventArray };
}
