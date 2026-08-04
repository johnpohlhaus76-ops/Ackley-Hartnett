import { NextRequest, NextResponse } from 'next/server';
import {
  generateRevenueReport,
  generateCustomerReport,
  generateMachineUtilizationReport,
  generateSalesPerformanceReport,
} from '@/lib/reporting';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'revenue';
    const from = searchParams.get('from') || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const to = searchParams.get('to') || new Date().toISOString();

    let report;

    switch (type) {
      case 'revenue':
        report = generateRevenueReport(from, to);
        break;
      case 'customer':
        report = generateCustomerReport(from, to);
        break;
      case 'machine-utilization':
        report = generateMachineUtilizationReport();
        break;
      case 'sales-performance':
        report = generateSalesPerformanceReport(from, to);
        break;
      default:
        report = generateRevenueReport(from, to);
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Reporting error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
