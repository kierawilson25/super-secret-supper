import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generatePairsForGroup, shouldGeneratePairings } from '@/lib/pairingService';
import { logger } from '@/lib/logger';

/**
 * Cron endpoint to automatically generate pairings for groups
 * This should be called daily by Vercel Cron or external cron service
 *
 * Security: Verifies the request comes from authorized source via CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron (or authorized source)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Starting automated pairing generation check');

    // Get all groups
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('groupid, groupname, dinner_cadence');

    if (groupsError) {
      logger.error('Failed to fetch groups', { error: groupsError });
      return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
    }

    if (!groups || groups.length === 0) {
      logger.info('No groups found');
      return NextResponse.json({ message: 'No groups to process' }, { status: 200 });
    }

    const results = [];

    // Check each group and generate pairings if needed
    for (const group of groups) {
      try {
        const shouldGenerate = await shouldGeneratePairings(group.groupid);

        if (shouldGenerate) {
          logger.info('Generating pairings for group', {
            groupId: group.groupid,
            groupName: group.groupname,
            cadence: group.dinner_cadence
          });

          const pairs = await generatePairsForGroup(group.groupid);

          results.push({
            groupId: group.groupid,
            groupName: group.groupname,
            status: 'success',
            pairsGenerated: pairs.length
          });

          logger.info('Successfully generated pairings', {
            groupId: group.groupid,
            pairCount: pairs.length
          });
        } else {
          logger.info('Skipping group - not time yet', {
            groupId: group.groupid,
            groupName: group.groupname
          });

          results.push({
            groupId: group.groupid,
            groupName: group.groupname,
            status: 'skipped',
            reason: 'Not time for next pairing based on cadence'
          });
        }
      } catch (error) {
        logger.error('Failed to generate pairings for group', {
          groupId: group.groupid,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        results.push({
          groupId: group.groupid,
          groupName: group.groupname,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    logger.info('Automated pairing generation completed', {
      totalGroups: groups.length,
      successful: results.filter(r => r.status === 'success').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length
    });

    return NextResponse.json({
      message: 'Pairing generation check completed',
      results
    }, { status: 200 });

  } catch (error) {
    logger.error('Cron job failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
