const orderCustomerEmail = (order, customerEmail, customerName) => {
  return {
    email:customerName,
    subject: "Order Confirmation",
    message: `Dear ${customerName},

Thank you for shopping with us.

Your order has been received successfully.

Order Summary
-------------
Order ID: ${order._id}
Items: ${order.items.length}
Total Amount: $${order.totalAmount}
Payment Status: ${order.paymentStatus}
Order Status: ${order.orderStatus}

Shipping Address
----------------
${order.shippingAddress}

We will notify you once your order has been shipped.

Thank you for choosing us!

Best Regards,
ShelfLife Team`,
  };
};

export default orderCustomerEmail;