import { site, mapEmbed, mapLink } from '@/lib/site';
import { PageHead } from '@/components/Bits';
import { images } from '@/lib/content';
import { ContactForm } from '@/components/Forms';
import { isConfigured } from '@/lib/supabase/server';
import { SetupNotice } from '@/components/Bits';

export const metadata = { title: 'Contact' };

export default function Contact() {
  return (
    <>
      <PageHead photo={images.contact} title="Get In Touch" lead="Questions about rooms, day tours, events or activities? Our reservations team will reply within 24 hours." />
      <section className="section" >
        <div className="wrap split" style={{ alignItems: 'stretch' }}>
          <div className="contact-card">
            {!isConfigured && <SetupNotice />}
            <ContactForm />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="panel">
              <p style={{ margin: 0 }}><b>Email</b><br /><a className="link" href={`mailto:${site.email}`}>{site.email}</a></p>
              <p style={{ margin: '14px 0 0' }}><b>Phone</b><br /><a className="link" href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}>{site.phone}</a></p>
              <p style={{ margin: '14px 0 0' }}><b>Address</b><br />{site.address} · <a className="link" href={mapLink} target="_blank" rel="noreferrer">Directions</a></p>
            </div>
            <iframe className="map" src={mapEmbed} title="Map to the resort" loading="lazy" style={{ flex: 1 }} />
          </div>
        </div>
      </section>
    </>
  );
}
