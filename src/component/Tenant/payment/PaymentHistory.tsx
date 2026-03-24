interface Payment {
  id: string;
  amount: number;
  method: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

interface PaymentHistoryProps {
  payments?: Payment[];
  onDeletePayment: (id: string) => void;
}

const PaymentHistory = ({ payments = [], onDeletePayment }: PaymentHistoryProps) => {

  // Use the payments passed as props or default to empty array
  const paymentList = payments.length > 0 ? payments : [
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

    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">

      <h3 className="text-lg font-bold text-gray-900 mb-4">Payment History</h3>

      

      <div className="space-y-3">
        {paymentList.map((payment) => (

          <div key={payment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-all duration-300">

            <div className="flex items-center justify-between">

              <div className="flex-1">

                <div className="flex items-center gap-3 mb-2">

                  <span className="text-gray-900 font-semibold">${payment.amount}</span>

                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(payment.status)}`}>

                    {payment.status}

                  </span>

                </div>

                <p className="text-gray-600 text-sm mb-1">{payment.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500">

                  <span>📅 {payment.date}</span>

                  <span>💳 {payment.method}</span>

                </div>

              </div>
              <button
                onClick={() => onDeletePayment(payment.id)}
                className="text-red-500 hover:text-red-700 transition-colors duration-300"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

      

      <button className="w-full mt-4 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">

        View All Payments →

      </button>

    </div>

  );

};



export default PaymentHistory;

