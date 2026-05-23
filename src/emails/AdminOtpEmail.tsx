import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Text,
  Section,
  Hr,
  Tailwind,
} from '@react-email/components';

interface AdminOtpEmailProps {
  otp: string;
}

export const AdminOtpEmail = ({ otp = '123456' }: AdminOtpEmailProps) => (
  <Html>
    <Head />
    <Preview>Your SYÖ & JUO admin login code: {otp}</Preview>
    <Tailwind>
      <Body className="bg-zinc-950 text-zinc-50 font-sans my-auto mx-auto p-4">
        <Container className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mx-auto max-w-[480px] mt-8">
          <Text className="font-bold text-2xl tracking-widest uppercase text-white m-0 mb-1">
            SYÖ & JUO
          </Text>
          <Text className="text-zinc-500 text-xs tracking-widest uppercase m-0 mb-8">
            Operations Portal
          </Text>

          <Text className="text-zinc-300 text-sm leading-6 mb-6">
            Use the code below to sign in to the admin portal. It expires in{' '}
            <strong className="text-white">10 minutes</strong> and can only be used once.
          </Text>

          <Section className="bg-zinc-950 rounded-xl p-6 mb-6 text-center">
            <Text className="text-4xl font-bold tracking-[0.3em] text-white m-0 font-mono">
              {otp}
            </Text>
          </Section>

          <Text className="text-zinc-500 text-xs leading-5">
            If you did not request this code, someone may be trying to access your admin panel.
            You can safely ignore this email — the code will expire automatically.
          </Text>

          <Hr className="border-zinc-800 my-6" />

          <Text className="text-zinc-600 text-xs text-center m-0">
            SYÖ & JUO · Mannerheimintie 12, 00100 Helsinki
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default AdminOtpEmail;
