import { useState, useEffect } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  totalProperties: number;
  totalUsers: number;
  occupancyRate: number;
  averageBookingValue: number;
  monthlyRevenue: number[];
  monthlyBookings: number[];
  topProperties: Array<{
    id: string;
    title: string;
    revenue: number;
    bookings: number;
    occupancyRate: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'booking' | 'payment' | 'property' | 'user';
    description: string;
    timestamp: string;
    amount?: number;
  }>;
  paymentStats: {
    paid: number;
    pending: number;
    failed: number;
    refunded: number;
  };
  bookingStats: {
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
  };
}

const Analytics = () => {
  const { isDarkMode } = useDarkMode();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | '1year'>('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [visibleActivities, setVisibleActivities] = useState(4);
  const [visibleProperties, setVisibleProperties] = useState(4);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/admin/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data.analytics);
        } else {
          console.error("Failed to fetch analytics");
        }
      } catch (error) {
        console.error("Analytics fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return 'Booking';
      case 'payment':
        return 'Payment';
      case 'property':
        return 'Property';
      case 'user':
        return 'User';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'booking':
        return isDarkMode
          ? 'bg-blue-900/30 text-blue-400'
          : 'bg-blue-100 text-blue-800';
      case 'payment':
        return isDarkMode
          ? 'bg-green-900/30 text-green-400'
          : 'bg-green-100 text-green-800';
      case 'property':
        return isDarkMode
          ? 'bg-purple-900/30 text-purple-400'
          : 'bg-purple-100 text-purple-800';
      case 'user':
        return isDarkMode
          ? 'bg-orange-900/30 text-orange-400'
          : 'bg-orange-100 text-orange-800';
      default:
        return isDarkMode
          ? 'bg-gray-900/30 text-gray-400'
          : 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewAllActivities = () => {
    setVisibleActivities(analyticsData?.recentActivity.length || 0);
  };

  const handleViewLessActivities = () => {
    setVisibleActivities(4);
  };

  const handleViewAllProperties = () => {
    setVisibleProperties(analyticsData?.topProperties.length || 0);
  };

  const handleViewLessProperties = () => {
    setVisibleProperties(4);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-gray-600 ${isDarkMode ? 'text-gray-400' : ''}`}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className={`text-gray-600 ${isDarkMode ? 'text-gray-400' : ''}`}>No analytics data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analytics Dashboard</h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isDarkMode ? 'text-blue-400/40' : 'text-blue-600/40'}`}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'}`}
          >

            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-4 gap-6 overflow-x-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Revenue</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(analyticsData.totalRevenue)}</p>
              <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>+12.5% from last month</p>
            </div>
            <div className={`${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'} p-3 rounded-lg`}>
              <span className="text-2xl"></span>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Bookings</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{analyticsData.totalBookings}</p>
              <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>+8.2% from last month</p>
            </div>
            <div className={`${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'} p-3 rounded-lg`}>
              <span className="text-2xl"></span>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Occupancy Rate</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{analyticsData.occupancyRate}%</p>
              <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>+3.1% from last month</p>
            </div>
            <div className={`${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'} p-3 rounded-lg`}>
              <span className="text-2xl"></span>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Booking Value</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(analyticsData.averageBookingValue)}</p>
              <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>-2.3% from last month</p>
            </div>
            <div className={`${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100'} p-3 rounded-lg`}>
              <span className="text-2xl"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Monthly Revenue Trend</h3>
          <div className="h-40 flex items-end justify-between space-x-1">
            {analyticsData.monthlyRevenue.map((revenue, index) => {
              const now = new Date();
              const monthDate = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all duration-500`}
                    style={{
                      height: `${Math.max((revenue / (Math.max(...analyticsData.monthlyRevenue) || 1)) * 120, 5)}px`,
                      minHeight: '4px'
                    }}
                    title={`${monthDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}: ${formatCurrency(revenue)}`}
                  ></div>
                  <span className={`text-[9px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 rotate-45 origin-left`}>
                    {monthDate.toLocaleDateString('en', { month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bookings Chart */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Monthly Bookings Trend</h3>
          <div className="h-40 flex items-end justify-between space-x-1">
            {analyticsData.monthlyBookings.map((bookings, index) => {
              const now = new Date();
              const monthDate = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full bg-green-500 rounded-t hover:bg-green-600 transition-all duration-500`}
                    style={{
                      height: `${Math.max((bookings / (Math.max(...analyticsData.monthlyBookings) || 1)) * 120, 5)}px`,
                      minHeight: '4px'
                    }}
                    title={`${monthDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}: ${bookings} bookings`}
                  ></div>
                  <span className={`text-[9px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 rotate-45 origin-left`}>
                    {monthDate.toLocaleDateString('en', { month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        {/* Booking Status Breakdown */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Booking Status Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirmed</span>
              </div>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mr-2`}>{analyticsData.bookingStats.confirmed}</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ({((analyticsData.bookingStats.confirmed / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pending</span>
              </div>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mr-2`}>{analyticsData.bookingStats.pending}</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ({((analyticsData.bookingStats.pending / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cancelled</span>
              </div>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mr-2`}>{analyticsData.bookingStats.cancelled}</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ({((analyticsData.bookingStats.cancelled / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Completed</span>
              </div>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mr-2`}>{analyticsData.bookingStats.completed}</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ({((analyticsData.bookingStats.completed / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Breakdown */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Payment Status Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Paid</span>
              </div>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mr-2`}>{analyticsData.paymentStats.paid}</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ({((analyticsData.paymentStats.paid / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pending</span>
              </div>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mr-2`}>{analyticsData.paymentStats.pending}</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ({((analyticsData.paymentStats.pending / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Failed</span>
              </div>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mr-2`}>{analyticsData.paymentStats.failed}</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ({((analyticsData.paymentStats.failed / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Refunded</span>
              </div>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mr-2`}>{analyticsData.paymentStats.refunded}</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ({((analyticsData.paymentStats.refunded / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Properties and Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Performing Properties */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Top Performing Properties</h3>
            {analyticsData.topProperties.length > 0 && (
              <button
                onClick={visibleProperties > 4 ? handleViewLessProperties : handleViewAllProperties}
                className={`text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors`}
              >
                {visibleProperties > 4 ? 'View Less' : 'View All'}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {analyticsData.topProperties.slice(0, visibleProperties).map((property, index) => (
              <div key={property.id} className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-colors`}>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mr-4 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>{property.title}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{property.bookings} bookings • {property.occupancyRate}% occupancy</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{formatCurrency(property.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
            {analyticsData.recentActivity.length > 4 && (
              <button
                onClick={visibleActivities > 4 ? handleViewLessActivities : handleViewAllActivities}
                className={`text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors`}
              >
                {visibleActivities > 4 ? 'View Less' : 'View All'}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {analyticsData.recentActivity.slice(0, visibleActivities).map((activity) => (
              <div key={activity.id} className={`flex items-start p-4 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-colors`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mr-4 ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>{activity.description}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{activity.timestamp}</p>
                  {activity.amount && (
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'} mt-2`}>{formatCurrency(activity.amount)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
