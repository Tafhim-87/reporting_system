import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Report from '@/models/Report';

// GET all reports
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const worName = searchParams.get('worName');
    const month = searchParams.get('month');
    
    let query = {};
    
    if (worName && worName !== 'all') {
      query.worName = worName;
    }
    
    if (month && month !== 'all') {
      query.month = month;
    }
    
    const reports = await Report.find(query).sort({ date: -1 });
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new report
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const data = await request.json();
    const report = new Report(data);
    await report.save();
    
    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}