import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — SYÖ & JUO',
  description: 'How SYÖ & JUO collects, uses, and protects your personal data.',
};

const sections = [
  { title: '1. Who We Are', body: 'SYÖ & JUO Oy is a Finnish limited company registered at Pohjoisesplanadi 27, 00100 Helsinki, Finland. We operate the SYÖ & JUO dining room and our at-home delivery service. This policy explains how we handle the personal data you share with us.' },
  { title: '2. Data We Collect', body: 'We collect contact details (name, email, phone) when you make a reservation or order; dietary and allergy information where you choose to provide them; order history to process and track deliveries; and technical data (IP address, browser type) automatically collected via web server logs.' },
  { title: '3. How We Use Your Data', body: 'We use your data to fulfil reservations and delivery orders, communicate about your booking, comply with Finnish and EU legal requirements, and improve our services. We do not sell your data to any third party or use it for automated profiling.' },
  { title: '4. Legal Basis', body: 'Our legal bases are: contractual necessity (to fulfil your order or reservation); legitimate interest (website security); legal obligation (VAT records); and explicit consent where we process dietary data.' },
  { title: '5. Data Sharing', body: 'We share data only with delivery partners (to complete at-home orders), our PCI-DSS compliant payment processor, and public authorities when required by Finnish law. All third parties are bound by GDPR-compliant data processing agreements.' },
  { title: '6. Data Retention', body: 'Reservation and order records are kept for seven years under Finnish accounting law, then permanently deleted. Website logs are retained for 90 days.' },
  { title: '7. Your Rights', body: 'Under GDPR you have the right to access, correct, erase, restrict, or port your personal data. Email privacy@syojuo.fi to exercise these rights. You may also complain to the Finnish Data Protection Ombudsman at tietosuoja.fi.' },
  { title: '8. Cookies', body: 'This website uses strictly necessary session cookies only (to keep your cart). We do not use advertising or tracking cookies. If we add analytics in future, we will update this policy and seek your consent first.' },
  { title: '9. Contact', body: 'Questions? Contact our data controller at privacy@syojuo.fi or write to Pohjoisesplanadi 27, 00100 Helsinki, Finland.' },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-32 pb-32 bg-background">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-muted-foreground mb-6">Legal</p>
        <h1 className="font-display font-bold text-5xl text-foreground mb-4 pb-2">Privacy Policy</h1>
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
          <Link href="/terms" className="font-medium text-foreground hover:text-primary transition-colors">Terms of Service →</Link>
          <Link href="/" className="text-gray-400 hover:text-foreground transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
