import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Report from '@/models/Report';

// GET specific report
export async function GET(request, context) {
  try {
    const { id } = await context.params; // Await the params
    await connectToDatabase();
    
    const report = await Report.findById(id);
    
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT (update) specific report
export async function PUT(request, context) {
  try {
    const { id } = await context.params; // Await the params
    await connectToDatabase();
    const data = await request.json();
    
    const report = await Report.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE specific report
export async function DELETE(request, context) {
  try {
    const { id } = await context.params; // Await the params
    await connectToDatabase();
    
    const report = await Report.findByIdAndDelete(id);
    
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Report deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}