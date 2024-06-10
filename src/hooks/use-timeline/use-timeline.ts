import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  type UseTimelineReturn,
  type ExpectedTimelineEvent,
  type UseTimelineProps,
  type TimelineEvent,
  type OutOfOrderEvent,
} from "./types";
import {
  getDisplayMessageForStatus,
  getInitialTimelineEvents,
  hasMatchingStatusCode,
  isCorrespondingEvents,
  mapEventIDToStatus,
} from "./utils";

function expectedTimelineIndexReducer(
  state: number,
  action:
    | "received_error"
    | "received_in_order_event"
    | "received_out_of_order_event",
) {
  switch (action) {
    case "received_error":
      console.log("setExpectedTimelineIndexReducer received an error");
      return Infinity;
    case "received_in_order_event":
      console.log("setExpectedTimelineIndexReducer received an in order event");
      return state + 1;
    case "received_out_of_order_event":
      console.log(
        "setExpectedTimelineIndexReducer received an out of order event",
      );
      return state + 1;
    default:
      console.warn(
        "setExpectedTimelineIndexReducer received an unknown action",
      );
      return state;
  }
}

/**
 *
 * ### This hook may infinite re-rendering if the props are not memoized with useMemo before passing them to this hook
 * 
 * It is recommended to memoize them as such
 * 
 * ```typescript
 * 
 * const tlProps = useMemo(() => {
    return {
      expectedTimeline: [
        {
          errorCode: "cv_dl_input_fail",
          successCode: "cv_dl_input_success",
          errorDisplayMessage: "Failed to download input.",
          pendingDisplayMessage: "Downloading your files...",
          successDisplayMessage: "Successfully downloaded your files!",
        },
        // ... rest of the timeline
      ],
      errorOnlyEvents: [
        {
          errorCode: "cv_unexpected_error",
          errorDisplayMessage:
            "An unexpected error occured while creating your video.",
        },
      ],
    } as UseTimelineProps<OperationLogCode>;
  }, []);

  // Then pass these to the hook
  const { timeline, updateWithEventArray } =
    useTimeline<OperationLogCode>(tlProps);
 * ``` 
 * 
 * @param EventIDS - Should be a literal union type that contains all possible events our expectedTimelineEvents can receive
 * For instance, we might have the literal union `upload_success` | `download_success` | `upload_fail` | `download_fail`
 *
 * 
 *
 */
export default function useTimeline<EventIDS extends string>({
  expectedTimeline,
  errorOnlyEvents,
}: UseTimelineProps<EventIDS>): UseTimelineReturn<EventIDS> {
  // This is used to store the initial expected timeline events passed in props
  const [expectedTimelineEvents] =
    useState<ExpectedTimelineEvent<EventIDS>[]>(expectedTimeline);

  // FIXME: This doesn't seem to be properly updated
  const expectedTimelineIndex = useRef<number>(0);

  // User to store events that were initially received out of order
  const [outOfOrderEvents, setOutOfOrderEvents] = useState<
    OutOfOrderEvent<EventIDS>[]
  >([]);

  const [timeline, setTimeline] = useState<TimelineEvent[]>(() =>
    getInitialTimelineEvents(expectedTimeline),
  );

  // We use this to track whether or not we should run cancelAllPending events
  // Intended to only set this once, when we receive our first error
  const didTimelineError = useRef<boolean>(false);

  const nextExpectedEvent = useMemo(() => {
    return expectedTimelineEvents.at(expectedTimelineIndex.current);
  }, [expectedTimelineEvents]);

  const cancelAllPendingEvents = useCallback(() => {
    setTimeline((prevTimeline) => {
      return prevTimeline.map((tle) => {
        if (tle.state === "pending") {
          return {
            ...tle,
            state: "cancelled",
            metadata: {
              _updatedByEventID: tle.metadata._updatedByEventID,
              _relevantEventIDS: tle.metadata._relevantEventIDS,
              _displayMessagesMap: {
                ...tle.metadata._displayMessagesMap,
              },
            },
          };
        }
        return tle;
      });
    });
  }, []);

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
          cancelAllPendingEvents();
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

      const receivedOutOfOrderEvent = nextExpectedEvent
        ? !hasMatchingStatusCode(nextExpectedEvent, receivedEventID)
        : false;

      // If received event is out of order, add it to the out of order events array
      if (receivedOutOfOrderEvent) {
        console.log(
          receivedEventID,
          "Was out of order",
          expectedTimelineEvents,
        );

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

        expectedTimelineIndex.current += 1;

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

        expectedTimelineIndex.current += 1;

        return;
      }
    },
    [
      errorOnlyEvents,
      expectedTimelineEvents,
      nextExpectedEvent,
      cancelAllPendingEvents,
    ],
  );

  // FIXME: So this runs infinitely in a loop, but it doesnt find errors so it doesnt actually updaate the timeline
  // FIXME: So that implies our expectedTimeline changes every render?

  // FIXME: One problem with this is that when we end up updating the timeline array here, we update it, then this effect runs again,
  // FIXME: and because we the 'error' event is still in the timeline, it just keeps running.

  // If we received an errored event, we should cancel all pending events and remove all expected events
  useEffect(() => {
    console.log("Timeline eff", timeline);
    if (
      !didTimelineError.current &&
      timeline.some((timelineEvent) => timelineEvent.state === "error")
    ) {
      didTimelineError.current = true;

      setTimeline((prevTimeline) => {
        console.log("Found an error", prevTimeline);

        return prevTimeline.map((tle) => ({
          ...tle,
          state: tle.state === "pending" ? "cancelled" : tle.state,
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
      expectedTimelineIndex.current = Infinity;
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
