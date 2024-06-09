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

      // If we received an event out of order, (if the received event is not the first element in the expectedTimelineEvents)
      // Then we will add it to an array which we will try to re-process later
      if (isEventOutOfOrder) {
        console.warn("Received out of order event", receivedEventID);
        setOutOfOrderEvents((prev) => [
          ...prev,
          { eventID: receivedEventID, indicatesState: newTimelineEventStatus },
        ]);
      }

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
        setExpectedTimelineEvents([]);
      } else {
        console.log("Updating timeline");
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

      // FIXME: This function does not receive the most recent expectedTimelineEvents array, it is outdated
      // FIXME: We can either pass the expectedTimelineEvents array as a parameter in here, or refactor the
      // FIXME: expectedTimelineEvents to use useRef hook
      const processOutOfOrderEvents = () => {
        console.log("Processing out of order events");

        setOutOfOrderEvents((prevOutOfOrderEvents) => {
          console.log(
            `setOutOfOrderEvents has expectedTimeline scope ${String(JSON.stringify(expectedTimelineEvents))}`,
          );
          const remainingOutOfOrderEvents = prevOutOfOrderEvents.filter(
            (outOfOrderEvent) => {
              const nextExpectedEvent = expectedTimelineEvents[0];

              // If we are expecting no more events, and we still have out of order events, we'll drop these out of order events
              if (!nextExpectedEvent) {
                console.debug(`Tried to process out of order event ${String(outOfOrderEvent)} but we aren't expecting to receive anymore events
                , we will update the timeline with this event if we can find a matching event in the timeline)`);

                // Find the timeline event corresponding to the out of order event, and update it if it can be found
                setTimeline((prevTimeline) => {
                  const newTimeline: TimelineEvent[] = prevTimeline.map(
                    (timelineEvent) => {
                      console.log(
                        timelineEvent.metadata._relevantEventIDS,
                        outOfOrderEvent.eventID,
                      );
                      if (
                        timelineEvent.metadata._relevantEventIDS.has(
                          outOfOrderEvent.eventID,
                        )
                      ) {
                        console.log(
                          `Found matching TimelineEvent with a matching relevant event id for out of order event ${String(outOfOrderEvent)}`,
                        );

                        return {
                          metadata: {
                            _updatedByEventID: String(outOfOrderEvent),
                            _relevantEventIDS:
                              timelineEvent.metadata._relevantEventIDS,
                            _displayMessagesMap:
                              timelineEvent.metadata._displayMessagesMap,
                          },
                          displayMessage:
                            timelineEvent.metadata._displayMessagesMap[
                              outOfOrderEvent.indicatesState
                            ],
                          state: newTimelineEventStatus,
                        };
                      }
                      return timelineEvent;
                    },
                  );

                  console.log(newTimeline, "updated");

                  return newTimeline;
                });

                return false;
              }
              // If the next event we are expecting matches this out of order event, then update the timeline state and remove this out of order event
              else if (
                hasMatchingStatusCode(
                  nextExpectedEvent,
                  outOfOrderEvent.eventID,
                )
              ) {
                console.log("Next event matches");
                updateWithEvent(outOfOrderEvent.eventID);
                return false;
              }

              console.log(
                `Event ${String(outOfOrderEvent.eventID)} is still out of order.`,
              );
              // If this event is still out of order, leave it in here
              return true;
            },
          );

          // Create an array of OutOfOrder events with all duplicate events removed
          const uniqueOutOfOrderEvents = Array.from(
            new Set(
              remainingOutOfOrderEvents.map((eventObj) =>
                JSON.stringify(eventObj),
              ),
            ),
          ).map(
            (eventObj) => JSON.parse(eventObj) as OutOfOrderEvent<EventIDS>,
          );

          return uniqueOutOfOrderEvents;
        });
      };

      setTimeline(newTimeline);
      processOutOfOrderEvents();
    },
    [
      errorOnlyEvents,
      expectedTimelineEvents,
      onUnexpectedEventReceived,
      timeline,
    ],
  );

  const updateWithEventArray = (receivedEventIDS: EventIDS[]) => {
    receivedEventIDS.forEach(updateWithEvent);
  };

  return { timeline, updateWithEvent, updateWithEventArray };
}
