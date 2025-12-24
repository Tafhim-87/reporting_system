'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  PieChart,
  Download,
  Filter,
  Home,
  Eye,
  UserPlus,
  UserCheck,
  Wallet,
  Activity,
  Lock
} from 'lucide-react';

const WOR_NAMES = ['45south', '45north', '46', '46 school', '47', '47 school', 'madrasah'];
const ACTIVITIES = [
  { id: 'উপশাখা_দায়িত্বশীল_বৈঠক', label: 'উপশাখা দায়িত্বশীল বৈঠক' },
  { id: 'সাথী_বৈঠক', label: 'সাথী বৈঠক' },
  { id: 'কর্মী_বৈঠক', label: 'কর্মী বৈঠক' },
  { id: 'কুরান_তালীম', label: 'কুরান তালীম' },
  { id: 'সামষ্টিক_বৈঠক', label: 'সামষ্টিক বৈঠক' },
  { id: 'সাধারণ_সভা', label: 'সাধারণ সভা' },
  { id: 'আলোচনা_চক্র', label: 'আলোচনা চক্র' }
];

const DASHBOARD_PASSWORD = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD; // Set your password here

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [filters, setFilters] = useState({
    worName: 'all',
    month: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [allReports, setAllReports] = useState([]);

  // Check if already authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem('dashboard_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchDashboardData();
      fetchAllReports();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (password === DASHBOARD_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('dashboard_auth', 'true');
      fetchDashboardData();
      fetchAllReports();
    } else {
      setError('ভুল পাসওয়ার্ড! আবার চেষ্টা করুন');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('dashboard_auth');
    setPassword('');
    setDashboardData(null);
    setAllReports([]);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReports = async () => {
    try {
      let url = '/api/reports';
      if (filters.worName !== 'all' || filters.month !== 'all') {
        const params = new URLSearchParams();
        if (filters.worName !== 'all') params.append('worName', filters.worName);
        if (filters.month !== 'all') params.append('month', filters.month);
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setAllReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const getUniqueMonths = () => {
    if (!allReports.length) return [];
    const months = allReports.map(report => report.month);
    return [...new Set(months)];
  };

  const exportDashboardData = () => {
    if (!dashboardData) return;
    
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `dashboard_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ড্যাশবোর্ড এক্সেস</h1>
            <p className="text-gray-600 mt-2">পাসওয়ার্ড দিন ড্যাশবোর্ড দেখতে</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                পাসওয়ার্ড
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="পাসওয়ার্ড দিন"
                required
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ড্যাশবোর্ডে প্রবেশ করুন
            </button>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ← রিপোর্ট পেজে ফিরে যান
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">ডেটা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700">ডেটা পাওয়া যায়নি</p>
        </div>
      </div>
    );
  }

  const { totals, worWiseData, monthlyData, activityPercentages, totalReports, activityTotals } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ড্যাশবোর্ড - সকল রিপোর্টের সারসংক্ষেপ</h1>
                <p className="text-gray-700">মোট রিপোর্ট: {totalReports}</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
                রিপোর্ট পেজ
              </button>
              <button
                onClick={exportDashboardData}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                এক্সপোর্ট
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                লগআউট
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Rest of your dashboard content remains exactly the same */}
      {/* Filters Section */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-900 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">ফিল্টার</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                ওয়ার নাম
              </label>
              <select
                value={filters.worName}
                onChange={(e) => setFilters(prev => ({ ...prev, worName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="all">সকল ওয়ার</option>
                {WOR_NAMES.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                মাস
              </label>
              <select
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="all">সকল মাস</option>
                {getUniqueMonths().map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ worName: 'all', month: 'all' })}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ফিল্টার রিসেট
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-900">
            {allReports.length} টি রিপোর্ট পাওয়া গেছে
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{totals.সাথী}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">মোট সাথী</h3>
            <p className="text-gray-700 text-sm">সকল ওয়ার সম্মিলিত</p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{totals.কর্মী}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">মোট কর্মী</h3>
            <p className="text-gray-700 text-sm">সকল ওয়ার সম্মিলিত</p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                ৳{(totals.income - totals.expense).toLocaleString()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">নিট ব্যালেন্স</h3>
            <p className="text-gray-700 text-sm">আয় - ব্যয়</p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {Object.values(activityPercentages).reduce((a, b) => a + b, 0) / Object.values(activityPercentages).length > 0 ? 
                 ((Object.values(activityPercentages).reduce((a, b) => a + b, 0) / Object.values(activityPercentages).length).toFixed(1)) : 0}%
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">গড় উপস্থিতি</h3>
            <p className="text-gray-700 text-sm">সকল কার্যক্রম</p>
          </div>
        </div>

        {/* Detailed Summary Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Member Summary */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="text-xl font-bold text-gray-900">সদস্য সারসংক্ষেপ - ওয়ারভিত্তিক</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ওয়ার নাম</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">সাথী</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">কর্মী</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">সমর্থক</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">বন্ধু</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(worWiseData).map(([worName, data]) => (
                    <tr key={worName}>
                      <td className="px-6 py-4 font-medium text-gray-900">{worName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900">{data.সাথী}</span>
                          {data.সাথী > 0 && (
                            <TrendingUp className="h-4 w-4 text-green-600 ml-2" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900">{data.কর্মী}</span>
                          {data.কর্মী > 0 && (
                            <TrendingUp className="h-4 w-4 text-green-600 ml-2" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{data.সমর্থক}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{data.বন্ধু}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-6 py-4 font-bold text-gray-900">মোট</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{totals.সাথী}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{totals.কর্মী}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{totals.সমর্থক}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{totals.বন্ধু}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="text-xl font-bold text-gray-900">আর্থিক সারসংক্ষেপ - ওয়ারভিত্তিক</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ওয়ার নাম</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">মোট আয়</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">মোট ব্যয়</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">নিট ব্যালেন্স</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(worWiseData).map(([worName, data]) => (
                    <tr key={worName}>
                      <td className="px-6 py-4 font-medium text-gray-900">{worName}</td>
                      <td className="px-6 py-4 text-green-600 font-semibold">
                        ৳{data.income.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-red-600 font-semibold">
                        ৳{data.expense.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${data.income - data.expense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ৳{(data.income - data.expense).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-6 py-4 font-bold text-gray-900">মোট</td>
                    <td className="px-6 py-4 font-bold text-green-600">৳{totals.income.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-red-600">৳{totals.expense.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${totals.income - totals.expense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ৳{(totals.income - totals.expense).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-xl font-bold text-gray-900">কার্যক্রম উপস্থিতি সারসংক্ষেপ</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ACTIVITIES.map(activity => {
                const totalPrograms = activityTotals[activity.id]?.total || 0;
                const totalPresent = activityTotals[activity.id]?.present || 0;
                const maxPossibleAttendees = totalPrograms * 3;
                const attendancePercentage = maxPossibleAttendees > 0 
                  ? (totalPresent / maxPossibleAttendees) * 100 
                  : 0;
                
                return (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">{activity.label}</h4>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {attendancePercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-900 mb-2">
                      {totalPresent} জন / {maxPossibleAttendees} জন
                      <div className="text-xs text-gray-600 mt-1">
                        {totalPrograms} টি প্রোগ্রাম
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, attendancePercentage)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        {monthlyData.length > 0 && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="text-xl font-bold text-gray-900">মাসিক প্রবণতা</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">মাস</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">গড় সাথী</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">গড় কর্মী</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">গড় আয়</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">গড় ব্যয়</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {monthlyData.map((data, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 font-medium text-gray-900">{data.month}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900">{data.avgSathi}</span>
                            {index > 0 && data.avgSathi > monthlyData[index - 1].avgSathi && (
                              <TrendingUp className="h-4 w-4 text-green-600 ml-2" />
                            )}
                            {index > 0 && data.avgSathi < monthlyData[index - 1].avgSathi && (
                              <TrendingDown className="h-4 w-4 text-red-600 ml-2" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900">{data.avgKormi}</span>
                            {index > 0 && data.avgKormi > monthlyData[index - 1].avgKormi && (
                              <TrendingUp className="h-4 w-4 text-green-600 ml-2" />
                            )}
                            {index > 0 && data.avgKormi < monthlyData[index - 1].avgKormi && (
                              <TrendingDown className="h-4 w-4 text-red-600 ml-2" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-green-600 font-semibold">
                          ৳{data.avgIncome.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-red-600 font-semibold">
                          ৳{data.avgExpense.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}