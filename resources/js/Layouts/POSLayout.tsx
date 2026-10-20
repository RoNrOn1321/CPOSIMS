import React from 'react';
import { 
  CreditCard, 
  History, 
  RotateCcw, 
  Settings, 
  LayoutGrid, 
  Search, 
  User, 
  PauseCircle, 
  Barcode, 
  Package, 
  DollarSign, 
  LogOut,
  Wifi
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { destroy as logoutAction } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

interface POSLayoutProps {
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  cartCount?: number;
  onHoldOrdersClick?: () => void;
  heldOrdersCount?: number;
  onReloadClick?: () => void;
  onOrdersClick?: () => void;
  onRefundsClick?: () => void;
  onConfigClick?: () => void;
  onStockClick?: () => void;
}

export default function POSLayout({
  children,
  searchQuery = '',
  onSearchChange,
  cartCount = 0,
  heldOrdersCount = 0,
  onHoldOrdersClick,
  onReloadClick,
  onOrdersClick,
  onRefundsClick,
  onConfigClick,
  onStockClick,
}: POSLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-100/90 text-slate-800 overflow-hidden font-sans select-none antialiased">
      {/* Sleek Left Command Rail */}
      <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-4 justify-between shadow-sm z-20">
        <div className="flex flex-col items-center gap-5 w-full">
          {/* STCT Official Logo moved to Sidebar */}
          <div className="w-13 h-13 p-1 bg-white rounded-2xl shadow-md flex items-center justify-center overflow-hidden ring-2 ring-[#5c1516]/20 hover:scale-105 transition-transform duration-200 cursor-pointer">
            <img 
              src="/images/logo.png" 
              alt="STCT Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-2 w-full px-2">
            <NavRailItem 
              icon={<CreditCard size={20} />} 
              label="Register" 
              active={true} 
            />
            <NavRailItem 
              icon={<History size={20} />} 
              label="Orders" 
              onClick={onOrdersClick}
            />
            <NavRailItem 
              icon={<Package size={20} />} 
              label="Stock" 
              onClick={onStockClick}
            />
            <NavRailItem 
              icon={<RotateCcw size={20} />} 
              label="Refunds" 
              onClick={onRefundsClick || onOrdersClick}
            />
            <NavRailItem 
              icon={<Settings size={20} />} 
              label="Settings" 
              onClick={onConfigClick}
            />
          </nav>
        </div>

        {/* Bottom Station Status & Functional Logout */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          <div className="w-full py-2 px-1 rounded-lg bg-emerald-50 border border-emerald-200/60 flex flex-col items-center gap-1 text-center">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-emerald-700 uppercase">Online</span>
          </div>

    
          
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Modern Header Bar without logo */}
        <header className="h-20 bg-[#5c1516] text-white flex items-center justify-between px-6 shadow-md z-30 border-b border-amber-900/30">
          {/* System Brand */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h1 className="font-extrabold tracking-tight text-lg text-white drop-shadow-sm leading-tight">
                Cafeteria Point-of-Sale and Inventory Management System
              </h1>
              <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-300 font-bold text-[10px] px-1.5 py-0 rounded shadow-xs">
                CPOSIMS
              </Badge>
            </div>
            <p className="text-xs text-amber-200/80 font-medium mt-0.5">
              Saint Theresa College of Tandag, Inc. &bull; Terminal #01 (Senior High / College Canteen)
            </p>
          </div>

          {/* Center Search Bar with modern glassmorphism */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search food, beverage, or scan barcode (F2)..." 
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white focus:text-slate-900 text-white placeholder:text-zinc-300 pl-10 pr-12 h-11 rounded-xl border border-white/20 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:border-transparent transition-all shadow-inner text-sm" 
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-white/20 text-white/90 px-1.5 py-0.5 rounded font-mono">
                F2
              </kbd>
            </div>
          </div>

          {/* Right Status & Cashier Info with Logout Button */}
          <div className="flex items-center gap-3">
            {/* Quick RFID Balance Reload Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onReloadClick}
              className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold border border-amber-300/80 rounded-xl h-10 px-3 flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <CreditCard size={17} className="text-amber-950" />
              <span className="text-xs font-bold">Reload RFID</span>
            </Button>

            {/* Recent Orders & Refunds View Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onOrdersClick}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl h-10 px-3 flex items-center gap-2 cursor-pointer"
            >
              <History size={17} className="text-amber-300" />
              <span className="text-xs font-semibold">Orders & Refunds</span>
            </Button>

            {/* Quick Scanner & Hold Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onHoldOrdersClick}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl h-10 px-3 flex items-center gap-2 relative"
            >
              <PauseCircle size={17} className="text-amber-300" />
              <span className="text-xs font-semibold">Held Orders</span>
              {heldOrdersCount > 0 && (
                <span className="bg-amber-400 text-amber-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                  {heldOrdersCount}
                </span>
              )}
            </Button>

            {/* Barcode / RFID Input Quick Trigger */}
            <button
              type="button"
              onClick={onConfigClick}
              title="Barcode Scanner & RFID Input (F2) - Click to configure Terminal Settings"
              className="h-10 px-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl flex items-center gap-2 text-white/90 text-xs transition-colors cursor-pointer"
            >
              <Barcode size={18} className="text-amber-300" />
              <span className="hidden xl:inline text-[11px] font-medium text-amber-100">Barcode / RFID (F2)</span>
            </button>

            {/* Cashier Badge & Functional Header Logout */}
            <div className="flex items-center gap-2.5 pl-2 ml-1 border-l border-white/20">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center font-bold text-amber-300 text-sm shadow-inner">
                CS
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">Canteen Staff</span>
                <span className="text-[11px] text-amber-300/80">Shift: AM &bull; Active</span>
              </div>
              
              <Link
                href={logoutAction.url()}
                method="post"
                as="button"
                title="Log Out Terminal"
                className="ml-1.5 p-2 rounded-xl bg-white/10 hover:bg-red-600 text-white/80 hover:text-white transition-all cursor-pointer flex items-center justify-center"
              >
                <LogOut size={16} />
              </Link>
            </div>
          </div>
        </header>

        {/* Content Shell (Grid & Cart) */}
        <div className="flex-1 flex overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

function NavRailItem({ 
  icon, 
  label, 
  active = false,
  onClick,
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 w-full py-2.5 rounded-xl transition-all duration-200 group relative ${
        active 
          ? 'bg-[#5c1516] text-white shadow-md shadow-red-950/20' 
          : 'text-slate-500 hover:text-[#5c1516] hover:bg-red-50/70'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r-full" />
      )}
      <div className={`transition-transform duration-200 group-hover:scale-110 ${active ? 'text-amber-300' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-semibold tracking-tight">{label}</span>
    </button>
  );
}
