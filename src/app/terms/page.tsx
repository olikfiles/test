import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — SYÖ & JUO',
  description: 'The terms governing your use of the SYÖ & JUO website, reservations, and at-home dining service.',
};

const sections = [
  { title: '1. About These Terms', body: 'These terms govern your use of the SYÖ & JUO website (syojuo.fi) and any associated services, including online reservations and our at-home delivery offering. By using our website or services you agree to these terms. If you do not agree, please do not use our services.' },
  { title: '2. Reservations', body: 'A reservation request is not confirmed until you receive a written confirmation from us by email. We reserve the right to decline reservation requests. Tables held for more than 15 minutes past the booked time without notice may be released. For groups of 6 or more, a credit card guarantee may be required at the time of booking.' },
  { title: '3. Cancellations & No-Shows', body: 'We ask for at least 24 hours notice for cancellations. Late cancellations or no-shows for tables of 4 or more may incur a cancellation fee of €25 per guest. We understand that circumstances change — please contact us as early as possible.' },
  { title: '4. Online Orders & Delivery', body: 'Orders placed through our website constitute a binding purchase agreement upon payment confirmation. Delivery times are estimates and may vary. Risk of loss passes to you upon delivery. If your order arrives damaged or incorrect, please contact us within 2 hours of delivery.' },
  { title: '5. Pricing & Payment', body: 'All prices are in Euros (€) and inclusive of Finnish VAT (25.5% for restaurant services, 14% for food deliveries). We accept major credit and debit cards. Payment is taken at the time of order for deliveries, and at the end of service for dine-in.' },
  { title: '6. Allergens & Dietary Requirements', body: 'We take allergies and dietary requirements seriously. You must inform us of all relevant allergies and dietary needs at the time of booking or ordering. While we take all reasonable precautions, our kitchen handles nuts, gluten, dairy, and other common allergens. We cannot guarantee a completely allergen-free environment.' },
  { title: '7. Website Use', body: 'You may use this website for personal, non-commercial purposes only. You must not scrape, copy, or reproduce content without our written permission. We reserve the right to suspend access to any user who misuses the website.' },
  { title: '8. Intellectual Property', body: 'All content on this website — including photography, menus, copy, and design — is owned by or licensed to SYÖ & JUO Oy. Nothing on this site grants you any right to use our name, logo, or other intellectual property without our written consent.' },
  { title: '9. Limitation of Liability', body: 'To the extent permitted by Finnish law, SYÖ & JUO Oy shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or services. Our total liability to you shall not exceed the amount you paid for the specific service in question.' },
  { title: '10. Governing Law', body: 'These terms are governed by the laws of Finland. Any disputes shall be resolved in the Helsinki District Court (Helsingin käräjäoikeus), unless mandatory consumer protection law in your country of residence provides otherwise.' },
  { title: '11. Changes to These Terms', body: 'We may update these terms from time to time. Material changes will be signalled by an updated date at the top of this page. Continued use of our services after any change constitutes acceptance of the new terms.' },
  { title: '12. Contact', body: 'For questions about these terms, email legal@syojuo.fi or write to SYÖ & JUO Oy, Pohjoisesplanadi 27, 00100 Helsinki, Finland.' },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-32 pb-32 bg-background">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-muted-foreground mb-6">Legal</p>
        <h1 className="font-display font-bold text-5xl text-foreground mb-4 pb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-16">Last updated: 16 May 2025</p>
        <div className="space-y-12">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-display font-bold text-xl text-foreground mb-3">{s.title}</h2>
              <p className="text-gray-500 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-20 pt-12 border-t border-gray-100 flex gap-6 text-sm">
          <Link href="/privacy" className="font-medium text-foreground hover:text-primary transition-colors">Privacy Policy →</Link>
          <Link href="/" className="text-gray-400 hover:text-foreground transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
