import { supabase } from './supabase';
import { getSecureRandomIndex } from './crypto';
import { logger } from './logger';

export interface PairResult {
  person1: {
    userid: string;
    username: string;
  };
  person2: {
    userid: string;
    username: string;
  };
  person3?: {
    userid: string;
    username: string;
  };
  dinnerID: string;
  location?: {
    locationID: string;
    locationName: string;
    locationCity: string;
  };
}

/**
 * Server-side pairing generation service
 * Generates dinner pairs for a group using the same algorithm as the client hook
 */
export async function generatePairsForGroup(groupId: string): Promise<PairResult[]> {
  try {
    logger.info('Starting pairing algorithm', { groupId });

    // Step 1: Get group details to find the city
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('groupcity')
      .eq('groupid', groupId)
      .single();

    if (groupError) throw groupError;
    const groupCity = groupData?.groupcity;

    logger.info('Retrieved group details', { groupId, groupCity });

    // Step 2: Get all group members
    const { data: members, error: membersError } = await supabase
      .from('peoplegroup')
      .select(`
        users_userid,
        people:users_userid (
          userid,
          username
        )
      `)
      .eq('groups_groupid', groupId);

    if (membersError) throw membersError;

    // Edge case: No members
    if (!members || members.length === 0) {
      logger.error('Cannot generate pairs: no members in group', { groupId });
      throw new Error('Cannot generate pairs: This group has no members.');
    }

    // Edge case: Single member
    if (members.length === 1) {
      logger.error('Cannot generate pairs: only one member', { groupId, memberCount: 1 });
      throw new Error('Cannot generate pairs: This group only has 1 member.');
    }

    logger.info('Retrieved group members', { groupId, memberCount: members.length });

    // Step 3: Get available dinner locations (filtered by group city)
    let locationsQuery = supabase
      .from('dinner_locations')
      .select('locationid, locationname, locationcity');

    // Only filter by city if the group has a city set
    if (groupCity) {
      locationsQuery = locationsQuery.eq('locationcity', groupCity);
    }

    const { data: locations, error: locationsError } = await locationsQuery;

    if (locationsError) {
      logger.warn('Failed to fetch locations', { groupId, errorMessage: locationsError.message });
    }

    logger.info('Retrieved dinner locations', {
      groupId,
      locationCount: locations?.length || 0,
      city: groupCity || 'all cities'
    });

    // Step 4: Get pairing history from new tables (flat queries — no nested joins)
    const { data: groupEvents } = await supabase
      .from('dinner_events')
      .select('id')
      .eq('circle_id', groupId);

    let history: { user_id: string; match_id: string }[] | null = null;
    let historyError = null;

    if (groupEvents && groupEvents.length > 0) {
      const groupEventIds = groupEvents.map(e => e.id as string);

      const { data: groupMatches } = await supabase
        .from('dinner_matches')
        .select('id')
        .in('dinner_event_id', groupEventIds);

      if (groupMatches && groupMatches.length > 0) {
        const groupMatchIds = groupMatches.map(m => m.id as string);
        const { data: guests, error: guestsError } = await supabase
          .from('dinner_match_guests')
          .select('user_id, match_id')
          .in('match_id', groupMatchIds);

        history = guests as { user_id: string; match_id: string }[] | null;
        historyError = guestsError;
      }
    }

    if (historyError) {
      logger.warn('Failed to fetch pairing history', { groupId, errorMessage: (historyError as { message: string }).message });
    }

    logger.info('Retrieved pairing history', { groupId, historyCount: history?.length || 0 });

    // Build pairing history map: matchId → [userIds]
    const matchGroups = new Map<string, string[]>();
    history?.forEach(record => {
      const matchId = record.match_id;
      if (!matchGroups.has(matchId)) {
        matchGroups.set(matchId, []);
      }
      matchGroups.get(matchId)!.push(record.user_id);
    });

    // Track who has eaten together
    const eatenTogether = new Set<string>();
    matchGroups.forEach(attendees => {
      for (let i = 0; i < attendees.length; i++) {
        for (let j = i + 1; j < attendees.length; j++) {
          const pair = [attendees[i], attendees[j]].sort().join('|');
          eatenTogether.add(pair);
        }
      }
    });

    logger.info('Calculated existing pairings', { groupId, existingPairCount: eatenTogether.size });

    // Step 5: Create a single dinner_event for this run
    const dinnerDate = new Date();
    dinnerDate.setDate(dinnerDate.getDate() + 7); // 1 week from now

    const { data: dinnerEvent, error: eventError } = await supabase
      .from('dinner_events')
      .insert({
        circle_id: groupId,
        scheduled_date: dinnerDate.toISOString(),
      })
      .select('id')
      .single();

    if (eventError) {
      logger.error('Failed to create dinner_event', { groupId, errorMessage: eventError.message });
      throw eventError;
    }

    const dinnerEventId = dinnerEvent.id;

    // Step 6: Generate optimal pairs
    const userList = members.map(m => ({
      userid: m.users_userid,
      username: (m.people as { username?: string } | null)?.username ?? 'Unknown'
    }));

    const pairs: PairResult[] = [];
    const paired = new Set<string>();

    // Greedy algorithm: pair people who haven't eaten together
    for (let i = 0; i < userList.length; i++) {
      if (paired.has(userList[i].userid)) continue;

      let bestMatch = null;
      for (let j = i + 1; j < userList.length; j++) {
        if (paired.has(userList[j].userid)) continue;

        const pairKey = [userList[i].userid, userList[j].userid].sort().join('|');
        if (!eatenTogether.has(pairKey)) {
          bestMatch = j;
          break;
        }
      }

      if (bestMatch !== null) {
        // Pick a random location for this match
        const assignedLocationId = locations && locations.length > 0
          ? locations[getSecureRandomIndex(locations.length)].locationid
          : null;

        // Create a dinner_match for this pair
        const { data: newMatch, error: matchError } = await supabase
          .from('dinner_matches')
          .insert({
            dinner_event_id: dinnerEventId,
            status: 'pending',
            location_id: assignedLocationId,
          })
          .select('id')
          .single();

        if (matchError) {
          logger.error('Failed to create dinner_match', { groupId, errorMessage: matchError.message });
          throw matchError;
        }

        const matchId = newMatch.id;

        // Get location details if assigned
        let locationDetails = undefined;
        if (assignedLocationId && locations) {
          const loc = locations.find(l => l.locationid === assignedLocationId);
          if (loc) {
            locationDetails = {
              locationID: loc.locationid,
              locationName: loc.locationname,
              locationCity: loc.locationcity
            };
          }
        }

        const pairMembers = [userList[i], userList[bestMatch]];

        // Insert dinner_match_guests for each person
        await supabase
          .from('dinner_match_guests')
          .insert(pairMembers.map(p => ({ match_id: matchId, user_id: p.userid })));

        // Insert dinner_invites for each person
        await supabase
          .from('dinner_invites')
          .insert(pairMembers.map(p => ({
            dinner_event_id: dinnerEventId,
            user_id: p.userid,
            status: 'pending',
          })));

        const pairResult: PairResult = {
          person1: userList[i],
          person2: userList[bestMatch],
          dinnerID: matchId,
          location: locationDetails
        };

        pairs.push(pairResult);
        paired.add(userList[i].userid);
        paired.add(userList[bestMatch].userid);

        logger.info('Created dinner pair', {
          groupId,
          matchId,
          location: locationDetails?.locationName || 'TBD'
        });
      }
    }

    // Handle unpaired people (odd number) — add to last match
    const unpaired = userList.filter(u => !paired.has(u.userid));
    if (unpaired.length > 0 && pairs.length > 0) {
      const lastPair = pairs[pairs.length - 1];
      lastPair.person3 = unpaired[0];

      await supabase
        .from('dinner_match_guests')
        .insert({ match_id: lastPair.dinnerID, user_id: unpaired[0].userid });

      await supabase
        .from('dinner_invites')
        .insert({
          dinner_event_id: dinnerEventId,
          user_id: unpaired[0].userid,
          status: 'pending',
        });

      logger.info('Added unpaired member to group of 3', { groupId, matchId: lastPair.dinnerID });
    }

    logger.info('Pairing algorithm completed successfully', { groupId, pairCount: pairs.length });

    return pairs;

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Pairing algorithm failed', { groupId, errorMessage });
    throw err;
  }
}

/**
 * Determines if a group needs new pairings based on its cadence
 */
export async function shouldGeneratePairings(groupId: string): Promise<boolean> {
  try {
    // Get group's cadence setting
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('dinner_cadence')
      .eq('groupid', groupId)
      .single();

    if (groupError || !group) {
      logger.warn('Failed to fetch group cadence', { groupId, error: groupError });
      return false;
    }

    const cadence = group.dinner_cadence;
    if (!cadence) {
      logger.info('Group has no cadence set, skipping', { groupId });
      return false;
    }

    // Get the most recent dinner_event for this group
    const { data: recentEvent, error: eventError } = await supabase
      .from('dinner_events')
      .select('scheduled_date')
      .eq('circle_id', groupId)
      .order('scheduled_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (eventError) {
      logger.warn('Failed to fetch recent dinner events', { groupId, error: eventError });
    }

    const now = new Date();

    // If no previous events, generate pairings
    if (!recentEvent) {
      logger.info('No previous dinner events found, should generate pairings', { groupId });
      return true;
    }

    const lastDinnerDate = new Date(recentEvent.scheduled_date);
    const daysSinceLastDinner = Math.floor((now.getTime() - lastDinnerDate.getTime()) / (1000 * 60 * 60 * 24));

    logger.info('Checking cadence', { groupId, cadence, daysSinceLastDinner });

    // Determine if we should generate based on cadence
    switch (cadence) {
      case 'biweekly':
        return daysSinceLastDinner >= 14;
      case 'monthly':
        return daysSinceLastDinner >= 30;
      case 'quarterly':
        return daysSinceLastDinner >= 90;
      default:
        logger.warn('Unknown cadence type', { groupId, cadence });
        return false;
    }
  } catch (err) {
    logger.error('Error checking if should generate pairings', { groupId, error: err });
    return false;
  }
}
