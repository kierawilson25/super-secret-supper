# Pairing Module

This module handles all logic related to dinner pairings and location assignments.

## Location Assignment

### Overview

The location assignment algorithm assigns restaurant locations to dinner matches, ensuring:
1. **No conflicts**: Two matches on the same date don't go to the same location (when possible)
2. **Random distribution**: Locations are shuffled for fair distribution
3. **Graceful fallback**: If more matches than locations, allows reuse

### Usage

```typescript
import { assignLocationsToMatches, getLocationAssignmentSummary } from '@/lib/pairing';

// After generating pairings, assign locations
const result = await assignLocationsToMatches(dinnerEventId);

if (result.success) {
  console.log(`Assigned ${result.assignedCount}/${result.totalMatches} matches`);

  if (result.reusedLocations) {
    console.warn('Some locations were reused due to limited availability');
  }

  // Get summary for admin preview
  const summary = await getLocationAssignmentSummary(dinnerEventId);
  console.log(`Using ${summary.uniqueLocations} unique locations`);
} else {
  console.error('Assignment failed:', result.errors);
}
```

### API Reference

#### `assignLocationsToMatches(dinnerEventId: string)`

Assigns locations to all matches for a dinner event.

**Parameters:**
- `dinnerEventId` - UUID of the dinner event

**Returns:** `LocationAssignmentResult`
```typescript
{
  success: boolean;           // True if all matches assigned
  assignedCount: number;       // Number of successfully assigned matches
  totalMatches: number;        // Total number of matches
  reusedLocations: boolean;    // True if any location was reused
  errors: string[];            // Array of error messages (if any)
}
```

**Algorithm:**
1. Fetch dinner event and group city
2. Fetch all matches for the event
3. Query available locations in the city
4. Shuffle locations randomly
5. For each match:
   - Check if location is available (no conflict on same date)
   - Assign first available location
   - If none available, reuse a location
6. Update `dinner_matches.location_id` in database

---

#### `getAvailableLocations(city: string, priceRange?, cuisinePreference?)`

Fetches available restaurant locations in a city.

**Parameters:**
- `city` - City name (e.g., "Charlotte")
- `priceRange` (optional) - `{ min: number, max: number }` (1-3 scale) *(future enhancement)*
- `cuisinePreference` (optional) - `string[]` of cuisine types *(future enhancement)*

**Returns:** `Location[]`
```typescript
{
  locationid: string;
  locationname: string;
  locationcity: string;
  locationprice: number | null;  // 1 = $, 2 = $$, 3 = $$$
  cuisine: string | null;
}
```

---

#### `isLocationAvailable(locationId: string, date: Date)`

Checks if a location is available (not assigned to another match on the same date).

**Parameters:**
- `locationId` - UUID of the location
- `date` - Date to check for conflicts

**Returns:** `boolean`

---

#### `getLocationAssignmentSummary(dinnerEventId: string)`

Gets a summary of location assignments for an event (useful for admin preview).

**Returns:**
```typescript
{
  matches: Array<{
    matchId: string;
    locationName: string;
    locationAddress: string;
  }>;
  totalLocations: number;      // Total matches
  uniqueLocations: number;     // Number of unique locations used
}
```

---

## Testing

Run unit tests:
```bash
npm test src/lib/pairing/__tests__/locationAssignment.test.ts
```

Test coverage includes:
- ✅ Fetching locations by city
- ✅ Conflict detection (same location, same date)
- ✅ Assignment with sufficient locations
- ✅ Assignment with limited locations (reuse)
- ✅ Edge case: no locations in city
- ✅ Summary generation

---

## Future Enhancements

### Price Range Filtering
```typescript
// Filter by price preference (1-3 scale)
const locations = await getAvailableLocations('Charlotte', { min: 1, max: 2 });
```

### Cuisine Preference
```typescript
// Filter by cuisine type
const locations = await getAvailableLocations('Charlotte', undefined, ['Italian', 'French']);
```

### Member Preference Weighting
Weight location selection based on member preferences (e.g., dietary restrictions, favorite cuisines).

### Smart Reuse
When reusing locations, prefer:
- Locations with fewest assignments
- Locations members haven't visited recently
- Locations that match member preferences

---

## Integration Points

This module is used by:
- **Issue #29** - Admin Create Pairing Flow
  - Called after pairings are generated but before invites are sent
  - Admin previews pairings with assigned locations
  - Can regenerate if needed

Example integration:
```typescript
// In admin create pairing flow
async function handleGeneratePairings() {
  // 1. Generate pairings (round-robin algorithm)
  const pairings = await generatePairings(eventId);

  // 2. Assign locations
  const locationResult = await assignLocationsToMatches(eventId);

  if (!locationResult.success) {
    showError(locationResult.errors.join(', '));
    return;
  }

  // 3. Show preview to admin
  const summary = await getLocationAssignmentSummary(eventId);
  showPairingPreview(pairings, summary);

  // 4. Admin can proceed to send invites
}
```

---

## Database Dependencies

### Tables Used
- `dinner_events` - Event details (date, group)
- `dinner_matches` - Matches to assign locations to
- `dinner_locations` - Available restaurant locations
- `groups` - Group city information

### Columns Modified
- `dinner_matches.location_id` - Updated with assigned location

### SQL Functions Used
- `check_location_date_conflict()` - Helper function from migration #26
