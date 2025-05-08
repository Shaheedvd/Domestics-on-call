/**
 * Represents payment information.
 */
export interface PaymentInfo {
  /**
   * The amount to be paid in cents.
   */
  amountInCents: number;
  /**
   * The customer's email address.
   */
  email: string;
}

/**
 * Represents the result of a payment transaction.
 */
export interface PaymentResult {
  /**
   * Indicates whether the payment was successful.
   */
  success: boolean;
  /**
   * A reference number for the transaction.
   */
  reference: string;
}

/**
 * Initiates a payment transaction with Paystack.
 * @param paymentInfo Information about the payment to be made.
 * @returns A promise that resolves to a PaymentResult object.
 */
export async function initiatePayment(paymentInfo: PaymentInfo): Promise<PaymentResult> {
  // TODO: Implement this by calling the Paystack API.
  return {
    success: true,
    reference: 'test-reference-' + Math.random(),
  };
}
