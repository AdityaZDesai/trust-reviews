// File: src/app/api/slack/oauth/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { WebClient } from '@slack/web-api';
import clientPromise from '@/lib/mongodb';

async function getEmailFromRequest(req: NextRequest): Promise<string | null> {
  // Get email from cookie and remove any spaces
  let email = req.cookies.get('user-email')?.value || null;
  
  // Remove spaces if email exists
  if (email) {
    email = email.replace(/\s+/g, '');
    console.log('DEBUG - Email after removing spaces:', email);
  }
  
  console.log('DEBUG - Cookie email value:', email);
  
  // Also check session cookie
  const sessionCookie = req.cookies.get('session')?.value;
  console.log('DEBUG - Session cookie exists:', !!sessionCookie);
  
  // Check all cookies for debugging
  console.log('DEBUG - All cookies:', req.cookies.getAll().map(c => c.name));
  
  return email;
}

export async function GET(request: NextRequest) {
  console.log('DEBUG - Slack OAuth callback started');
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    console.log('DEBUG - URL params:', { 
      code: code ? 'exists' : 'missing', 
      state: state ? 'exists' : 'missing',
      fullUrl: request.url
    });

    if (!code || !state) {
      console.log('DEBUG - Missing required parameters');
      return NextResponse.redirect(
        `/dashboard?slackError=missing_params`
      );
    }

    // 1. Retrieve logged-in user's email (tie Slack install to your user)
    let userEmail = await getEmailFromRequest(request);
    console.log('DEBUG - User email from request:', userEmail);
    
    if (!userEmail) {
      console.log('DEBUG - User not authenticated, no email found');
      return NextResponse.redirect(
        `/dashboard?slackError=not_authenticated`
      );
    }
    
    // Ensure email has no spaces for database matching
    userEmail = userEmail.replace(/\s+/g, '');
    console.log('DEBUG - Normalized user email for DB lookup:', userEmail);

    // 2. Perform the OAuth token exchange manually
    console.log('DEBUG - Starting OAuth token exchange');
    const client = new WebClient(); 
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/slack/oauth/callback`;
    console.log('DEBUG - Redirect URI:', redirectUri);

    console.log('DEBUG - OAuth params:', { 
      client_id: process.env.SLACK_CLIENT_ID ? 'exists' : 'missing',
      client_secret: process.env.SLACK_CLIENT_SECRET ? 'exists' : 'missing',
      redirect_uri: redirectUri
    });

    const oauthResult = await client.oauth.v2.access({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
    });

    console.log('DEBUG - OAuth result:', { 
      ok: oauthResult.ok, 
      team: oauthResult.team?.name,
      teamId: oauthResult.team?.id,
      botId: oauthResult.bot_user_id,
      hasWebhook: !!oauthResult.incoming_webhook
    });

    if (!oauthResult.ok) {
      console.error('DEBUG - Slack OAuth error:', oauthResult.error);
      return NextResponse.redirect(
        `/dashboard?slackError=oauth_failed`
      );
    }

    // 3. Extract essential installation details
    const teamId = oauthResult.team?.id;
    const botToken = oauthResult.access_token;            // bot token
    const botUserId = oauthResult.bot_user_id;
    const incomingWebhookUrl = oauthResult.incoming_webhook?.url; 
    
    console.log('DEBUG - Extracted details:', { 
      teamId, 
      botUserId,
      hasToken: !!botToken,
      hasWebhook: !!incomingWebhookUrl 
    });

    // 4. Save to MongoDB under Users.Slack_Notifications
    console.log('DEBUG - Connecting to MongoDB');
    const mongoClient = await clientPromise;
    const dbName = process.env.MONGODB_DB_NAME || 'Removify';
    console.log('DEBUG - Using database:', dbName);
    const db = mongoClient.db(dbName);

    const slackNotifs = {
      teamId,
      botToken,
      botUserId,
      incomingWebhookUrl: incomingWebhookUrl || null,
      authedUserId: oauthResult.authed_user?.id || null,
      installedAt: new Date(),
    };
    
    console.log('DEBUG - Slack notification data prepared');
    
    // First, check if the user exists and if they have Slack_Notifications
    console.log('DEBUG - Looking for existing user with email:', userEmail);
    const existingUser = await db.collection('Users').findOne({ email: userEmail });
    console.log('DEBUG - Existing user found:', !!existingUser);
    
    if (!existingUser) {
      // Try case-insensitive search as fallback
      console.log('DEBUG - Trying case-insensitive email search');
      const caseInsensitiveUser = await db.collection('Users').findOne({
        email: { $regex: new RegExp('^' + userEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
      });
      console.log('DEBUG - Case-insensitive user found:', !!caseInsensitiveUser);
      
      if (caseInsensitiveUser) {
        console.log('DEBUG - Using case-insensitive matched email:', caseInsensitiveUser.email);
        userEmail = caseInsensitiveUser.email; // Use the exact email from DB for the update
      }
    }
    
    console.log('DEBUG - User has Slack_Notifications:', existingUser ? !!existingUser.Slack_Notifications : 'N/A');
    
    // Prepare the update operation based on whether Slack_Notifications exists
    let updateOperation;
    if (existingUser && existingUser.Slack_Notifications) {
      console.log('DEBUG - Updating existing Slack_Notifications');
      updateOperation = {
        $set: {
          'Slack_Notifications.teamId': teamId,
          'Slack_Notifications.botToken': botToken,
          'Slack_Notifications.botUserId': botUserId,
          'Slack_Notifications.incomingWebhookUrl': incomingWebhookUrl || null,
          'Slack_Notifications.authedUserId': oauthResult.authed_user?.id || null,
          'Slack_Notifications.updatedAt': new Date(),
          slackConnected: true,
          slackTeamId: teamId,
          updatedAt: new Date(),
        }
      };
    } else {
      console.log('DEBUG - Creating new Slack_Notifications');
      updateOperation = {
        $set: {
          Slack_Notifications: slackNotifs,
          slackConnected: true,
          slackTeamId: teamId,
          updatedAt: new Date(),
        }
      };
    }
    
    console.log('DEBUG - Update operation prepared:', JSON.stringify(updateOperation));

    // Upsert by email to match your existing schema
    console.log('DEBUG - Executing MongoDB update for user:', userEmail);
    const updateResult = await db.collection('Users').updateOne(
      { email: userEmail },
      updateOperation,
      { upsert: false }  // set to true if you want to create a new user-document stub
    );
    
    console.log('DEBUG - MongoDB update result:', { 
      matched: updateResult.matchedCount,
      modified: updateResult.modifiedCount,
      upserted: updateResult.upsertedCount,
      upsertedId: updateResult.upsertedId
    });

    if (updateResult.matchedCount === 0) {
      console.log('DEBUG - WARNING: No user document matched the email:', userEmail);
      console.log('DEBUG - Consider enabling upsert or checking email value');
    }

    // 5. Redirect back to your dashboard with a success flag
    console.log('DEBUG - Redirecting to dashboard with success');
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?slackConnected=true`
    );
  } catch (err) {
    console.error('DEBUG - Slack OAuth callback error:', err);
    // Log the full error details
    if (err instanceof Error) {
      console.error('DEBUG - Error name:', err.name);
      console.error('DEBUG - Error message:', err.message);
      console.error('DEBUG - Error stack:', err.stack);
    } else {
      console.error('DEBUG - Unknown error type:', typeof err);
    }
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?slackError=exception`
    );
  }
}
