/**
 * Pairing Module
 *
 * Handles dinner pairing logic including:
 * - Location assignment to matches
 * - Round-robin pairing algorithm (future)
 * - Pairing history tracking (future)
 */

export {
  assignLocationsToMatches,
  getAvailableLocations,
  isLocationAvailable,
  getLocationAssignmentSummary,
  type Location,
  type Match,
  type DinnerEvent,
} from './locationAssignment';
