import { useState, useEffect } from 'react';

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
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | '1year'>('30days');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock analytics data
    const mockData: AnalyticsData = {
      totalRevenue: 8750000,
      totalBookings: 234,
      totalProperties: 45,
      totalUsers: 189,
      occupancyRate: 78.5,
      averageBookingValue: 37400,
      monthlyRevenue: [650000, 720000, 680000, 750000, 820000, 790000, 850000, 880000, 920000, 870000, 910000, 8750000],
      monthlyBookings: [18, 22, 19, 24, 26, 23, 28, 29, 31, 27, 30, 234],
      topProperties: [
        {
          id: 'prop1',
          title: 'Luxury Villa - Pokhara',
          revenue: 1250000,
          bookings: 28,
          occupancyRate: 92
        },
        {
          id: 'prop2',
          title: 'Modern Studio - Thamel',
          revenue: 980000,
          bookings: 35,
          occupancyRate: 88
        },
        {
          id: 'prop3',
          title: 'Family Apartment - Lalitpur',
          revenue: 870000,
          bookings: 22,
          occupancyRate: 85
        },
        {
          id: 'prop4',
          title: 'Cozy Room - Bhaktapur',
          revenue: 750000,
          bookings: 31,
          occupancyRate: 82
        },
        {
          id: 'prop5',
          title: 'Penthouse - Kathmandu',
          revenue: 680000,
          bookings: 18,
          occupancyRate: 79
        }
      ],
      recentActivity: [
        {
          id: '1',
          type: 'booking',
          description: 'New booking: Modern Studio Apartment',
          timestamp: '2024-03-24 10:30 AM',
          amount: 225000
        },
        {
          id: '2',
          type: 'payment',
          description: 'Payment received: Luxury Villa',
          timestamp: '2024-03-24 09:45 AM',
          amount: 750000
        },
        {
          id: '3',
          type: 'property',
          description: 'New property listed: 2BHK Apartment',
          timestamp: '2024-03-24 08:20 AM'
        },
        {
          id: '4',
          type: 'user',
          description: 'New user registered: John Smith',
          timestamp: '2024-03-24 07:15 AM'
        },
        {
          id: '5',
          type: 'booking',
          description: 'Booking cancelled: Single Room',
          timestamp: '2024-03-23 11:30 PM',
          amount: 120000
        }
      ],
      paymentStats: {
        paid: 198,
        pending: 18,
        failed: 8,
        refunded: 10
      },
      bookingStats: {
        confirmed: 156,
        pending: 28,
        cancelled: 22,
        completed: 28
      }
    };

    setTimeout(() => {
      setAnalyticsData(mockData);
      setIsLoading(false);
    }, 1500);
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
        return '📅';
      case 'payment':
        return '💰';
      case 'property':
        return '🏠';
      case 'user':
        return '👤';
      default:
        return '📊';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'property':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">No analytics data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</p>
              <p className="text-sm text-green-600">+12.5% from last month</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalBookings}</p>
              <p className="text-sm text-green-600">+8.2% from last month</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.occupancyRate}%</p>
              <p className="text-sm text-green-600">+3.1% from last month</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Booking Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.averageBookingValue)}</p>
              <p className="text-sm text-red-600">-2.3% from last month</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <span className="text-2xl">💎</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analyticsData.monthlyRevenue.slice(-6).map((revenue, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                  style={{ 
                    height: `${(revenue / Math.max(...analyticsData.monthlyRevenue)) * 200}px`,
                    minHeight: '20px'
                  }}
                  title={formatCurrency(revenue)}
                ></div>
                <span className="text-xs text-gray-600 mt-2">
                  {new Date(2024, index + 6).toLocaleDateString('en', { month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings Chart */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Bookings Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analyticsData.monthlyBookings.slice(-6).map((bookings, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                  style={{ 
                    height: `${(bookings / Math.max(...analyticsData.monthlyBookings)) * 200}px`,
                    minHeight: '20px'
                  }}
                  title={`${bookings} bookings`}
                ></div>
                <span className="text-xs text-gray-600 mt-2">
                  {new Date(2024, index + 6).toLocaleDateString('en', { month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Breakdown */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Confirmed</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{analyticsData.bookingStats.confirmed}</span>
                <span className="text-sm text-gray-600">
                  ({((analyticsData.bookingStats.confirmed / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Pending</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{analyticsData.bookingStats.pending}</span>
                <span className="text-sm text-gray-600">
                  ({((analyticsData.bookingStats.pending / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Cancelled</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{analyticsData.bookingStats.cancelled}</span>
                <span className="text-sm text-gray-600">
                  ({((analyticsData.bookingStats.cancelled / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Completed</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{analyticsData.bookingStats.completed}</span>
                <span className="text-sm text-gray-600">
                  ({((analyticsData.bookingStats.completed / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Breakdown */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Paid</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{analyticsData.paymentStats.paid}</span>
                <span className="text-sm text-gray-600">
                  ({((analyticsData.paymentStats.paid / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Pending</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{analyticsData.paymentStats.pending}</span>
                <span className="text-sm text-gray-600">
                  ({((analyticsData.paymentStats.pending / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Failed</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{analyticsData.paymentStats.failed}</span>
                <span className="text-sm text-gray-600">
                  ({((analyticsData.paymentStats.failed / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Refunded</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{analyticsData.paymentStats.refunded}</span>
                <span className="text-sm text-gray-600">
                  ({((analyticsData.paymentStats.refunded / analyticsData.totalBookings) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Properties and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Properties */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Properties</h3>
          <div className="space-y-3">
            {analyticsData.topProperties.map((property, index) => (
              <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{property.title}</p>
                    <p className="text-xs text-gray-600">{property.bookings} bookings • {property.occupancyRate}% occupancy</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(property.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analyticsData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-600">{activity.timestamp}</p>
                  {activity.amount && (
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(activity.amount)}</p>
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