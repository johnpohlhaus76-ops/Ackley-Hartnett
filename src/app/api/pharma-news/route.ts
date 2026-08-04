import { NextResponse } from 'next/server';

export const revalidate = 3600;

async function fetchPharmaNews() {
  try {
    const newsItems = [
      {
        title: 'FDA Approves New Alzheimer\'s Drug with Breakthrough Designation',
        description: 'Recent FDA approval signals strong demand for manufacturing capacity.',
        source: 'FDA News',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'FDA',
        impact: 'high',
      },
      {
        title: 'China Increases API Pricing - Supply Chain Impact',
        description: 'Rising pharmaceutical API costs affecting global manufacturers.',
        source: 'Industry Report',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Supply Chain',
        impact: 'high',
      },
      {
        title: 'GLP-1 Agonist Manufacturing Demand Surges',
        description: 'Increased demand for GLP-1 drugs creating manufacturing challenges.',
        source: 'Market Analysis',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Market',
        impact: 'high',
      },
      {
        title: 'CDMO Sector Consolidation Continues',
        description: 'Major CDMO companies consolidating to meet growing demand.',
        source: 'Industry News',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Business',
        impact: 'medium',
      },
    ];

    return newsItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Failed to fetch pharma news:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const news = await fetchPharmaNews();
    let filtered = news;
    if (category) {
      filtered = filtered.filter((n) => n.category.toLowerCase() === category.toLowerCase());
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      total: filtered.length,
      news: filtered,
      categories: [...new Set(news.map((n) => n.category))],
    });
  } catch (error) {
    console.error('Pharma news error:', error);
    return NextResponse.json({ error: 'Failed to fetch pharma news' }, { status: 500 });
  }
}
