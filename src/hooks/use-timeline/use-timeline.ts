import { useCallback, useEffect, useRef, useState } from "react";
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
  const expectedTimelineEvents =
    useRef<ExpectedTimelineEvent<EventIDS>[]>(expectedTimeline);

  // * This doesn't directly effect the visually rendered content, so maybe we should ref it
  // User to store events that were initially received out of order
  const outOfOrderEvents = useRef<OutOfOrderEvent<EventIDS>[]>([]);

  const [timeline, setTimeline] = useState<TimelineEvent[]>(() =>
    getInitialTimelineEvents(expectedTimeline),
  );

  // We use this to track whether or not we should run cancelAllPending events
  // Function that updates the state of the expectedTimelineEvents by acknowleding the passed event has occured
  const updateWithEvent = useCallback((receivedEventID: EventIDS) => {
    console.log("updateWithEvent");
  }, []);

  const updateWithEventArray = useCallback(
    (receivedEventIDS: EventIDS[]) => {
      console.log("updateWithEventArray");
    },
    [updateWithEvent],
  );

  return { timeline, updateWithEventArray, updateWithEvent };
}
