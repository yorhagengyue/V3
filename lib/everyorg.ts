// Every.org API Client
// Documentation: https://docs.every.org

const BASE_URL = process.env.EVERYORG_BASE_URL || 'https://partners.every.org/v0.2'
const PUBLIC_KEY = process.env.EVERYORG_PUBLIC_KEY || ''
const SECRET_KEY = process.env.EVERYORG_SECRET_KEY || ''

// Create auth header
function getAuthHeaders(): HeadersInit {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
}

// Build URL with API key
function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.set('apiKey', PUBLIC_KEY)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  return url.toString()
}

interface Nonprofit {
  name: string
  slug: string
  ein: string
  description: string
  profileUrl: string
  logoUrl: string
  coverImageUrl: string
  websiteUrl?: string
  locationAddress?: string
}

interface SearchResult {
  nonprofits: Nonprofit[]
}

interface NonprofitDetails {
  nonprofit: Nonprofit
  data?: {
    stats?: {
      totalRaised?: number
      totalDonors?: number
    }
  }
}

// Search for nonprofits by keyword
export async function searchNonprofits(query: string, take: number = 10): Promise<Nonprofit[]> {
  try {
    const url = buildUrl(`/search/${encodeURIComponent(query)}`, { take: take.toString() })
    
    console.log('Fetching:', url)
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Every.org search error: ${response.status} ${response.statusText}`, errorText)
      return []
    }

    const data: SearchResult = await response.json()
    console.log('Search results:', data)
    return data.nonprofits || []
  } catch (error) {
    console.error('Every.org search error:', error)
    return []
  }
}

// Get nonprofit details by slug
export async function getNonprofit(slug: string): Promise<NonprofitDetails | null> {
  try {
    const url = buildUrl(`/nonprofit/${encodeURIComponent(slug)}`)
    
    console.log('Fetching nonprofit:', url)
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Every.org nonprofit error: ${response.status} ${response.statusText}`, errorText)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Every.org nonprofit error:', error)
    return null
  }
}

// Get nonprofit donation link
export function getDonationLink(slug: string, options?: {
  amount?: number
  frequency?: 'once' | 'monthly'
  successUrl?: string
  cancelUrl?: string
}): string {
  const baseUrl = `https://www.every.org/${slug}/donate`
  const params = new URLSearchParams()
  
  if (options?.amount) {
    params.set('amount', options.amount.toString())
  }
  if (options?.frequency) {
    params.set('frequency', options.frequency)
  }
  if (options?.successUrl) {
    params.set('success_url', options.successUrl)
  }
  if (options?.cancelUrl) {
    params.set('cancel_url', options.cancelUrl)
  }
  
  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

// Get environment nonprofits for the canvas project
export async function getEnvironmentNonprofits(): Promise<Nonprofit[]> {
  const keywords = ['rainforest', 'climate', 'environment', 'conservation', 'wildlife']
  const allNonprofits: Nonprofit[] = []
  
  for (const keyword of keywords) {
    const results = await searchNonprofits(keyword, 3)
    allNonprofits.push(...results)
  }
  
  // Remove duplicates by slug
  const unique = allNonprofits.reduce((acc, np) => {
    if (!acc.find(x => x.slug === np.slug)) {
      acc.push(np)
    }
    return acc
  }, [] as Nonprofit[])
  
  return unique.slice(0, 10)
}

export type { Nonprofit, NonprofitDetails }

