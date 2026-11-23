import { site, mapEmbed, mapLink } from '@/lib/site';
import { PageHead } from '@/components/Bits';
import { ContactForm } from '@/components/Forms';
import { isConfigured } from '@/lib/supabase/server';
import { SetupNotice } from '@/components/Bits';

export const metadata = { title: 'Contact' };

export default function Contact() {
  return (
    <>
      <PageHead title="Contact" lead="Questions about rooms, day passes or group stays. We reply within a day." />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap split" style={{ alignItems: 'stretch' }}>
          <div className="contact-card">
            {!isConfigured && <SetupNotice />}
            <ContactForm />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="panel">
              <p style={{ margin: 0 }}><b>Email</b><br /><a className="link" href={`mailto:${site.email}`}>{site.email}</a></p>
              <p style={{ margin: '14px 0 0' }}><b>Phone</b><br /><a className="link" href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a></p>
              <p style={{ margin: '14px 0 0' }}><b>Address</b><br />{site.address} · <a className="link" href={mapLink} target="_blank" rel="noreferrer">Directions</a></p>
            </div>
            <iframe className="map" src={mapEmbed} title="Map to the resort" loading="lazy" style={{ flex: 1 }} />
          </div>
        </div>
      </section>
    </>
  );
}
