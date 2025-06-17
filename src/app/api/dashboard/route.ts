// app/api/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// Define interfaces for the data structures
interface WeeklyScrape {
  email: string;
  yearly_revenue: string;
  // Use unknown instead of any for additional properties
  [key: string]: string | number | boolean | object | unknown;
}

interface ScrapeListingItem {
  url?: string;
  source?: string;
  status?: string;
  timestamp?: string | Date;
  // Use unknown instead of any for additional properties
  [key: string]: string | number | boolean | Date | object | unknown | undefined;
}

interface CompanyDocument {
  customer_email: string;
  brand_name: string;
  url: string;
  sales_agent: string;
  created_at: string | Date;
  scrape_listings?: ScrapeListingItem[];
  scrape_count?: number;
  // Use unknown instead of any for additional properties
  [key: string]: string | number | boolean | Date | object | ScrapeListingItem[] | unknown | undefined;
}

interface SourceCount {
  source: string;
  count: number;
}

interface CommissionItem {
  source: string;
  commission: number;
}

interface DashboardResponse {
  companyInfo: {
    brandName: string;
    url: string;
    salesAgent: string;
    createdAt: string | Date;
  };
  commissionBySource: CommissionItem[];
  totalCommission: number;
  todayCount: number;
  sourceCounts: SourceCount[];
  listings: (ScrapeListingItem & { id: string })[];
  deletedReviewsCount: number;
  totalScrapeCount: number;
}

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
    const weekly = await db.collection('weekly_scrapes').findOne({ email }) as WeeklyScrape | null
    if (!weekly?.yearly_revenue) {
      return NextResponse.json({ error: 'No weekly data found for this email' }, { status: 404 })
    }
    const annualRevenue = parseFloat(weekly.yearly_revenue)

    // 3. Fetch company data using customer email
    const company = await db.collection('Company').findOne({ customer_email: email }) as CompanyDocument | null
    if (!company) {
      return NextResponse.json({ error: 'No company data found for this email' }, { status: 404 })
    }
    
    // 4. Use scrape_listings from company document
    const rawScrapes = company.scrape_listings || [] as ScrapeListingItem[]
    
    // Use URL as the ID instead of _id
    const listings = rawScrapes.map((scrape: ScrapeListingItem) => ({
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
    
    rawScrapes.forEach(({ source }: ScrapeListingItem) => {
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
    
    const commissionBySource: CommissionItem[] = Object.entries(sourceCountsMap).map(
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
    
    const todayCount = rawScrapes.filter((scrape: ScrapeListingItem) => {
      const scrapeDate = scrape.timestamp ? new Date(scrape.timestamp) : null
      return scrapeDate && scrapeDate >= startOfToday && scrapeDate <= endOfToday
    }).length

    // 8. Count "deleted" reviews
    const deletedReviewsCount = rawScrapes.filter(
      (scrape: ScrapeListingItem) => scrape.status === 'deleted'
    ).length

    // 9. Return everything with additional company info
    const response: DashboardResponse = {
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
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to fetch and compute data' },
      { status: 500 }
    )
  }
}
