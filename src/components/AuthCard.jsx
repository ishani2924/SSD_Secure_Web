import React from 'react';
import { Link } from 'react-router-dom';

const AuthCard = ({ title, subtitle, icon, children, footerText, footerLink }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-surface via-surface-light to-background">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:flex flex-col items-center justify-center p-12 rounded-2xl bg-gradient-to-tr from-primary/10 via-secondary/8 to-transparent glass-morphism overflow-hidden relative">
          <div className="mb-6 text-6xl text-primary">{icon}</div>
          <h2 className="text-3xl font-extrabold mb-2">Welcome to WildSafe</h2>
          <p className="text-text-muted text-center max-w-[22rem]">Protect wildlife and report incidents quickly — help us keep habitats safe.</p>
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary/8 blur-3xl"></div>
        </div>

        <div className="p-8 lg:p-12 glass-morphism">
          <div className="text-center mb-6">
            <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-primary/40">
              {icon}
            </div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-text-muted mt-1">{subtitle}</p>
          </div>

          {children}

          {footerText && (
            <div className="mt-6 text-center text-sm text-text-muted">
              <span>{footerText} </span>
              {footerLink}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
