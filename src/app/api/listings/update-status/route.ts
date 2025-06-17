import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { WebClient } from '@slack/web-api';

// Define interfaces for better type safety
interface RequestBody {
  id: string;
  status: string;
  bulkOperation?: boolean;
}

interface ScrapeListingItem {
  url: string;
  source?: string;
  status?: string;
  summary?: string;
  timestamp?: string | number;
}

interface CompanyDocument {
  customer_email: string;
  brand_name?: string;
  url?: string;
  scrape_listings?: ScrapeListingItem[];
  sales_agent?: string;
  created_at?: Date;
  scrape_count?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { id, status, bulkOperation = false } = await req.json() as RequestBody;
    
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
    
    // Find the company document by user email
    const company = await db.collection('Company').findOne({ customer_email: userEmail }) as CompanyDocument | null;
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    
    // Check if scrape_listings exists and is an array
    if (!company.scrape_listings || !Array.isArray(company.scrape_listings)) {
      return NextResponse.json({ error: 'No listings found for this company' }, { status: 404 });
    }
    
    // Find the specific listing in the scrape_listings array using URL as the primary key
    const listingIndex = company.scrape_listings.findIndex(
      (listing: ScrapeListingItem) => listing && listing.url === id
    );
    
    if (listingIndex === -1) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    // Get the old status before updating
    const oldStatus = company.scrape_listings[listingIndex].status || '';
    
    // Update the status of the listing in the scrape_listings array
    const result = await db.collection('Company').updateOne(
      { 
        customer_email: userEmail,
        'scrape_listings.url': id
      },
      { 
        $set: { 'scrape_listings.$.status': status }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Listing not found or update failed' }, { status: 404 });
    }
    
    // Only send Slack notification if this is not part of a bulk operation
    // and status is changing from active to awaiting (deletion request)
    if (!bulkOperation && oldStatus === 'active' && status === 'awaiting') {
      // Get the updated company document to get the latest listing data
      const updatedCompany = await db.collection('Company').findOne({ customer_email: userEmail }) as CompanyDocument | null;
      const updatedListing = updatedCompany?.scrape_listings?.find(
        (listing: ScrapeListingItem) => listing && listing.url === id
      );
      
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
          const text = `🚨 *Review Deletion Request* 🚨\n\nUser *${userEmail}* has requested to delete a review from *${updatedListing?.source || 'Unknown'}*.\n\nContent: ${updatedListing?.url || 'No content available'}`;
          
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