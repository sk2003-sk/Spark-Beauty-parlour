import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useServices } from '../hooks/useServices.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useCart } from '../context/CartContext.jsx';
import { ICON, slug } from '../lib/constants.js';
import ServiceRow from '../components/ServiceRow.jsx';
import Skeleton from '../components/Skeleton.jsx';
import Icon from '../components/Icon.jsx';
import { errMsg } from '../api/client.js';

export default function Services() {
  const { data: services = [], isLoading, error } = useServices();
  const { has, toggle } = useCart();
  const [q, setQ] = useState('');
  const term = useDebounce(q).trim().toLowerCase();
  const { hash } = useLocation();

  const groups = useMemo(() => {
    const map = new Map();
    services
      .filter((s) => !term || s.name.toLowerCase().includes(term) || s.category.toLowerCase().includes(term))
      .forEach((s) => map.set(s.category, [...(map.get(s.category) || []), s]));
    return [...map];
  }, [services, term]);

  // Scroll to a category when arriving from the home page (/services#hair-care)
  useEffect(() => {
    if (hash && groups.length) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash, groups.length]);

  if (isLoading) return <Skeleton />;
  if (error) return <div className="w empty"><p className="mu">{errMsg(error)}</p></div>;

  return (
    <div className="w sec">
      <h1 className="h1s">Services</h1>
      <input className="q" type="search" value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Search facial, wax, hair spa" aria-label="Search services" />
      <div className="chips">
        {[...new Set(services.map((s) => s.category))].map((c) => (
          <a key={c} className="chip" href={`#${slug(c)}`}>{c}</a>
        ))}
      </div>
      {groups.length === 0 && <p className="mu">Nothing matches. Try another word.</p>}
      {groups.map(([category, list]) => (
        <section key={category} id={slug(category)} className="grp">
          <h3><Icon name={ICON[category] || 'spark'} className="hi" />{category}</h3>
          {list.map((s) => <ServiceRow key={s._id} service={s} selected={has(s._id)} onToggle={toggle} />)}
        </section>
      ))}
    </div>
  );
}
