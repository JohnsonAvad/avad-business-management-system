import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import { isValidPhone, cleanPhoneInput } from '../utils/helpers';

const ROLES = ['Manager', 'Sales', 'Cashier', 'Storekeeper', 'Driver', 'Accountant', 'Cleaner'];

export default function HR() {
  const { employees, attendance, leaves, payrolls, addEmployee, updateEmployee, markAttendance, addLeave, updateLeave, generatePayroll, payPayroll } = useData();
  const { format } = useCurrency();
  const [tab, setTab] = useState('employees');
  const [modal, setModal] = useState(null);
  const [eForm, setEForm] = useState({ name: '', phone: '', role: ROLES[1], salary: '' });
  const [lForm, setLForm] = useState({ employeeId: '', fromDate: '', toDate: '', reason: '' });
  const [paying, setPaying] = useState(null);
  const [payMethod, setPayMethod] = useState('Cash');
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [error, setError] = useState('');

  const activeEmps = (employees || []).filter(e => e.active !== false);
  const empName = id => (employees || []).find(e => e.id === id)?.name || '—';
  const attFor = (empId, date) => (attendance || []).find(a => a.employeeId === empId && a.date === date)?.status;
  const dayStatuses = (attendance || []).filter(a => a.date === attDate);
  const countPresent = dayStatuses.filter(a => a.status === 'Present').length;
  const countHalf = dayStatuses.filter(a => a.status === 'Half').length;
  const countAbsent = dayStatuses.filter(a => a.status === 'Absent').length;

  function saveEmployee(e) {
    e.preventDefault(); setError('');
    if (!eForm.name.trim()) return setError('Please enter the employee name.');
    if (!isValidPhone(eForm.phone)) return setError('Please enter a valid phone number (10 digits).');
    if (!(Number(eForm.salary) > 0)) return setError('Please enter the monthly salary.');
    addEmployee({ name: eForm.name.trim(), phone: eForm.phone.trim(), role: eForm.role, salary: Number(eForm.salary) });
    setModal(null); setEForm({ name: '', phone: '', role: ROLES[1], salary: '' });
  }

  function saveLeave(e) {
    e.preventDefault(); setError('');
    if (!lForm.employeeId) return setError('Please choose an employee.');
    if (!lForm.fromDate || !lForm.toDate) return setError('Please pick the leave dates.');
    addLeave({ employeeId: Number(lForm.employeeId), fromDate: lForm.fromDate, toDate: lForm.toDate, reason: lForm.reason });
    setModal(null); setLForm({ employeeId: '', fromDate: '', toDate: '', reason: '' });
  }

  const monthPayrolls = (payrolls || []).filter(p => p.month === month);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">HR & Payroll</h1>
          <div className="page-sub">Your team, attendance, and salaries.</div>
        </div>
        <div className="pay-methods" style={{ margin: 0 }}>
          {[['employees', 'Employees'], ['attendance', 'Attendance'], ['leave', 'Leave'], ['payroll', 'Payroll']].map(([k, label]) => (
            <button key={k} className={'pay-btn' + (tab === k ? ' selected' : '')} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>
      </div>

      {tab === 'employees' && (
        <>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div />
            <button className="btn btn-green" onClick={() => { setError(''); setModal('employee'); }}>+ Add Employee</button>
          </div>
          <div className="panel">
            {(employees || []).length === 0 ? <div className="empty-state">No employees yet.</div> : (
              <table className="table">
                <thead><tr><th>Name</th><th>Phone</th><th>Role</th><th>Salary</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {(employees || []).map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 700 }}>{e.name}</td>
                      <td>{e.phone}</td>
                      <td><span className="badge blue">{e.role}</span></td>
                      <td style={{ fontWeight: 700 }}>{format(e.salary)}</td>
                      <td><span className={'badge ' + (e.active !== false ? 'green' : 'grey')}>{e.active !== false ? 'Active' : 'Disabled'}</span></td>
                      <td>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13 }}
                          onClick={() => updateEmployee(e.id, { active: e.active === false })}>
                          {e.active !== false ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'attendance' && (
        <div className="panel">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
            <input className="input" type="date" style={{ maxWidth: 200 }} value={attDate} onChange={e => setAttDate(e.target.value)} />
            <div className="choice-sub">
              Present: <strong style={{ color: 'var(--green-deep)' }}>{countPresent}</strong> •
              Half: <strong style={{ color: 'var(--amber)' }}>{countHalf}</strong> •
              Absent: <strong style={{ color: 'var(--red)' }}>{countAbsent}</strong>
            </div>
          </div>
          {activeEmps.map(e => (
            <div key={e.id} className="cart-row">
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontWeight: 700 }}>{e.name}</div>
                <div className="choice-sub">{e.role}</div>
              </div>
              <div className="pay-methods" style={{ margin: 0 }}>
                {['Present', 'Half', 'Absent'].map(st => (
                  <button key={st}
                    className={'pay-btn' + (attFor(e.id, attDate) === st ? (st === 'Absent' ? ' selected-red' : ' selected') : '')}
                    style={{ padding: '8px 12px', fontSize: 13 }}
                    onClick={() => markAttendance({ date: attDate, employeeId: e.id, status: st })}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'leave' && (
        <>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div />
            <button className="btn btn-green" onClick={() => { setError(''); setModal('leave'); }}>+ Leave Request</button>
          </div>
          <div className="panel">
            {(leaves || []).length === 0 ? <div className="empty-state">No leave requests.</div> : (
              [...(leaves || [])].reverse().map(l => (
                <div key={l.id} className="cart-row">
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 700 }}>{empName(l.employeeId)}</div>
                    <div className="choice-sub">{l.fromDate} → {l.toDate}{l.reason ? ' • ' + l.reason : ''}</div>
                  </div>
                  <span className={'badge ' + (l.status === 'Approved' ? 'green' : l.status === 'Rejected' ? 'red' : 'amber')}>{l.status}</span>
                  {l.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-green" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => updateLeave(l.id, { status: 'Approved' })}>Approve</button>
                      <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => updateLeave(l.id, { status: 'Rejected' })}>Reject</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {tab === 'payroll' && (
        <>
          <div className="panel" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <input className="input" type="month" style={{ maxWidth: 200 }} value={month} onChange={e => setMonth(e.target.value)} />
              <button className="btn btn-green" onClick={() => generatePayroll(month)}>Generate Payslips</button>
              <div className="choice-sub">Salaries are calculated automatically. Absent days and half days are deducted.</div>
            </div>
          </div>
          <div className="panel">
            {monthPayrolls.length === 0 ? <div className="empty-state">No payslips for this month yet. Tap Generate Payslips.</div> : (
              <table className="table">
                <thead><tr><th>Employee</th><th>Base Salary</th><th>Deductions</th><th>Net Pay</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {monthPayrolls.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700 }}>{empName(p.employeeId)}</td>
                      <td>{format(p.base)}</td>
                      <td style={{ color: 'var(--red)' }}>{p.deductions > 0 ? '− ' + format(p.deductions) : '—'}</td>
                      <td style={{ fontWeight: 800 }}>{format(p.net)}</td>
                      <td><span className={'badge ' + (p.status === 'Paid' ? 'green' : 'amber')}>{p.status}</span></td>
                      <td>
                        {p.status !== 'Paid' && (
                          <button className="btn btn-green" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => { setPaying(p); setPayMethod('Cash'); }}>
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {modal === 'employee' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={saveEmployee}>
            <div className="modal-title">Add Employee</div>
            <div className="form-group">
              <label>Name</label>
              <input className="input" value={eForm.name} onChange={e => setEForm({ ...eForm, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="input" value={eForm.phone} onChange={e => setEForm({ ...eForm, phone: cleanPhoneInput(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select className="input" value={eForm.role} onChange={e => setEForm({ ...eForm, role: e.target.value })}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Monthly salary</label>
              <input className="input" inputMode="numeric" value={eForm.salary} onChange={e => setEForm({ ...eForm, salary: e.target.value })} />
            </div>
            {error && <div className="alert red" style={{ marginTop: 0 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-green btn-lg" style={{ flex: 1 }}>Save Employee</button>
            </div>
          </form>
        </div>
      )}

      {modal === 'leave' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={saveLeave}>
            <div className="modal-title">Leave Request</div>
            <div className="form-group">
              <label>Employee</label>
              <select className="input" value={lForm.employeeId} onChange={e => setLForm({ ...lForm, employeeId: e.target.value })}>
                <option value="">-- Choose --</option>
                {activeEmps.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>From</label>
              <input className="input" type="date" value={lForm.fromDate} onChange={e => setLForm({ ...lForm, fromDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label>To</label>
              <input className="input" type="date" value={lForm.toDate} onChange={e => setLForm({ ...lForm, toDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Reason</label>
              <input className="input" value={lForm.reason} onChange={e => setLForm({ ...lForm, reason: e.target.value })} />
            </div>
            {error && <div className="alert red" style={{ marginTop: 0 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-green btn-lg" style={{ flex: 1 }}>Save Request</button>
            </div>
          </form>
        </div>
      )}

      {paying && (
        <div className="modal-overlay" onClick={() => setPaying(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Pay Salary – {empName(paying.employeeId)}</div>
            <div className="total-line big"><span>Net pay</span><span className="amt">{format(paying.net)}</span></div>
            <div className="label" style={{ margin: '12px 0 6px' }}>Pay using</div>
            <div className="pay-methods">
              {['Cash', 'Mobile Money', 'Bank'].map(m => (
                <button key={m} className={'pay-btn' + (payMethod === m ? ' selected' : '')} onClick={() => setPayMethod(m)}>{m}</button>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setPaying(null)}>Cancel</button>
              <button className="btn btn-green btn-lg" style={{ flex: 1 }} onClick={() => { payPayroll({ id: paying.id, method: payMethod }); setPaying(null); }}>
                Pay {format(paying.net)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}