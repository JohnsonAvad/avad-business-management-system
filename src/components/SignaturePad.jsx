import { useRef } from 'react';

export default function SignaturePad({ title, onSave, onClose }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  const ctx = () => canvasRef.current.getContext('2d');
  function pos(e) {
    const r = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return [(t.clientX - r.left) * (canvasRef.current.width / r.width),
            (t.clientY - r.top) * (canvasRef.current.height / r.height)];
  }
  function start(e) {
    e.preventDefault();
    drawing.current = true;
    const c = ctx();
    c.lineWidth = 2.5; c.lineCap = 'round'; c.strokeStyle = '#111827';
    const [x, y] = pos(e);
    c.beginPath(); c.moveTo(x, y);
  }
  function move(e) {
    if (!drawing.current) return;
    e.preventDefault();
    const c = ctx();
    const [x, y] = pos(e);
    c.lineTo(x, y); c.stroke();
  }
  const end = () => { drawing.current = false; };
  const clear = () => ctx().clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

  return (
    <div className="print-overlay" onClick={onClose}>
      <div className="print-card" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        <canvas ref={canvasRef} width={400} height={160}
          style={{ width: '100%', height: 160, border: '1px dashed var(--border)', borderRadius: 10, background: '#fff', touchAction: 'none' }}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
        <div className="choice-sub" style={{ margin: '6px 0 12px' }}>Sign above with your finger or mouse.</div>
        <div className="print-actions">
          <button className="btn btn-outline" onClick={clear}>Clear</button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-green" onClick={() => onSave(canvasRef.current.toDataURL())}>Save Signature</button>
        </div>
      </div>
    </div>
  );
}