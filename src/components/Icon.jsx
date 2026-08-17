const paths = {
  home: ['M3 10.5 12 3l9 7.5', 'M5 10v10h5v-6h4v6h5V10'],
  sales: ['M2 3h3l2.7 11h11.6L22 7H6', 'M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z', 'M18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'],
  customers: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M2 21c0-4 3-6 7-6s7 2 7 6', 'M17 3.5a4 4 0 0 1 0 7', 'M22 21c0-3-1.5-5-4-5.5'],
  inventory: ['M21 8l-9-5-9 5v8l9 5 9-5V8z', 'M3 8l9 5 9-5', 'M12 13v8'],
  purchases: ['M6 7h12l1.5 14h-15L6 7z', 'M9 10V6a3 3 0 0 1 6 0v4'],
  suppliers: ['M1 5h14v11H1z', 'M15 9h4l4 4v3h-8', 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
  expenses: ['M12 3v12', 'M7 10l5 5 5-5', 'M4 21h16'],
  invoices: ['M6 2h12v20l-2-1.5-2 1.5-2-1.5L10 22l-2-1.5L6 22V2z', 'M9 7h6', 'M9 11h6', 'M9 15h4'],
  accounting: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'],
  banks: ['M3 9l9-6 9 6', 'M4 9v11', 'M20 9v11', 'M8 12v5', 'M12 12v5', 'M16 12v5', 'M2 20h20'],
  hr: ['M3 5h18v14H3z', 'M8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M5.5 16c.5-2 1.5-3 2.5-3s2 1 2.5 3', 'M14 9h5', 'M14 13h5'],
  marketing: ['M3 10v4h4l7 5V5l-7 5H3z', 'M17.5 9.5a5 5 0 0 1 0 5'],
  reports: ['M3 3v18h18', 'M8 17v-6', 'M13 17V7', 'M18 17v-4'],
  settings: ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3', 'M4.6 4.6l2.1 2.1', 'M17.3 17.3l2.1 2.1', 'M19.4 4.6l-2.1 2.1', 'M6.7 17.3l-2.1 2.1'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.3-4.3'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9', 'M13.7 21a2 2 0 0 1-3.4 0'],
  logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  plus: ['M12 5v14', 'M5 12h14'],
  menu: ['M3 6h18', 'M3 12h18', 'M3 18h18'],
  crm: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M2 21c0-4 3-6 7-6s7 2 7 6', 'M19 3l.9 2.1L22 6l-2.1.9L19 9l-.9-2.1L16 6l2.1-.9z'],
};

export default function Icon({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {(paths[name] || []).map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}