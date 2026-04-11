// Mock eSewa Payment Service
interface EsewaPaymentRequest {
  amount: string;
  product_name: string;
  transaction_uuid: string;
}

class EsewaService {
  // Generate unique transaction ID
  private generateTransactionId(): string {
    return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create payment request
  createPaymentRequest(amount: number, productName: string = 'Rent Payment'): EsewaPaymentRequest {
    const transactionId = this.generateTransactionId();
    const totalAmount = amount.toString();

    return {
      amount: totalAmount,
      product_name: productName,
      transaction_uuid: transactionId
    };
  }

  // Redirect to mock eSewa payment page
  redirectToEsewa(paymentRequest: EsewaPaymentRequest): void {
    // Redirect to local mock gateway instead of real eSewa
    const url = `/esewa-checkout?amount=${paymentRequest.amount}&product_name=${encodeURIComponent(paymentRequest.product_name)}&transaction_id=${paymentRequest.transaction_uuid}`;
    window.location.href = url;
  }

  // Format amount (should be in rupees without decimal)
  formatAmount(amount: number): string {
    return Math.round(amount).toString();
  }
}

export default new EsewaService();
