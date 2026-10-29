import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, errMsg } from '../api/client.js';
import { CATEGORIES } from '../lib/constants.js';
import { longDate, rs, time12 } from '../lib/format.js';

const TABS = ['Overview', 'Bookings', 'Services'];
const NEXT = { pending: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled'], completed: [], cancelled: [] };

export default function Admin() {
  const [tab, setTab] = useState('Overview');
  return (
    <div className="w sec">
      <h2>Owner dashboard</h2>
      <div className="chips" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`chip ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === 'Overview' && <Overview />}
      {tab === 'Bookings' && <BookingsTab />}
      {tab === 'Services' && <ServicesTab />}
    </div>
  );
}

function Overview() {
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-stats'], queryFn: () => api.get('/admin/stats').then((r) => r.data) });
  if (isLoading) return <p className="mu">Loading...</p>;
  if (error) return <p className="alert">{errMsg(error)}</p>;
  const cards = [['Today', data.today], ['Upcoming', data.upcoming], ['Waiting for confirmation', data.pending], ['Completed', data.completed], ['Revenue (completed)', rs(data.revenue)]];
  return (
    <>
      <div className="stats">{cards.map(([l, v]) => <div className="stat" key={l}><b>{v}</b><span>{l}</span></div>)}</div>
      <h3 className="sub-h">Most booked services</h3>
      {data.topServices.length === 0 && <p className="mu">Nothing yet.</p>}
      {data.topServices.map((s) => (
        <div className="rw" key={s._id}><div className="n">{s._id}</div><span className="mu">{s.count} bookings</span><span className="pr">{rs(s.revenue)}</span></div>
      ))}
    </>
  );
}

function BookingsTab() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const params = { page, ...(status && { status }), ...(date && { date }) };
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-bookings', params],
    queryFn: () => api.get('/admin/bookings', { params }).then((r) => r.data),
    placeholderData: (prev) => prev, // keeps the old list on screen while the next page loads
  });
  const update = useMutation({
    mutationFn: ({ id, status: s }) => api.patch(`/admin/bookings/${id}/status`, { status: s }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-bookings'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); },
  });

  return (
    <>
      <div className="filters">
        <select className="f sel" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.keys(NEXT).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input className="f" type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }} aria-label="Filter by date" />
      </div>
      {isLoading && <p className="mu">Loading...</p>}
      {error && <p className="alert">{errMsg(error)}</p>}
      {update.isError && <p className="alert" role="alert">{errMsg(update.error)}</p>}
      {data?.data.length === 0 && <p className="mu">No bookings found.</p>}
      {data?.data.map((b) => (
        <article className="bk" key={b._id}>
          <div className="bk-top"><strong>{longDate(b.date)}, {time12(b.time)}</strong><span className={`st st-${b.status}`}>{b.status}</span></div>
          <p>{b.user?.name} &middot; <a href={`tel:${b.user?.phone}`}>{b.user?.phone}</a></p>
          <p className="mu">{b.items.map((i) => i.name).join(', ')}</p>
          {b.notes && <p className="mu">Note: {b.notes}</p>}
          <div className="bk-top">
            <span className="pr">{rs(b.total)}</span>
            <span className="btns">
              {NEXT[b.status].map((s) => (
                <button key={s} className={`btn sm ${s === 'cancelled' ? 'g' : ''}`} disabled={update.isPending} onClick={() => update.mutate({ id: b._id, status: s })}>
                  {s === 'confirmed' ? 'Confirm' : s === 'completed' ? 'Mark done' : 'Cancel'}
                </button>
              ))}
            </span>
          </div>
        </article>
      ))}
      {data && data.pages > 1 && (
        <div className="actions">
          <button className="btn g sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="mu pg">Page {data.page} of {data.pages}</span>
          <button className="btn g sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}

function ServicesTab() {
  const queryClient = useQueryClient();
  const refresh = () => { queryClient.invalidateQueries({ queryKey: ['admin-services'] }); queryClient.invalidateQueries({ queryKey: ['services'] }); };
  const { data = [], isLoading, error } = useQuery({ queryKey: ['admin-services'], queryFn: () => api.get('/services/all').then((r) => r.data) });
  const patch = useMutation({ mutationFn: ({ id, ...body }) => api.patch(`/services/${id}`, body), onSuccess: refresh });
  const del = useMutation({ mutationFn: (id) => api.delete(`/services/${id}`), onSuccess: refresh });
  const add = useMutation({ mutationFn: (body) => api.post('/services', body), onSuccess: () => { refresh(); setForm({ name: '', category: CATEGORIES[0], price: '' }); } });
  const [form, setForm] = useState({ name: '', category: CATEGORIES[0], price: '' });

  return (
    <>
      <form className="add-form" onSubmit={(e) => { e.preventDefault(); add.mutate({ ...form, price: Number(form.price) }); }}>
        <input className="f" placeholder="Service name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required aria-label="Service name" />
        <select className="f sel" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} aria-label="Category">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input className="f" type="number" min="0" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required aria-label="Price" />
        <button className="btn" disabled={add.isPending}>Add service</button>
      </form>
      {add.isError && <p className="alert" role="alert">{errMsg(add.error)}</p>}
      {isLoading && <p className="mu">Loading...</p>}
      {error && <p className="alert">{errMsg(error)}</p>}
      {data.map((s) => (
        <div className={`rw ${s.active ? '' : 'off'}`} key={s._id}>
          <div className="n">{s.name}<small>{s.category}</small></div>
          <input className="f price-in" type="number" min="0" defaultValue={s.price} aria-label={`Price for ${s.name}`}
            onBlur={(e) => Number(e.target.value) !== s.price && patch.mutate({ id: s._id, price: Number(e.target.value) })} />
          <button className="btn g sm" onClick={() => patch.mutate({ id: s._id, active: !s.active })}>{s.active ? 'Hide' : 'Show'}</button>
          <button className="btn g sm" onClick={() => window.confirm(`Delete ${s.name}?`) && del.mutate(s._id)}>Delete</button>
        </div>
      ))}
    </>
  );
}
