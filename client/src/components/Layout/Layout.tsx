import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

export function Layout({ title, children }: LayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title={title} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
