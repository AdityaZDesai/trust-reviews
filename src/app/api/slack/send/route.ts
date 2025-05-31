// File: src/app/api/slack/send-message/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { WebClient } from '@slack/web-api';

export async function POST(req: NextRequest) {
  try {
    // ─── 1) Get the logged‐in user’s email from your session cookie ───────────
    // (Adjust the cookie name and retrieval logic to match your auth setup.)
    const userEmail = req.cookies.get('user-email')?.value;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // ─── 2) Pull Slack bot token & channel ID from environment ────────────────
    const botToken  = process.env.SLACK_BOT_TOKEN;
    const channelId = process.env.SLACK_CHANNEL_ID; // e.g. "C01ABCDEF23" or "#general"

    if (!botToken) {
      console.error('[ERROR] SLACK_BOT_TOKEN is not defined in environment');
      return NextResponse.json(
        { error: 'Slack bot token not configured' },
        { status: 500 }
      );
    }
    if (!channelId) {
      console.error('[ERROR] SLACK_CHANNEL_ID is not defined in environment');
      return NextResponse.json(
        { error: 'Slack channel not configured' },
        { status: 500 }
      );
    }

    // ─── 3) Parse request body (require at least "text") ───────────────────────
    const { text, username, icon_url } = await req.json();
    if (!text) {
      return NextResponse.json(
        { error: 'Missing required field: text' },
        { status: 400 }
      );
    }

    // ─── 4) Initialize Slack WebClient with bot token ──────────────────────────
    const slack = new WebClient(botToken);

    // ─── 5) Prefix the message with the user’s email from session ──────────────
    // You can format any way you like; here we simply prepend:
    const finalText = `From <${userEmail}>: ${text}`;

    // ─── 6) Send to the configured channel ────────────────────────────────────
    const result = await slack.chat.postMessage({
      channel: channelId,
      text: finalText,
      unfurl_links: false,
      unfurl_media: false,

      // If you want to override bot’s display name or icon (optional):
      username: username || undefined,
      icon_url: icon_url || undefined,
    });

    // ─── 7) Return success (timestamp can be used for threading or confirmation) ─
    return NextResponse.json({ success: true, ts: result.ts });
  } catch (error) {
    console.error('Error sending Slack message:', error);
    return NextResponse.json(
      { error: 'Failed to send Slack message' },
      { status: 500 }
    );
  }
}
