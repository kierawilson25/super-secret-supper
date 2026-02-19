/**
 * Location Assignment Algorithm
 *
 * Assigns restaurant locations to dinner matches, ensuring:
 * 1. No two matches on the same date go to the same location (when possible)
 * 2. Random distribution across available locations
 * 3. Graceful handling when more matches than available locations
 *
 * Future enhancements:
 * - Filter by price range preference
 * - Filter by cuisine preference
 * - Weight by member preferences
 */

import { supabase } from '@/lib/supabase';

export interface Location {
  locationid: string;
  locationname: string;
  locationcity: string;
  locationprice: number | null;
  cuisine: string | null;
}

export interface Match {
  id: string;
  dinner_event_id: string;
  location_id: string | null;
}

export interface DinnerEvent {
  id: string;
  circle_id: string;
  scheduled_date: string | null;
}

interface LocationAssignmentResult {
  success: boolean;
  assignedCount: number;
  totalMatches: number;
  reusedLocations: boolean;
  errors: string[];
}

/**
 * Shuffles array in place using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get available locations in a city
 *
 * @param city - City name to filter by
 * @param priceRange - Optional price range filter (future enhancement)
 * @param cuisinePreference - Optional cuisine filter (future enhancement)
 */
export async function getAvailableLocations(
  city: string,
  priceRange?: { min: number; max: number },
  cuisinePreference?: string[]
): Promise<Location[]> {
  let query = supabase
    .from('dinner_locations')
    .select('*')
    .eq('locationcity', city);

  // Future enhancement: price range filter
  if (priceRange) {
    query = query
      .gte('locationprice', priceRange.min)
      .lte('locationprice', priceRange.max);
  }

  // Future enhancement: cuisine preference filter
  if (cuisinePreference && cuisinePreference.length > 0) {
    query = query.in('cuisine', cuisinePreference);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch locations: ${error.message}`);
  }

  return data || [];
}

/**
 * Check if a location is already assigned to another match on the same date
 */
export async function isLocationAvailable(
  locationId: string,
  date: Date
): Promise<boolean> {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

  const { data, error } = await supabase
    .from('dinner_matches')
    .select(`
      id,
      location_id,
      dinner_events:dinner_event_id (
        scheduled_date
      )
    `)
    .eq('location_id', locationId);

  if (error) {
    throw new Error(`Failed to check location availability: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return true; // No matches assigned to this location
  }

  // Check if any match with this location is on the same date
  const hasConflict = data.some((match: any) => {
    const event = Array.isArray(match.dinner_events)
      ? match.dinner_events[0]
      : match.dinner_events;

    if (!event?.scheduled_date) return false;

    const matchDate = new Date(event.scheduled_date).toISOString().split('T')[0];
    return matchDate === dateStr;
  });

  return !hasConflict;
}

/**
 * Assign locations to all matches for a dinner event
 *
 * Algorithm:
 * 1. Get all matches for the event
 * 2. Get available locations in the group's city
 * 3. Shuffle locations for random distribution
 * 4. For each match:
 *    - Try to assign an available location (no conflict on same date)
 *    - If all locations have conflicts, reuse a location
 * 5. Update database with assignments
 */
export async function assignLocationsToMatches(
  dinnerEventId: string
): Promise<LocationAssignmentResult> {
  const result: LocationAssignmentResult = {
    success: false,
    assignedCount: 0,
    totalMatches: 0,
    reusedLocations: false,
    errors: [],
  };

  try {
    // 1. Get dinner event details
    const { data: event, error: eventError } = await supabase
      .from('dinner_events')
      .select(`
        id,
        circle_id,
        scheduled_date,
        groups:circle_id (
          groupcity
        )
      `)
      .eq('id', dinnerEventId)
      .single();

    if (eventError || !event) {
      result.errors.push(`Failed to fetch event: ${eventError?.message || 'Event not found'}`);
      return result;
    }

    const eventData = event as any;
    const city = Array.isArray(eventData.groups)
      ? eventData.groups[0]?.groupcity
      : eventData.groups?.groupcity;

    if (!city) {
      result.errors.push('Event group has no city specified');
      return result;
    }

    const scheduledDate = eventData.scheduled_date
      ? new Date(eventData.scheduled_date)
      : new Date();

    // 2. Get all matches for this event
    const { data: matches, error: matchesError } = await supabase
      .from('dinner_matches')
      .select('id, dinner_event_id, location_id')
      .eq('dinner_event_id', dinnerEventId);

    if (matchesError) {
      result.errors.push(`Failed to fetch matches: ${matchesError.message}`);
      return result;
    }

    if (!matches || matches.length === 0) {
      result.errors.push('No matches found for this event');
      return result;
    }

    result.totalMatches = matches.length;

    // 3. Get available locations in the city
    const locations = await getAvailableLocations(city);

    if (locations.length === 0) {
      result.errors.push(`No locations found in city: ${city}`);
      return result;
    }

    // 4. Shuffle locations for random distribution
    const shuffledLocations = shuffleArray(locations);

    // 5. Assign locations to matches
    const assignments: { matchId: string; locationId: string }[] = [];
    const usedLocations = new Set<string>();

    for (const match of matches) {
      let assignedLocationId: string | null = null;

      // Try to find an available location (no conflict)
      for (const location of shuffledLocations) {
        const isAvailable = await isLocationAvailable(
          location.locationid,
          scheduledDate
        );

        if (isAvailable) {
          assignedLocationId = location.locationid;
          usedLocations.add(location.locationid);
          break;
        }
      }

      // If no available location found, reuse one (least used first)
      if (!assignedLocationId) {
        result.reusedLocations = true;
        // Pick the first location (or implement more sophisticated reuse logic)
        assignedLocationId = shuffledLocations[0].locationid;
      }

      assignments.push({
        matchId: match.id,
        locationId: assignedLocationId,
      });
    }

    // 6. Update database with all assignments
    const updatePromises = assignments.map(({ matchId, locationId }) =>
      supabase
        .from('dinner_matches')
        .update({ location_id: locationId })
        .eq('id', matchId)
    );

    const updateResults = await Promise.all(updatePromises);

    // Check for errors
    const failedUpdates = updateResults.filter(({ error }) => error);
    if (failedUpdates.length > 0) {
      result.errors.push(
        `Failed to update ${failedUpdates.length} matches: ${failedUpdates[0].error?.message}`
      );
      result.assignedCount = assignments.length - failedUpdates.length;
    } else {
      result.assignedCount = assignments.length;
      result.success = true;
    }

    return result;
  } catch (error) {
    result.errors.push(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
    return result;
  }
}

/**
 * Get location assignment summary for an event
 * Useful for admin preview before sending invites
 */
export async function getLocationAssignmentSummary(
  dinnerEventId: string
): Promise<{
  matches: Array<{
    matchId: string;
    locationName: string;
    locationAddress: string;
  }>;
  totalLocations: number;
  uniqueLocations: number;
}> {
  const { data, error } = await supabase
    .from('dinner_matches')
    .select(`
      id,
      dinner_locations:location_id (
        locationname,
        locationcity
      )
    `)
    .eq('dinner_event_id', dinnerEventId);

  if (error) {
    throw new Error(`Failed to fetch assignment summary: ${error.message}`);
  }

  const matches = (data || []).map((match: any) => {
    const location = Array.isArray(match.dinner_locations)
      ? match.dinner_locations[0]
      : match.dinner_locations;

    return {
      matchId: match.id,
      locationName: location?.locationname || 'Not assigned',
      locationAddress: location?.locationcity || '',
    };
  });

  const locationIds = new Set(
    data?.map((m: any) => {
      const loc = Array.isArray(m.dinner_locations)
        ? m.dinner_locations[0]
        : m.dinner_locations;
      return loc?.locationname;
    }).filter(Boolean) || []
  );

  return {
    matches,
    totalLocations: data?.length || 0,
    uniqueLocations: locationIds.size,
  };
}
