import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { WebClient } from '@slack/web-api';

export async function POST(req: NextRequest) {
  try {
    const { ids, status } = await req.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('Removify');
    
    // Get the user email from cookie
    const userEmail = req.cookies.get('user-email')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // Convert string IDs to ObjectIds
    const objectIds = ids.map(id => new ObjectId(id));
    
    // Get the listings before updating to check their current status
    const listings = await db.collection('Scrapes').find({ _id: { $in: objectIds } }).toArray();
    
    // Filter for listings that are currently active
    const activeListings = listings.filter(listing => listing.status === 'active');
    const activeListingIds = activeListings.map(listing => listing._id);
    
    if (activeListingIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No active listings to update' 
      });
    }
    
    // Update the status of all active listings
    const result = await db.collection('Scrapes').updateMany(
      { _id: { $in: activeListingIds } },
      { $set: { status } }
    );
    
    // Only send Slack notification if status is changing to 'awaiting' (deletion request)
    if (status === 'awaiting') {
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
          
          // Get sources summary
          const sourceCount = activeListings.reduce((acc, listing) => {
            const source = listing.source || 'Unknown';
            acc[source] = (acc[source] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          // Format sources for message
          const sourcesText = Object.entries(sourceCount)
            .map(([source, count]) => `*${source}*: ${count}`)
            .join('\n');
          
          // ─── Prepare the message text ──────────────────────────────────────────
          const text = `🚨 *Bulk Review Deletion Request* 🚨\n\nUser *${userEmail}* has requested to delete *${activeListings.length} reviews* from the following sources:\n\n${sourcesText}`;
          
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
    
    return NextResponse.json({ 
      success: true, 
      message: `Status updated to ${status} for ${result.modifiedCount} listings` 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to update listing statuses' },
      { status: 500 }
    );
  }
}