import React, { useState } from 'react';
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
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { router, useForm, usePage, Head } from '@inertiajs/react';
import { 
  index as settingsIndex, 
  storeUser, 
  updateUser, 
  storeCategory, 
  updateCategory, 
  destroyCategory 
} from '@/actions/App/Http/Controllers/Admin/SettingController';
import { PageProps } from '@/types';
import ConfirmDialog from '@/Components/ui/confirm-dialog';
import { 
  Users, 
  UserCheck, 
  FolderTree, 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  X,
  KeyRound,
  Tag
} from 'lucide-react';

export interface UserItem {
  id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'cashier' | 'parent' | 'faculty' | 'student';
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CategoryItem {
  id: number;
  name: string;
  description: string | null;
  products_count: number;
  created_at?: string;
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

interface SettingsIndexProps {
  users: PaginatedData<UserItem>;
  categories: CategoryItem[];
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalCategories: number;
    totalProducts: number;
  };
  filters: {
    user_search: string;
    role: string;
  };
}

export default function SettingsIndex({
  users,
  categories = [],
  metrics,
  filters = { user_search: '', role: 'all' },
}: SettingsIndexProps) {
  const { flash, auth } = usePage<PageProps<{ flash?: { success?: string; error?: string } }>>().props;

  const [activeTab, setActiveTab] = useState<string>('users');
  const [searchTerm, setSearchTerm] = useState(filters.user_search || '');
  const [selectedRole, setSelectedRole] = useState(filters.role || 'all');

  // User modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Category delete confirmation state
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);

  // Inertia useForm for Users
  const userForm = useForm({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    role: 'parent' as 'admin' | 'cashier' | 'parent' | 'faculty' | 'student',
    status: 'active' as 'active' | 'inactive',
    password: '',
  });

  // Inertia useForm for Categories
  const categoryForm = useForm({
    name: '',
    description: '',
  });

  // Filter handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(settingsIndex.url(), {
      user_search: searchTerm.trim() || undefined,
      role: selectedRole !== 'all' ? selectedRole : undefined,
    }, { preserveState: true });
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    router.get(settingsIndex.url(), {
      user_search: searchTerm.trim() || undefined,
      role: role !== 'all' ? role : undefined,
    }, { preserveState: true });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    router.get(settingsIndex.url());
  };

  // User Modal open/edit
  const openCreateUserModal = () => {
    setEditingUser(null);
    userForm.reset();
    userForm.clearErrors();
    userForm.setData({
      username: '',
      full_name: '',
      email: '',
      phone: '',
      role: 'parent',
      status: 'active',
      password: '',
    });
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (user: UserItem) => {
    setEditingUser(user);
    userForm.clearErrors();
    userForm.setData({
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      password: '',
    });
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      userForm.put(updateUser.url(editingUser.id), {
        onSuccess: () => {
          setIsUserModalOpen(false);
          userForm.reset();
        },
      });
    } else {
      userForm.post(storeUser.url(), {
        onSuccess: () => {
          setIsUserModalOpen(false);
          userForm.reset();
        },
      });
    }
  };

  // Category Modal open/edit
  const openCreateCategoryModal = () => {
    setEditingCategory(null);
    categoryForm.reset();
    categoryForm.clearErrors();
    categoryForm.setData({
      name: '',
      description: '',
    });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    categoryForm.clearErrors();
    categoryForm.setData({
      name: cat.name,
      description: cat.description || '',
    });
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      categoryForm.put(updateCategory.url(editingCategory.id), {
        onSuccess: () => {
          setIsCategoryModalOpen(false);
          categoryForm.reset();
        },
      });
    } else {
      categoryForm.post(storeCategory.url(), {
        onSuccess: () => {
          setIsCategoryModalOpen(false);
          categoryForm.reset();
        },
      });
    }
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    router.delete(destroyCategory.url(categoryToDelete.id), {
      onSuccess: () => setCategoryToDelete(null),
    });
  };

  // Helper for role badge styling
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300 font-bold text-[10px] px-2 py-0.5">Admin</Badge>;
      case 'cashier':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-bold text-[10px] px-2 py-0.5">Cashier</Badge>;
      case 'parent':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px] px-2 py-0.5">Parent</Badge>;
      case 'faculty':
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 font-bold text-[10px] px-2 py-0.5">Faculty</Badge>;
      case 'student':
      default:
        return <Badge className="bg-slate-100 text-slate-700 border-slate-300 font-bold text-[10px] px-2 py-0.5">Student</Badge>;
    }
  };

  return (
    <AdminLayout portal="admin" activeNav="settings" title="System Settings">
      <Head title="System Settings & Cashier Management" />
      {/* Flash Success Notification */}
      {flash?.success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{flash.success}</span>
          </div>
        </div>
      )}

      {/* Flash Error Notification */}
      {flash?.error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>{flash.error}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              System Settings & Configuration
            </h1>
            <Badge className="bg-[#5c1516] text-white font-extrabold text-[10px]">
              Control Center
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage authorized staff & user accounts, Spatie RBAC permissions, and product categories.
          </p>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Users
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {metrics.totalUsers}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Registered administrators, cashiers & parents.
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active Accounts
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-emerald-700 tracking-tight mt-1">
              {metrics.activeUsers}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Operational logins with full access privileges.
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Product Categories
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FolderTree size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-purple-700 tracking-tight mt-1">
              {metrics.totalCategories}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Cafeteria catalog classifications.
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Catalog Items
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Package size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-amber-800 tracking-tight mt-1">
              {metrics.totalProducts}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Active inventory items across all categories.
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl h-11 shadow-xs grid grid-cols-2 w-full sm:w-80">
          <TabsTrigger value="users" className="rounded-xl text-xs font-bold data-[state=active]:bg-[#5c1516] data-[state=active]:text-white">
            <Users size={14} className="mr-1.5" /> System Users & RBAC
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl text-xs font-bold data-[state=active]:bg-[#5c1516] data-[state=active]:text-white">
            <FolderTree size={14} className="mr-1.5" /> Product Categories
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: User Accounts & RBAC */}
        <TabsContent value="users" className="space-y-4 m-0">
          {/* User Filter Toolbar */}
          <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by full name, username, or email..."
                    className="pl-9 h-10 text-xs rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <Button type="submit" size="sm" className="h-10 px-4 bg-[#5c1516] hover:bg-[#7a1420] text-white text-xs font-bold rounded-xl">
                  Search
                </Button>
              </form>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 font-medium">
                  <Filter size={14} />
                  <span>Role:</span>
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="h-10 text-xs font-semibold rounded-xl border border-slate-200 bg-white px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5c1516]/20"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="cashier">Cashier</option>
                  <option value="parent">Parent</option>
                  <option value="faculty">Faculty</option>
                  <option value="student">Student</option>
                </select>

                {(searchTerm || selectedRole !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-10 px-2.5 text-xs text-slate-500 hover:text-slate-800 rounded-xl"
                  >
                    <X size={14} className="mr-1" /> Clear
                  </Button>
                )}

                <Button
                  onClick={openCreateUserModal}
                  className="h-10 bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs px-4 rounded-xl shadow-sm flex items-center gap-1.5 ml-auto"
                >
                  <Plus size={16} /> Add User
                </Button>
              </div>
            </div>
          </Card>

          {/* Users Table */}
          <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5 pl-6">
                    User Details
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Role
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Contact Email
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Phone
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
                {users.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-36 text-center text-slate-500 text-xs">
                      No user accounts found matching your filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.data.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <TableCell className="pl-6">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                          <span>{user.full_name}</span>
                          {user.id === auth.user.id && (
                            <Badge className="bg-amber-100 text-amber-900 text-[9px] font-black px-1.5 py-0 border-amber-300">
                              YOU
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          @{user.username}
                        </div>
                      </TableCell>

                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>

                      <TableCell className="text-xs text-slate-700 font-medium">
                        {user.email}
                      </TableCell>

                      <TableCell className="text-xs text-slate-500">
                        {user.phone || '—'}
                      </TableCell>

                      <TableCell>
                        {user.status === 'active' ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px] px-2 py-0.5">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-600 border-slate-300 font-bold text-[10px] px-2 py-0.5">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditUserModal(user)}
                          className="h-8 px-2.5 text-xs font-semibold border-slate-200 text-slate-700 hover:text-[#5c1516] hover:border-red-200 rounded-lg flex items-center gap-1 ml-auto"
                        >
                          <Edit size={13} /> Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 text-xs text-slate-500">
              <div>
                Showing <span className="font-bold text-slate-800">{users.from || 0}</span> to{' '}
                <span className="font-bold text-slate-800">{users.to || 0}</span> of{' '}
                <span className="font-bold text-slate-800">{users.total}</span> users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => users.prev_page_url && router.visit(users.prev_page_url)}
                  disabled={!users.prev_page_url}
                  className="h-8 px-3 text-xs rounded-lg border-slate-200 disabled:opacity-40"
                >
                  Previous
                </Button>
                <span className="font-bold text-slate-700">
                  Page {users.current_page} of {users.last_page || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => users.next_page_url && router.visit(users.next_page_url)}
                  disabled={!users.next_page_url}
                  className="h-8 px-3 text-xs rounded-lg border-slate-200 disabled:opacity-40"
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Product Categories */}
        <TabsContent value="categories" className="space-y-4 m-0">
          <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Product Categories</h3>
                <p className="text-xs text-slate-500">Product categories used in the POS register and inventory management.</p>
              </div>
              <Button
                onClick={openCreateCategoryModal}
                className="h-10 bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs px-4 rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Plus size={16} /> Add Category
              </Button>
            </div>
          </Card>

          <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5 pl-6">
                    Category Name
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Description
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Products
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right pr-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-36 text-center text-slate-500 text-xs">
                      No product categories configured yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                      <TableCell className="pl-6">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                          <Tag size={13} className="text-[#5c1516]" />
                          <span>{cat.name}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-slate-500">
                        {cat.description || '—'}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-bold text-[10px] bg-slate-50 border-slate-200 text-slate-700">
                          {cat.products_count} {cat.products_count === 1 ? 'Product' : 'Products'}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditCategoryModal(cat)}
                            className="h-8 px-2.5 text-xs font-semibold border-slate-200 text-slate-700 hover:text-[#5c1516] rounded-lg flex items-center gap-1"
                          >
                            <Edit size={13} /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCategoryToDelete(cat)}
                            className="h-8 px-2.5 text-xs font-semibold border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-lg flex items-center gap-1"
                          >
                            <Trash2 size={13} /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Modal Dialog */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl" showCloseButton={false}>
          <form onSubmit={handleUserSubmit}>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#5c1516] text-white flex items-center justify-center font-bold">
                  {editingUser ? <Edit size={16} /> : <Plus size={16} />}
                </div>
                <div>
                  <DialogTitle className="text-base font-extrabold text-slate-900">
                    {editingUser ? `Edit User: ${editingUser.full_name}` : 'Create New System User'}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    {editingUser
                      ? 'Update credentials, RBAC role, or account activation status.'
                      : 'Enroll a new system user and grant RBAC permissions.'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="username" className="text-xs font-bold text-slate-700">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    value={userForm.data.username}
                    onChange={(e) => userForm.setData('username', e.target.value)}
                    placeholder="e.g. maria_santos"
                    className="mt-1 text-xs font-mono"
                  />
                  {userForm.errors.username && (
                    <p className="text-red-500 text-[11px] mt-1">{userForm.errors.username}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="full_name" className="text-xs font-bold text-slate-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    value={userForm.data.full_name}
                    onChange={(e) => userForm.setData('full_name', e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="mt-1 text-xs"
                  />
                  {userForm.errors.full_name && (
                    <p className="text-red-500 text-[11px] mt-1">{userForm.errors.full_name}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.data.email}
                  onChange={(e) => userForm.setData('email', e.target.value)}
                  placeholder="e.g. maria@example.com"
                  className="mt-1 text-xs"
                />
                {userForm.errors.email && (
                  <p className="text-red-500 text-[11px] mt-1">{userForm.errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
                  Phone Number (Optional)
                </Label>
                <Input
                  id="phone"
                  value={userForm.data.phone}
                  onChange={(e) => userForm.setData('phone', e.target.value)}
                  placeholder="e.g. 09123456789"
                  className="mt-1 text-xs"
                />
                {userForm.errors.phone && (
                  <p className="text-red-500 text-[11px] mt-1">{userForm.errors.phone}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="role" className="text-xs font-bold text-slate-700">
                    System Role (RBAC) <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="role"
                    value={userForm.data.role}
                    onChange={(e) => userForm.setData('role', e.target.value as any)}
                    className="mt-1 w-full h-10 text-xs font-semibold rounded-xl border border-slate-200 bg-white px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5c1516]/20"
                  >
                    <option value="admin">Admin (Full System Access)</option>
                    <option value="cashier">Cashier (POS & Top-up Access)</option>
                    <option value="parent">Parent (Portal Dashboard Access)</option>
                    <option value="faculty">Faculty (Campus Meal Portal)</option>
                    <option value="student">Student (Card Balance View)</option>
                  </select>
                  {userForm.errors.role && (
                    <p className="text-red-500 text-[11px] mt-1">{userForm.errors.role}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status" className="text-xs font-bold text-slate-700">
                    Account Status <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="status"
                    value={userForm.data.status}
                    onChange={(e) => userForm.setData('status', e.target.value as any)}
                    className="mt-1 w-full h-10 text-xs font-semibold rounded-xl border border-slate-200 bg-white px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5c1516]/20"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {userForm.errors.status && (
                    <p className="text-red-500 text-[11px] mt-1">{userForm.errors.status}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <KeyRound size={13} className="text-slate-400" />
                  Password {editingUser ? '(Leave blank to keep unchanged)' : <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={userForm.data.password}
                  onChange={(e) => userForm.setData('password', e.target.value)}
                  placeholder={editingUser ? '••••••••' : 'Minimum 8 characters'}
                  className="mt-1 text-xs"
                />
                {userForm.errors.password && (
                  <p className="text-red-500 text-[11px] mt-1">{userForm.errors.password}</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUserModalOpen(false)}
                className="h-9 text-xs rounded-xl border-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={userForm.processing}
                className="h-9 bg-[#5c1516] hover:bg-[#7a1420] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                {userForm.processing && <RefreshCw size={14} className="animate-spin" />}
                <span>{editingUser ? 'Save Changes' : 'Create User'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Modal Dialog */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl" showCloseButton={false}>
          <form onSubmit={handleCategorySubmit}>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#5c1516] text-white flex items-center justify-center font-bold">
                  <FolderTree size={16} />
                </div>
                <div>
                  <DialogTitle className="text-base font-extrabold text-slate-900">
                    {editingCategory ? `Edit Category: ${editingCategory.name}` : 'New Product Category'}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Add or update category groupings for the canteen inventory.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3 py-4 text-xs">
              <div>
                <Label htmlFor="category_name" className="text-xs font-bold text-slate-700">
                  Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category_name"
                  value={categoryForm.data.name}
                  onChange={(e) => categoryForm.setData('name', e.target.value)}
                  placeholder="e.g. Desserts & Pastries"
                  className="mt-1 text-xs"
                />
                {categoryForm.errors.name && (
                  <p className="text-red-500 text-[11px] mt-1">{categoryForm.errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category_description" className="text-xs font-bold text-slate-700">
                  Description (Optional)
                </Label>
                <Input
                  id="category_description"
                  value={categoryForm.data.description}
                  onChange={(e) => categoryForm.setData('description', e.target.value)}
                  placeholder="e.g. Fresh baked bread, pastries, and sweets"
                  className="mt-1 text-xs"
                />
                {categoryForm.errors.description && (
                  <p className="text-red-500 text-[11px] mt-1">{categoryForm.errors.description}</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCategoryModalOpen(false)}
                className="h-9 text-xs rounded-xl border-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={categoryForm.processing}
                className="h-9 bg-[#5c1516] hover:bg-[#7a1420] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                {categoryForm.processing && <RefreshCw size={14} className="animate-spin" />}
                <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <ConfirmDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        title="Confirm Category Removal"
        description={
          <span>
            Are you sure you want to remove category <strong className="font-extrabold text-slate-800">{categoryToDelete?.name}</strong>?
          </span>
        }
        warningNote={
          categoryToDelete && categoryToDelete.products_count > 0
            ? `Warning: There are ${categoryToDelete.products_count} items currently assigned to this category.`
            : undefined
        }
        confirmText="Remove Category"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
      />
    </AdminLayout>
  );
}
