import React, { useState, useRef, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/Components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/Components/ui/dialog';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import { router, useForm, usePage } from '@inertiajs/react';
import { 
  index as studentsIndex, 
  store as storeStudent, 
  update as updateStudent 
} from '@/actions/App/Http/Controllers/Admin/StudentAccountController';
import { PageProps } from '@/types';
import { formatMoney } from '@/lib/formatters';
import { 
  Users, 
  CreditCard, 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  Plus, 
  Edit, 
  Radio, 
  Filter, 
  RefreshCw, 
  Wallet, 
  CheckCircle2, 
  X, 
  UserCheck,
  UserX,
  ExternalLink
} from 'lucide-react';

export interface ParentUser {
  id: number;
  full_name: string;
  username: string;
  email: string;
}

export interface StudentItem {
  id: number;
  student_id_number: string;
  rfid_uid: string | null;
  first_name: string;
  last_name: string;
  grade_level: string;
  section: string;
  parent_id: number | null;
  current_balance: number | string;
  daily_spending_limit: number | string;
  is_spending_limited: boolean;
  status: 'active' | 'suspended' | 'lost_card' | 'inactive';
  parent?: ParentUser | null;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
  prev_page_url: string | null;
  next_page_url: string | null;
}

interface StudentsIndexProps {
  students: PaginatedData<StudentItem>;
  parents: ParentUser[];
  metrics: {
    totalStudents: number;
    activeCards: number;
    lostOrSuspendedCards: number;
    totalStoredBalance: number;
  };
  filters: {
    search: string;
    status: string;
  };
}

export default function StudentsIndex({
  students,
  parents = [],
  metrics,
  filters = { search: '', status: 'all' },
}: StudentsIndexProps) {
  const { flash } = usePage<PageProps<{ flash?: { success?: string; error?: string } }>>().props;

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || 'all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);

  const rfidInputRef = useRef<HTMLInputElement>(null);

  // Form helper using Inertia useForm
  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    student_id_number: '',
    rfid_uid: '',
    first_name: '',
    last_name: '',
    grade_level: '',
    section: '',
    parent_id: '' as string | number,
    daily_spending_limit: '200.00',
    is_spending_limited: true,
    status: 'active' as 'active' | 'suspended' | 'lost_card' | 'inactive',
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(studentsIndex.url(), {
      search: searchTerm.trim() || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    }, { preserveState: true });
  };

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatus(status);
    router.get(studentsIndex.url(), {
      search: searchTerm.trim() || undefined,
      status: status !== 'all' ? status : undefined,
    }, { preserveState: true });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    router.get(studentsIndex.url());
  };

  // Open modal in Create mode
  const openCreateModal = () => {
    setEditingStudent(null);
    clearErrors();
    reset();
    setData({
      student_id_number: '',
      rfid_uid: '',
      first_name: '',
      last_name: '',
      grade_level: '',
      section: '',
      parent_id: '',
      daily_spending_limit: '200.00',
      is_spending_limited: true,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  // Open modal in Edit / Replace RFID mode
  const openEditModal = (student: StudentItem) => {
    setEditingStudent(student);
    clearErrors();
    setData({
      student_id_number: student.student_id_number,
      rfid_uid: student.rfid_uid ?? '',
      first_name: student.first_name,
      last_name: student.last_name,
      grade_level: student.grade_level,
      section: student.section,
      parent_id: student.parent_id ?? '',
      daily_spending_limit: String(student.daily_spending_limit ?? '200.00'),
      is_spending_limited: Boolean(student.is_spending_limited),
      status: student.status,
    });
    setIsModalOpen(true);
  };

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      put(updateStudent.url(editingStudent.id), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
      });
    } else {
      post(storeStudent.url(), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
      });
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] px-2 py-0.5">
            Active
          </Badge>
        );
      case 'lost_card':
        return (
          <Badge className="bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[10px] px-2 py-0.5">
            Lost Card
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className="bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[10px] px-2 py-0.5">
            Suspended
          </Badge>
        );
      case 'inactive':
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[10px] px-2 py-0.5">
            Inactive
          </Badge>
        );
    }
  };

  return (
    <AdminLayout portal="admin" activeNav="students" title="Student & RFID Management">
      {/* Flash Success Notification */}
      {flash?.success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{flash.success}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Student Accounts & RFID Cards
            </h1>
            <Badge className="bg-[#5c1516] text-white font-extrabold text-[10px]">
              {metrics.totalStudents} Enrolled
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage student records, link parent profiles, issue or replace USB RFID cards, and adjust daily limits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={openCreateModal}
            className="h-10 bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs px-4 rounded-xl shadow-sm flex items-center gap-1.5"
          >
            <Plus size={16} /> Enroll New Student
          </Button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Enrolled */}
        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Enrolled
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {metrics.totalStudents} Students
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Registered pupils with campus canteen profiles.
            </span>
          </CardContent>
        </Card>

        {/* Card 2: Active RFID Cards */}
        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active RFID Cards
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-emerald-700 tracking-tight mt-1">
              {metrics.activeCards} Cards
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Live contactless cards ready for POS tap payment.
            </span>
          </CardContent>
        </Card>

        {/* Card 3: Frozen or Lost Cards */}
        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Lost / Suspended
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-rose-700 tracking-tight mt-1">
              {metrics.lostOrSuspendedCards} Cards
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Instantly locked tags to prevent unauthorized spending.
            </span>
          </CardContent>
        </Card>

        {/* Card 4: Stored Value Liability */}
        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Stored Balance
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Wallet size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-amber-800 tracking-tight mt-1">
              {formatMoney(metrics.totalStoredBalance)}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Total prepay balance held in canteen trust liability.
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Student ID, RFID UID, or Student Name..."
                className="pl-9 h-10 text-xs rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
              />
            </div>
            <Button type="submit" size="sm" className="h-10 px-4 bg-[#5c1516] hover:bg-[#7a1420] text-white text-xs font-bold rounded-xl">
              Search
            </Button>
          </form>

          {/* Status filter dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 font-medium">
              <Filter size={14} />
              <span>Status:</span>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="h-10 text-xs font-semibold rounded-xl border border-slate-200 bg-white px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5c1516]/20"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="lost_card">Lost Card</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>

            {(searchTerm || selectedStatus !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-10 px-2.5 text-xs text-slate-500 hover:text-slate-800 rounded-xl"
              >
                <X size={14} className="mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Student Accounts Table */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5 pl-6">
                Student ID
              </TableHead>
              <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Full Name
              </TableHead>
              <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Grade & Section
              </TableHead>
              <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Linked Parent
              </TableHead>
              <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                RFID UID
              </TableHead>
              <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Balance
              </TableHead>
              <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Daily Limit
              </TableHead>
              <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-48 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <UserX size={32} className="text-slate-300" />
                    <span className="font-semibold text-xs">No student accounts found.</span>
                    <span className="text-[11px] text-slate-400">
                      Try adjusting your search criteria or enroll a new student.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              students.data.map((student) => (
                <TableRow key={student.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Student ID */}
                  <TableCell className="font-mono font-bold text-xs text-slate-800 pl-6">
                    {student.student_id_number}
                  </TableCell>

                  {/* Student Full Name */}
                  <TableCell>
                    <div className="font-bold text-xs text-slate-900">
                      {student.first_name} {student.last_name}
                    </div>
                  </TableCell>

                  {/* Grade & Section */}
                  <TableCell className="text-xs text-slate-600 font-medium">
                    {student.grade_level} - {student.section}
                  </TableCell>

                  {/* Linked Parent */}
                  <TableCell>
                    {student.parent ? (
                      <div>
                        <div className="text-xs font-semibold text-slate-800">
                          {student.parent.full_name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {student.parent.email}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-400 bg-slate-50 font-medium">
                        Unlinked
                      </Badge>
                    )}
                  </TableCell>

                  {/* RFID UID */}
                  <TableCell>
                    {student.rfid_uid ? (
                      <div className="flex items-center gap-1.5">
                        <CreditCard size={13} className={student.status === 'lost_card' ? 'text-rose-500' : 'text-slate-500'} />
                        <span className={`font-mono text-xs font-semibold ${student.status === 'lost_card' ? 'line-through text-rose-500' : 'text-slate-700'}`}>
                          {student.rfid_uid}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-dashed border-slate-300 text-slate-400">
                        Unassigned
                      </Badge>
                    )}
                  </TableCell>

                  {/* Stored Balance */}
                  <TableCell className="font-extrabold text-xs text-[#5c1516]">
                    {formatMoney(Number(student.current_balance))}
                  </TableCell>

                  {/* Daily Limit */}
                  <TableCell className="text-xs text-slate-700 font-semibold">
                    {student.is_spending_limited ? (
                      formatMoney(Number(student.daily_spending_limit))
                    ) : (
                      <span className="text-slate-400 font-normal">No Limit</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {getStatusBadge(student.status)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right pr-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(student)}
                      className="h-8 px-2.5 text-xs font-semibold border-slate-200 text-slate-700 hover:text-[#5c1516] hover:border-red-200 rounded-lg flex items-center gap-1 ml-auto"
                    >
                      <Edit size={13} />
                      <span>Edit / Replace RFID</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{students.from || 0}</span> to{' '}
            <span className="font-bold text-slate-800">{students.to || 0}</span> of{' '}
            <span className="font-bold text-slate-800">{students.total}</span> students
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => students.prev_page_url && router.visit(students.prev_page_url)}
              disabled={!students.prev_page_url}
              className="h-8 px-3 text-xs rounded-lg border-slate-200 disabled:opacity-40"
            >
              Previous
            </Button>
            <span className="font-bold text-slate-700">
              Page {students.current_page} of {students.last_page || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => students.next_page_url && router.visit(students.next_page_url)}
              disabled={!students.next_page_url}
              className="h-8 px-3 text-xs rounded-lg border-slate-200 disabled:opacity-40"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal Dialog: Enroll or Edit Student & Replace RFID */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[560px] rounded-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#5c1516] text-white flex items-center justify-center font-bold">
                  {editingStudent ? <CreditCard size={16} /> : <Plus size={16} />}
                </div>
                <div>
                  <DialogTitle className="text-base font-extrabold text-slate-900">
                    {editingStudent ? 'Edit Student & Manage RFID Card' : 'Enroll New Student'}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    {editingStudent
                      ? `Update account details or replace a lost RFID tag for ${editingStudent.first_name} ${editingStudent.last_name}.`
                      : 'Enroll a new student account, link parent profile, and assign an RFID tag.'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              {/* Row 1: Student ID Number */}
              <div>
                <Label htmlFor="student_id_number" className="text-xs font-bold text-slate-700">
                  Student ID Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="student_id_number"
                  type="text"
                  value={data.student_id_number}
                  onChange={(e) => setData('student_id_number', e.target.value)}
                  placeholder="e.g. 2026-0042"
                  className="mt-1 font-mono text-xs"
                />
                {errors.student_id_number && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.student_id_number}</p>
                )}
              </div>

              {/* Row 2: First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="first_name" className="text-xs font-bold text-slate-700">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    type="text"
                    value={data.first_name}
                    onChange={(e) => setData('first_name', e.target.value)}
                    placeholder="e.g. Juan"
                    className="mt-1 text-xs"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="last_name" className="text-xs font-bold text-slate-700">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    type="text"
                    value={data.last_name}
                    onChange={(e) => setData('last_name', e.target.value)}
                    placeholder="e.g. Dela Cruz"
                    className="mt-1 text-xs"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.last_name}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Grade Level & Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="grade_level" className="text-xs font-bold text-slate-700">
                    Grade Level <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="grade_level"
                    type="text"
                    value={data.grade_level}
                    onChange={(e) => setData('grade_level', e.target.value)}
                    placeholder="e.g. Grade 6"
                    className="mt-1 text-xs"
                  />
                  {errors.grade_level && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.grade_level}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="section" className="text-xs font-bold text-slate-700">
                    Section <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="section"
                    type="text"
                    value={data.section}
                    onChange={(e) => setData('section', e.target.value)}
                    placeholder="e.g. St. Therese"
                    className="mt-1 text-xs"
                  />
                  {errors.section && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.section}</p>
                  )}
                </div>
              </div>

              {/* Row 4: Linked Parent Account */}
              <div>
                <Label htmlFor="parent_id" className="text-xs font-bold text-slate-700">
                  Linked Parent Account (Optional)
                </Label>
                <select
                  id="parent_id"
                  value={data.parent_id}
                  onChange={(e) => setData('parent_id', e.target.value)}
                  className="mt-1 w-full h-10 text-xs font-medium rounded-xl border border-slate-200 bg-white px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5c1516]/20"
                >
                  <option value="">-- No Parent Linked (Independent Student) --</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.full_name} ({parent.email} / @{parent.username})
                    </option>
                  ))}
                </select>
                {errors.parent_id && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.parent_id}</p>
                )}
              </div>

              {/* Row 5: RFID Card UID with USB Reader integration */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="rfid_uid" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Radio size={14} className="text-[#5c1516]" />
                    RFID Card UID (Physical Tag)
                  </Label>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    USB Reader Ready
                  </span>
                </div>

                <div className="relative">
                  <Input
                    ref={rfidInputRef}
                    id="rfid_uid"
                    type="text"
                    value={data.rfid_uid}
                    onChange={(e) => setData('rfid_uid', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault(); // Prevent accidental form submit from USB reader Enter key
                      }
                    }}
                    placeholder="Scan card using USB reader or type UID..."
                    className="font-mono text-xs uppercase"
                  />
                </div>
                {errors.rfid_uid && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.rfid_uid}</p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                  <span className="text-slate-500">
                    Tap a card to auto-populate. To replace a lost card, scan new tag and set status to Active.
                  </span>

                  {editingStudent && (
                    <div className="flex gap-2">
                      {data.status !== 'lost_card' && (
                        <button
                          type="button"
                          onClick={() => setData('status', 'lost_card')}
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:underline"
                        >
                          Mark Card as Lost
                        </button>
                      )}
                      {data.rfid_uid && (
                        <button
                          type="button"
                          onClick={() => {
                            setData('rfid_uid', '');
                            rfidInputRef.current?.focus();
                          }}
                          className="text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:underline"
                        >
                          Clear Tag
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 6: Daily Spending Limit & Toggle */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <Label htmlFor="daily_spending_limit" className="text-xs font-bold text-slate-700">
                    Daily Spending Limit (₱) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="daily_spending_limit"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10000"
                    disabled={!data.is_spending_limited}
                    value={data.daily_spending_limit}
                    onChange={(e) => setData('daily_spending_limit', e.target.value)}
                    placeholder="200.00"
                    className="mt-1 text-xs"
                  />
                  {errors.daily_spending_limit && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.daily_spending_limit}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 pb-2.5">
                  <Checkbox
                    id="is_spending_limited"
                    checked={data.is_spending_limited}
                    onCheckedChange={(checked) => setData('is_spending_limited', Boolean(checked))}
                  />
                  <Label htmlFor="is_spending_limited" className="text-xs text-slate-700 font-semibold cursor-pointer">
                    Enforce Daily Spending Limit
                  </Label>
                </div>
              </div>

              {/* Row 7: Account / Card Status */}
              <div>
                <Label htmlFor="status" className="text-xs font-bold text-slate-700">
                  Account & Card Status <span className="text-red-500">*</span>
                </Label>
                <select
                  id="status"
                  value={data.status}
                  onChange={(e) => setData('status', e.target.value as any)}
                  className="mt-1 w-full h-10 text-xs font-bold rounded-xl border border-slate-200 bg-white px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5c1516]/20"
                >
                  <option value="active">Active (Card operational, ready for cafeteria purchase)</option>
                  <option value="lost_card">Lost Card (Instantly frozen, POS rejects transactions)</option>
                  <option value="suspended">Suspended (Temporarily frozen account)</option>
                  <option value="inactive">Inactive (Archived or withdrawn student)</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.status}</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-9 text-xs rounded-xl border-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={processing}
                className="h-9 bg-[#5c1516] hover:bg-[#7a1420] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                {processing && <RefreshCw size={14} className="animate-spin" />}
                <span>{editingStudent ? 'Save Changes & Update RFID' : 'Enroll Student'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
