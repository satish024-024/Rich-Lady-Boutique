const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

interface ShiprocketOrderPayload {
  order_id: string;
  order_date: string; // YYYY-MM-DD HH:MM
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: string;
  }>;
  payment_method: "Prepaid" | "COD";
  sub_total: number;
  length: number; // in cm
  width: number; // in cm
  height: number; // in cm
  weight: number; // in kg
}

// 1. Authenticate and get JWT Token
export async function getShiprocketToken(): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password || email.includes("your_") || password.includes("your_")) {
    // If not configured, throw a descriptive error
    throw new Error("Shiprocket credentials are not configured in your env.local file.");
  }

  const res = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok || !data.token) {
    throw new Error(data.message || "Failed to authenticate with Shiprocket API");
  }

  return data.token;
}

// 2. Create ad-hoc shipment order in Shiprocket
export async function createShiprocketOrder(
  token: string,
  payload: ShiprocketOrderPayload
): Promise<{ order_id: number; shipment_id: number }> {
  const res = await fetch(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || data.status_code === 422 || !data.shipment_id) {
    console.error("Shiprocket order creation error:", data);
    const errorsMsg = data.errors ? Object.values(data.errors).flat().join(", ") : "";
    throw new Error(data.message || errorsMsg || "Failed to create order in Shiprocket");
  }

  return {
    order_id: data.order_id,
    shipment_id: data.shipment_id,
  };
}

// 3. Assign courier AWB tracking to shipment
export async function assignShiprocketAwb(
  token: string,
  shipmentId: number
): Promise<{ awb_code: string; courier_name: string }> {
  const res = await fetch(`${SHIPROCKET_BASE_URL}/courier/assign/awb`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: shipmentId }),
  });

  const data = await res.json();

  if (!res.ok || data.status === 0 || !data.response?.data?.awb_code) {
    console.error("Shiprocket AWB assignment error:", data);
    throw new Error(
      data.response?.data?.awb_assign_error || 
      data.message || 
      "Failed to auto-assign courier/AWB label in Shiprocket"
    );
  }

  return {
    awb_code: data.response.data.awb_code,
    courier_name: data.response.data.courier_name || "Shiprocket Courier Partner",
  };
}
