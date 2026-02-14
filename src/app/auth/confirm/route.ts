import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') || '/groups';

  logger.info('Email confirmation callback received', { type, hasToken: !!token_hash });

  // Validate required parameters
  if (!token_hash || !type) {
    logger.error('Missing required parameters for email confirmation', { hasToken: !!token_hash, type });
    return NextResponse.redirect(
      new URL('/login?error=Invalid confirmation link', request.url)
    );
  }

  // Only handle email confirmation type
  if (type !== 'email') {
    logger.warn('Unsupported confirmation type', { type });
    return NextResponse.redirect(
      new URL('/login?error=Invalid confirmation type', request.url)
    );
  }

  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('Missing Supabase environment variables');
      return NextResponse.redirect(
        new URL('/login?error=Configuration error', request.url)
      );
    }

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verify the email confirmation token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'email',
    });

    if (error) {
      logger.error('Email confirmation failed', { errorMessage: error.message });
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent('Email confirmation failed. The link may have expired.')}`,
          request.url
        )
      );
    }

    if (!data.user) {
      logger.error('Email confirmation succeeded but no user returned');
      return NextResponse.redirect(
        new URL('/login?error=Confirmation failed', request.url)
      );
    }

    logger.info('Email confirmation successful', { userId: data.user.id });

    // Redirect to the next page or groups page
    return NextResponse.redirect(new URL(next, request.url));
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Email confirmation error', { errorMessage });
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('An error occurred during confirmation')}`,
        request.url
      )
    );
  }
}
