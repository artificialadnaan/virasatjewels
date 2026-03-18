import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface OrderItem {
  name: string;
  quantity: number;
  priceAtTime: number;
  image?: string;
}

interface ShippingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface OrderConfirmationProps {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddress;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function OrderConfirmation({
  orderNumber = "VJ-20240315-0042",
  customerName = "Valued Customer",
  items = [
    { name: "Gold Filigree Necklace", quantity: 1, priceAtTime: 249.99 },
    { name: "Kundan Earrings", quantity: 2, priceAtTime: 89.99 },
  ],
  subtotal = 429.97,
  shippingCost = 0,
  total = 429.97,
  shippingAddress = {
    line1: "123 Main Street",
    city: "New York",
    state: "NY",
    postal_code: "10001",
    country: "US",
  },
}: OrderConfirmationProps) {
  const addressLines = [
    shippingAddress.line1,
    shippingAddress.line2,
    [shippingAddress.city, shippingAddress.state, shippingAddress.postal_code]
      .filter(Boolean)
      .join(", "),
    shippingAddress.country,
  ].filter(Boolean);

  return (
    <Html>
      <Head />
      <Preview>Order confirmed! Your VirasatJewels order {orderNumber} is on its way.</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={logoStyle}>VirasatJewels</Text>
            <Text style={taglineStyle}>Heirloom Craftsmanship, Timeless Beauty</Text>
          </Section>

          {/* Order confirmed */}
          <Section style={contentStyle}>
            <Heading style={h1Style}>Order Confirmed</Heading>
            <Text style={greetingStyle}>Dear {customerName},</Text>
            <Text style={paraStyle}>
              Thank you for your order! We have received your purchase and our artisans are preparing your
              handcrafted pieces with care. You will receive a shipping confirmation once your order is on its way.
            </Text>

            {/* Order number banner */}
            <Section style={orderBannerStyle}>
              <Text style={orderLabelStyle}>ORDER NUMBER</Text>
              <Text style={orderNumberStyle}>{orderNumber}</Text>
            </Section>

            <Hr style={hrStyle} />

            {/* Items */}
            <Heading style={h2Style}>Your Items</Heading>

            {items.map((item, index) => (
              <Row key={index} style={itemRowStyle}>
                {item.image && (
                  <Column style={itemImageColStyle}>
                    <Img
                      src={item.image}
                      alt={item.name}
                      width="60"
                      height="60"
                      style={itemImageStyle}
                    />
                  </Column>
                )}
                <Column style={itemNameColStyle}>
                  <Text style={itemNameStyle}>{item.name}</Text>
                  <Text style={itemQtyStyle}>Qty: {item.quantity}</Text>
                </Column>
                <Column style={itemPriceColStyle}>
                  <Text style={itemPriceStyle}>
                    {formatPrice(item.priceAtTime * item.quantity)}
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr style={hrStyle} />

            {/* Totals */}
            <Section style={totalsSection}>
              <Row style={totalRowStyle}>
                <Column>
                  <Text style={totalLabelStyle}>Subtotal</Text>
                </Column>
                <Column style={totalValueColStyle}>
                  <Text style={totalValueStyle}>{formatPrice(subtotal)}</Text>
                </Column>
              </Row>
              <Row style={totalRowStyle}>
                <Column>
                  <Text style={totalLabelStyle}>Shipping</Text>
                </Column>
                <Column style={totalValueColStyle}>
                  <Text style={totalValueStyle}>
                    {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                  </Text>
                </Column>
              </Row>
              <Hr style={hrStyle} />
              <Row style={totalRowStyle}>
                <Column>
                  <Text style={grandTotalLabelStyle}>Total</Text>
                </Column>
                <Column style={totalValueColStyle}>
                  <Text style={grandTotalValueStyle}>{formatPrice(total)}</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={hrStyle} />

            {/* Shipping address */}
            <Heading style={h2Style}>Shipping Address</Heading>
            <Section style={addressSectionStyle}>
              {addressLines.map((line, i) => (
                <Text key={i} style={addressLineStyle}>{line}</Text>
              ))}
            </Section>

            <Hr style={hrStyle} />

            {/* Note */}
            <Text style={paraStyle}>
              Each piece is handcrafted by our master artisans and inspected before shipping.
              Please allow 3–5 business days for standard delivery. You will receive a tracking
              number once your order ships.
            </Text>

            <Text style={paraStyle}>
              If you have any questions about your order, please contact us at{" "}
              <span style={linkStyle}>support@virasatjewels.com</span> with your order number.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              VirasatJewels &mdash; Handcrafted Heritage Jewelry
            </Text>
            <Text style={footerSubStyle}>
              &copy; {new Date().getFullYear()} VirasatJewels. All rights reserved.
            </Text>
            <Text style={footerSubStyle}>
              support@virasatjewels.com &bull; virasatjewels.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const bodyStyle: React.CSSProperties = {
  backgroundColor: "#f9f5f0",
  fontFamily: "'Georgia', 'Times New Roman', serif",
  margin: 0,
  padding: "20px 0",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  maxWidth: "600px",
  margin: "0 auto",
  borderRadius: "8px",
  overflow: "hidden",
  border: "1px solid #e5e0d8",
};

const headerStyle: React.CSSProperties = {
  backgroundColor: "#6B2737",
  padding: "32px 40px",
  textAlign: "center",
};

const logoStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: 0,
  letterSpacing: "2px",
};

const taglineStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.75)",
  fontSize: "12px",
  margin: "6px 0 0",
  letterSpacing: "1px",
};

const contentStyle: React.CSSProperties = {
  padding: "40px 40px 24px",
};

const h1Style: React.CSSProperties = {
  color: "#6B2737",
  fontSize: "26px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const h2Style: React.CSSProperties = {
  color: "#3d2c1e",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const greetingStyle: React.CSSProperties = {
  color: "#3d2c1e",
  fontSize: "16px",
  margin: "0 0 8px",
};

const paraStyle: React.CSSProperties = {
  color: "#5a4a3a",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const orderBannerStyle: React.CSSProperties = {
  backgroundColor: "#fdf8f0",
  border: "2px solid #6B2737",
  borderRadius: "6px",
  padding: "16px 24px",
  textAlign: "center",
  margin: "24px 0",
};

const orderLabelStyle: React.CSSProperties = {
  color: "#9a7a5a",
  fontSize: "11px",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};

const orderNumberStyle: React.CSSProperties = {
  color: "#6B2737",
  fontSize: "22px",
  fontWeight: "bold",
  fontFamily: "monospace",
  margin: 0,
  letterSpacing: "2px",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#e5e0d8",
  margin: "20px 0",
};

const itemRowStyle: React.CSSProperties = {
  marginBottom: "12px",
};

const itemImageColStyle: React.CSSProperties = {
  width: "70px",
  verticalAlign: "top",
};

const itemImageStyle: React.CSSProperties = {
  borderRadius: "4px",
  objectFit: "cover" as const,
  border: "1px solid #e5e0d8",
};

const itemNameColStyle: React.CSSProperties = {
  verticalAlign: "top",
  paddingLeft: "12px",
};

const itemPriceColStyle: React.CSSProperties = {
  verticalAlign: "top",
  textAlign: "right",
  width: "100px",
};

const itemNameStyle: React.CSSProperties = {
  color: "#3d2c1e",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 2px",
};

const itemQtyStyle: React.CSSProperties = {
  color: "#9a7a5a",
  fontSize: "12px",
  margin: 0,
};

const itemPriceStyle: React.CSSProperties = {
  color: "#3d2c1e",
  fontSize: "14px",
  fontWeight: "bold",
  margin: 0,
};

const totalsSection: React.CSSProperties = {
  backgroundColor: "#fdf8f0",
  borderRadius: "6px",
  padding: "16px",
};

const totalRowStyle: React.CSSProperties = {
  marginBottom: "4px",
};

const totalLabelStyle: React.CSSProperties = {
  color: "#5a4a3a",
  fontSize: "14px",
  margin: 0,
};

const totalValueColStyle: React.CSSProperties = {
  textAlign: "right",
};

const totalValueStyle: React.CSSProperties = {
  color: "#3d2c1e",
  fontSize: "14px",
  margin: 0,
};

const grandTotalLabelStyle: React.CSSProperties = {
  color: "#3d2c1e",
  fontSize: "16px",
  fontWeight: "bold",
  margin: 0,
};

const grandTotalValueStyle: React.CSSProperties = {
  color: "#6B2737",
  fontSize: "18px",
  fontWeight: "bold",
  margin: 0,
};

const addressSectionStyle: React.CSSProperties = {
  backgroundColor: "#fdf8f0",
  borderRadius: "6px",
  padding: "16px",
};

const addressLineStyle: React.CSSProperties = {
  color: "#5a4a3a",
  fontSize: "14px",
  margin: "0 0 2px",
};

const linkStyle: React.CSSProperties = {
  color: "#6B2737",
  textDecoration: "underline",
};

const footerStyle: React.CSSProperties = {
  backgroundColor: "#3d2c1e",
  padding: "24px 40px",
  textAlign: "center",
};

const footerTextStyle: React.CSSProperties = {
  color: "#c8a882",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 6px",
  letterSpacing: "1px",
};

const footerSubStyle: React.CSSProperties = {
  color: "rgba(200, 168, 130, 0.6)",
  fontSize: "12px",
  margin: "0 0 4px",
};
