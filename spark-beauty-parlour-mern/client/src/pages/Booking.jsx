import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, errMsg } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { longDate, nextDays, rs, time12 } from '../lib/format.js';
import Icon from '../components/Icon.jsx';

const STEPS = ['Your picks', 'Date and time', 'Confirm'];

export default function Booking() {
  const { items, total, remove, clear } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const days = useMemo(() => nextDays(Number(import.meta.env.VITE_BOOKING_DAYS) || 14), []);
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(days[0].iso);
  const [time, setTime] = useState(null);
  const [notes, setNotes] = useState('');

  // Free slots are fetched per date and cached by React Query
  const slots = useQuery({
    queryKey: ['slots', date],
    enabled: step === 2,
    queryFn: () => api.get('/bookings/availability', { params: { date } }).then((r) => r.data),
  });

  const submit = useMutation({
    mutationFn: () => api.post('/bookings', { serviceIds: items.map((i) => i._id), date, time, notes: notes || undefined }),
    onSuccess: () => {
      clear();
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      navigate('/bookings', { state: { created: true } });
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ['slots', date] }),
  });

  if (items.length === 0) {
    return (
      <div className="w empty">
        <span className="ring"><Icon name="bag" /></span>
        <h2>Your booking is empty</h2>
        <p className="mu">Add a service to get started.</p>
        <Link className="btn" to="/services">Choose services</Link>
      </div>
    );
  }

  const pickAnother = () => { submit.reset(); setTime(null); setStep(2); };

  return (
    <div className="w sec narrow">
      <p className="mu step-n">Step {step} of 3</p>
      <h2>{STEPS[step - 1]}</h2>
      <ol className="prog" aria-hidden="true">{STEPS.map((s, i) => <li key={s} className={i < step ? 'on' : ''} />)}</ol>

      {step === 1 && (
        <>
          {items.map((s) => (
            <div className="rw" key={s._id}>
              <div className="n">{s.name}<small>{s.category}</small></div>
              <span className="pr">{rs(s.price)}</span>
              <button className="add" aria-label={`Remove ${s.name}`} onClick={() => remove(s._id)}>{'\u00D7'}</button>
            </div>
          ))}
          <div className="tot"><span className="mu">Total</span><span className="pr big">{rs(total)}</span></div>
          <div className="actions">
            <Link className="btn g" to="/services">Add more</Link>
            <button className="btn grow" onClick={() => setStep(2)}>Continue</button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="days" role="group" aria-label="Choose a day">
            {days.map((d) => (
              <button key={d.iso} className="day" aria-pressed={date === d.iso}
                onClick={() => { setDate(d.iso); setTime(null); }}>
                {d.wd}<b>{d.day}</b>{d.mon}
              </button>
            ))}
          </div>
          {slots.isLoading && <p className="mu">Checking free times...</p>}
          {slots.error && <p className="alert">{errMsg(slots.error)}</p>}
          {slots.data && slots.data.slots.length === 0 && <p className="mu">No times left on this day. Try another day.</p>}
          <div className="slots" role="group" aria-label="Choose a time">
            {slots.data?.slots.map((s) => (
              <button key={s.time} className="slot" disabled={!s.available} aria-pressed={time === s.time} onClick={() => setTime(s.time)}>
                {time12(s.time)}{!s.available && ' (full)'}
              </button>
            ))}
          </div>
          <div className="actions">
            <button className="btn g" onClick={() => setStep(1)}>Back</button>
            <button className="btn grow" disabled={!time} onClick={() => setStep(3)}>Continue</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <p className="sum"><strong>{longDate(date)} at {time12(time)}</strong><br />
            {items.map((i) => i.name).join(', ')}<br /><span className="pr">{rs(total)}</span></p>
          <label htmlFor="notes">Notes for us (optional)</label>
          <input id="notes" className="f" maxLength={300} value={notes} onChange={(e) => setNotes(e.target.value)} />
          {submit.isError && (
            <p className="alert" role="alert">
              {errMsg(submit.error)}{' '}
              {submit.error.response?.status === 409 && <button className="link" onClick={pickAnother}>Pick another time</button>}
            </p>
          )}
          <div className="actions">
            <button className="btn g" onClick={() => setStep(2)}>Back</button>
            <button className="btn grow" disabled={submit.isPending} onClick={() => submit.mutate()}>
              {submit.isPending ? 'Booking...' : 'Confirm booking'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
