import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useServices } from '../hooks/useServices.js';
import { ICON, PARLOUR, slug } from '../lib/constants.js';
import { rs } from '../lib/format.js';
import Icon from '../components/Icon.jsx';

export default function Home() {
  const { data: services = [], isLoading } = useServices();

  // Category list with the lowest price in each, built from live data
  const categories = useMemo(() => {
    const map = new Map();
    services.forEach((s) => {
      const c = map.get(s.category);
      map.set(s.category, c ? Math.min(c, s.price) : s.price);
    });
    return [...map].map(([name, from]) => ({ name, from }));
  }, [services]);

  const ticker = categories.map((c) => `${c.name} from ${rs(c.from)}`).join('   \u2022   ');

  return (
    <>
      <section className="hero">
        <div className="blob b1" /><div className="blob b2" />
        <div className="w hero-in">
          <div>
            <span className="pill">Beauty &middot; Style &middot; Confidence</span>
            <h1>Glow up,<br /><em>your way</em></h1>
            <p className="lead">Facials, hair spa, waxing and more. Pick your services, choose a time and book in under a minute.</p>
            <div className="cta">
              <Link className="btn" to="/services">Book a service</Link>
              <a className="btn g" href={`tel:${PARLOUR.phone}`}>Call us</a>
            </div>
          </div>
          <div className="art" aria-hidden="true">
            <span className="orb o1"><Icon name="scissors" /></span>
            <span className="orb o2"><Icon name="gem" /></span>
            <span className="orb o3"><Icon name="bottle" /></span>
          </div>
        </div>
      </section>

      {ticker && <div className="mq" aria-hidden="true"><div>{ticker}   {'\u2022'}   {ticker}</div></div>}

      <div className="w">
        <section className="sec">
          <h2>Pick your vibe</h2>
          <p className="mu">Tap a category to see prices.</p>
          <div className="bubs">
            {isLoading && Array.from({ length: 8 }, (_, i) => <div key={i} className="sk bub-sk" />)}
            {categories.map((c) => (
              <Link key={c.name} className="bub" to={`/services#${slug(c.name)}`}>
                <span><Icon name={ICON[c.name] || 'spark'} /></span>
                {c.name}
                <small>from {rs(c.from)}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="sec">
          <h2>Book in 3 steps</h2>
          <div className="how">
            {[['1', 'Choose', 'Add the services you want.'], ['2', 'Pick a slot', 'Select a day and a time that is free.'], ['3', 'Confirm', 'We confirm your booking and see you there.']].map(([n, t, d]) => (
              <div key={n}><b>{n}</b><h3>{t}</h3><p className="mu">{d}</p></div>
            ))}
          </div>
        </section>

        <section className="sec">
          <h2>Find us</h2>
          <p className="addr">{PARLOUR.address[0]}<br />{PARLOUR.address[1]}<br /><strong>{PARLOUR.phone}</strong></p>
          <a className="btn g" href={PARLOUR.maps} target="_blank" rel="noopener noreferrer"><Icon name="pin" />Open in Maps</a>
        </section>
      </div>
    </>
  );
}
