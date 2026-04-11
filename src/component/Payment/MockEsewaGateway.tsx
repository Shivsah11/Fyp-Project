import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MockEsewaGateway = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState<"login" | "token" | "processing">("login");
  const [esewaId, setEsewaId] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const amount = searchParams.get("amount") || "0";
  const productName = searchParams.get("product_name") || "Payment";
  const transactionId = searchParams.get("transaction_id") || "TX123456";

  const validEsewaIds = ["9806800001", "9806800002", "9806800003", "9806800004", "9806800005"];

  useEffect(() => {
    document.title = "eSewa Payment Portal";
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (validEsewaIds.includes(esewaId) && password === "Nepal@123") {
      setError("");
      setStep("token");
    } else {
      setError("Invalid eSewa ID or Password. Please try again.");
    }
  };

  const handleToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (token === "123456" || token === "1122") {
      setError("");
      setStep("processing");
      setTimeout(() => {
        // Redirect to success
        navigate(`/payment/success?transaction_id=${transactionId}&amount=${amount}&status=success`);
      }, 2000);
    } else {
      setError("Invalid Token/MPIN. Expected 123456 or 1122.");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans overflow-y-auto z-[100]">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-lg overflow-hidden">
        {/* Header mimicking eSewa */}
        <div className="bg-[#60BB46] text-white p-6 flex justify-between items-center shadow-md">
          <div className="font-bold text-2xl tracking-wider">eSewa</div>
          <div className="text-right">
            <div className="text-sm opacity-90">Amount</div>
            <div className="font-bold text-xl">Rs. {amount}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-b-lg shadow-md border border-gray-100">
          <div className="mb-6 flex justify-between text-sm text-gray-600 border-b pb-4">
            <div>
              <p className="font-semibold text-gray-800">Merchant:</p>
              <p>EPAYTEST</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800">Product:</p>
              <p>{productName}</p>
              <p className="text-xs text-gray-400">Txn: {transactionId}</p>
            </div>
          </div>

          {step === "processing" ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-12 h-12 border-4 border-[#60BB46] border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800">Processing Payment...</h3>
              <p className="text-gray-500 mt-2">Please do not refresh the page.</p>
            </div>
          ) : step === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Login to eSewa</h3>

              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">eSewa ID</label>
                <input
                  type="text"
                  required
                  value={esewaId}
                  onChange={(e) => setEsewaId(e.target.value)}
                  placeholder="eSewa ID / Mobile Number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#60BB46] focus:border-[#60BB46] outline-none transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1">Hint: 9806800001</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#60BB46] focus:border-[#60BB46] outline-none transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1">Hint: Nepal@123</p>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#60BB46] hover:bg-[#4ea635] text-white font-bold py-3 px-4 rounded-md transition-colors"
                >
                  LOGIN
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-md transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleToken} className="space-y-5">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Payment</h3>

              <div className="bg-green-50 text-green-800 p-3 rounded-md text-sm mb-4">
                Logged in as {esewaId}.
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Token / MPIN</label>
                <input
                  type="password"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter Token or MPIN"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#60BB46] focus:border-[#60BB46] outline-none transition-colors text-center text-xl tracking-widest"
                />
                <p className="text-xs text-center text-gray-400 mt-2">Hint: 123456 or 1122</p>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#60BB46] hover:bg-[#4ea635] text-white font-bold py-3 px-4 rounded-md transition-colors"
                >
                  CONFIRM PAYMENT
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center mt-6 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} eSewa Mock Gateway. For development testing only.</p>
        </div>
      </div>
    </div>
  );
};

export default MockEsewaGateway;
