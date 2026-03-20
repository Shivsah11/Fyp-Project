interface Payment {
  id: string;
  amount: number;
  method: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

const PaymentHistory = () => {
  // Mock payment history data
  const payments: Payment[] = [
    {
      id: '1',
      amount: 850,
      method: 'Credit Card',
      date: '2025-02-15',
      status: 'completed',
      description: 'Monthly Rent - Studio A'
    },
    {
      id: '2',
      amount: 50,
      method: 'PayPal',
      date: '2025-02-10',
      status: 'completed',
      description: 'Maintenance Fee'
    },
    {
      id: '3',
      amount: 1200,
      method: 'Bank Transfer',
      date: '2025-03-01',
      status: 'pending',
      description: 'Monthly Rent - Studio A'
    }
  ];

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-4">Payment History</h3>
      
      <div className="space-y-3">
        {payments.map((payment) => (
          <div key={payment.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-white font-semibold">${payment.amount}</span>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-1">{payment.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>📅 {payment.date}</span>
                  <span>💳 {payment.method}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
        View All Payments →
      </button>
    </div>
  );
};

export default PaymentHistory;
