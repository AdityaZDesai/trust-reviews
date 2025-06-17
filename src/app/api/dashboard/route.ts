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

    // 2. Fetch annual revenue from weekly_scrapes (keeping this as requested)
    const weekly = await db.collection('weekly_scrapes').findOne({ email })
    if (!weekly?.yearly_revenue) {
      return NextResponse.json({ error: 'No weekly data found for this email' }, { status: 404 })
    }
    const annualRevenue = parseFloat(weekly.yearly_revenue)

    // 3. Fetch company data using customer email
    const company = await db.collection('Company').findOne({ customer_email: email })
    if (!company) {
      return NextResponse.json({ error: 'No company data found for this email' }, { status: 404 })
    }
    
    // 4. Use scrape_listings from company document
    const rawScrapes = company.scrape_listings || []
    
    // Use URL as the ID instead of _id
    const listings = rawScrapes.map((scrape: any) => ({
      id: scrape.url || String(Math.random()), // Use URL as ID
      ...scrape,
    }))

    // 5. Count scrapes per source
    const sourceCountsMap: Record<string, number> = {
      reddit: 0,
      google: 0,
      tiktok: 0,
      instagram: 0,
      youtube: 0, // Added YouTube as a source
      others: 0,
    }
    
    rawScrapes.forEach(({ source }: { source?: string }) => {
      const s = (source || '').toLowerCase()
      if (['reddit', 'google', 'tiktok', 'instagram', 'youtube'].includes(s)) {
        sourceCountsMap[s]++
      } else {
        sourceCountsMap.others++
      }
    })

    // 6. Calculate commission by source
    const rateMap: Record<string, number> = {
      reddit: 0.10,
      google: 0.07,
      tiktok: 0.05,
      instagram: 0.05,
      youtube: 0.06, // Added rate for YouTube
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

    // 7. Count scrapes done today
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)
    
    const todayCount = rawScrapes.filter((scrape: any) => {
      const scrapeDate = scrape.timestamp ? new Date(scrape.timestamp) : null
      return scrapeDate && scrapeDate >= startOfToday && scrapeDate <= endOfToday
    }).length

    // 8. Count "deleted" reviews
    const deletedReviewsCount = rawScrapes.filter(
      (scrape: any) => scrape.status === 'deleted'
    ).length

    // 9. Return everything with additional company info
    return NextResponse.json({
      companyInfo: {
        brandName: company.brand_name,
        url: company.url,
        salesAgent: company.sales_agent,
        createdAt: company.created_at,
      },
      commissionBySource,          // [{ source, commission }, …]
      totalCommission,             // sum of all commissions
      todayCount,                  // number of scrapes today
      sourceCounts: Object.entries(sourceCountsMap).map(([source, count]) => ({
        source,
        count,
      })),
      listings,                    // full array of this company's scrapes
      deletedReviewsCount,         // number of reviews with status 'deleted'
      totalScrapeCount: company.scrape_count || rawScrapes.length,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to fetch and compute data' },
      { status: 500 }
    )
  }
}
