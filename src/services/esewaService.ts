// eSewa Payment Service
interface EsewaPaymentRequest {
  amount: string;
  merchant_code: string;
  product_code: string;
  product_name: string;
  total_amount: string;
  transaction_uuid: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

interface EsewaPaymentResponse {
  transaction_code: string;
  status: string;
  reference_id: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_name: string;
  signed_field_names: string;
  signature: string;
}

class EsewaService {
  private merchantCode: string;
  private secretKey: string;
  private apiBaseUrl: string;

  constructor() {
    // Use sandbox for development, change to live for production
    this.merchantCode = process.env.REACT_APP_ESEWA_MERCHANT_CODE || 'EPAYTEST';
    this.secretKey = process.env.REACT_APP_ESEWA_SECRET_KEY || 'bgWyPhv3yA8hnG6JqGyhJfP5lRi3gQyK';
    this.apiBaseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://esewa.com.np/epay/main' 
      : 'https://uat.esewa.com.np/epay/main';
  }

  // Generate unique transaction ID
  private generateTransactionId(): string {
    return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate signature for eSewa
  private generateSignature(data: any): string {
    // This is a simplified version - in production, you should use proper HMAC-SHA256
    const stringToSign = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join(',');
    
    // For demo purposes - replace with actual HMAC implementation
    return btoa(stringToSign + this.secretKey);
  }

  // Create payment request
  createPaymentRequest(amount: number, productName: string = 'Rent Payment'): EsewaPaymentRequest {
    const transactionId = this.generateTransactionId();
    const totalAmount = amount.toString();
    
    const paymentData = {
      amount: totalAmount,
      merchant_code: this.merchantCode,
      product_code: 'RENT',
      product_name: productName,
      total_amount: totalAmount,
      transaction_uuid: transactionId,
      success_url: `${window.location.origin}/payment/success`,
      failure_url: `${window.location.origin}/payment/failure`,
      signed_field_names: 'amount,merchant_code,product_code,product_name,total_amount,transaction_uuid,success_url,failure_url'
    };

    const signature = this.generateSignature(paymentData);

    return {
      ...paymentData,
      signature
    };
  }

  // Redirect to eSewa payment page
  redirectToEsewa(paymentRequest: EsewaPaymentRequest): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.apiBaseUrl;

    Object.keys(paymentRequest).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = paymentRequest[key as keyof EsewaPaymentRequest];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  // Verify payment response (for success/fallback pages)
  verifyPaymentResponse(response: any): boolean {
    try {
      // Verify signature from eSewa response
      const receivedSignature = response.signature;
      const calculatedSignature = this.generateSignature(response);
      
      return receivedSignature === calculatedSignature;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }

  // Format amount for eSewa (should be in rupees without decimal)
  formatAmount(amount: number): string {
    return Math.round(amount).toString();
  }
}

export default new EsewaService();
