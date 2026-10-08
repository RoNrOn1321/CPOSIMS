import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';

export default function AuditLogsIndex() {
  const dummyLogs = [
    { id: 1, action: 'Product Created', user: 'Admin User', date: '2026-10-08 10:00:00' },
    { id: 2, action: 'POS Transaction', user: 'Cashier 1', date: '2026-10-08 10:05:00' },
  ];

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>
      
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyLogs.map(log => (
              <TableRow key={log.id}>
                <TableCell>{log.id}</TableCell>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
