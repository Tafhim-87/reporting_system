import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Report from '@/models/Report';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get all reports
    const reports = await Report.find({});
    
    // Calculate totals
    let totals = {
      সাথী: 0,
      কর্মী: 0,
      সমর্থক: 0,
      বন্ধু: 0,
      income: 0,
      expense: 0
    };
    
    // Group by WOR
    const worWiseData = {};
    const worNames = ['45south', '45north', '46', '46 school', '47', '47 school', 'madrasah'];
    
    // Initialize WOR data
    worNames.forEach(wor => {
      worWiseData[wor] = {
        সাথী: 0,
        কর্মী: 0,
        সমর্থক: 0,
        বন্ধু: 0,
        income: 0,
        expense: 0
      };
    });
    
    // Process each report
    reports.forEach(report => {
      // Total calculations
      totals.সাথী += report.reports.সাথী.current;
      totals.কর্মী += report.reports.কর্মী.current;
      totals.সমর্থক += report.reports.সমর্থক.current;
      totals.বন্ধু += report.reports.বন্ধু.current;
      totals.income += report.baitulmal.totalIncome;
      totals.expense += report.baitulmal.totalExpense;
      
      // WOR-wise calculations
      if (worWiseData[report.worName]) {
        worWiseData[report.worName].সাথী += report.reports.সাথী.current;
        worWiseData[report.worName].কর্মী += report.reports.কর্মী.current;
        worWiseData[report.worName].সমর্থক += report.reports.সমর্থক.current;
        worWiseData[report.worName].বন্ধু += report.reports.বন্ধু.current;
        worWiseData[report.worName].income += report.baitulmal.totalIncome;
        worWiseData[report.worName].expense += report.baitulmal.totalExpense;
      }
    });
    
    // Monthly trends
    const monthlyTrends = {};
    reports.forEach(report => {
      if (!monthlyTrends[report.month]) {
        monthlyTrends[report.month] = {
          সাথী: 0,
          কর্মী: 0,
          income: 0,
          expense: 0,
          count: 0
        };
      }
      
      monthlyTrends[report.month].সাথী += report.reports.সাথী.current;
      monthlyTrends[report.month].কর্মী += report.reports.কর্মী.current;
      monthlyTrends[report.month].income += report.baitulmal.totalIncome;
      monthlyTrends[report.month].expense += report.baitulmal.totalExpense;
      monthlyTrends[report.month].count += 1;
    });
    
    // Calculate averages for monthly trends
    const monthlyData = Object.entries(monthlyTrends).map(([month, data]) => ({
      month,
      avgSathi: Math.round(data.সাথী / data.count),
      avgKormi: Math.round(data.কর্মী / data.count),
      avgIncome: Math.round(data.income / data.count),
      avgExpense: Math.round(data.expense / data.count)
    }));
    
    // Activity calculations
    const activityTotals = {
      উপশাখা_দায়িত্বশীল_বৈঠক: { total: 0, present: 0 },
      সাথী_বৈঠক: { total: 0, present: 0 },
      কর্মী_বৈঠক: { total: 0, present: 0 },
      কুরান_তালীম: { total: 0, present: 0 },
      সামষ্টিক_বৈঠক: { total: 0, present: 0 },
      সাধারণ_সভা: { total: 0, present: 0 },
      আলোচনা_চক্র: { total: 0, present: 0 }
    };
    
    reports.forEach(report => {
      Object.keys(activityTotals).forEach(activity => {
        activityTotals[activity].total += report.activities[activity].total;
        activityTotals[activity].present += report.activities[activity].present;
      });
    });
    
    // Calculate percentages
    const activityPercentages = {};
    Object.keys(activityTotals).forEach(activity => {
      const { total, present } = activityTotals[activity];
      activityPercentages[activity] = total > 0 ? (present / total * 100) : 0;
    });
    
    const dashboardData = {
      totals,
      worWiseData,
      monthlyData,
      activityPercentages,
      totalReports: reports.length,
      activityTotals
    };
    
    return NextResponse.json(dashboardData);
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}