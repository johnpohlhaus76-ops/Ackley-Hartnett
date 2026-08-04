import { validateAllAPIs, generateAPIHealthReport, getAPIRecommendations } from '@/lib/api-validation';

export async function GET() {
  try {
    const results = await validateAllAPIs();
    const report = generateAPIHealthReport(results);
    const recommendations = getAPIRecommendations(results);

    return Response.json({
      success: true,
      report,
      recommendations,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
