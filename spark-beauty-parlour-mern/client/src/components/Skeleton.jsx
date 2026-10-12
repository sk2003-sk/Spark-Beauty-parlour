export default function Skeleton({ rows = 5 }) {
  return (
    <div className="w" aria-busy="true" aria-label="Loading">
      <div className="sk" style={{ height: 40, width: '55%', margin: '28px 0 18px' }} />
      {Array.from({ length: rows }, (_, i) => <div key={i} className="sk" style={{ height: 58, marginBottom: 12 }} />)}
    </div>
  );
}
