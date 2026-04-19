'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bot, Send, User, Sparkles, RefreshCw, Table2,
  CheckCircle, XCircle, AlertTriangle, Trash2,
  ChevronDown, ChevronUp, MessageSquare, Database,
  Zap, Copy, Check, Info, Command
} from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';

/* ─── Suggestion chips ────────────────────────────────────────────────────── */
const SUGGESTIONS = [
  { text: 'من هو أفضل سائق هذا الشهر؟', icon: '🏆', color: 'text-amber-400' },
  { text: 'أعطني تقرير أداء السائقين لشهر مايو', icon: '📊', color: 'text-blue-400' },
  { text: 'اعرض لي جميع الموظفين', icon: '👥', color: 'text-emerald-400' },
  { text: 'ما هي المركبات غير المخصصة؟', icon: '🚗', color: 'text-rose-400' },
  { text: 'أعطني ملخص المحافظ لشهر مايو 2024', icon: '💰', color: 'text-yellow-400' },
  { text: 'من السائقون الذين لديهم أعلى رفض؟', icon: '⚠️', color: 'text-orange-400' },
  { text: 'اعرض لي جميع المستخدمين في النظام', icon: '🔑', color: 'text-purple-400' },
  { text: 'ما هي المساكن المتاحة؟', icon: '🏠', color: 'text-cyan-400' },
];

const CAPABILITIES = [
  { icon: Database, label: 'استعلام البيانات', desc: 'اسأل عن أي سجل في النظام' },
  { icon: Table2, label: 'عرض الجداول', desc: 'تحليل البيانات في جداول تفاعلية' },
  { icon: Zap, label: 'إجراءات النظام', desc: 'تنفيذ أوامر إدارية مباشرة' },
  { icon: MessageSquare, label: 'سياق ذكي', desc: 'تذكر سياق المحادثة بالكامل' },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function renderValue(val, key = '') {
  if (val === null || val === undefined) return <span className="text-slate-600">—</span>;
  if (typeof val === 'boolean') return val
    ? <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px]"><CheckCircle size={10}/>نعم</span>
    : <span className="inline-flex items-center gap-1.5 text-rose-400 font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-[10px]"><XCircle size={10}/>لا</span>;
  
  if (typeof val === 'number') {
    const k = key.toLowerCase();
    const isID = k.includes('id') || k.includes('no') || k.includes('iqama') || k.includes('code') || k.includes('plate');
    
    return (
      <span className="font-mono font-bold text-sky-400 tracking-tight">
        {isID ? String(val) : val.toLocaleString()}
      </span>
    );
  }
  
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
    return <span className="text-indigo-300 font-medium">{new Date(val).toLocaleDateString('ar-SA')}</span>;
  }
  
  return <span className="truncate max-w-[300px] inline-block">{String(val)}</span>;
}

/* ─── Data Table ─────────────────────────────────────────────────────────── */
function DataTable({ data }) {
  if (!data) return null;
  const rows = Array.isArray(data) ? data : [data];
  if (!rows.length) return <p className="text-slate-500 text-xs py-4 text-center">لا توجد بيانات متاحة لعرضها.</p>;
  
  const keys = Object.keys(isObj(rows[0]) ? rows[0] : {});
  if (!keys.length) return null;

  return (
    <div className="w-full mt-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0f172a]/80 backdrop-blur-xl group/table relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur opacity-25 group-hover/table:opacity-40 transition-opacity pointer-events-none"></div>

      <div className="relative">
        <div className="flex items-center justify-between px-5 py-3 bg-white/[0.03] border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Table2 size={14} />
            </div>
            <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">
              نتائج البيانات ({rows.length})
            </span>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[9px] text-slate-500 font-bold bg-white/5 px-2 py-1 rounded-md uppercase tracking-wider">{keys.length} حقول</span>
          </div>
        </div>

        <div className="overflow-x-auto w-full scrollbar-hide scrollbar-track-transparent">
          <table className="min-w-full text-xs text-right" dir="rtl">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#1e293b]/90 backdrop-blur-md">
                {keys.map(k => (
                  <th key={k}
                    className="px-5 py-3.5 font-black text-slate-400 uppercase tracking-tighter border-b border-white/5 whitespace-nowrap">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, i) => (
                <tr key={i}
                  className="hover:bg-blue-500/10 transition-colors duration-150 group/row">
                  {keys.map(k => (
                    <td key={k}
                      className="px-5 py-3 text-slate-300 font-medium whitespace-nowrap group-hover/row:text-white transition-colors">
                      {renderValue(isObj(row) ? row[k] : row, k)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {rows.length > 5 && (
          <div className="px-5 py-2 bg-white/[0.02] border-t border-white/5 text-[10px] text-slate-500 text-center italic">
            استخدم شريط التمرير لرؤية المزيد من النتائج
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Confirm Dialog ─────────────────────────────────────────────────────── */
function ConfirmDialog({ pendingAction, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" dir="rtl">
      <div className="relative bg-[#1e293b] border border-yellow-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(234,179,8,0.15)] p-8 max-w-md w-full animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[60px] rounded-full pointer-events-none -mr-16 -mt-16"></div>
        
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-3xl flex items-center justify-center border border-yellow-500/30 shadow-inner">
            <AlertTriangle className="text-yellow-500" size={40} />
          </div>
          
          <div>
            <h3 className="text-white font-black text-2xl mb-2">هل أنت متأكد؟</h3>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-[10px] font-black uppercase tracking-tighter mb-4">
              {pendingAction.actionType}
            </div>
            <p className="text-slate-400 text-sm leading-relaxed px-4">
              {pendingAction.description}
            </p>
          </div>

          <div className="flex gap-4 w-full">
            <button 
              onClick={onConfirm} 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500
                         text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2
                         shadow-lg shadow-emerald-900/40 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <RefreshCw size={20} className="animate-spin" /> : <CheckCircle size={20} />}
              تأكيد الإجراء
            </button>
            <button 
              onClick={onCancel} 
              disabled={loading}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10
                         text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <XCircle size={20} />
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Chat Bubble ────────────────────────────────────────────────────────── */
function ChatBubble({ msg, isLast }) {
  const isUser = msg.role === 'user';
  const [dataOpen, setDataOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex flex-col w-full max-w-[95%] md:max-w-full ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Top Part: Avatar + Bubble */}
        <div className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-3 px-2 ${isUser ? 'flex-row' : 'flex-row-reverse'}`}>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 {isUser ? 'أنت' : 'Express Service AI'}
               </span>
               {msg.time && <span className="text-[10px] text-slate-600 font-medium">{msg.time}</span>}
            </div>

            <div className="relative group">
              <div className={`relative px-5 py-4 rounded-[1.5rem] text-sm leading-relaxed shadow-xl
                ${isUser
                  ? 'bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white rounded-tr-none shadow-blue-500/10 border border-blue-400/20'
                  : 'bg-[#1e293b] text-slate-100 rounded-tl-none border border-white/5 shadow-black/20'
                }`}>
                
                {!isUser && isLast && (
                  <div className="absolute inset-0 rounded-[1.5rem] rounded-tl-none bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%] animate-shimmer pointer-events-none"></div>
                )}

                <p className="relative z-10 whitespace-pre-wrap font-medium">{msg.content}</p>

                <button onClick={copy} 
                  className="absolute -top-3 -left-3 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200
                             bg-[#0f172a] hover:bg-[#1e293b] border border-white/10 p-2 rounded-xl shadow-2xl z-20">
                  {copied 
                    ? <Check size={12} className="text-emerald-400" /> 
                    : <Copy size={12} className="text-slate-400 hover:text-white" />
                  }
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-[#0b1222]
                ${isUser 
                  ? 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-blue-500/20' 
                  : 'bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 shadow-black/50'
                }`}>
                {isUser 
                  ? <User size={18} className="text-white" /> 
                  : <Bot size={18} className="text-blue-400" />
                }
              </div>
          </div>
        </div>

        {/* Bottom Part: Data Table (Full Width) */}
        {msg.data && (
          <div className="w-full mt-4 max-w-full">
            <button onClick={() => setDataOpen(v => !v)}
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all
                ${dataOpen ? 'text-blue-400 bg-blue-500/10 mb-2' : 'text-slate-500 hover:text-slate-400 bg-white/5 hover:bg-white/10'}`}>
              <div className={`p-1 rounded-md ${dataOpen ? 'bg-blue-400/20' : 'bg-slate-700/50'}`}>
                 <Table2 size={12} />
              </div>
              {Array.isArray(msg.data) ? `عرض النتائج (${msg.data.length})` : 'عرض تفاصيل البيانات'}
              <div className="ml-auto">
                 {dataOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </div>
            </button>
            
            <div className={`transition-all duration-300 ease-out overflow-hidden ${dataOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                 <DataTable data={msg.data} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Typing Indicator ───────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex justify-start mb-8 animate-in fade-in duration-500">
      <div className="flex gap-4 items-start max-w-[80%]">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-white/10 shadow-black/50">
          <Bot size={18} className="text-blue-400" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Express Service AI</span>
          <div className="bg-[#1e293b] border border-white/5 rounded-[1.5rem] rounded-tl-none px-6 py-4 flex gap-1.5 items-center shadow-xl">
            <span className="dot-bounce w-2 h-2 rounded-full bg-blue-500" style={{ animationDelay: '0ms' }} />
            <span className="dot-bounce w-2 h-2 rounded-full bg-indigo-400" style={{ animationDelay: '150ms' }} />
            <span className="dot-bounce w-2 h-2 rounded-full bg-sky-400" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────────── */
function EmptyState({ onSend }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto py-12 gap-12 text-center px-6">
      <div className="relative group cursor-default">
         <div className="absolute inset-0 scale-150 rotate-45 border-2 border-indigo-500/10 rounded-[3rem] animate-spin-slow"></div>
         <div className="absolute inset-0 scale-125 -rotate-12 border border-blue-500/10 rounded-[4rem] animate-spin-reverse-slow"></div>
         
         <div className="relative w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 
                         flex items-center justify-center shadow-[0_0_60px_-15px_rgba(79,70,229,0.5)] z-10 transition-transform group-hover:scale-110 duration-500">
            <Sparkles size={56} className="text-white animate-pulse" />
            <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-white/10 rounded-2xl px-3 py-1 flex items-center gap-2 shadow-2xl">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] font-black text-white uppercase tracking-tighter">نظام نشط</span>
            </div>
         </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-white text-4xl font-black tracking-tighter leading-none h-[1.1em]">
          مرحباً بك في <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Express Service AI</span>
        </h1>
        <p className="text-slate-400 text-base max-w-md mx-auto font-medium leading-relaxed">
          مساعدك الإداري الذكي لتحليل البيانات، إدارة السائقين، والتحكم بالعمليات بلمسة واحدة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {SUGGESTIONS.map(({ text, icon, color }) => (
          <button key={text} onClick={() => onSend(text)}
            className="group flex items-center justify-between gap-4 text-right
                       bg-[#1e293b]/40 hover:bg-[#1e293b]/80 border border-white/5
                       hover:border-blue-500/30 text-slate-300 hover:text-white
                       rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1">
            <div className="flex-1 overflow-hidden">
               <div className={`text-base mb-1 ${color}`}>{icon}</div>
               <p className="text-xs font-bold leading-tight line-clamp-1">{text}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Command size={14} className="text-slate-500" />
            </div>
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full pt-8 border-t border-white/5">
         {CAPABILITIES.map(({ icon: Icon, label, desc }) => (
           <div key={label} className="text-center group">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                 <Icon size={18} />
              </div>
              <h4 className="text-white text-[11px] font-black uppercase mb-1 tracking-wider">{label}</h4>
              <p className="text-slate-500 text-[10px] leading-tight px-1">{desc}</p>
           </div>
         ))}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function AIChatPage() {
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const buildHistory = useCallback((msgs) =>
    msgs.filter(m => m.role === 'user' || m.role === 'model')
        .map(m => ({ role: m.role, content: m.content })), []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const now = () => new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  /* Send */
  const sendMessage = async (text) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;
    
    setInput('');
    setError('');
    
    if (userText === '/clear') { clearChat(); return; }

    const userMsg = { role: 'user', content: userText, time: now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    
    try {
      const res = await ApiService.post('/api/ai/chat', {
        message: userText,
        history: buildHistory(messages),
      });
      
      if (res.needsConfirmation && res.pendingAction) {
        setMessages(prev => [...prev, { role: 'model', content: res.message, data: null, time: now() }]);
        setConfirmDialog({ pendingAction: res.pendingAction });
      } else {
        setMessages(prev => [...prev, { role: 'model', content: res.message, data: res.data ?? null, time: now() }]);
      }
    } catch (err) {
      setError(err.message || 'عذراً، فشل المساعد في معالجة طلبك حالياً. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleConfirm = async () => {
    if (!confirmDialog) return;
    setConfirmLoading(true);
    try {
      const res = await ApiService.post('/api/ai/chat', {
        message: '',
        confirmationToken: confirmDialog.pendingAction.token,
      });
      setMessages(prev => [...prev, { role: 'model', content: res.message, data: res.data ?? null, time: now() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: `❌ خطأ: ${err.message}`, data: null, time: now() }]);
    } finally {
      setConfirmLoading(false);
      setConfirmDialog(null);
    }
  };

  const handleCancel = () => {
    setMessages(prev => [...prev, { role: 'model', content: 'تم إلغاء الإجراء.', data: null, time: now() }]);
    setConfirmDialog(null);
  };

  const clearChat = () => { 
    setMessages([]); 
    setError(''); 
    setConfirmDialog(null); 
    if (inputRef.current) inputRef.current.focus(); 
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="h-screen flex flex-col bg-[#0b1222] text-slate-100 selection:bg-blue-500/30 overflow-hidden" dir="rtl">
      <PageHeader
        title="مساعد الذكاء الاصطناعي Express Service AI"
        subtitle="المحرك الذكي لإدارة البيانات والعمليات الإدارية"
        icon={Sparkles}
      />

      {confirmDialog && (
        <ConfirmDialog
          pendingAction={confirmDialog.pendingAction}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          loading={confirmLoading}
        />
      )}

      <div className="flex-1 flex flex-col min-h-0 relative">
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 scroll-smooth
          scrollbar-hide scrollbar-track-transparent">
          
          <div className="max-w-4xl mx-auto">
            {isEmpty
              ? <EmptyState onSend={sendMessage} />
              : <>
                  <div className="flex flex-col gap-2 mb-10 border-b border-white/5 pb-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg transform rotate-3">
                              <Sparkles size={18} className="text-white" />
                           </div>
                           <div>
                              <h2 className="text-base font-black tracking-tight leading-none">محادثة نشطة</h2>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">تاريخ اليوم: {new Date().toLocaleDateString('ar-SA')}</p>
                           </div>
                        </div>
                        <button onClick={clearChat} title="مسح المحادثة"
                          className="p-3 bg-white/5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-2xl border border-white/5 transition-all active:scale-95 group">
                          <Trash2 size={16} className="group-hover:rotate-12 transition-transform" />
                        </button>
                     </div>
                  </div>
                  
                  {messages.map((msg, i) => (
                    <ChatBubble key={i} msg={msg} isLast={i === messages.length - 1 && msg.role === 'model'} />
                  ))}
                  
                  {loading && <TypingIndicator />}
                </>
            }
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2 z-20">
          {error && (
            <div className="mb-4 animate-in slide-in-from-bottom-4 duration-300">
               <div className="bg-rose-950/40 border border-rose-500/20 text-rose-300 rounded-2xl px-5 py-4 text-sm flex items-center gap-4 shadow-2xl backdrop-blur-md">
                 <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                    <XCircle size={16} />
                 </div>
                 <span className="font-medium">{error}</span>
                 <button onClick={() => setError('')} className="ml-auto text-rose-300/50 hover:text-rose-300">
                    <Check size={16} />
                 </button>
               </div>
            </div>
          )}

          {!isEmpty && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none px-2 mask-linear-r">
               {SUGGESTIONS.slice(0, 4).map(({ text, icon }) => (
                 <button key={text} onClick={() => sendMessage(text)}
                   className="flex-shrink-0 flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white 
                              bg-[#1e293b]/80 border border-white/5 hover:border-blue-500/40 rounded-full px-4 py-2 transition-all">
                   <span className="text-xs">{icon}</span>
                   {text}
                 </button>
               ))}
            </div>
          )}

          <div className="relative group/input">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-sky-600/20 blur opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2.5rem]"></div>
            
            <div className={`relative flex items-center gap-3 p-2 bg-[#1e293b]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] transition-all duration-300
              ${loading ? 'ring-2 ring-blue-500/20' : 'group-focus-within/input:border-blue-500/40 group-focus-within/input:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)]'}`}>
              
              <div className="flex-1 flex items-center min-w-0 pr-4 pl-2">
                 <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 text-slate-500 mr-2 group-focus-within/input:text-blue-400 transition-colors">
                    <Command size={18} />
                 </div>
                 <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={loading ? 'جاري التفكير...' : 'اسأل Express Service AI أي شيء...'}
                    rows={1}
                    disabled={loading}
                    className="flex-1 bg-transparent text-white placeholder-slate-600 outline-none
                               scrollbar-hide resize-none text-sm font-semibold py-4 px-2 tracking-tight leading-relaxed max-h-32 overflow-y-auto"
                  />
              </div>

              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className={`relative w-14 h-14 flex items-center justify-center rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 active:scale-90 flex-shrink-0
                  ${!input.trim() || loading 
                    ? 'bg-slate-800 text-slate-600' 
                    : 'bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                  }`}
              >
                {loading
                  ? <RefreshCw size={22} className="animate-spin" />
                  : <Send size={20} />
                }
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-4 opacity-30 group/footer transition-opacity hover:opacity-100">
             <div className="h-[1px] w-20 bg-slate-700"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Express Service AI CORE 2024
             </p>
             <div className="h-[1px] w-20 bg-slate-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
