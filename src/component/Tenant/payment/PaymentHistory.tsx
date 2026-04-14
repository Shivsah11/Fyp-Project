import { useDarkMode } from '../../../context/DarkModeContext';

interface Payment {
  id: string;
  amount: number;
  method: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

const PaymentHistory = ({ payments, onViewAllPayments, limit }: { 
  payments: Payment[], 
  onViewAllPayments?: () => void,
  limit?: number
}) => {
  const { isDarkMode } = useDarkMode();
  const displayPayments = limit ? payments.slice(0, limit) : payments;

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return isDarkMode 
          ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700'
          : 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'pending':
        return isDarkMode
          ? 'bg-yellow-900/30 text-yellow-500 border-yellow-700'
          : 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'failed':
        return isDarkMode
          ? 'bg-red-900/30 text-red-400 border-red-700'
          : 'bg-red-50 text-red-600 border-red-200';
      default:
        return isDarkMode
          ? 'bg-gray-700 text-gray-300 border-gray-600'
          : 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={`rounded-3xl p-8 shadow-sm border h-full flex flex-col ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-black ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Payment History</h3>
        {onViewAllPayments && (!limit || payments.length > limit) && (
          <button 
            onClick={onViewAllPayments}
            className={`text-sm font-bold transition-all duration-300 ${
              isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
            }`}
          >
            See All
          </button>
        )}
      </div>
      
      <div className="space-y-4 flex-1">
        {displayPayments.length > 0 ? (
          displayPayments.map((payment) => (
            <div key={payment.id} className={`rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.01] ${
              isDarkMode
                ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-md'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`font-black text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>NPR {payment.amount.toLocaleString()}</span>
                    <span className={`px-3 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                  <p className={`font-bold text-xs mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{payment.description}</p>
                  <div className={`flex items-center gap-4 text-[10px] font-black uppercase tracking-tighter ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <span className="flex items-center gap-1.5"><span className="opacity-50 text-[14px]">📅</span> {payment.date}</span>
                    <span className="flex items-center gap-1.5"><span className="opacity-50 text-[14px]">💳</span> {payment.method}</span>
                  </div>
                </div>
                <button className={`p-2 rounded-xl transition-all duration-300 ${
                  isDarkMode ? 'bg-gray-600/50 text-emerald-400 hover:bg-gray-600' : 'bg-white text-emerald-600 hover:bg-emerald-50 shadow-sm border border-emerald-100'
                }`}>
                  <span className="text-xl font-black">›</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={`text-center py-12 rounded-2xl border border-dashed flex flex-col items-center justify-center ${
            isDarkMode
              ? 'bg-gray-800/50 border-gray-700 text-gray-500'
              : 'bg-gray-50/50 border-gray-300 text-gray-400'
          }`}>
            <span className="text-4xl mb-3 opacity-30">💸</span>
            <p className="font-bold italic">No payment history yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
