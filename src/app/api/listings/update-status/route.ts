import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { WebClient } from '@slack/web-api';

export async function POST(req: NextRequest) {
  try {
    const { id, status, bulkOperation = false } = await req.json();
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('Removify');
    
    // Get the user email from cookie
    const userEmail = req.cookies.get('user-email')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // Get the listing before updating to check if status is changing from active to awaiting/deleted
    const listing = await db.collection('Scrapes').findOne({ _id: new ObjectId(id) });
    const oldStatus = listing?.status || '';
    
    // Update the status of the listing
    const result = await db.collection('Scrapes').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    // Only send Slack notification if this is not part of a bulk operation
    // and status is changing from active to awaiting (deletion request)
    if (!bulkOperation && oldStatus === 'active' && status === 'awaiting') {
      // Get the listing details for the notification
      const updatedListing = await db.collection('Scrapes').findOne({ _id: new ObjectId(id) });
      
      // ─── Pull Slack bot token & channel ID from environment ────────────────
      const botToken = process.env.SLACK_BOT_TOKEN;
      const channelId = process.env.SLACK_CHANNEL_ID;

      if (!botToken) {
        console.error('[ERROR] SLACK_BOT_TOKEN is not defined in environment');
        // Continue with the request even if Slack notification fails
      } else if (!channelId) {
        console.error('[ERROR] SLACK_CHANNEL_ID is not defined in environment');
        // Continue with the request even if Slack notification fails
      } else {
        try {
          // ─── Initialize Slack WebClient with bot token ──────────────────────────
          const slack = new WebClient(botToken);
          
          // ─── Prepare the message text ──────────────────────────────────────────
          const text = `🚨 *Review Deletion Request* 🚨\n\nUser *${userEmail}* has requested to delete a review from *${updatedListing?.source || 'Unknown'}*.\n\nContent: ${updatedListing?.text || updatedListing?.summary || 'No content available'}`;
          
          // ─── Send to the configured channel ────────────────────────────────────
          await slack.chat.postMessage({
            channel: channelId,
            text: text,
            unfurl_links: false,
            unfurl_media: false
          });
        } catch (error) {
          console.error('Error sending Slack message:', error);
          // Don't fail the request if notification fails
        }
      }
    }
    
    return NextResponse.json({ success: true, message: `Status updated to ${status}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to update listing status' },
      { status: 500 }
    );
  }
}