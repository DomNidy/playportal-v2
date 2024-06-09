/**
 * The status our timeline events can be
 */
type TimelineEventStatuses = "pending" | "error" | "success" | "cancelled";

/**
 * Represents an event that our timeline is expecting to occur
 *
 * EventIDS should be a literal union type that contains all possible events our timeline can receive
 * For instance, we might have the literal union `upload_success` | `download_success` | `upload_fail` | `download_fail`
 *
 * Each `ExpectedTimelineEvent` has it's own state, so we use the EventIDS union to map the event state to the TimelineEventState
 * This is needed because any event that can fail in a system, has multiple outcomes (success or failure, etc.), so what we are
 * doing here with the ExpectedTimelineEvent is creating a container that encapsulates an event itsself with its outcomes.
 */
type ExpectedTimelineEvent<EventIDS> = {
  /**
   * When we receive an event with the status code equal to the successCode, this event is concered successfully completed
   */
  successCode: EventIDS;
  /**
   * When we receive an event with the satus code equal to the errorCode, this event is concered successfully completed
   */
  errorCode: EventIDS;
  /**
   * Message to display to the user when this event has been successfully completed
   */
  successDisplayMessage: string;
  /**
   * Message to display to the user when this event has been successfully completed
   */
  errorDisplayMessage: string;
  /**
   * Message to display to the user when this event has not received any state update
   */
  pendingDisplayMessage: string;
};

/**
 * A `TimelineEvent` is a type returned by `useTimeline`, it models the current state of an event in the timeline.
 *
 * **Note**: Each `ExpectedTimelineEvent` has a corresponding `TimelineEvent`
 */
type TimelineEvent = {
  /**
   * Represents the state of this event on the timeline
   */
  state: TimelineEventStatuses;
  /**
   * Message we should show to the user for this event
   *
   * This is determined by the messages passed to the `ExpectedTimelineEvent` that this event is derivative of
   */
  displayMessage: string;
};

/**
 * The return type of the useTimeline hook
 *
 * ExternalEventType: The type of the events we will pass into our timeline
 */
type UseTimelineReturn<EventIDS> = {
  // The current state of the timeline, can be used to display the messages and whatnot
  timeline: TimelineEvent[];
  /**
   * Function that updates the state of the timeline by acknowleding the passed event has occured
   *
   * @param receivedEventID The identifier associated with the event that occured from our external system (i.e. 'upload_fail', 'upload_success', etc..)
   *
   */
  updateWithEvent: (receivedEventID: EventIDS) => void;
};

/**
 * Parameters passed to `useTimeline`
 *
 * EventIDS: EventIDS should be a literal union type that contains all possible events our timeline can receive
 * For instance, we might have the literal union `upload_success` | `download_success` | `upload_fail` | `download_fail`
 */
type UseTimelineProps<EventIDS> = {
  /**
   * This array contains events in our timeline, **chronologically ordered by when they are expected to occur**.
   *
   * ### For example
   * Consider the Timeline indicating the status of a video upload to YouTube (we are assuming that the upload video process is entirely synchronus)
   *
   * When you upload a video, first you will need to actual upload the video to the server, then the server will need to process that video,
   * after the processing is done, the video will then be scanned for DMCA violations, then eventually published to a youtube channel
   *
   * In that case, our expected timeline of this video upload operation as a whole might be:
   * 1. Upload the video
   * 2. Process the video
   * 3. Scan for DMCA violations
   * 4. Publish to channel
   *
   * So you should make a ExpectedTimelineEvent for each step in that process, then pass those here in an array (ordered chronologically by when they are expected to occur)
   */
  expectedTimeline: ExpectedTimelineEvent<EventIDS>[];
  /**
   * Function called when our timeline receives an event id that is not in the `expectedTimeline`
   *
   * This might happen when you don't define an `ExpectedTimelineEvent` for all events in your `EventIDS`.
   *
   * **Note**: Make sure your `EventIDS` contains event identifiers for all events your external system can produce
   */
  onUnexpectedEventReceived?: (unexpectedEventID: EventIDS) => void;
};

export type {
  ExpectedTimelineEvent,
  UseTimelineProps,
  UseTimelineReturn,
  TimelineEvent,
  TimelineEventStatuses,
};
