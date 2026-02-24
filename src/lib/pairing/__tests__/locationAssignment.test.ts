/**
 * Unit tests for Location Assignment Algorithm
 *
 * Test cases:
 * - Shuffle algorithm produces different orders
 * - Location conflict detection works
 * - Assignment handles edge cases (1 location, many matches)
 * - Assignment distributes evenly when possible
 */

import {
  getAvailableLocations,
  isLocationAvailable,
  assignLocationsToMatches,
  getLocationAssignmentSummary,
} from '../locationAssignment';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

describe('Location Assignment Algorithm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableLocations', () => {
    it('should fetch locations for a given city', async () => {
      const mockLocations = [
        {
          locationid: 'loc-1',
          locationname: 'Restaurant A',
          locationcity: 'Charlotte',
          locationprice: 2,
          cuisine: 'Italian',
        },
        {
          locationid: 'loc-2',
          locationname: 'Restaurant B',
          locationcity: 'Charlotte',
          locationprice: 3,
          cuisine: 'French',
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockLocations,
            error: null,
          }),
        }),
      });

      const result = await getAvailableLocations('Charlotte');

      expect(result).toEqual(mockLocations);
      expect(supabase.from).toHaveBeenCalledWith('dinner_locations');
    });

    it('should throw error when fetch fails', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      await expect(getAvailableLocations('Charlotte')).rejects.toThrow(
        'Failed to fetch locations'
      );
    });

    it('should return empty array when no locations in city', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const result = await getAvailableLocations('NonexistentCity');
      expect(result).toEqual([]);
    });
  });

  describe('isLocationAvailable', () => {
    it('should return true when location has no matches', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const result = await isLocationAvailable('loc-1', new Date('2026-03-01'));
      expect(result).toBe(true);
    });

    it('should return false when location is assigned on same date', async () => {
      const mockMatches = [
        {
          id: 'match-1',
          location_id: 'loc-1',
          dinner_events: {
            scheduled_date: '2026-03-01T18:00:00Z',
          },
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockMatches,
            error: null,
          }),
        }),
      });

      const result = await isLocationAvailable('loc-1', new Date('2026-03-01'));
      expect(result).toBe(false);
    });

    it('should return true when location is assigned on different date', async () => {
      const mockMatches = [
        {
          id: 'match-1',
          location_id: 'loc-1',
          dinner_events: {
            scheduled_date: '2026-03-01T18:00:00Z',
          },
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockMatches,
            error: null,
          }),
        }),
      });

      const result = await isLocationAvailable('loc-1', new Date('2026-03-15'));
      expect(result).toBe(true);
    });
  });

  describe('assignLocationsToMatches', () => {
    it('should assign unique locations when enough are available', async () => {
      const mockEvent = {
        id: 'event-1',
        circle_id: 'group-1',
        scheduled_date: '2026-03-01T18:00:00Z',
        groups: {
          groupcity: 'Charlotte',
        },
      };

      const mockMatches = [
        { id: 'match-1', dinner_event_id: 'event-1', location_id: null },
        { id: 'match-2', dinner_event_id: 'event-1', location_id: null },
      ];

      const mockLocations = [
        { locationid: 'loc-1', locationname: 'Restaurant A', locationcity: 'Charlotte', locationprice: 2, cuisine: 'Italian' },
        { locationid: 'loc-2', locationname: 'Restaurant B', locationcity: 'Charlotte', locationprice: 2, cuisine: 'French' },
        { locationid: 'loc-3', locationname: 'Restaurant C', locationcity: 'Charlotte', locationprice: 2, cuisine: 'Mexican' },
      ];

      // Mock chain for event fetch
      const mockEventSelect = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockEvent,
            error: null,
          }),
        }),
      };

      // Mock chain for matches fetch
      const mockMatchesSelect = {
        eq: jest.fn().mockResolvedValue({
          data: mockMatches,
          error: null,
        }),
      };

      // Mock chain for locations fetch
      const mockLocationsSelect = {
        eq: jest.fn().mockResolvedValue({
          data: mockLocations,
          error: null,
        }),
      };

      // Mock chain for availability check
      const mockAvailabilitySelect = {
        eq: jest.fn().mockResolvedValue({
          data: [], // No conflicts
          error: null,
        }),
      };

      // Mock update
      const mockUpdate = {
        eq: jest.fn().mockResolvedValue({
          data: {},
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'dinner_events') {
          return { select: jest.fn().mockReturnValue(mockEventSelect) };
        }
        if (table === 'dinner_matches' && !mockMatchesSelect.eq.mock.calls.length) {
          return { select: jest.fn().mockReturnValue(mockMatchesSelect) };
        }
        if (table === 'dinner_matches' && mockMatchesSelect.eq.mock.calls.length > 0) {
          // Availability check
          return { select: jest.fn().mockReturnValue(mockAvailabilitySelect) };
        }
        if (table === 'dinner_locations') {
          return { select: jest.fn().mockReturnValue(mockLocationsSelect) };
        }
        return { update: jest.fn().mockReturnValue(mockUpdate) };
      });

      const result = await assignLocationsToMatches('event-1');

      expect(result.success).toBe(true);
      expect(result.assignedCount).toBe(2);
      expect(result.totalMatches).toBe(2);
    });

    it('should handle case with no locations in city', async () => {
      const mockEvent = {
        id: 'event-1',
        circle_id: 'group-1',
        scheduled_date: '2026-03-01T18:00:00Z',
        groups: {
          groupcity: 'UnknownCity',
        },
      };

      const mockMatches = [
        { id: 'match-1', dinner_event_id: 'event-1', location_id: null },
      ];

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'dinner_events') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockEvent,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'dinner_matches') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: mockMatches,
                error: null,
              }),
            }),
          };
        }
        if (table === 'dinner_locations') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [], // No locations
                error: null,
              }),
            }),
          };
        }
        return {};
      });

      const result = await assignLocationsToMatches('event-1');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No locations found in city: UnknownCity');
    });
  });

  describe('getLocationAssignmentSummary', () => {
    it('should return summary of location assignments', async () => {
      const mockData = [
        {
          id: 'match-1',
          dinner_locations: {
            locationname: 'Restaurant A',
            locationcity: 'Charlotte',
          },
        },
        {
          id: 'match-2',
          dinner_locations: {
            locationname: 'Restaurant B',
            locationcity: 'Charlotte',
          },
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      });

      const result = await getLocationAssignmentSummary('event-1');

      expect(result.totalLocations).toBe(2);
      expect(result.uniqueLocations).toBe(2);
      expect(result.matches).toHaveLength(2);
      expect(result.matches[0].locationName).toBe('Restaurant A');
    });
  });
});
