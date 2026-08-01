import React, { useState } from 'react';
import {
  X,
  Database,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveCustomSupabaseCredentials,
  clearCustomSupabaseCredentials,
} from '../lib/supabase';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsChanged: () => void;
  isConnected: boolean;
  errorMessage: string | null;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({
  isOpen,
  onClose,
  onCredentialsChanged,
  isConnected,
  errorMessage,
}) => {
  if (!isOpen) return null;

  const config = getSupabaseConfig();
  const [url, setUrl] = useState(config.url);
  const [key, setKey] = useState(config.key);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) return;

    saveCustomSupabaseCredentials(url, key);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onCredentialsChanged();
      onClose();
    }, 800);
  };

  const handleReset = () => {
    clearCustomSupabaseCredentials();
    const freshConfig = getSupabaseConfig();
    setUrl(freshConfig.url);
    setKey(freshConfig.key);
    onCredentialsChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Supabase Connection Setup
              </h2>
              <p className="text-xs text-slate-400">
                Connected to tables: <code className="text-indigo-300">orders</code> &{' '}
                <code className="text-indigo-300">destinations</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] text-xs">
          {/* Status Alert */}
          {isConnected ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-300 text-xs">
                  Supabase Backend Connected
                </p>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Currently retrieving live sales records and destination data via client config ({config.source} source).
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-amber-200 text-xs">
                  Connection Configuration Required
                </p>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  {errorMessage ||
                    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment, or enter credentials below.'}
                </p>
              </div>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>Supabase Project URL</span>
                <span className="text-[10px] text-slate-500 font-mono">VITE_SUPABASE_URL</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://your-project.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>Supabase Anon / Public Key</span>
                <span className="text-[10px] text-slate-500 font-mono">VITE_SUPABASE_ANON_KEY</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="eyJhY2...your-anon-key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {config.source === 'custom' ? (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Reset to Environment Defaults
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-colors"
              >
                {saveSuccess ? 'Saved & Connecting...' : 'Save Credentials'}
              </button>
            </div>
          </form>

          {/* Database Schema Reference */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h3 className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              Expected Database Schema
            </h3>

            <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-indigo-400 font-bold block">Table: orders</span>
                <p className="text-slate-400">id, amount, created_at, status, destination_id</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-amber-400 font-bold block">Table: destinations</span>
                <p className="text-slate-400">id, name, code, created_at</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
