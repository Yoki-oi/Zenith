'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import NavBar from './navbar';
import {
  Users, Copy, Pencil, Check, X, Send, UserPlus, Clock, ChevronDown, ChevronUp,
  RefreshCw, Trash2
} from 'lucide-react';
import {
  getPublicProfileByCode, sendFriendRequest, getPendingRequests,
  acceptFriendRequest, rejectFriendRequest, cancelFriendRequest,
  getFriends, removeFriend, isFriendCodeTaken, updatePublicProfile,
  PublicProfile, FriendRequest, subscribeToRequests,
} from '@/lib/firestore';

// ── Helpers ───────────────────────────────────────────────────────────────────

function avatarColor(name: string) {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
  return colors[h];
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-12 h-12 text-lg' : 'w-10 h-10 text-base';
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ background: avatarColor(name) }}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}

function ProgressBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-300 font-medium">{pct}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ── Your Code Card ────────────────────────────────────────────────────────────

function YourCodeCard() {
  const { user, updateUser, saveToCloud } = useStore();
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const code = user?.friendCode || '------';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditStart = () => {
    setEditVal(code);
    setEditError('');
    setEditing(true);
  };

  const handleEditSave = async () => {
    const val = editVal.toUpperCase().trim();
    if (val.length !== 5) return setEditError('Must be exactly 5 characters');
    if (!/^[A-Z0-9]+$/.test(val)) return setEditError('Letters and numbers only');
    if (!user?.uid) return;
    setEditLoading(true);
    const taken = await isFriendCodeTaken(val, user.uid);
    if (taken) { setEditError('Code already taken, try another'); setEditLoading(false); return; }
    await updateUser({ friendCode: val });
    await saveToCloud();
    // Also update public profile immediately with new code
    if (user.uid) {
      await updatePublicProfile(user.uid, {
        name: user.name,
        friendCode: val,
        examName: user.examName,
        examDate: user.examDate,
        class11Pct: 0, class12Pct: 0, overallPct: 0,
        masteredCount: 0, totalChapters: 0,
        currentChapter: null, recentMastered: [],
        updatedAt: Date.now(),
      });
    }
    setEditing(false);
    setEditLoading(false);
  };

  return (
    <div className="bg-[#0f1219] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-label text-gray-500 text-xs uppercase tracking-wider">Your Code</p>
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <Users className="w-4 h-4 text-purple-400" />
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <input
            value={editVal}
            onChange={e => { setEditVal(e.target.value.toUpperCase().slice(0, 5)); setEditError(''); }}
            className="w-full font-mono text-3xl font-bold text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 tracking-widest uppercase"
            maxLength={5}
            autoFocus
          />
          {editError && <p className="text-red-400 text-xs">{editError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleEditSave}
              disabled={editLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/20 text-purple-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {editLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-sm rounded-xl transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <p className="font-mono text-5xl sm:text-6xl font-bold text-white tracking-widest mb-2">{code}</p>
            <p className="text-gray-600 text-sm">Share this code with friends to connect.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/8 border border-white/8 text-gray-300 text-sm font-medium rounded-xl transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={handleEditStart}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/8 border border-white/8 text-gray-300 text-sm font-medium rounded-xl transition-colors"
            >
              <Pencil className="w-4 h-4" /> Edit Code
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Add Friend Card ───────────────────────────────────────────────────────────

function AddFriendCard({ onRequestSent }: { onRequestSent: () => void }) {
  const { user } = useStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSend = async () => {
    if (!user?.uid || !user.friendCode) return;
    const val = code.toUpperCase().trim();
    if (val.length < 5 || val.length > 6) return setError('Enter a valid 5-character code');
    if (val === user.friendCode) return setError("That's your own code!");
    setLoading(true); setError(''); setSuccess('');
    const profile = await getPublicProfileByCode(val);
    if (!profile) { setError('No user found with this code'); setLoading(false); return; }
    const result = await sendFriendRequest(
      user.uid, user.name, user.friendCode,
      profile.uid, profile.name, profile.friendCode
    );
    if (result.success) {
      setSuccess(`Request sent to ${profile.name}!`);
      setCode('');
      onRequestSent();
    } else {
      setError(result.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#0f1219] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-label text-gray-500 text-xs uppercase tracking-wider">Add a Friend</p>
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <UserPlus className="w-4 h-4 text-purple-400" />
        </div>
      </div>
      <p className="text-gray-500 text-sm -mt-2">Enter your friend's code to send a request.</p>

      <input
        value={code}
        onChange={e => { setCode(e.target.value.toUpperCase().slice(0, 5)); setError(''); setSuccess(''); }}
        placeholder="ENTER FRIEND'S CODE"
        className="w-full font-mono text-lg text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 tracking-widest uppercase placeholder:text-gray-600 placeholder:text-base placeholder:tracking-widest"
        onKeyDown={e => e.key === 'Enter' && handleSend()}
      />

      {error && <p className="text-red-400 text-xs -mt-2">{error}</p>}
      {success && <p className="text-green-400 text-xs -mt-2">{success}</p>}

      <button
        onClick={handleSend}
        disabled={loading || code.length < 5 || code.length > 6}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: code.length >= 5 ? '0 4px 16px rgba(99,102,241,0.3)' : 'none' }}
      >
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Send Request
      </button>
    </div>
  );
}

// ── Pending Requests ──────────────────────────────────────────────────────────

function PendingRequestsCard({
  incoming, outgoing, onRefresh
}: {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);

  if (incoming.length === 0 && outgoing.length === 0) return null;

  const handle = async (fn: () => Promise<void>, id: string) => {
    setLoading(id);
    await fn();
    onRefresh();
    setLoading(null);
  };

  return (
    <div className="bg-[#0f1219] border border-white/5 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <p className="font-label text-gray-500 text-xs uppercase tracking-wider">Pending Requests</p>
          <div className="flex items-center gap-1.5">
            {incoming.length > 0 && (
              <span className="px-2 py-0.5 bg-purple-500/15 border border-purple-500/20 text-purple-400 text-xs rounded-full font-medium">
                {incoming.length} incoming
              </span>
            )}
            {outgoing.length > 0 && (
              <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-gray-500 text-xs rounded-full font-medium">
                {outgoing.length} outgoing
              </span>
            )}
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-6">
          {/* Incoming */}
          {incoming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                <p className="text-gray-400 text-sm font-medium">Incoming Requests</p>
              </div>
              <div className="space-y-3">
                {incoming.map(req => (
                  <div key={req.id} className="flex items-center gap-4 py-3 border-t border-white/5">
                    <Avatar name={req.fromName} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{req.fromName}</p>
                      <p className="text-gray-600 text-xs font-mono">{req.fromCode}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handle(() => acceptFriendRequest(req.id), `accept-${req.id}`)}
                        disabled={loading === `accept-${req.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/20 text-purple-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                      >
                        {loading === `accept-${req.id}` ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Accept
                      </button>
                      <button
                        onClick={() => handle(() => rejectFriendRequest(req.id), `reject-${req.id}`)}
                        disabled={loading === `reject-${req.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outgoing */}
          {outgoing.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Send className="w-3.5 h-3.5 text-gray-500" />
                <p className="text-gray-400 text-sm font-medium">Outgoing Requests</p>
              </div>
              <div className="space-y-3">
                {outgoing.map(req => (
                  <div key={req.id} className="flex items-center gap-4 py-3 border-t border-white/5">
                    <Avatar name={req.toName} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{req.toName}</p>
                      <p className="text-gray-600 text-xs font-mono">{req.toCode}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/8 text-gray-500 text-xs rounded-full">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                      <button
                        onClick={() => handle(() => cancelFriendRequest(req.id), `cancel-${req.id}`)}
                        disabled={loading === `cancel-${req.id}`}
                        className="text-xs text-red-400/70 hover:text-red-400 transition-colors px-2 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Friend Card ───────────────────────────────────────────────────────────────

function FriendCard({ profile, myUid, onRemoved }: { profile: PublicProfile; myUid: string; onRemoved: () => void }) {
  const [removing, setRemoving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    await removeFriend(myUid, profile.uid);
    onRemoved();
  };

  return (
    <div className="bg-[#0f1219] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">

      {/* Mobile top row — avatar + name + chapter */}
      <div className="lg:hidden flex items-center gap-3 mb-3">
        <Avatar name={profile.name} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{profile.name}</p>
          <p className="text-gray-600 text-xs font-mono">{profile.friendCode}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-white font-bold text-base">{profile.masteredCount}<span className="text-gray-600 text-xs font-normal"> / {profile.totalChapters}</span></p>
            <p className="text-gray-500 text-[10px]">Mastered</p>
          </div>
          {confirmRemove ? (
            <div className="flex flex-col items-center gap-0.5">
              <button onClick={handleRemove} disabled={removing} className="text-xs text-red-400 hover:text-red-300 transition-colors">{removing ? '...' : 'Remove'}</button>
              <button onClick={() => setConfirmRemove(false)} className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirmRemove(true)} className="text-gray-700 hover:text-red-400 transition-colors p-1"><Trash2 className="w-3.5 h-3.5" /></button>
          )}
        </div>
      </div>
      {(profile.doingChapters?.length ?? 0) > 0 && (
        <div className="lg:hidden mb-3 flex flex-wrap gap-1">
          {profile.doingChapters.slice(0, 2).map((c, i) => (
            <span key={i} className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/15 text-blue-300 text-xs rounded-lg truncate max-w-[160px]">
              {c.subjectName} · {c.title}
            </span>
          ))}
        </div>
      )}
      <div className="hidden lg:flex items-center gap-5">

        {/* Col 1: Avatar + name + code */}
        <div className="flex items-center gap-3 w-40 shrink-0">
          <Avatar name={profile.name} size="lg" />
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{profile.name}</p>
            <p className="text-gray-600 text-xs font-mono">{profile.friendCode}</p>
          </div>
        </div>

        {/* Col 2: Doing chapters */}
        <div className="w-52 shrink-0">
          <p className="text-gray-500 text-xs mb-1.5">Currently Doing</p>
          {(profile.doingChapters?.length ?? 0) > 0 ? (
            <div className="flex flex-col gap-1">
              {profile.doingChapters.slice(0, 3).map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/15 text-blue-300 text-xs rounded-lg font-medium leading-tight truncate">
                  <span className="text-blue-500/60 shrink-0">●</span>
                  <span className="truncate">{c.subjectName} · {c.title}</span>
                </span>
              ))}
              {profile.doingChapters.length > 3 && (
                <span className="text-gray-600 text-xs pl-1">+{profile.doingChapters.length - 3} more</span>
              )}
            </div>
          ) : (
            <span className="text-gray-600 text-xs italic">No active chapters</span>
          )}
        </div>

        {/* Col 3: Progress bars */}
        <div className="flex-1 space-y-2.5 min-w-0">
          <ProgressBar label="Class 11" pct={profile.class11Pct} color="#6366f1" />
          <ProgressBar label="Class 12" pct={profile.class12Pct} color="#8b5cf6" />
        </div>

        {/* Col 4: Mastered + recent pills + remove */}
        <div className="w-52 shrink-0 space-y-2">
          <div>
            <p className="text-gray-500 text-xs mb-1">Mastered</p>
            <p className="text-white font-bold text-lg leading-none">
              {profile.masteredCount}
              <span className="text-gray-600 text-sm font-normal"> / {profile.totalChapters}</span>
            </p>
          </div>
          {profile.recentMastered.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {profile.recentMastered.slice(0, 3).map((ch, i) => (
                <span key={i} className="px-2 py-0.5 bg-green-500/10 border border-green-500/15 text-green-400 text-[10px] rounded-full truncate max-w-[140px]">
                  {ch}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Remove button */}
        <div className="shrink-0">
          {confirmRemove ? (
            <div className="flex flex-col items-center gap-1">
              <button onClick={handleRemove} disabled={removing} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                {removing ? '...' : 'Confirm'}
              </button>
              <button onClick={() => setConfirmRemove(false)} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmRemove(true)} className="text-gray-700 hover:text-red-400 transition-colors p-1" title="Remove friend">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile stacked layout — only show below lg */}
      <div className="hidden max-lg:block mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-3">
        <ProgressBar label="Class 11" pct={profile.class11Pct} color="#6366f1" />
        <ProgressBar label="Class 12" pct={profile.class12Pct} color="#8b5cf6" />
        {profile.recentMastered.length > 0 && (
          <div className="col-span-2 flex flex-wrap gap-1">
            {profile.recentMastered.slice(0, 3).map((ch, i) => (
              <span key={i} className="px-2 py-0.5 bg-green-500/10 border border-green-500/15 text-green-400 text-[10px] rounded-full">
                {ch}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Friends Page ─────────────────────────────────────────────────────────

export default function FriendsPage() {
  const { user } = useStore();
  const [friends, setFriends] = useState<PublicProfile[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'progress' | 'name'>('progress');

  const loadFriends = useCallback(async () => {
    if (!user?.uid) return;
    const friendList = await getFriends(user.uid);
    setFriends(friendList);
    setLoading(false);
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    loadFriends();

    // Real-time listener for pending requests
    const unsub = subscribeToRequests(user.uid, ({ incoming, outgoing }) => {
      setIncoming(incoming);
      setOutgoing(outgoing);
      // Reload friends when a request is accepted
      loadFriends();
    });

    return () => unsub();
  }, [user?.uid, loadFriends]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await loadFriends();
  }, [loadFriends]);

  const sortedFriends = [...friends].sort((a, b) =>
    sortBy === 'progress'
      ? b.overallPct - a.overallPct
      : a.name.localeCompare(b.name)
  );

  return (
    <div className="min-h-screen bg-[#0a0d14] relative flex flex-col">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-900/8 blur-[100px]" />
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotgrid-friends" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid-friends)" />
        </svg>
      </div>
      <div className="relative z-10 flex flex-col flex-1">
      <NavBar activeTab="Friends" />
      <main className="flex-1 pt-20 pb-6 px-4 sm:px-6 xl:px-10 space-y-5">

        {/* Page header */}
        <div className="pt-4 flex items-end justify-between">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl text-white mb-2" style={{ letterSpacing: '-0.03em' }}>Friends</h1>
            <p className="text-gray-500 text-sm">Track progress together and stay motivated.</p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/8 text-gray-400 hover:text-white text-sm rounded-xl transition-colors mb-1 disabled:opacity-50"
            title="Refresh friends data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Top row — Your Code + Add Friend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <YourCodeCard />
          <AddFriendCard onRequestSent={loadData} />
        </div>

        {/* Pending requests */}
        <PendingRequestsCard incoming={incoming} outgoing={outgoing} onRefresh={loadData} />

        {/* Friends list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-label text-gray-500 text-xs uppercase tracking-wider">
              Friends {friends.length > 0 && <span className="text-gray-700 ml-1">({friends.length})</span>}
            </p>
            {friends.length > 1 && (
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
                {(['progress', 'name'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === s ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {s === 'progress' ? 'By Progress' : 'By Name'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-5 h-5 text-gray-600 animate-spin" />
            </div>
          ) : sortedFriends.length === 0 ? (
            <div className="bg-[#0f1219] border border-white/5 rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-purple-400/60" />
              </div>
              <p className="text-white font-medium">No friends yet</p>
              <p className="text-gray-600 text-sm max-w-xs">Share your code or enter a friend's code above to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedFriends.map(f => (
                <FriendCard key={f.uid} profile={f} myUid={user!.uid!} onRemoved={loadData} />
              ))}
            </div>
          )}
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs text-gray-700">
          Your friends can see your chapter names and progress. They cannot see your tasks or analytics.
        </p>
      </main>

      <footer className="mt-auto px-4 sm:px-6 xl:px-10 py-5 border-t border-white/5 flex flex-col sm:flex-row items-center sm:justify-between gap-1 text-sm text-gray-500 text-center sm:text-left">
        <span>Nexus — Syllabus Tracking Platform for JEE Aspirants</span>
        <span>Designed &amp; Developed by Yoki</span>
      </footer>
      </div>
    </div>
  );
}
