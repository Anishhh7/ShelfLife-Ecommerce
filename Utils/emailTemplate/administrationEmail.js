const orderAdminEmail = (order, customerName, customerEmail, customerPhone) => {
  return {
    email: process.env.EMAIL_USERNAME,
    subject: "New Order Received",
    message: `New Order Alert

Customer Details
----------------
Name: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}

Order Details
-------------
Order ID: ${order._id}
Items: ${order.items.length}
Total Amount: $${order.totalAmount}
Payment Method: ${order.paymentMethod}
Payment Status: ${order.paymentStatus}
Order Status: ${order.orderStatus}

Shipping Address
----------------
${order.shippingAddress}

Order placed on:
${order.createdAt.toLocaleString("en-US")}
`,
  };
};

export default orderAdminEmail;