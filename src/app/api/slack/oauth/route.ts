// pages/api/slack/oauth.ts
import { NextRequest, NextResponse } from 'next/server';
import { Installation, InstallationQuery, InstallProvider } from '@slack/oauth';
import clientPromise from '@/lib/mongodb';

async function getEmailFromRequest(req: NextRequest): Promise<string|undefined> {
  // —— YOUR LOGIC HERE ——  
  // e.g. if you store email in a secure cookie:
  return req.cookies.get('user-email')?.value;
  //
  // or if you use NextAuth:
  // const session = await getServerSession(authOptions);
  // return session?.user?.email;
}

const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID!,
  clientSecret: process.env.SLACK_CLIENT_SECRET!,
  stateSecret: process.env.SLACK_STATE_SECRET!,

  installationStore: {
    storeInstallation: async (installation) => {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME || 'Removify');

      // pull the email back out of the metadata
      const userEmail = installation.metadata as string;
      if (!userEmail) {
        throw new Error('No user email found in Slack metadata');
      }

      // Store in slack_installations collection
      const teamId = installation.team?.id || installation.enterprise?.id;
      if (!teamId) {
        throw new Error('Could not determine team or enterprise ID');
      }
      
      // Store the installation data
      await db.collection('slack_installations').updateOne(
        { teamId },
        { $set: {
          installation,
          userId: installation.user.id,
          userEmail: userEmail,
          updatedAt: new Date()
        }},
        { upsert: true }
      );
      
      // Also update the user record
      await db.collection('Users').updateOne(
        { email: userEmail },
        { $set: {
          slackConnected: true,
          slackTeamId: teamId,
          updatedAt: new Date()
        }}
      );
    },

    fetchInstallation: async (installQuery: InstallationQuery<boolean>): Promise<Installation<"v1" | "v2", boolean>> => {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME || 'Removify');
      const teamId = installQuery.teamId || installQuery.enterpriseId;
      if (!teamId) {
        throw new Error('Could not determine team or enterprise ID');
      }

      // Find the installation record
      const installationRecord = await db
        .collection('slack_installations')
        .findOne({ teamId });

      if (!installationRecord?.installation) {
        throw new Error(`No installation found for team ${teamId}`);
      }

      return installationRecord.installation;
    },
  },
});

export async function GET(request: NextRequest) {
  // 1) get the logged-in user's email
  const email = await getEmailFromRequest(request);
  if (!email) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  // 2) generate a Slack install URL, passing the email as metadata
  try {
    const url = await installer.generateInstallUrl({
      scopes: ['chat:write', 'channels:read', 'groups:read', 'chat:write.customize'],
      redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/slack/oauth/callback`,
      metadata: email,
    });
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('Slack OAuth error:', err);
    return NextResponse.json(
      { error: 'Failed to generate Slack installation URL' },
      { status: 500 }
    );
  }
}
