import express from 'express';

export const paymentsRouter = express.Router();

// POST /api/payments/checkout - Process credit card payment & generate receipt
paymentsRouter.post('/checkout', (req, res) => {
  try {
    const { items, paymentMethod, cardDetails, billingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items required for checkout.' });
    }

    const cardNumber = (cardDetails?.cardNumber || '').replace(/\s/g, '');
    if (paymentMethod === 'card' && cardNumber.length < 12) {
      return res.status(400).json({ success: false, message: 'Invalid credit card number.' });
    }

    // Subtotal math
    const subtotal = items.reduce((total, item) => total + (item.totalPrice * item.quantity), 0);
    const destinationFee = 2950; // White-glove enclosed transport
    const estimatedTax = Math.round(subtotal * 0.08); // 8% luxury sales tax
    const totalPaid = subtotal + destinationFee + estimatedTax;

    const orderId = `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const last4 = cardNumber ? cardNumber.slice(-4) : '4242';

    res.json({
      success: true,
      message: 'Payment Authorized & Allocation Confirmed!',
      order: {
        orderId,
        orderDate: new Date().toISOString(),
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod === 'card' ? `Credit Card (•••• ${last4})` : 'Wire Transfer Authorized',
        cardHolderName: cardDetails?.cardHolderName || 'Valued Client',
        subtotal,
        destinationFee,
        estimatedTax,
        totalPaid,
        items,
        guaranteedDeliveryDate: '2026-08-25',
        franchiseDealer: 'Mercedes-AMG Flagship Center'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Payment processing error', error: error.message });
  }
});
