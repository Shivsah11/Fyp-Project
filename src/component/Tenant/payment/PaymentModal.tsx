import { useState } from 'react';
import esewaService from '../../../services/esewaService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (amount: string, esewaNumber: string) => void;
}

const PaymentModal = ({ isOpen, onClose }: PaymentModalProps) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const paymentRequest = esewaService.createPaymentRequest(Number(amount), 'Rent Payment');
      esewaService.redirectToEsewa(paymentRequest);
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 border border-gray-200 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Make Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (Rs.)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 hover:bg-gray-100"
              placeholder="Enter amount"
              required
              min="1"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 flex items-center gap-3">
              <span className="w-6 h-6 bg-[#60BB46] text-white flex items-center justify-center rounded-full text-xs font-bold">e</span>
              <span className="font-medium">eSewa Wallet</span>
            </div>
          </div>

          {/* eSewa Payment Info */}
          <div className="text-center py-6">
            <p className="text-gray-600 mb-2">You will be redirected to the eSewa gateway.</p>
            <p className="text-sm text-gray-500">Log in with your eSewa ID to securely complete this transaction.</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-[#60BB46] hover:bg-[#4ea635] disabled:bg-gray-400 text-white py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:cursor-not-allowed tracking-wide"
          >
            {isProcessing ? 'Redirecting...' : `Pay Rs. ${amount || '0'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;

