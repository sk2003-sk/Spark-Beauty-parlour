import { Link, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, errMsg } from '../api/client.js';
import { longDate, rs, time12 } from '../lib/format.js';
import Skeleton from '../components/Skeleton.jsx';
import Icon from '../components/Icon.jsx';

export default function MyBookings() {
  const queryClient = useQueryClient();
  const created = useLocation().state?.created;
  const key = ['my-bookings'];
  const { data = [], isLoading, error } = useQuery({ queryKey: key, queryFn: () => api.get('/bookings/mine').then((r) => r.data) });

  // Optimistic update: the card changes at once and rolls back if the server says no
  const cancel = useMutation({
    mutationFn: (id) => api.patch(`/bookings/${id}/cancel`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old = []) => old.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b)));
      return { previous };
    },
    onError: (_e, _id, ctx) => queryClient.setQueryData(key, ctx.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  if (isLoading) return <Skeleton />;
  if (error) return <div className="w empty"><p className="mu">{errMsg(error)}</p></div>;

  return (
    <div className="w sec narrow">
      <h2>My bookings</h2>
      {created && <p className="ok"><Icon name="check" />Booking received. We will confirm it shortly.</p>}
      {cancel.isError && <p className="alert" role="alert">{errMsg(cancel.error)}</p>}
      {data.length === 0 && (
        <div className="empty"><p className="mu">No bookings yet.</p><Link className="btn" to="/services">Book a service</Link></div>
      )}
      {data.map((b) => (
        <article className="bk" key={b._id}>
          <div className="bk-top">
            <strong>{longDate(b.date)}, {time12(b.time)}</strong>
            <span className={`st st-${b.status}`}>{b.status}</span>
          </div>
          <p className="mu">{b.items.map((i) => i.name).join(', ')}</p>
          <div className="bk-top">
            <span className="pr">{rs(b.total)}</span>
            {['pending', 'confirmed'].includes(b.status) && (
              <button className="btn g sm" disabled={cancel.isPending} onClick={() => cancel.mutate(b._id)}>Cancel</button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
