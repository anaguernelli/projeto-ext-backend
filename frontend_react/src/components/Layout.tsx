import React, { useMemo } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const embers = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const size = Math.random() * 10 + 4; // 4px to 14px
      const left = Math.random() * 100; // 0% to 100%
      const delay = Math.random() * 15; // 0s to 15s
      const duration = Math.random() * 10 + 10; // 10s to 20s
      return { id: i, size, left, delay, duration };
    });
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100 w-100 position-relative">
      {/* Background wood oven embers */}
      <div className="ember-container">
        {embers.map((ember) => (
          <div
            key={ember.id}
            className="ember"
            style={{
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              left: `${ember.left}%`,
              animationDelay: `${ember.delay}s`,
              animationDuration: `${ember.duration}s`,
            }}
          />
        ))}
      </div>

      <Navbar />
      <main className="flex-grow-1" style={{ paddingTop: '96px', position: 'relative' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};
