export const customerWelcomeEmail = (name: string) => ({
  subject: 'Welcome to Shelflife',
  message: `Dear ${name},

Welcome to Shelflife!

Your customer account has been successfully created, and we're delighted to have you with us.

You can now explore our products, manage your wishlist, and place orders with ease.

Thank you for choosing Shelflife. We look forward to serving you.

Best regards,
The Shelflife Team`,
});

export const vendorWelcomeEmail = (name: string) => ({
  subject: 'Welcome to Shelflife',
  message: `Dear ${name},

Welcome to Shelflife!

Your vendor account has been successfully created. We're pleased to have you join the Shelflife marketplace as a seller.

Once your vendor account has been reviewed and approved, you will be able to manage your store, add products, and serve customers through the platform.

Thank you for choosing Shelflife. We look forward to growing with you.

Best regards,
The Shelflife Team`,
});

export const orderPlacedEmail = (
  name: string,
  orderNumber: string,
  totalAmount: string
) => ({
  subject: `Order Placed Successfully - ${orderNumber}`,
  message: `Dear ${name},

Thank you for shopping with Shelflife.

Your order has been placed successfully.

Order Number: ${orderNumber}
Total Amount: NPR ${totalAmount}

We have received your order and it is now being processed. You can track your order status from your Shelflife account.

Thank you for choosing Shelflife.

Best regards,
The Shelflife Team`,
});

export const vendorOrderReceivedEmail = (
  vendorName: string,
  storeName:string,
  orderNumber: string
) => ({
  subject: `New Order Received - ${orderNumber}`,
  message: `Dear ${vendorName},

Your ${storeName} have received a new order on Shelflife.

Order Number: ${orderNumber}

Please log in to your vendor account to review the order details and process the order according to the required workflow.

Thank you for being a valued seller on Shelflife.

Best regards,
The Shelflife Team`,
});

export const orderCancelledEmail = (
  name: string,
  orderNumber: string,
  reason?: string
) => ({
  subject: `Order Cancelled - ${orderNumber}`,
  message: `Dear ${name},

Your order ${orderNumber} has been cancelled.

${
  reason
    ? `Cancellation Reason: ${reason}`
    : 'No cancellation reason was provided.'
}

If you have any questions regarding this cancellation, please contact our support team.

Thank you for choosing Shelflife.

Best regards,
The Shelflife Team`,
});
