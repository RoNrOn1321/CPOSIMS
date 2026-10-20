import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Sliders, 
  ShieldAlert, 
  CreditCard, 
  LogOut, 
  Bell, 
  User, 
  ChevronDown, 
  Package, 
  FileText, 
  BarChart3,
  Settings,
  Sparkles,
  ExternalLink,
  Users
} from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import NotificationsDropdown from '@/Components/NotificationsDropdown';
import AdminComputerIcon from '@/Components/AdminComputerIcon';
import { index as parentDashboardIndex } from '@/actions/App/Http/Controllers/ParentDashboardController';
import { index as posIndex } from '@/actions/App/Http/Controllers/PosController';
import { dashboard as adminDashboardRoute } from '@/routes/admin';
import { index as productsIndex } from '@/actions/App/Http/Controllers/Admin/ProductController';
import { index as studentsIndex } from '@/actions/App/Http/Controllers/Admin/StudentAccountController';
import { index as auditLogsIndex } from '@/actions/App/Http/Controllers/Admin/AuditLogController';
import { index as reportsIndex } from '@/actions/App/Http/Controllers/Admin/ReportController';
import { index as settingsIndex } from '@/actions/App/Http/Controllers/Admin/SettingController';
import { destroy as logoutAction } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
  portal?: 'parent' | 'admin';
  title?: string;
  activeNav?: string;
  onNavigate?: (navId: string) => void;
  onTopUpClick?: () => void;
  unreadNotificationsCount?: number;
}

export default function AdminLayout({ 
  children,
  portal = 'parent',
  title,
  activeNav = 'dashboard',
  onNavigate,
  onTopUpClick,
  unreadNotificationsCount,
}: AdminLayoutProps) {
  const isParent = portal === 'parent';
  const { auth } = usePage<PageProps>().props;
  const user = auth?.user;

  const userInitials = user?.full_name
    ? user.full_name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (isParent ? 'PD' : 'AD');

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-[#5c1516] selection:text-white">
      {/* Top Universal Header Bar */}
      <header className="h-16 bg-[#5c1516] text-white flex items-center justify-between px-6 shadow-md z-30 sticky top-0 border-b border-amber-900/30">
        {/* Left: Branding with School Logo */}
        <div className="flex items-center gap-4">
          <Link href={parentDashboardIndex.url()} className="flex items-center gap-3 group">
            <div className="w-10 h-10 p-1 bg-white rounded-xl shadow-md flex items-center justify-center overflow-hidden ring-2 ring-amber-400/40 group-hover:scale-105 transition-transform">
              <img 
                src="/images/logo.png" 
                alt="STCT Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white drop-shadow-sm leading-tight">
                  CPOSIMS
                </span>
                <Badge className="bg-amber-400 text-amber-950 font-black text-[10px] px-1.5 py-0 border-0">
                  {isParent ? 'PARENT PORTAL' : 'ADMIN PANEL'}
                </Badge>
              </div>
              <span className="text-[11px] text-amber-200/80 font-medium hidden sm:inline">
                Saint Theresa College of Tandag, Inc.
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Quick Actions, Role Info & Logout */}
        <div className="flex items-center gap-3">
          {/* Quick POS Access for testing/staff */}
          <Link
            href={posIndex.url()}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-semibold border border-white/15 transition-all"
          >
            <span>POS Register</span>
            <ExternalLink size={13} />
          </Link>

          {/* Top-up CTA for parents */}
          {isParent && onTopUpClick && (
            <Button
              size="sm"
              onClick={onTopUpClick}
              className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold text-xs h-9 px-3.5 rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <CreditCard size={15} />
              <span>Top-Up RFID</span>
            </Button>
          )}

          {/* Real-time System Notifications Dropdown */}
          <NotificationsDropdown onTopUpClick={onTopUpClick} />

          {/* User Profile Capsule */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-white/20">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-300 font-bold text-xs flex items-center justify-center shadow-inner">
              {userInitials}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">
                {user?.full_name || (isParent ? 'Parent Account' : 'Administrator')}
              </span>
              <span className="text-[10px] text-amber-300/80">
                {isParent 
                  ? (user?.username ? `@${user.username}` : 'Parent Portal')
                  : (user?.role === 'admin' ? 'Super Admin' : 'Staff Admin')}
              </span>
            </div>

            {/* Logout Button */}
            <Link
              href={logoutAction.url()}
              method="post"
              as="button"
              title="Sign Out"
              className="p-2 rounded-xl bg-white/10 hover:bg-red-600 text-white/80 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Shell with Sidebar and View Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Modern Sidebar Rail */}
        <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between p-4 shadow-xs z-10 shrink-0">
          <div className="space-y-6">
            {/* Context Badge */}
            <div className="p-3 bg-gradient-to-br from-red-50 to-amber-50/50 border border-red-100/80 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5c1516] border border-amber-400/30 flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                {isParent ? (
                  <Users size={18} className="text-amber-300" />
                ) : (
                  <AdminComputerIcon className="w-6 h-6" />
                )}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-extrabold text-xs text-slate-800 leading-tight truncate">
                  {isParent ? 'Family Dashboard' : 'Management Center'}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {isParent ? '2 Enrolled Students' : 'System Administration'}
                </p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {isParent ? (
                <>
                  <SidebarNavItem 
                    icon={<LayoutDashboard size={18} />} 
                    label="Overview & Balance" 
                    active={activeNav === 'dashboard' || activeNav === 'overview'}
                    onClick={() => onNavigate?.('overview')}
                  />
                  <SidebarNavItem 
                    icon={<Receipt size={18} />} 
                    label="Meal History" 
                    active={activeNav === 'history'}
                    onClick={() => onNavigate?.('history')}
                  />
                  <SidebarNavItem 
                    icon={<Sliders size={18} />} 
                    label="Daily Spending Limits" 
                    active={activeNav === 'limits'}
                    onClick={() => onNavigate?.('limits')}
                  />
                </>
              ) : (
                <>
                  <SidebarNavItem 
                    icon={<LayoutDashboard size={18} />} 
                    label="Dashboard" 
                    active={activeNav === 'dashboard'}
                    href={adminDashboardRoute.url()}
                  />
                  <SidebarNavItem 
                    icon={<Users size={18} />} 
                    label="Students & RFID" 
                    active={activeNav === 'students'}
                    href={studentsIndex.url()}
                  />
                  <SidebarNavItem 
                    icon={<Package size={18} />} 
                    label="Products & Inventory" 
                    active={activeNav === 'products'}
                    href={productsIndex.url()}
                  />
                  <SidebarNavItem 
                    icon={<FileText size={18} />} 
                    label="Audit Logs" 
                    active={activeNav === 'audit'}
                    href={auditLogsIndex.url()}
                  />
                  <SidebarNavItem 
                    icon={<BarChart3 size={18} />} 
                    label="Reports & Analytics" 
                    active={activeNav === 'reports'}
                    href={reportsIndex.url()}
                  />
                  <SidebarNavItem 
                    icon={<Settings size={18} />} 
                    label="System Settings" 
                    active={activeNav === 'settings'}
                    href={settingsIndex.url()}
                  />
                </>
              )}
            </nav>
          </div>

          {/* Bottom Card for Helpline / Support */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Canteen Office</span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-300 text-emerald-700 bg-emerald-50">
                Open (7AM - 5PM)
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Have concerns about dietary restrictions or RFID cards? Call local #104.
            </p>
          </div>
        </aside>

        {/* Dynamic Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/60">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarNavItem({
  icon,
  label,
  active = false,
  onClick,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const content = (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-[#5c1516] text-white shadow-md shadow-red-950/20'
          : 'text-slate-600 hover:bg-red-50/70 hover:text-[#5c1516]'
      }`}
    >
      <span className={active ? 'text-amber-300' : 'text-slate-400 group-hover:text-[#5c1516]'}>
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
