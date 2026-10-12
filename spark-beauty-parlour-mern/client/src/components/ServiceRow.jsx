import { memo } from 'react';
import { rs } from '../lib/format.js';

// memo keeps long lists fast: a row re-renders only when its own state changes
function ServiceRow({ service, selected, onToggle, sub }) {
  return (
    <div className="rw">
      <div className="n">
        {service.name}
        {sub && <small>{sub}</small>}
      </div>
      <span className="pr">{rs(service.price)}</span>
      <button
        className="add"
        aria-pressed={selected}
        aria-label={`${selected ? 'Remove' : 'Add'} ${service.name}`}
        onClick={() => onToggle(service)}
      >
        {selected ? '\u2713' : '+'}
      </button>
    </div>
  );
}

export default memo(ServiceRow);
