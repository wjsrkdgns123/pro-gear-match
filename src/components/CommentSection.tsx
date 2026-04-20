import { useState, useEffect } from 'react';
import { MessageCircle, Flag, Send, Loader2, Trash2, Pencil, X } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, increment, setDoc, serverTimestamp, query, orderBy, collectionGroup, where } from 'firebase/firestore';
import { db } from '../firebase';
import { translations } from '../translations';
import { getAuthorToken } from '../utils/authorToken';

export interface ProComment {
  id: string;
  text: string;
  nickname: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
  reports: number;
  reportedBy: string[];
  authorToken: string;
  proId?: string;
}

type TranslationBundle = typeof translations['en'];

export function ReportedCommentsModal({ theme, t, onClose }: {
  theme: 'dark' | 'light';
  t: TranslationBundle;
  onClose: () => void;
}) {
  const [reported, setReported] = useState<ProComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collectionGroup(db, 'messages'), where('reports', '>', 0), orderBy('reports', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setReported(snap.docs.map(d => {
        const proId = d.ref.parent.parent?.id || '';
        return { id: d.id, proId, ...d.data() } as ProComment;
      }));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const handleDelete = async (c: ProComment) => {
    if (!c.proId) return;
    await deleteDoc(doc(db, 'comments', c.proId, 'messages', c.id));
  };

  const formatTs = (ts: ProComment['createdAt']) => {
    if (!ts) return '';
    return new Date(ts.seconds * 1000).toLocaleString();
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border ${theme === 'dark' ? 'bg-[#0c0c0e] border-[#333]' : 'bg-white border-[#d1d5db]'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-[#222]' : 'border-[#e5e7eb]'}`}>
          <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-red-400">
            <Flag size={12} /> {t.reportedComments} {!loading && `(${reported.length})`}
          </p>
          <button onClick={onClose} className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-white/10 text-[#888]' : 'hover:bg-black/10 text-[#4b5563]'}`}>
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {loading ? (
            <p className={`text-xs text-center py-8 ${theme === 'dark' ? 'text-[#555]' : 'text-[#9ca3af]'}`}>{t.loadingComments}</p>
          ) : reported.length === 0 ? (
            <p className={`text-xs text-center py-8 ${theme === 'dark' ? 'text-[#555]' : 'text-[#9ca3af]'}`}>{t.noReportedComments}</p>
          ) : reported.map(c => (
            <div key={c.id} className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#1e1e1e]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{c.nickname}</span>
                    <span className={`text-[9px] font-mono ${theme === 'dark' ? 'text-[#444]' : 'text-[#bbb]'}`}>{formatTs(c.createdAt)}</span>
                    <span className="text-[9px] font-mono text-red-400 border border-red-500/30 px-1 rounded">신고 {c.reports}</span>
                    <span className={`text-[9px] font-mono px-1 rounded ${theme === 'dark' ? 'bg-[#1a1a1a] text-[#555]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>{t.proIdLabel}: {c.proId}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-[#aaa]' : 'text-[#374151]'}`}>{c.text}</p>
                </div>
                <button
                  onClick={() => handleDelete(c)}
                  className={`flex-shrink-0 flex items-center gap-0.5 px-1.5 py-1 rounded text-[9px] font-mono border transition-all ${theme === 'dark' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-300 text-red-500 hover:bg-red-50'}`}
                >
                  <Trash2 size={9} /> {t.deleteComment}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CommentSection({ proId, theme, t, isAdmin }: {
  proId: string;
  theme: 'dark' | 'light';
  t: TranslationBundle;
  isAdmin: boolean;
}) {
  const myToken = getAuthorToken();
  const [comments, setComments] = useState<ProComment[]>([]);
  const [text, setText] = useState('');
  const [nickname, setNickname] = useState(() => localStorage.getItem('commentNickname') || '');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showReported, setShowReported] = useState(false);
  const [reportedIds, setReportedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('reportedComments') || '[]')); }
    catch { return new Set(); }
  });

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'comments'), snap => {
      setEnabled(snap.exists() ? snap.data().enabled !== false : true);
    });
    const q = query(collection(db, 'comments', proId, 'messages'), orderBy('createdAt', 'desc'));
    const unsubComments = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProComment)));
      setLoading(false);
    }, () => setLoading(false));
    return () => { unsubSettings(); unsubComments(); };
  }, [proId]);

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    const nick = nickname.trim() || t.anonymous;
    localStorage.setItem('commentNickname', nick);
    try {
      await addDoc(collection(db, 'comments', proId, 'messages'), {
        text: text.trim(),
        nickname: nick,
        createdAt: serverTimestamp(),
        reports: 0,
        reportedBy: [],
        authorToken: myToken,
      });
      setText('');
    } finally {
      setPosting(false);
    }
  };

  const handleReport = async (c: ProComment) => {
    if (reportedIds.has(c.id) || c.authorToken === myToken) return;
    if (!window.confirm(t.reportConfirm)) return;
    await updateDoc(doc(db, 'comments', proId, 'messages', c.id), {
      reports: increment(1),
      reportedBy: [...(c.reportedBy || []), myToken],
    });
    const next = new Set(reportedIds).add(c.id);
    setReportedIds(next);
    localStorage.setItem('reportedComments', JSON.stringify([...next]));
  };

  const handleDelete = async (commentId: string) => {
    await deleteDoc(doc(db, 'comments', proId, 'messages', commentId));
  };

  const handleEditSave = async (commentId: string) => {
    if (!editText.trim()) return;
    await updateDoc(doc(db, 'comments', proId, 'messages', commentId), { text: editText.trim() });
    setEditingId(null);
  };

  const toggleEnabled = async () => {
    await setDoc(doc(db, 'settings', 'comments'), { enabled: !enabled }, { merge: true });
  };

  const formatTs = (ts: ProComment['createdAt']) => {
    if (!ts) return '';
    const d = new Date(ts.seconds * 1000);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isAuthor = (c: ProComment) => c.authorToken === myToken;

  return (
    <>
      {showReported && isAdmin && (
        <ReportedCommentsModal theme={theme} t={t} onClose={() => setShowReported(false)} />
      )}
      <div className={`pt-8 border-t ${theme === 'dark' ? 'border-[#333]' : 'border-[#e5e7eb]'}`}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <p className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#555]' : 'text-[#888]'} uppercase tracking-widest flex items-center gap-2`}>
            <MessageCircle size={12} className="text-emerald-500" /> {t.comments}
            {!loading && <span className={`${theme === 'dark' ? 'text-[#444]' : 'text-[#bbb]'}`}>({comments.length})</span>}
          </p>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReported(true)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono border transition-all ${theme === 'dark' ? 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10' : 'border-orange-300 text-orange-500 hover:bg-orange-50'}`}
              >
                <Flag size={9} /> {t.viewReported}
              </button>
              <button
                onClick={toggleEnabled}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono border transition-all ${
                  enabled
                    ? theme === 'dark' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-400 text-red-500 hover:bg-red-50'
                    : theme === 'dark' ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {enabled ? t.disableComments : t.enableComments}
              </button>
            </div>
          )}
        </div>

        {!enabled && !isAdmin ? (
          <p className={`text-xs ${theme === 'dark' ? 'text-[#555]' : 'text-[#9ca3af]'} text-center py-4`}>{t.commentsDisabled}</p>
        ) : (
          <>
            {enabled && (
              <div className={`mb-4 p-3 rounded-xl border ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#222]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder={t.nicknamePlaceholder}
                  maxLength={20}
                  className={`w-full mb-2 px-3 py-1.5 rounded-lg text-xs font-mono border bg-transparent outline-none ${
                    theme === 'dark' ? 'border-[#333] text-[#aaa] placeholder-[#444] focus:border-emerald-500/50' : 'border-[#d1d5db] text-[#374151] placeholder-[#9ca3af] focus:border-emerald-500'
                  } transition-colors`}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handlePost()}
                    placeholder={t.commentPlaceholder}
                    maxLength={300}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-mono border bg-transparent outline-none ${
                      theme === 'dark' ? 'border-[#333] text-[#ccc] placeholder-[#444] focus:border-emerald-500/50' : 'border-[#d1d5db] text-[#374151] placeholder-[#9ca3af] focus:border-emerald-500'
                    } transition-colors`}
                  />
                  <button
                    onClick={handlePost}
                    disabled={posting || !text.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-black rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {posting ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                    {posting ? t.posting : t.postComment}
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <p className={`text-xs ${theme === 'dark' ? 'text-[#555]' : 'text-[#9ca3af]'} text-center py-4`}>{t.loadingComments}</p>
            ) : comments.length === 0 ? (
              <p className={`text-xs ${theme === 'dark' ? 'text-[#555]' : 'text-[#9ca3af]'} text-center py-4`}>{t.noComments}</p>
            ) : (
              <div className="space-y-2">
                {comments.map(c => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl border transition-all ${c.reports >= 3 && !isAdmin ? 'opacity-30' : ''} ${
                      theme === 'dark' ? 'bg-[#0a0a0a] border-[#1e1e1e]' : 'bg-white border-[#e5e7eb]'
                    }`}
                  >
                    {editingId === c.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleEditSave(c.id)}
                          maxLength={300}
                          autoFocus
                          className={`w-full px-3 py-1.5 rounded-lg text-xs font-mono border bg-transparent outline-none ${
                            theme === 'dark' ? 'border-emerald-500/50 text-[#ccc]' : 'border-emerald-500 text-[#374151]'
                          }`}
                        />
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => setEditingId(null)} className={`px-2 py-1 rounded text-[9px] font-mono border ${theme === 'dark' ? 'border-[#333] text-[#555] hover:text-[#aaa]' : 'border-[#d1d5db] text-[#9ca3af]'}`}>{t.cancel}</button>
                          <button onClick={() => handleEditSave(c.id)} className="px-2 py-1 rounded text-[9px] font-mono bg-emerald-500 text-black hover:bg-emerald-400">{t.saveEdit}</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`text-[10px] font-mono font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{c.nickname}</span>
                            <span className={`text-[9px] font-mono ${theme === 'dark' ? 'text-[#444]' : 'text-[#bbb]'}`}>{formatTs(c.createdAt)}</span>
                            {c.reports > 0 && isAdmin && (
                              <span className="text-[9px] font-mono text-red-400 border border-red-500/30 px-1 rounded">{t.report} {c.reports}</span>
                            )}
                          </div>
                          <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-[#aaa]' : 'text-[#374151]'}`}>{c.text}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isAuthor(c) && (
                            <>
                              <button
                                onClick={() => { setEditingId(c.id); setEditText(c.text); }}
                                className={`flex items-center gap-0.5 px-1.5 py-1 rounded text-[9px] font-mono border transition-all ${theme === 'dark' ? 'border-[#333] text-[#555] hover:border-emerald-500/40 hover:text-emerald-400' : 'border-[#e5e7eb] text-[#9ca3af] hover:border-emerald-400 hover:text-emerald-600'}`}
                              >
                                <Pencil size={9} /> {t.editComment}
                              </button>
                              <button
                                onClick={() => handleDelete(c.id)}
                                className={`flex items-center gap-0.5 px-1.5 py-1 rounded text-[9px] font-mono border transition-all ${theme === 'dark' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-300 text-red-500 hover:bg-red-50'}`}
                              >
                                <Trash2 size={9} /> {t.deleteComment}
                              </button>
                            </>
                          )}
                          {isAdmin && !isAuthor(c) && (
                            <button
                              onClick={() => handleDelete(c.id)}
                              className={`flex items-center gap-0.5 px-1.5 py-1 rounded text-[9px] font-mono border transition-all ${theme === 'dark' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-300 text-red-500 hover:bg-red-50'}`}
                            >
                              <Trash2 size={9} /> {t.deleteComment}
                            </button>
                          )}
                          {!isAuthor(c) && !isAdmin && (
                            <button
                              onClick={() => handleReport(c)}
                              disabled={reportedIds.has(c.id)}
                              className={`flex items-center gap-0.5 px-1.5 py-1 rounded text-[9px] font-mono border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                reportedIds.has(c.id)
                                  ? theme === 'dark' ? 'border-[#333] text-[#555]' : 'border-[#e5e7eb] text-[#9ca3af]'
                                  : theme === 'dark' ? 'border-[#333] text-[#555] hover:border-red-500/40 hover:text-red-400' : 'border-[#e5e7eb] text-[#9ca3af] hover:border-red-300 hover:text-red-500'
                              }`}
                            >
                              <Flag size={9} /> {reportedIds.has(c.id) ? t.reported : t.report}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
