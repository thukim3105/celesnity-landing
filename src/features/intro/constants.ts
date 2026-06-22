/** Intro phase durations (ms). Total ≈ 3.4s, skippable on click. */
export const T_SWEEP = 1350; // the star crosses; the word is revealed in its wake, in step
export const T_HOLD = 450; // the wordmark glows for a beat
export const T_FLYREVEAL = 1200; // the word flies to the logo while the page reveals in step

/**
 * Window event that re-triggers the intro overlay. Dispatched when the user
 * clicks the "About Us" tab while already on the home page (a same-route hash
 * navigation that wouldn't otherwise remount the overlay).
 */
export const REPLAY_INTRO_EVENT = "celesnity:replay-intro";
