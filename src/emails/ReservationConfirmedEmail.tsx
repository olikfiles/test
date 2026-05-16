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
  Hr,
  Tailwind,
} from '@react-email/components';

interface ReservationConfirmedEmailProps {
  guestName: string;
  date: string;
  time: string;
  partySize: number;
  occasion?: string;
}

function formatDate(d: string) {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-FI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export const ReservationConfirmedEmail = ({
  guestName = 'Guest',
  date = '2026-12-31',
  time = '19:00',
  partySize = 2,
  occasion,
}: ReservationConfirmedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your reservation at SYÖ & JUO is confirmed.</Preview>
      <Tailwind>
        <Body className="bg-zinc-950 text-zinc-50 font-sans my-auto mx-auto p-4">
          <Container className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mx-auto max-w-[600px] mt-8 shadow-2xl">
            <Heading className="text-3xl font-bold tracking-tight text-white m-0 mb-6">
              SYÖ & JUO
            </Heading>
            
            <Text className="text-xl text-zinc-300 font-semibold mb-6">
              Reservation Confirmed
            </Text>

            <Text className="text-zinc-400 text-sm leading-6 mb-8">
              Hi {guestName}, we are delighted to confirm your reservation. We look forward to providing you with an unforgettable dining experience.
            </Text>

            <Section className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 mb-8">
              <Text className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Details</Text>
              <Text className="text-white text-base m-0 mb-2"><strong>Date:</strong> {formatDate(date)}</Text>
              <Text className="text-white text-base m-0 mb-2"><strong>Time:</strong> {time}</Text>
              <Text className="text-white text-base m-0 mb-2"><strong>Guests:</strong> {partySize}</Text>
              {occasion && <Text className="text-white text-base m-0"><strong>Occasion:</strong> {occasion}</Text>}
            </Section>

            <Hr className="border border-zinc-800 my-6" />

            <Text className="text-xs text-zinc-500 leading-relaxed mb-4">
              <strong>Cancellation Policy:</strong> Please note that we require at least 24 hours notice for any cancellations or changes to your party size. 
              Late cancellations or no-shows may incur a fee of €50 per person.
            </Text>

            <Text className="text-xs text-zinc-500 text-center leading-relaxed mt-8">
              SYÖ & JUO • Mannerheimintie 12, 00100 Helsinki, Finland<br/>
              +358 40 123 4567 • info@syojuo.fi
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ReservationConfirmedEmail;
