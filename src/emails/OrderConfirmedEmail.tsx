import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Row,
  Column,
  Hr,
  Tailwind,
} from '@react-email/components';

interface OrderConfirmedEmailProps {
  orderId: string;
  customerName: string;
  type: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}

export const OrderConfirmedEmail = ({
  orderId = 'ORD-123',
  customerName = 'Guest',
  type = 'delivery',
  items = [],
  total = 0,
}: OrderConfirmedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your SYÖ & JUO order has been confirmed.</Preview>
      <Tailwind>
        <Body className="bg-zinc-950 text-zinc-50 font-sans my-auto mx-auto p-4">
          <Container className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mx-auto max-w-[600px] mt-8 shadow-2xl">
            <Heading className="text-3xl font-bold tracking-tight text-white m-0 mb-6">
              SYÖ & JUO
            </Heading>
            
            <Text className="text-xl text-zinc-300 font-semibold mb-6">
              Hi {customerName}, your {type} order is confirmed!
            </Text>

            <Text className="text-zinc-400 text-sm leading-6 mb-8">
              We have received your order and our kitchen has started preparation. We will ensure everything is prepared with the utmost care and quality.
            </Text>

            <Section className="bg-zinc-950 rounded-lg p-6 mb-8">
              <Text className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Order Summary — #{orderId.slice(0, 8)}</Text>
              
              {items.map((item, i) => (
                <Row key={i} className="mb-2">
                  <Column className="w-[80%]">
                    <Text className="text-zinc-300 m-0 text-sm">{item.quantity}x {item.name}</Text>
                  </Column>
                  <Column className="w-[20%] text-right">
                    <Text className="text-zinc-300 m-0 text-sm">€{(item.quantity * item.price).toFixed(2)}</Text>
                  </Column>
                </Row>
              ))}

              <Hr className="border border-zinc-800 my-4" />
              
              <Row>
                <Column className="w-[80%]">
                  <Text className="text-white font-bold m-0">Total</Text>
                </Column>
                <Column className="w-[20%] text-right">
                  <Text className="text-emerald-400 font-bold m-0">€{total.toFixed(2)}</Text>
                </Column>
              </Row>
            </Section>

            <Hr className="border border-zinc-800 my-6" />

            <Text className="text-xs text-zinc-500 text-center leading-relaxed">
              SYÖ & JUO • Mannerheimintie 12, 00100 Helsinki, Finland<br/>
              If you need to make changes to your order, please call us immediately at +358 40 123 4567.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderConfirmedEmail;
