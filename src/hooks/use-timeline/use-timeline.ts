import { useCallback, useRef, useState } from "react";
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

  const [timeline, setTimeline] = useState<TimelineEvent[]>(() =>
    getInitialTimelineEvents(expectedTimeline),
  );

  // Lock updates to the timeline to prevent the user from updating the timeline too quickly

  // Function that updates the state of the expectedTimelineEvents by acknowleding the passed event has occured
  const _updateWithEvent = (
    receivedEventID: EventIDS,
    _timeline: TimelineEvent[],
    _outOfOrderEvents: OutOfOrderEvent<EventIDS>[],
    _expectedTimelineEvents: ExpectedTimelineEvent<EventIDS>[],
  ) => {
    let newTimeline: TimelineEvent[] = [..._timeline];
    let newOutOfOrderEvents = [..._outOfOrderEvents];
    let newExpectedTimelineEvents = [..._expectedTimelineEvents];

    // Create a copy of the `ExpectedTimelineEvent` that our `receivedEvent` corresponds to
    const relevantExpectedEvent = newExpectedTimelineEvents.find(
      (expectedEvent) => hasMatchingStatusCode(expectedEvent, receivedEventID),
    );

    // Handle the case where we were not expecting to receive the provided event
    if (!relevantExpectedEvent) {
      // If the received event was not in our expected events array, check the errorOnlyEvents array
      if (
        errorOnlyEvents.find((errEv) => receivedEventID === errEv.errorCode)
      ) {
        console.log("Received an error only event", receivedEventID);
        setTimeline(cancelAllPendingEvents(newTimeline));
      }

      onUnexpectedEventReceived?.(receivedEventID);
      console.warn("Received unexpected event", receivedEventID);
      return;
    }

    // Determine the status that the receivedEvent indicates
    // We will update the related `TimelineEvent` with this status
    const newTimelineEventStatus = mapEventIDToStatus<EventIDS>(
      receivedEventID,
      relevantExpectedEvent,
    );

    const isEventOutOfOrder = isReceivedEventIDOutOfOrder(
      receivedEventID,
      newExpectedTimelineEvents,
    );

    // If we received an event out of order, (if the received event is not the first element in the expectedTimelineEvents)
    // Then we will add it to an array which we will try to re-process later
    if (isEventOutOfOrder) {
      console.log("Received out of order event", receivedEventID);
      newOutOfOrderEvents = outOfOrderEvents.map((outOfOrderEvent) => ({
        ...outOfOrderEvent,
        metadata: {
          _receivedAt: outOfOrderEvent.metadata._receivedAt,
          _originalExpectedEvent:
            outOfOrderEvent.metadata._originalExpectedEvent,
        },
      }));

      newOutOfOrderEvents.push({
        eventID: receivedEventID,
        indicatesState: newTimelineEventStatus,
        metadata: {
          _receivedAt: Date.now(),
          _originalExpectedEvent: { ...relevantExpectedEvent },
        },
      });
    } else {
      // Create new timeline with updated state
      newTimeline = newTimeline.map((timelineEvent) => {
        if (isCorrespondingEvents(relevantExpectedEvent, timelineEvent)) {
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
    }

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
      newExpectedTimelineEvents = expectedTimelineEvents.filter(
        (expectedEv) =>
          expectedEv.successCode !== relevantExpectedEvent.successCode,
      );
    }
    console.log("=====================================");

    console.log("PREV TL", newTimeline);
    console.log("PREV OOE", newOutOfOrderEvents);
    console.log("PREV EET", newExpectedTimelineEvents);

    // Create new arrays with the out of order events processed

    const {
      newTimeline: newTimelineFinal,
      newOutOfOrderEvents: newOutOfOrderEventsFinal,
      newExpectedTimelineEvents: newExpectedTimelineEventsFinal,
    } = processOutOfOrderEvents(
      newExpectedTimelineEvents,
      newOutOfOrderEvents,
      newTimeline,
    );

    console.log("NEW TL IS THE OLD TL", newTimelineFinal === newTimeline);
    console.log(
      "NEW OOE IS THE OLD OOE",
      newOutOfOrderEventsFinal === newOutOfOrderEvents,
    );

    console.log("NEW TL", newTimelineFinal);
    // FIXME: These (`newOutOfOrderEventsFinal` and `newExpectedTimelineEvents`) both end up being empty arrays
    // FIXME: but, the newTimelineFinal array does not have the updated state?
    console.log("NEW OOE", newOutOfOrderEventsFinal);
    console.log("NEW EET", newExpectedTimelineEventsFinal);

    setTimeline(newTimelineFinal);
    setOutOfOrderEvents(newOutOfOrderEventsFinal);
    setExpectedTimelineEvents(newExpectedTimelineEventsFinal);

    return {
      updatedTimeline: newTimelineFinal,
      updatedOutOfOrderEvents: newOutOfOrderEventsFinal,
      updatedExpectedTimelineEvents: newExpectedTimelineEventsFinal,
    };
  };

  const updateWithEvent = (receivedEventID: EventIDS) => {
    _updateWithEvent(
      receivedEventID,
      timeline,
      outOfOrderEvents,
      expectedTimelineEvents,
    );
  };

  const updateWithEventArray = (receivedEventIDS: EventIDS[]) => {
    let updatedTimeline = timeline;
    let updatedOutOfOrderEvents = outOfOrderEvents;
    let updatedExpectedTimelineEvents = expectedTimelineEvents;

    for (const receivedEventID of receivedEventIDS) {
      const returnedValues = _updateWithEvent(
        receivedEventID,
        updatedTimeline,
        updatedOutOfOrderEvents,
        updatedExpectedTimelineEvents,
      );

      if (returnedValues) {
        updatedTimeline = returnedValues.updatedTimeline;
        updatedOutOfOrderEvents = returnedValues.updatedOutOfOrderEvents;
        updatedExpectedTimelineEvents =
          returnedValues.updatedExpectedTimelineEvents;
      }
    }
  };

  return { timeline, updateWithEvent, updateWithEventArray };
}
