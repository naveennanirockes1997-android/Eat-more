// 1. Process Stripe Payment (Mock/Sandbox Validation)
export const processStripePayment = async (req, res) => {
  try {
    const { amount, paymentMethodId, cardDetails } = req.body;

    if (!amount || !paymentMethodId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Amount and Payment Method ID are required'
      });
    }

    // Simulate Payment Gateway Processing Time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Support payment failure handling
    // If the user inputs a card ending in 4243, fail the transaction!
    if (cardDetails && cardDetails.number && cardDetails.number.endsWith('4243')) {
      return res.status(400).json({
        status: 'fail',
        message: 'Your card was declined. Insufficient funds. Please try another card.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Stripe transaction processed successfully',
      paymentIntent: {
        id: `pi_${Math.random().toString(36).substr(2, 9)}`,
        status: 'succeeded',
        amount,
        currency: 'usd',
        paymentMethod: 'pm_card_visa'
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// 2. Process PayPal Payment (Mock Capture)
export const processPayPalPayment = async (req, res) => {
  try {
    const { paypalOrderId, amount } = req.body;

    if (!paypalOrderId || !amount) {
      return res.status(400).json({
        status: 'fail',
        message: 'PayPal Order ID and Amount are required'
      });
    }

    // Simulate PayPal Capture Time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // If order ID includes 'fail' or similar, simulate a PayPal error
    if (paypalOrderId.toLowerCase().includes('fail')) {
      return res.status(400).json({
        status: 'fail',
        message: 'PayPal authorization failed. Transaction aborted by buyer or account limit exceeded.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'PayPal transaction captured successfully',
      capture: {
        id: `pay_${Math.random().toString(36).substr(2, 9)}`,
        status: 'COMPLETED',
        amount,
        payer: {
          email_address: 'sandbox-customer@eatmore.com'
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};
