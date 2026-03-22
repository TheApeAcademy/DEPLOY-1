import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Assignment {
  id: string;
  assignment_type: string;
  course_name: string;
  description: string;
  due_date?: string;
  payment_amount?: number;
  status: string;
  delivery_url?: string;
  created_at: string;
}

const STATUS: Record<string, any> = {
  pending:    { label: 'Submitted',     bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.3)',  text: '#fbbf24', dot: '#f59e0b', pulse: false },
  paid:       { label: 'Paid',          bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa', dot: '#3b82f6', pulse: true  },
  generating: { label: 'Generating',    bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.3)', text: '#c084fc', dot: '#a855f7', pulse: true  },
  completed:  { label: 'Completed',     bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.3)',  text: '#4ade80', dot: '#22c55e', pulse: false },
};

export default function MyAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all'|'submitted'|'completed'>('all');
  const [copied, setCopied] = useState<string|null>(null);

  useEffect(() => {
    fetchAssignments();
    const channel = supabase.channel('my-assignments')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'assignments' }, (payload) => {
        setAssignments(prev => prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAssignments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('assignments').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setAssignments(data);
    setLoading(false);
  };

  const filtered = assignments.filter(a => {
    if (filter === 'submitted') return ['pending','paid','generating'].includes(a.status);
    if (filter === 'completed') return a.status === 'completed';
    return true;
  });

  const completed = assignments.filter(a => a.status === 'completed').length;
  const pending = assignments.filter(a => ['pending','paid','generating'].includes(a.status)).length;

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const tab = (f: typeof filter) => ({
    background: filter === f ? 'rgba(34,197,94,0.12)' : 'transparent',
    border: `1px solid ${filter === f ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600 as const,
    color: filter === f ? '#4ade80' : 'rgba(255,255,255,0.4)', cursor: 'pointer' as const,
  });

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <style>{'.dp{animation:dp 1.5s ease-in-out infinite} .sp{animation:sp 1s linear infinite} @keyframes dp{0%,100%{opacity:1}50%{opacity:0.3}} @keyframes sp{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'}</style>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h2 style={{ fontSize:'20px', fontWeight:800, color:'#fff', marginBottom:'3px' }}>My Assignments</h2>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)' }}>{completed} completed · {pending} in progress</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          {(['all','submitted','completed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={tab(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
              {f==='submitted' && pending>0 && <span style={{ marginLeft:'5px', background:'rgba(234,179,8,0.2)', color:'#fbbf24', borderRadius:'100px', padding:'1px 6px', fontSize:'10px' }}>{pending}</span>}
              {f==='completed' && completed>0 && <span style={{ marginLeft:'5px', background:'rgba(34,197,94,0.2)', color:'#4ade80', borderRadius:'100px', padding:'1px 6px', fontSize:'10px' }}>{completed}</span>}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.3)', fontSize:'13px' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px', background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:'14px' }}>
          <div style={{ fontSize:'36px', marginBottom:'12px' }}>🦍</div>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px' }}>{filter==='all' ? 'No assignments yet' : 'No ' + filter + ' assignments'}</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {filtered.map(a => {
            const cfg = STATUS[a.status] || STATUS.pending;
            return (
              <div key={a.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'20px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px', marginBottom:'10px' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px', flexWrap:'wrap' }}>
                      <span style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'6px', padding:'2px 8px', fontSize:'10px', fontWeight:700, color:'#4ade80', textTransform:'uppercase' as const }}>{a.assignment_type}</span>
                      {a.course_name && <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{a.course_name}</span>}
                    </div>
                    <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', lineHeight:1.5 }}>{a.description || 'No description provided'}</p>
                  </div>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:cfg.bg, border:'1px solid ' + cfg.border, borderRadius:'100px', padding:'4px 12px', fontSize:'11px', fontWeight:700, color:cfg.text, whiteSpace:'nowrap' as const, flexShrink:0 }}>
                    <span className={cfg.pulse ? 'dp' : ''} style={{ width:'6px', height:'6px', borderRadius:'50%', background:cfg.dot, display:'inline-block' }}/>
                    {cfg.label}
                  </span>
                </div>
                <div style={{ display:'flex', gap:'16px', fontSize:'11px', color:'rgba(255,255,255,0.3)', marginBottom: a.delivery_url || a.status==='generating' ? '12px' : '0' }}>
                  <span>Submitted {new Date(a.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>
                  {a.due_date && <span>Due {a.due_date}</span>}
                  {a.payment_amount && <span style={{ color:'rgba(74,222,128,0.6)' }}>£{Number(a.payment_amount).toFixed(2)} paid</span>}
                </div>
                {a.delivery_url && (
                  <div style={{ background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'10px', padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span>Document ready</span>
                    </div>
                    <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
                      <a href={a.delivery_url} target="_blank" rel="noreferrer" style={{ background:'#22c55e', color:'#052e16', borderRadius:'8px', padding:'6px 14px', fontSize:'12px', fontWeight:800, textDecoration:'none' }}>Open</a>
                      <button onClick={() => copyLink(a.delivery_url!, a.id)} style={{ background:copied===a.id ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)', color:copied===a.id ? '#4ade80' : 'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'6px 12px', fontSize:'12px', cursor:'pointer' }}>
                        {copied===a.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
                {a.status==='generating' && (
                  <div style={{ background:'rgba(168,85,247,0.06)', border:'1px solid rgba(168,85,247,0.2)', borderRadius:'10px', padding:'10px 14px', fontSize:'11px', color:'#c084fc', display:'flex', alignItems:'center', gap:'8px' }}>
                    <span className="sp">⚡</span>
                    Claude is generating your document — check back in a minute
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
