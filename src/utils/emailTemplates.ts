/**
 * Rich Lady Boutique - Email HTML Templates
 * Beautiful, responsive, and brand-aligned email templates using editorial style:
 * - Brand Colors: Forest Green (#23352D), Muted Gold (#B8904A), Primary Background (#FAF8F3)
 * - Typography: Serif headings (Georgia/Playfair), Sans-serif body (Inter/Helvetica)
 */

function getEmailLayout(title: string, contentHtml: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #FAF8F3;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #2D221C;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          width: 100%;
          table-layout: fixed;
          background-color: #FAF8F3;
          padding: 40px 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #FFFDF9;
          border: 1px solid #E5D8C9;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(45, 34, 28, 0.03);
        }
        .header {
          background-color: #23352D;
          padding: 40px 20px;
          text-align: center;
          border-bottom: 2px solid #B8904A;
        }
        .header h1 {
          font-family: 'Cormorant Garamond', 'Georgia', serif;
          color: #FAF8F3;
          font-size: 28px;
          font-weight: 300;
          margin: 0;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
        .header p {
          color: #B8904A;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.25em;
          margin: 5px 0 0 0;
          text-transform: uppercase;
        }
        .content {
          padding: 40px 35px;
          background-color: #FFFDF9;
        }
        .content-title {
          font-family: 'Cormorant Garamond', 'Georgia', serif;
          font-size: 24px;
          color: #2D221C;
          font-weight: normal;
          margin-top: 0;
          margin-bottom: 20px;
          line-height: 1.3;
        }
        .body-text {
          font-size: 14px;
          line-height: 1.6;
          color: #5B5046;
          margin-bottom: 25px;
          font-weight: 300;
        }
        .button-container {
          text-align: center;
          margin: 35px 0;
        }
        .button {
          display: inline-block;
          background-color: #23352D;
          color: #FAF8F3 !important;
          text-decoration: none;
          padding: 14px 30px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          border: 1px solid #B8904A;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        .ornament {
          text-align: center;
          margin: 30px 0;
        }
        .ornament-line {
          height: 1px;
          background-color: #E5D8C9;
          width: 80px;
          display: inline-block;
          vertical-align: middle;
        }
        .ornament-diamond {
          display: inline-block;
          width: 6px;
          height: 6px;
          background-color: #B8904A;
          transform: rotate(45deg);
          margin: 0 10px;
          vertical-align: middle;
        }
        .footer {
          background-color: #F2ECE3;
          padding: 35px 20px;
          text-align: center;
          border-top: 1px solid #E5D8C9;
          font-size: 12px;
          color: #5B5046;
          line-height: 1.6;
        }
        .footer-brand {
          font-family: 'Cormorant Garamond', 'Georgia', serif;
          font-size: 16px;
          color: #2D221C;
          margin-bottom: 10px;
          letter-spacing: 0.1em;
        }
        .footer-socials {
          margin: 15px 0;
        }
        .footer-socials a {
          color: #23352D;
          text-decoration: none;
          margin: 0 10px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .footer-socials a:hover {
          color: #B8904A;
        }
        .footer-contact {
          font-size: 10px;
          color: #5B5046;
          margin-top: 15px;
          letter-spacing: 0.05em;
        }
        .table-container {
          margin: 25px 0;
          border: 1px solid #E5D8C9;
          border-radius: 8px;
          overflow: hidden;
        }
        .order-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .order-table th {
          background-color: #F2ECE3;
          color: #2D221C;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 12px 15px;
          border-bottom: 1px solid #E5D8C9;
        }
        .order-table td {
          padding: 12px 15px;
          font-size: 13px;
          border-bottom: 1px solid #E5D8C9;
          color: #5B5046;
        }
        .order-table tr:last-child td {
          border-bottom: none;
        }
        .total-row {
          font-weight: bold;
          color: #2D221C !important;
          background-color: #FAF8F3;
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          border-radius: 40px;
          background-color: #E2ECE9;
          color: #23352D;
          letter-spacing: 0.05em;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Rich Lady</h1>
            <p>Boutique</p>
          </div>
          <div class="content">
            ${contentHtml}
          </div>
          <div class="footer">
            <div class="footer-brand">Rich Lady Boutique</div>
            <p>Curating premium, handcrafted fashion designs since 2011.</p>
            <div class="footer-socials">
              <a href="https://instagram.com/richlady_rjy" target="_blank">INSTAGRAM</a>
              <a href="https://wa.me/919030443306" target="_blank">WHATSAPP</a>
              <a href="#" target="_blank">WEBSITE</a>
            </div>
            <div class="ornament">
              <span class="ornament-line" style="width: 40px;"></span>
              <span class="ornament-diamond"></span>
              <span class="ornament-line" style="width: 40px;"></span>
            </div>
            <div class="footer-contact">
              Beside Raymond's Showroom, Main Road, Rajahmundry, AP, India<br>
              Store Hours: 11:00 AM - 9:00 PM • Customer Care: +91 90304 43306
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// 1. Welcome Email
export function getWelcomeEmail(customerName: string): string {
  const content = `
    <h2 class="content-title">Welcome to our Exclusive Circle, ${customerName}</h2>
    <p class="body-text">
      We are delighted to welcome you to <strong>Rich Lady Boutique</strong>. Since 2011, our passion has been curating premium, handcrafted Indian ethnic attire that seamlessly blends heritage workmanship with sophisticated modern silhouettes.
    </p>
    <p class="body-text">
      As a registered member of our boutique, you will enjoy early access to new arrivals, bespoke styling consultations, and priority announcements regarding our editorial collections.
    </p>
    <div class="ornament">
      <span class="ornament-line"></span>
      <span class="ornament-diamond"></span>
      <span class="ornament-line"></span>
    </div>
    <p class="body-text" style="text-align: center; font-style: italic;">
      "Luxury is in the details, and fashion is a story waiting to be told."
    </p>
    <div class="button-container">
      <a href="https://richladyboutique.com/catalog" class="button">Explore New Collection</a>
    </div>
  `;
  return getEmailLayout("Welcome to Rich Lady Boutique", content);
}

// 2. Email Verification Email
export function getEmailVerificationEmail(customerName: string, otpCode: string): string {
  const content = `
    <h2 class="content-title">Verify Your Email Address</h2>
    <p class="body-text">
      Thank you for starting your registration journey with Rich Lady Boutique. To complete the verification of your email, please use the secure code below:
    </p>
    
    <div style="background-color: #F2ECE3; border: 1px solid #E5D8C9; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
      <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 0.3em; color: #23352D;">${otpCode}</span>
      <p style="font-size: 11px; color: #5B5046; margin: 10px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em;">This code is valid for 15 minutes</p>
    </div>

    <p class="body-text">
      If you did not initiate this request, you can safely ignore this email. Your privacy and account security are our utmost priorities.
    </p>
  `;
  return getEmailLayout("Verify Your Email Address - Rich Lady Boutique", content);
}

// 3. Order Confirmation Email
export function getOrderConfirmationEmail(order: any, items: any[]): string {
  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let itemsRows = "";
  items.forEach((item) => {
    itemsRows += `
      <tr>
        <td>
          <div style="font-weight: 500; color: #2D221C;">${item.name || "Boutique Apparel"}</div>
          <div style="font-size: 11px; color: #5B5046; margin-top: 3px;">Qty: ${item.quantity}</div>
        </td>
        <td style="text-align: right;">₹${item.price.toLocaleString("en-IN")}</td>
      </tr>
    `;
  });

  const content = `
    <h2 class="content-title">Thank You For Your Order</h2>
    <p class="body-text">
      Dear ${order.customer_name}, we are pleased to confirm that we have received your payment and registered your order <strong>#RL-${order.id.slice(0, 8).toUpperCase()}</strong>.
    </p>
    <p class="body-text">
      Our master weavers and artisans have begun preparing your selection. Each garment undergoes a meticulous quality and styling check before leaving our boutique.
    </p>

    <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 18px; margin-top: 30px; margin-bottom: 10px; color: #2D221C;">Order Summary</h3>
    <p class="body-text" style="font-size: 12px; margin-bottom: 15px;">
      Order Date: ${orderDate}<br>
      Shipping Address: ${order.shipping_address}, ${order.city} - ${order.pincode}
    </p>

    <div class="table-container">
      <table class="order-table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
          <tr class="total-row">
            <td>TOTAL AMOUNT (PAID)</td>
            <td style="text-align: right;">₹${Number(order.total_amount).toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="body-text">
      Once your order has been dispatched via our logistics partner (Shiprocket), we will send you another update containing your tracking number and delivery details.
    </p>
  `;
  return getEmailLayout("Order Confirmation - Rich Lady Boutique", content);
}

// 4. Payment Success Email
export function getPaymentSuccessEmail(order: any): string {
  const content = `
    <h2 class="content-title">Payment Successful</h2>
    <p class="body-text">
      We have successfully processed your payment of <strong>₹${Number(order.total_amount).toLocaleString("en-IN")}</strong> for order <strong>#RL-${order.id.slice(0, 8).toUpperCase()}</strong>.
    </p>
    
    <div style="border-left: 3px solid #B8904A; background-color: #FAF8F3; padding: 15px; margin: 25px 0;">
      <table style="width: 100%; font-size: 13px; color: #5B5046;">
        <tr>
          <td style="padding: 4px 0; font-weight: 500; color: #2D221C;">Razorpay Order ID:</td>
          <td style="padding: 4px 0; text-align: right;">${order.razorpay_order_id || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 500; color: #2D221C;">Razorpay Payment ID:</td>
          <td style="padding: 4px 0; text-align: right;">${order.razorpay_payment_id || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 500; color: #2D221C;">Transaction Status:</td>
          <td style="padding: 4px 0; text-align: right;"><span class="badge">SUCCESS</span></td>
        </tr>
      </table>
    </div>

    <p class="body-text">
      A digital invoice has been attached to your order record. If you have any inquiries regarding this payment, please contact our financial desk at +91 90304 43306.
    </p>
  `;
  return getEmailLayout("Payment Successful - Rich Lady Boutique", content);
}

// 5. Shipping Confirmation Email
export function getShippingConfirmationEmail(order: any): string {
  const content = `
    <h2 class="content-title">Your Order Has Shipped</h2>
    <p class="body-text">
      Exquisite craftsmanship is now on its way. We have handed order <strong>#RL-${order.id.slice(0, 8).toUpperCase()}</strong> over to our premium courier partner, <strong>${order.shiprocket_courier_name}</strong>.
    </p>

    <div style="background-color: #FAF8F3; border: 1px solid #E5D8C9; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <h4 style="margin: 0 0 10px 0; font-family: 'Cormorant Garamond', serif; font-size: 16px; color: #2D221C;">Tracking Details</h4>
      <table style="width: 100%; font-size: 13px; color: #5B5046;">
        <tr>
          <td style="padding: 4px 0; font-weight: bold;">Courier Partner:</td>
          <td style="padding: 4px 0; text-align: right; color: #2D221C;">${order.shiprocket_courier_name}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold;">AWB tracking Number:</td>
          <td style="padding: 4px 0; text-align: right; font-family: monospace; color: #2D221C;">${order.shiprocket_awb_code}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold;">Destination:</td>
          <td style="padding: 4px 0; text-align: right;">${order.city} - ${order.pincode}</td>
        </tr>
      </table>
      
      <div class="button-container" style="margin: 20px 0 0 0;">
        <a href="${order.shiprocket_tracking_url}" class="button" style="padding: 10px 20px; font-size: 10px;">Track Live Package</a>
      </div>
    </div>

    <p class="body-text">
      We appreciate your patience while our artisans meticulously prepared your garments. We trust they will bring you style and delight.
    </p>
  `;
  return getEmailLayout("Your Order Has Shipped - Rich Lady Boutique", content);
}

// 6. Delivery Confirmation Email
export function getDeliveryConfirmationEmail(order: any): string {
  const content = `
    <h2 class="content-title">Delivered</h2>
    <p class="body-text">
      We are pleased to notify you that order <strong>#RL-${order.id.slice(0, 8).toUpperCase()}</strong> has been successfully delivered to your address.
    </p>
    
    <div style="background-color: #FAF8F3; border: 1px solid #E2ECE9; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
      <span class="badge" style="background-color: #23352D; color: #FAF8F3; padding: 6px 12px; font-size: 11px;">DELIVERED SECURELY</span>
      <p style="font-size: 12px; color: #5B5046; margin: 15px 0 0 0;">
        Delivered to: ${order.customer_name}<br>
        Address: ${order.shipping_address}, ${order.city}
      </p>
    </div>

    <p class="body-text">
      We hope you love your new boutique apparel. We would be honored to hear about your experience. Feel free to tag us on Instagram at <strong>@richlady_rjy</strong> to share your style!
    </p>
  `;
  return getEmailLayout("Order Delivered - Rich Lady Boutique", content);
}

// 7. Contact Form Notification
export function getContactFormNotification(name: string, email: string, message: string): string {
  const content = `
    <h2 class="content-title">New Contact Inquiry</h2>
    <p class="body-text">
      A user has submitted a new inquiry via the Rich Lady Boutique contact desk:
    </p>
    
    <div style="background-color: #FAF8F3; border: 1px solid #E5D8C9; border-radius: 8px; padding: 20px; margin: 25px 0; font-size: 13px; color: #5B5046;">
      <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${name}</p>
      <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 0 0 10px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString("en-IN")}</p>
      <div style="height: 1px; background-color: #E5D8C9; margin: 15px 0;"></div>
      <p style="margin: 0; font-style: italic; line-height: 1.5;">"${message}"</p>
    </div>

    <p class="body-text">
      Please reply to this customer within 24 business hours.
    </p>
  `;
  return getEmailLayout("New Contact Desk Submission", content);
}

// 8. Newsletter Subscription Email
export function getNewsletterSubscriptionEmail(email: string): string {
  const content = `
    <h2 class="content-title">Subscribed to Our Newsletter</h2>
    <p class="body-text">
      Thank you for subscribing to the <strong>Rich Lady Boutique</strong> digital editorial digest.
    </p>
    <p class="body-text">
      You are now part of our inner circle. We will periodically send you curations of our finest weaves, natural handlooms, behind-the-scenes stories of our craftsmen, and exclusive online launches.
    </p>
    
    <div class="ornament">
      <span class="ornament-line"></span>
      <span class="ornament-diamond"></span>
      <span class="ornament-line"></span>
    </div>

    <p class="body-text" style="font-size: 11px; text-align: center; color: #5B5046;">
      You received this because you entered your email at our store page. You can unsubscribe at any time using the link in future digests.
    </p>
  `;
  return getEmailLayout("Newsletter Subscription Confirmed - Rich Lady Boutique", content);
}

// 9. Admin Notification for New Orders
export function getAdminNewOrderNotification(order: any, items: any[]): string {
  let itemsList = "";
  items.forEach((item) => {
    itemsList += `<li>${item.name || "Boutique Item"} (Qty: ${item.quantity}) - ₹${item.price}</li>`;
  });

  const content = `
    <h2 class="content-title" style="color: #B8904A;">[ADMIN ALERT] New Order Received</h2>
    <p class="body-text">
      A new prepaid transaction has been completed and verified.
    </p>

    <div style="background-color: #FAF8F3; border: 1px solid #E5D8C9; border-radius: 8px; padding: 20px; margin: 25px 0; font-size: 13px; color: #5B5046;">
      <p style="margin: 0 0 10px 0;"><strong>Order ID:</strong> #RL-${order.id.slice(0, 8).toUpperCase()}</p>
      <p style="margin: 0 0 10px 0;"><strong>Customer Name:</strong> ${order.customer_name}</p>
      <p style="margin: 0 0 10px 0;"><strong>Phone:</strong> ${order.customer_phone}</p>
      <p style="margin: 0 0 10px 0;"><strong>Total Amount:</strong> ₹${order.total_amount.toLocaleString("en-IN")}</p>
      <p style="margin: 0 0 10px 0;"><strong>Delivery Area:</strong> ${order.city} (${order.pincode})</p>
      <div style="height: 1px; background-color: #E5D8C9; margin: 15px 0;"></div>
      <p style="margin: 0 0 5px 0;"><strong>Items:</strong></p>
      <ul style="margin: 0; padding-left: 20px; line-height: 1.5;">
        ${itemsList}
      </ul>
    </div>

    <div class="button-container">
      <a href="https://richladyboutique.com/admin" class="button">Open Admin Dashboard</a>
    </div>
  `;
  return getEmailLayout("Admin Alert: New Order Received", content);
}
