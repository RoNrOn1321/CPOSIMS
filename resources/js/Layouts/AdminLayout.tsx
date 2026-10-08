import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-stct-maroon text-white p-6">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="space-y-4">
          <a href="#" className="block py-2 px-4 rounded hover:bg-white/10">Dashboard</a>
          <a href="#" className="block py-2 px-4 rounded bg-white/20">Products</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-white/10">Audit Logs</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-white/10">Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
