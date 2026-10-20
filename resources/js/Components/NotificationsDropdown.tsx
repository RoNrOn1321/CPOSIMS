import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, router, usePage, usePoll } from '@inertiajs/react';
import { PageProps, SystemNotification } from '@/types';
import { toast } from '@/Hooks/use-toast';
import { 
  Bell, 
  Package, 
  RotateCcw, 
  TrendingUp, 
  CreditCard, 
  AlertTriangle, 
  Info, 
  CheckCheck, 
  RefreshCw, 
  CheckCircle2, 
  ChevronRight,
  X
} from 'lucide-react';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

interface NotificationsDropdownProps {
  onTopUpClick?: () => void;
}

const STORAGE_KEY = 'cposims_read_notifications';

export default function NotificationsDropdown({ onTopUpClick }: NotificationsDropdownProps) {
  const pageProps = usePage<PageProps>().props;
  const notifications: SystemNotification[] = pageProps.system_notifications || [];

  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'stock' | 'void' | 'topup'>('all');
  
  // Track read notification IDs in localStorage
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Inertia v2 Auto-Polling (every 8 seconds in the background)
  // Polls ONLY the lightweight system_notifications prop without showing progress bar
  usePoll(
    8000,
    {
      only: ['system_notifications'],
      showProgress: false,
    },
    {
      autoStart: true,
      keepAlive: false,
    }
  );

  // Detect newly arrived notifications to notify the user with a toast
  const isInitialMount = useRef(true);
  const knownIdsRef = useRef<Set<string>>(new Set(notifications.map(n => n.id)));

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const currentKnown = knownIdsRef.current;
    const newItems = notifications.filter(n => !currentKnown.has(n.id));

    if (newItems.length > 0) {
      newItems.forEach(item => {
        if (item.type === 'void') {
          toast.error(item.message, { title: item.title, duration: 7000 });
        } else if (item.type === 'stock') {
          toast.warning(item.message, { title: item.title, duration: 6000 });
        } else if (item.type === 'topup') {
          toast.success(item.message, { title: item.title, duration: 5000 });
        } else {
          toast.info(item.message, { title: item.title, duration: 5000 });
        }
        currentKnown.add(item.id);
      });
    }
  }, [notifications]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [readIds]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !readIds.includes(n.id)).length;
  }, [notifications, readIds]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'stock') return notifications.filter(n => n.type === 'stock');
    if (filter === 'void') return notifications.filter(n => n.type === 'void');
    if (filter === 'topup') return notifications.filter(n => n.type === 'topup' || n.type === 'balance');
    return notifications;
  }, [notifications, filter]);

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(prev => Array.from(new Set([...prev, ...allIds])));
  };

  const handleNotificationClick = (item: SystemNotification) => {
    // Mark as read
    if (!readIds.includes(item.id)) {
      setReadIds(prev => [...prev, item.id]);
    }

    setIsOpen(false);

    if (item.actionUrl === '#topup' && onTopUpClick) {
      onTopUpClick();
      return;
    }

    if (item.actionUrl && item.actionUrl !== '#') {
      router.visit(item.actionUrl);
    }
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    router.reload({
      only: ['system_notifications'],
      onFinish: () => setIsRefreshing(false),
    });
  };

  const renderIcon = (type: string, severity: string) => {
    switch (type) {
      case 'stock':
        return severity === 'danger' ? (
          <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle size={15} />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Package size={15} />
          </div>
        );
      case 'void':
        return (
          <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <RotateCcw size={15} />
          </div>
        );
      case 'topup':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp size={15} />
          </div>
        );
      case 'balance':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <CreditCard size={15} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Info size={15} />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-9 h-9 rounded-xl flex items-center justify-center relative transition-all cursor-pointer ${
          isOpen 
            ? 'bg-white/25 text-white ring-2 ring-amber-400/60' 
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        title="Notifications & System Alerts"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={17} className={unreadCount > 0 ? 'text-amber-200' : 'text-white'} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-400 text-amber-950 font-black text-[10px] rounded-full flex items-center justify-center ring-2 ring-[#5c1516] shadow-sm animate-in zoom-in-75 duration-200">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 origin-top-right">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 to-[#5c1516] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
                <Bell size={14} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-tight text-white flex items-center gap-2">
                  System Alerts
                  {unreadCount > 0 && (
                    <span className="bg-amber-400 text-amber-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-amber-200/80 font-medium">
                  Inventory, cashier voids & reloads
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh alerts"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-100 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <CheckCheck size={13} />
                  <span>Mark read</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Badges (if multiple notifications) */}
          {notifications.length > 3 && (
            <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 border-b border-slate-100 text-[11px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Filter:</span>
              {(['all', 'stock', 'void', 'topup'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] capitalize transition-colors cursor-pointer ${
                    filter === tab 
                      ? 'bg-[#5c1516] text-white shadow-2xs' 
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'stock' ? 'Stock' : tab === 'void' ? 'Voids' : 'Top-Ups'}
                </button>
              ))}
            </div>
          )}

          {/* Notifications List */}
          <ScrollArea className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2 opacity-80" />
                <h4 className="text-xs font-bold text-slate-800">All Caught Up!</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  No active low-stock warnings, cashier void notices, or critical alerts at this time.
                </p>
              </div>
            ) : (
              filteredNotifications.map(item => {
                const isRead = readIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                      !isRead ? 'bg-amber-50/30' : 'bg-white'
                    }`}
                  >
                    {renderIcon(item.type, item.severity)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {item.title}
                        </span>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 ring-1 ring-white" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between mt-1.5 pt-1 text-[10px]">
                        <span className="text-slate-400 font-medium">
                          {item.time}
                        </span>

                        {item.actionLabel && (
                          <span className="inline-flex items-center gap-0.5 text-[#5c1516] font-bold hover:underline">
                            <span>{item.actionLabel}</span>
                            <ChevronRight size={11} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-between px-3">
            <span className="text-[10px] text-slate-400 font-medium">
              CPOSIMS Automated Monitor
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
