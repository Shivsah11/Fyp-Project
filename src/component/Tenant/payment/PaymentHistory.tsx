interface Payment {
  id: string;
  amount: number;
  method: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

const PaymentHistory = ({ payments, onDeletePayment, onViewAllPayments, limit }: { 
  payments: Payment[], 
  onDeletePayment?: (id: string) => void,
  onViewAllPayments?: () => void,
  limit?: number
}) => {
  const displayPayments = limit ? payments.slice(0, limit) : payments;

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Payment History</h3>
      
      <div className="space-y-4">
        {displayPayments.length > 0 ? (
          displayPayments.map((payment) => (
            <div key={payment.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:bg-gray-100 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-900 font-bold text-lg">Rs. {payment.amount}</span>
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium text-sm mb-2">{payment.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">📅 {payment.date}</span>
                    <span className="flex items-center gap-1">💳 {payment.method}</span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <span className="text-xl">›</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No payment history found.</p>
          </div>
        )}
      </div>
      
      {onViewAllPayments && (!limit || payments.length > limit) && (
        <button 
          onClick={onViewAllPayments}
          className="w-full mt-6 text-emerald-600 hover:text-emerald-700 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          View All Payments <span>→</span>
        </button>
      )}
    </div>
  );
};

export default PaymentHistory;
