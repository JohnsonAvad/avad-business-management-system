import Icon from '../components/Icon';

export default function Placeholder({ title, icon, note }) {
  return (
    <div className="panel placeholder">
      <div className="placeholder-icon"><Icon name={icon} size={30} /></div>
      <h2 style={{ marginBottom: 8 }}>{title}</h2>
      <p style={{ color: 'var(--muted)', maxWidth: 420 }}>{note}</p>
    </div>
  );
}