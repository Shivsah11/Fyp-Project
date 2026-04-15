import { useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const isRecorded = useRef(false);

  const status = searchParams.get("status");
  const transactionId = searchParams.get("transaction_id");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (status !== 'success') {
      navigate('/tenant/dashboard');
      return;
    }

    if (isRecorded.current) return;
    isRecorded.current = true;

    // --- Step 1: Save payment to localStorage immediately (always works) ---
    const newPayment = {
      id: transactionId || `local_${Date.now()}`,
      amount: Number(amount) || 0,
      method: 'eSewa',
      date: new Date().toISOString().split('T')[0],
      status: 'completed' as const,
      description: `Payment via eSewa (${transactionId})`,
    };

    const existing = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
    existing.unshift(newPayment);
    localStorage.setItem('pendingPayments', JSON.stringify(existing));

    // --- Step 2: Record in backend (generic dashboard record) ---
    const token = localStorage.getItem('token');
    const bookingId = searchParams.get("bookingId");

    if (token) {
      // 2a. Record generic payment
      fetch('http://localhost:5000/api/dashboard/record-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount),
          method: 'eSewa',
          description: `Payment via eSewa (${transactionId})`,
          transactionId
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.payment) {
            // Backend saved it — remove from pendingPayments to avoid duplicates
            const stored = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
            const filtered = stored.filter((p: any) => p.id !== newPayment.id);
            localStorage.setItem('pendingPayments', JSON.stringify(filtered));
          }
        })
        .catch(err => console.error("Generic recording error:", err));

      // 2b. If associated with a booking, update booking status to 'paid' and 'confirmed'
      if (bookingId) {
        fetch(`http://localhost:5000/api/bookings/${bookingId}/pay`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId,
            amount: Number(amount),
            paymentMethod: 'eSewa'
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              console.log("Booking successfully updated to Booked/Confirmed.");
            }
          })
          .catch(err => console.error("Booking status update error:", err));
      }
    }
  }, [status, navigate, amount, transactionId]);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gray-50 flex items-center justify-center p-4 z-[100]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-[#60BB46] p-6 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[#60BB46]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
          <p className="text-green-50 mt-1">Thank you for your payment via eSewa</p>
        </div>

        <div className="p-8">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-semibold text-gray-800 text-sm break-all">{transactionId}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-[#60BB46]">Confirmed ✓</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <span className="text-lg text-gray-700">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">Rs. {amount}</span>
          </div>

          <Link
            to="/tenant/dashboard"
            className="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
