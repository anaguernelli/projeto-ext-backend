import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="text-center py-4 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
      <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
        &copy; 2026 Pizzaria 404. Todos os direitos reservados.
      </p>
    </footer>
  );
};
