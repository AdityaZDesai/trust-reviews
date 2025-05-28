// app/api/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('Removify')

    // 1. Grab email query
    const email = req.nextUrl.searchParams.get('email')
    if (!email) {
      return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 })
    }

    // 2. Fetch annual revenue
    const weekly = await db.collection('weekly_scrapes').findOne({ email })
    if (!weekly?.yearly_revenue) {
      return NextResponse.json({ error: 'No weekly data found for this email' }, { status: 404 })
    }
    const annualRevenue = parseFloat(weekly.yearly_revenue)

    // 3. Fetch all scrapes for listings
    const rawScrapes = await db
      .collection('Scrapes')
      .find({ submitted_by: email })
      .toArray()
    // convert ObjectId to string and include all other fields
    const listings = rawScrapes.map(({ _id, ...rest }) => ({
      id: _id.toString(),
      ...rest,
    }))

    // 4. Count scrapes per source
    const sourceCountsMap: Record<string, number> = {
      reddit: 0,
      google: 0,
      tiktok: 0,
      instagram: 0,
      others: 0,
    }
    rawScrapes.forEach(({ source }) => {
      const s = (source || '').toLowerCase()
      if (['reddit', 'google', 'tiktok', 'instagram'].includes(s)) {
        sourceCountsMap[s]++
      } else {
        sourceCountsMap.others++
      }
    })

    // 5. Calculate commission by source
    const rateMap: Record<string, number> = {
      reddit: 0.10,
      google: 0.07,
      tiktok: 0.05,
      instagram: 0.05,
      others: 0.02,
    }
    const commissionBySource = Object.entries(sourceCountsMap).map(
      ([source, count]) => {
        const rate = rateMap[source] ?? 0.02
        return {
          source,
          commission: rate * annualRevenue * count,
        }
      }
    )
    const totalCommission = commissionBySource.reduce(
      (sum, { commission }) => sum + commission,
      0
    )

    // 6. Count scrapes done today
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)
    const todayCount = await db.collection('Scrapes').countDocuments({
      submitted_by: email,
      timestamp: { $gte: startOfToday, $lte: endOfToday },
    })

    // 7. Count “deleted” reviews
    const deletedReviewsCount = await db
      .collection('Scrapes')
      .countDocuments({ submitted_by: email, status: 'deleted' })

    // 8. Return everything
    return NextResponse.json({
      commissionBySource,          // [{ source, commission }, …]
      totalCommission,             // sum of all commissions
      todayCount,                  // number of scrapes today
      sourceCounts: Object.entries(sourceCountsMap).map(([source, count]) => ({
        source,
        count,
      })),
      listings,                    // full array of this user’s scrapes
      deletedReviewsCount,         // number of reviews with status 'deleted'
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to fetch and compute data' },
      { status: 500 }
    )
  }
}
