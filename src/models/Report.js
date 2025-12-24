import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  worName: {
    type: String,
    required: true,
    enum: ['45south', '45north', '46', '46 school', '47', '47 school', 'madrasah']
  },
  month: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // সদস্য প্রতিবেদন
  reports: {
    সাথী: {
      previous: { type: Number, default: 0 },
      current: { type: Number, default: 0 },
      increase: { type: Number, default: 0 },
      decrease: { type: Number, default: 0 }
    },
    কর্মী: {
      previous: { type: Number, default: 0 },
      current: { type: Number, default: 0 },
      increase: { type: Number, default: 0 },
      decrease: { type: Number, default: 0 }
    },
    সমর্থক: {
      previous: { type: Number, default: 0 },
      current: { type: Number, default: 0 },
      increase: { type: Number, default: 0 },
      decrease: { type: Number, default: 0 }
    },
    বন্ধু: {
      previous: { type: Number, default: 0 },
      current: { type: Number, default: 0 },
      increase: { type: Number, default: 0 },
      decrease: { type: Number, default: 0 }
    }
  },
  
  // কার্যক্রম প্রতিবেদন
  activities: {
    উপশাখা_দায়িত্বশীল_বৈঠক: {
      total: { type: Number, default: 0 },
      present: { type: Number, default: 0 }
    },
    সাথী_বৈঠক: {
      total: { type: Number, default: 0 },
      present: { type: Number, default: 0 }
    },
    কর্মী_বৈঠক: {
      total: { type: Number, default: 0 },
      present: { type: Number, default: 0 }
    },
    কুরান_তালীম: {
      total: { type: Number, default: 0 },
      present: { type: Number, default: 0 }
    },
    সামষ্টিক_বৈঠক: {
      total: { type: Number, default: 0 },
      present: { type: Number, default: 0 }
    },
    সাধারণ_সভা: {
      total: { type: Number, default: 0 },
      present: { type: Number, default: 0 }
    },
    আলোচনা_চক্র: {
      total: { type: Number, default: 0 },
      present: { type: Number, default: 0 }
    }
  },
  
  // বায়তুলমাল
  baitulmal: {
    totalIncome: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);