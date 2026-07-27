const orderVendorEmail = (
  order,
  vendor,
  customerName,
  customerEmail,
  customerPhone,
  vendorItems
) => {
  return {
    email: vendor.email,
    subject: 'New Product Order',
    message: `New Order Assigned

Vendor: ${vendor.name}

Order Details
-------------
Order ID: ${order._id}
Customer: ${customerName}
Phone no: ${customerPhone}
Email:${customerEmail}
Items to Fulfill: ${vendorItems.length}
Items: ${vendorItems.map((item) => `${item.productName} x${item.quantity}`).join(', ')}
Total Amount: $${order.totalAmount}

Please prepare the ordered products for shipment as soon as possible.

Order Date:
${order.createdAt.toLocaleString('en-US')}
`,
  };
};

export default orderVendorEmail;
