import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('Removify');
    
    // Update the status of the listing
    const result = await db.collection('Scrapes').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
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