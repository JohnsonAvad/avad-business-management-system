import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState('');
  const [manual, setManual] = useState('');
  const doneRef = useRef(false);

  useEffect(() => {
    let scanner;
    const timer = setTimeout(async () => {
      try {
        scanner = new Html5Qrcode('avad-barcode-reader');
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 150 } },
          text => { if (!doneRef.current) { doneRef.current = true; onScan(text); } },
          () => {}
        );
      } catch {
        setError('Camera not available here. Type the barcode number below instead.');
      }
    }, 50);
    return () => {
      clearTimeout(timer);
      if (scanner) scanner.stop().then(() => scanner.clear()).catch(() => {});
    };
  }, []);

  return (
    <div className="print-overlay" onClick={onClose}>
      <div className="print-card" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Scan Barcode</div>
        <div id="avad-barcode-reader" style={{ borderRadius: 10, overflow: 'hidden', background: '#000', minHeight: 180 }} />
        {error && <div className="alert amber" style={{ marginTop: 10 }}>{error}</div>}
        <form style={{ marginTop: 12 }} onSubmit={e => { e.preventDefault(); if (manual.trim()) onScan(manual.trim()); }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Or type the barcode number</label>
            <input className="input" value={manual} onChange={e => setManual(e.target.value)} placeholder="e.g. 6291041500213" />
          </div>
          <div className="print-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
            <button type="submit" className="btn btn-green">Use This Code</button>
          </div>
        </form>
      </div>
    </div>
  );
}