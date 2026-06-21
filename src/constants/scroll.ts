/**
 * Vertical path of the scroll-comet head, as ratios of the viewport height:
 *   head Y = (TOP + progress * SPAN) * innerHeight
 *
 * Shared by `ScrollProgress` (the comet) and `SectionNav` (the star rail) so
 * the markers sit exactly on the comet's path.
 */
export const COMET_TOP_RATIO = 0.12;
export const COMET_SPAN_RATIO = 0.76;
