import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { WebClient } from '@slack/web-api';

interface RequestBody {
  ids: string[];
  status: string;
}

interface ScrapeListingItem {
  url: string;
  status: string;
  source?: string;
}

interface CompanyDocument {
  customer_email: string;
  scrape_listings: ScrapeListingItem[];
}

export async function POST(req: NextRequest) {
  try {
    const { ids, status } = await req.json() as RequestBody;
    
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
    
    // Find the company document
    const company = await db.collection('Company').findOne({ customer_email: userEmail }) as CompanyDocument | null;
    
    if (!company || !company.scrape_listings || company.scrape_listings.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No company data or listings found for this user' 
      });
    }
    
    // Find active listings within the company's scrape_listings that match the provided URLs
    const activeListings = company.scrape_listings.filter((listing: ScrapeListingItem) =>
      ids.includes(listing.url) && listing.status === 'active'
    );
    
    if (activeListings.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No active listings to update' 
      });
    }
    
    // Get the URLs of active listings
    const activeListingUrls = activeListings.map((listing: ScrapeListingItem) => listing.url);
    
    // Update the status in the scrape_listings array within the Company collection
    // We'll use the $[] array update operator with a filter condition
    await db.collection('Company').updateOne(
      { customer_email: userEmail },
      { $set: { "scrape_listings.$[elem].status": status } },
      { 
        arrayFilters: [{ 
          "elem.url": { $in: activeListingUrls },
          "elem.status": "active"
        }],
        upsert: false
      }
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
          const sourceCount = activeListings.reduce((acc: Record<string, number>, listing: ScrapeListingItem) => {
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
      message: `Status updated to ${status} for ${activeListings.length} listings` 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to update listing statuses' },
      { status: 500 }
    );
  }
}