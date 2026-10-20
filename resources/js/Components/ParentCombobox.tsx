import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, User, Check, Loader2, ChevronDown, UserX } from 'lucide-react';
import { ParentUser } from '@/Pages/Admin/Students/Index';

interface ParentComboboxProps {
  value: number | string;
  onChange: (parentId: number | '', parent?: ParentUser | null) => void;
  initialParents?: ParentUser[];
  selectedParent?: ParentUser | null;
  error?: string;
}

export default function ParentCombobox({
  value,
  onChange,
  initialParents = [],
  selectedParent = null,
  error,
}: ParentComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ParentUser[]>(initialParents);
  const [isLoading, setIsLoading] = useState(false);

  // Keep track of the currently selected parent object for display
  const [currentParent, setCurrentParent] = useState<ParentUser | null>(() => {
    if (selectedParent && String(selectedParent.id) === String(value)) {
      return selectedParent;
    }
    const found = initialParents.find((p) => String(p.id) === String(value));
    return found || null;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync selected parent when value or selectedParent prop changes externally
  useEffect(() => {
    if (!value) {
      setCurrentParent(null);
      return;
    }

    if (selectedParent && String(selectedParent.id) === String(value)) {
      setCurrentParent(selectedParent);
      return;
    }

    const foundInResults = results.find((p) => String(p.id) === String(value));
    if (foundInResults) {
      setCurrentParent(foundInResults);
      return;
    }

    const foundInInitial = initialParents.find((p) => String(p.id) === String(value));
    if (foundInInitial) {
      setCurrentParent(foundInInitial);
    }
  }, [value, selectedParent, initialParents, results]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced async search
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setResults(initialParents);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/admin/parents/search?q=${encodeURIComponent(query.trim())}`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          }
        );

        if (response.ok) {
          const data: ParentUser[] = await response.json();
          setResults(data);
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          console.error('Failed to search parents:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, isOpen, initialParents]);

  const handleSelectParent = (parent: ParentUser | null) => {
    if (parent) {
      onChange(parent.id, parent);
      setCurrentParent(parent);
    } else {
      onChange('', null);
      setCurrentParent(null);
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', null);
    setCurrentParent(null);
    setQuery('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* 1. If parent is selected, show rich card capsule with change/clear options */}
      {currentParent ? (
        <div
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className={`flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 border rounded-xl cursor-pointer transition-all ${
            error ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#5c1516]/10 border border-[#5c1516]/20 text-[#5c1516] flex items-center justify-center font-bold text-xs shrink-0">
              {getInitials(currentParent.full_name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {currentParent.full_name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {currentParent.email} • @{currentParent.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span className="text-[11px] text-[#5c1516] font-semibold hover:underline px-2 py-1">
              Change
            </span>
            <button
              type="button"
              onClick={handleClearSelection}
              title="Unlink parent (Independent Student)"
              className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* 2. If no parent is selected, show the Search Combobox Input */
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            placeholder="Search parent by name, username, or email..."
            className={`w-full h-10 pl-9 pr-9 text-xs rounded-xl border bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5c1516]/20 ${
              error ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200 focus:border-[#5c1516]'
            }`}
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
            {isLoading ? (
              <Loader2 size={14} className="animate-spin text-slate-400" />
            ) : (
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <ChevronDown size={14} className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-72 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {/* Quick search input inside dropdown if parent is already selected and they clicked 'Change' */}
          {currentParent && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search size={13} className="absolute inset-y-0 left-2.5 my-auto text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type new parent name or email..."
                  className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#5c1516] focus:ring-1 focus:ring-[#5c1516]"
                />
              </div>
            </div>
          )}

          {/* Results list */}
          <div className="overflow-y-auto divide-y divide-slate-100 py-1">
            {/* Option: Unlink / Independent */}
            <button
              type="button"
              onClick={() => handleSelectParent(null)}
              className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors hover:bg-slate-50 ${
                !value ? 'bg-amber-50/50 text-amber-900 font-bold' : 'text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                  <UserX size={13} />
                </div>
                <div>
                  <p className="font-semibold text-xs">-- No Parent Linked --</p>
                  <p className="text-[10px] text-slate-400">Independent Student Account</p>
                </div>
              </div>
              {!value && <Check size={14} className="text-amber-600" />}
            </button>

            {/* List of matching parents */}
            {results.length > 0 ? (
              results.map((parent) => {
                const isSelected = String(parent.id) === String(value);
                return (
                  <button
                    key={parent.id}
                    type="button"
                    onClick={() => handleSelectParent(parent)}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between transition-colors hover:bg-[#5c1516]/5 ${
                      isSelected ? 'bg-[#5c1516]/10 text-[#5c1516] font-bold' : 'text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 ${
                          isSelected
                            ? 'bg-[#5c1516] text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {getInitials(parent.full_name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate leading-tight">
                          {parent.full_name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                          {parent.email} <span className="opacity-60">• @{parent.username}</span>
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <Check size={14} className="text-[#5c1516] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-2">
                    <Loader2 size={14} className="animate-spin text-[#5c1516]" />
                    <span>Searching parent directory...</span>
                  </div>
                ) : (
                  <div className="py-2">
                    <p className="text-xs font-semibold text-slate-700">No parents found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No active parent matches &quot;{query}&quot;.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer status bar */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>
              {query ? `Showing results for "${query}"` : 'Type to search all parents'}
            </span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] text-slate-400">
              Esc to close
            </kbd>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
    </div>
  );
}
