const orderCancelledEmail = (
  order,
  customerName,
  customerEmail
) => ({
  email: customerEmail,
  subject: 'Your Order Has Been Cancelled',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">

      <div style="background: #dc2626; color: #fff; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Order Cancelled</h2>
      </div>

      <div style="padding: 24px;">
        <p>Hi <strong>${customerName}</strong>,</p>

        <p>
          Your order has been cancelled successfully.
        </p>

        <p>
          If you cancelled the order yourself, no further action is required.
        </p>

        <h3>Cancelled Order Summary</h3>

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
          <strong>Total Amount:</strong> $${order.totalAmount}
        </p>

        <p>
          We hope to serve you again in the future.
        </p>

        <div style="text-align:center; margin:30px 0;">
          <a
            href="#"
            style="background:#dc2626;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;"
          >
            Continue Shopping
          </a>
        </div>

        <p>
          If you believe this cancellation was made in error or you have any questions, please contact our support team.
        </p>

        <p>
          Thank you for choosing <strong>ShelfLife</strong>.
        </p>
      </div>

      <div style="background:#f9fafb;padding:16px;text-align:center;font-size:13px;color:#666;">
        © ${new Date().getFullYear()} ShelfLife. All rights reserved.
      </div>

    </div>
  `,
});

export default orderCancelledEmail;