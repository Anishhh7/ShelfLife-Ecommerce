const orderDeliveredEmail = (order, customerName, customerEmail) => ({
  email: customerEmail,
  subject: '📦 Your Order Has Been Delivered',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
      
      <div style="background: #16a34a; color: #fff; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Order Delivered Successfully</h2>
      </div>

      <div style="padding: 24px;">
        <p>Hi <strong>${customerName}</strong>,</p>

        <p>
          Great news! Your order has been successfully delivered.
        </p>

        <h3>Order Summary</h3>

        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th align="left" style="padding:10px;">Product</th>
              <th align="center">Qty</th>
              <th align="right">Price</th>
            </tr>
          </thead>

          <tbody>
            ${order.items
              .map(
                (item) => `
                  <tr>
                    <td style="padding:10px;">${item.productName}</td>
                    <td align="center">${item.quantity}</td>
                    <td align="right">$${item.price}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>

        <hr style="margin:24px 0;">

        <p>
          <strong>Total:</strong> $${order.totalAmount}
        </p>

        <p>
          We hope you enjoy your purchase.
        </p>

        <p>
          If you're happy with your order, we'd love to hear your feedback.
          Please consider leaving a review to help other customers.
        </p>

        <div style="text-align:center; margin:30px 0;">
          <a
            href="#"
            style="background:#16a34a;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;"
          >
            Leave a Review
          </a>
        </div>

        <p>
          Thank you for shopping with <strong>ShelfLife</strong>!
        </p>
      </div>

      <div style="background:#f9fafb;padding:16px;text-align:center;font-size:13px;color:#666;">
        © ${new Date().getFullYear()} ShelfLife. All rights reserved.
      </div>

    </div>
  `,
});

export default orderDeliveredEmail;