import { useCallback, useEffect, useMemo, useState } from "react";
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
  mapEventIDToStatus,
} from "./utils";

/**
 *
 * @param EventIDS - Should be a literal union type that contains all possible events our expectedTimelineEvents can receive
 * For instance, we might have the literal union `upload_success` | `download_success` | `upload_fail` | `download_fail`
 */
export default function useTimeline<EventIDS extends string>({
  expectedTimeline,
  errorOnlyEvents,
}: UseTimelineProps<EventIDS>): UseTimelineReturn<EventIDS> {
  // This is used to store the initial expected timeline events passed in props
  // We will remove expected events from this array as they occur
  const [expectedTimelineEvents] = useState<ExpectedTimelineEvent<EventIDS>[]>(
    () => expectedTimeline,
  );

  const [expectedTimelineIndex, setExpectedTimelineIndex] = useState<number>(0);

  // User to store events that were initially received out of order
  const [outOfOrderEvents, setOutOfOrderEvents] = useState<
    OutOfOrderEvent<EventIDS>[]
  >([]);

  const [timeline, setTimeline] = useState<TimelineEvent[]>(() =>
    getInitialTimelineEvents(expectedTimeline),
  );

  const nextExpectedEvent = useMemo(() => {
    return expectedTimelineEvents.at(expectedTimelineIndex);
  }, [expectedTimelineEvents, expectedTimelineIndex]);

  // Function that updates the state of the expectedTimelineEvents by acknowleding the passed event has occured
  const updateWithEvent = useCallback(
    (receivedEventID: EventIDS) => {
      console.log("updateWithEvent");
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
          console.log("Received an error only event", receivedEventID);
          setTimeline((prevTimeline) => cancelAllPendingEvents(prevTimeline));
        }

        console.warn("Received unexpected event", receivedEventID);
        return;
      }

      // Determine the status that the receivedEvent indicates
      // We will update the related `TimelineEvent` with this status
      const newTimelineEventStatus = mapEventIDToStatus<EventIDS>(
        receivedEventID,
        relevantExpectedEvent,
      );

      const isEventOutOfOrder = nextExpectedEvent
        ? hasMatchingStatusCode(nextExpectedEvent, receivedEventID)
        : false;

      // If received event is out of order, add it to the out of order events array
      if (isEventOutOfOrder) {
        setOutOfOrderEvents((prevOutOfOrderEvents) => [
          ...prevOutOfOrderEvents,
          {
            eventID: receivedEventID,
            indicatesState: newTimelineEventStatus,
            metadata: {
              _receivedAt: Date.now(),
              _originalExpectedEvent: { ...relevantExpectedEvent },
            },
          },
        ]);

        setExpectedTimelineIndex((prev) => prev + 1);

        return;
      } else {
        // Otherwise, add update the timeline
        setTimeline((prevTimeline) =>
          prevTimeline.map((timelineEvent) => {
            if (isCorrespondingEvents(relevantExpectedEvent, timelineEvent)) {
              return {
                metadata: {
                  _updatedByEventID: receivedEventID,
                  _relevantEventIDS: timelineEvent.metadata._relevantEventIDS,
                  _displayMessagesMap:
                    timelineEvent.metadata._displayMessagesMap,
                },
                displayMessage: getDisplayMessageForStatus(
                  relevantExpectedEvent,
                  newTimelineEventStatus,
                ),
                state: newTimelineEventStatus,
              };
            }
            return timelineEvent;
          }),
        );
        return;
      }
    },
    [errorOnlyEvents, expectedTimelineEvents, nextExpectedEvent],
  );

  // FIXME: So this runs infinitely in a loop, but it doesnt find errors so it doesnt actually updaate the timeline
  // FIXME: So that implies our expectedTimeline changes every render?

  // If we received an errored event, we should cancel all pending events and remove all expected events
  useEffect(() => {
    console.log("Timeline eff", timeline);
    if (timeline.some((timelineEvent) => timelineEvent.state === "error")) {
      setTimeline((prevTimeline) => {
        console.log("Found an error", prevTimeline);

        return prevTimeline.map((tle) => ({
          ...tle,
          state: "cancelled",
          metadata: {
            _updatedByEventID: tle.metadata._updatedByEventID,
            _relevantEventIDS: tle.metadata._relevantEventIDS,
            _displayMessagesMap: {
              ...tle.metadata._displayMessagesMap,
            },
          },
        }));
      });
      // Set it to an index outside of the array to indicate we are done
      setExpectedTimelineIndex(Infinity);
    }
  }, [timeline]);

  // When the expected events change, we should try to process any out of order events
  useEffect(() => {
    console.log("OOE eff", outOfOrderEvents);

    const hasOutOfOrderEvents = outOfOrderEvents.length > 0;

    // Check if the next expected event matches an out of order event
    if (hasOutOfOrderEvents && nextExpectedEvent) {
      const matchingOutOfOrderEvent = outOfOrderEvents.find((ooe) =>
        hasMatchingStatusCode(nextExpectedEvent, ooe.eventID),
      );

      if (matchingOutOfOrderEvent) {
        console.log(
          "Found an out of order event that matches the next expected event:",
          matchingOutOfOrderEvent,
        );

        // Remove from out of order events, and add to timeline
        setTimeline((prevTimeline) => {
          return prevTimeline.map((timelineEvent) => {
            if (
              timelineEvent.metadata._relevantEventIDS.has(
                matchingOutOfOrderEvent.eventID,
              )
            ) {
              return {
                metadata: {
                  _updatedByEventID: matchingOutOfOrderEvent.eventID,
                  _relevantEventIDS: timelineEvent.metadata._relevantEventIDS,
                  _displayMessagesMap:
                    timelineEvent.metadata._displayMessagesMap,
                },
                displayMessage: getDisplayMessageForStatus(
                  matchingOutOfOrderEvent.metadata._originalExpectedEvent,
                  matchingOutOfOrderEvent.indicatesState,
                ),
                state: matchingOutOfOrderEvent.indicatesState,
              };
            }
            return timelineEvent;
          });
        });

        setOutOfOrderEvents((prevOutOfOrderEvents) =>
          prevOutOfOrderEvents.filter(
            (ooe) => ooe.eventID !== matchingOutOfOrderEvent.eventID,
          ),
        );
      } else {
        console.log(
          "Failed to find an expected event matching the next expected event",
          nextExpectedEvent,
        );
      }
    }
  }, [outOfOrderEvents, nextExpectedEvent]);

  const updateWithEventArray = useCallback(
    (receivedEventIDS: EventIDS[]) => {
      for (const receivedEventID of receivedEventIDS) {
        updateWithEvent(receivedEventID);
      }
    },
    [updateWithEvent],
  );

  return useMemo(
    () => ({ timeline, updateWithEvent, updateWithEventArray }),
    [timeline, updateWithEvent, updateWithEventArray],
  );
}
