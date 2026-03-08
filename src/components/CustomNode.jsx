import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, Zap, Sparkles, Bell, Code, Database, Mail } from 'lucide-react';
import { cn } from '../lib/utils';

const iconMap = {
    'git-branch': GitBranch, 'zap': Zap, 'sparkles': Sparkles, 'bell': Bell,
    'code': Code, 'database': Database, 'mail': Mail, 'play': Zap,
    'trigger': GitBranch, 'action': Zap, 'ai': Sparkles, 'notification': Bell,
};

const typeColors = {
    trigger: { strip: '#6EE7B7', text: '#6EE7B7', iconBg: 'rgba(110,231,183,0.12)', label: '#F1F5F9', shadow: '0 0 20px rgba(110,231,183,0.15)' },
    action: { strip: '#64748B', text: '#94A3B8', iconBg: 'rgba(148,163,184,0.10)', label: '#F1F5F9', shadow: '0 0 20px rgba(100,116,139,0.15)' },
    ai: { strip: '#A78BFA', text: '#A78BFA', iconBg: 'rgba(167,139,250,0.12)', label: '#F1F5F9', shadow: '0 0 20px rgba(167,139,250,0.20)' },
    notification: { strip: '#F59E0B', text: '#F59E0B', iconBg: 'rgba(245,158,11,0.12)', label: '#F1F5F9', shadow: '0 0 20px rgba(245,158,11,0.15)' },
};

const statusColors = {
    running: { border: '#F59E0B', glow: '0 0 20px rgba(245,158,11,0.4)', dot: '#F59E0B', pulse: true },
    success: { border: '#6EE7B7', glow: '0 0 20px rgba(110,231,183,0.4)', dot: '#6EE7B7', pulse: false },
    failed: { border: '#F87171', glow: '0 0 20px rgba(248,113,113,0.4)', dot: '#F87171', pulse: false },
};

const CustomNode = ({ data, selected }) => {
    const rawType = data?.type || 'action';
    const type = typeColors[rawType] ? rawType : 'action';
    const colors = typeColors[type];
    const status = data?.status;
    const sc = statusColors[status];

    const label = data?.label || 'Step';
    const description = data?.description || '';
    const icon = data?.icon;
    const IconComponent = iconMap[icon] || iconMap[type] || Zap;

    return (
        <div
            className={cn(
                'relative w-[260px] bg-[#111] border rounded-xl overflow-visible transition-all duration-300 cursor-pointer',
                status ? '' : selected ? 'border-[#6EE7B7]/60' : 'border-[#222] hover:border-[#333]'
            )}
            style={{
                borderColor: sc ? sc.border : undefined,
                boxShadow: sc ? sc.glow : selected ? colors.shadow : 'none',
            }}
        >
            {/* Status dot — top right */}
            {sc && (
                <div className="absolute -top-1.5 -right-1.5 z-10">
                    <div className="w-3 h-3 rounded-full" style={{ background: sc.dot }}>
                        {sc.pulse && (
                            <div className="absolute inset-0 rounded-full animate-ping"
                                style={{ background: sc.dot, opacity: 0.6 }} />
                        )}
                    </div>
                </div>
            )}

            {/* Running shimmer overlay */}
            {status === 'running' && (
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.08), transparent)',
                            animation: 'shimmer 1.5s infinite'
                        }} />
                </div>
            )}

            {/* Colored left strip */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl transition-all duration-300"
                style={{ background: sc ? sc.border : colors.strip }} />

            <div className="pl-5 pr-4 py-3.5">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg shrink-0 transition-all duration-300"
                        style={{ background: sc ? `${sc.dot}20` : colors.iconBg }}>
                        <IconComponent className="w-4 h-4 transition-all duration-300"
                            style={{ color: sc ? sc.dot : colors.text }} />
                    </div>
                    <div className="min-w-0">
                        <div className="font-mono text-sm font-semibold leading-snug truncate"
                            style={{ color: colors.label }}>{label}</div>
                        <div className="font-mono text-[9px] uppercase tracking-widest mt-0.5 mb-1.5 flex items-center gap-1.5"
                            style={{ color: sc ? sc.dot : colors.text }}>
                            {status || type}
                            {status === 'running' && (
                                <span className="flex gap-0.5">
                                    {[0, 1, 2].map(i => (
                                        <span key={i} className="w-1 h-1 rounded-full bg-current animate-bounce"
                                            style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </span>
                            )}
                        </div>
                        <div className="font-mono text-[10px] leading-relaxed line-clamp-2"
                            style={{ color: '#64748B' }}>{description}</div>
                    </div>
                </div>
            </div>

            {type !== 'trigger' && (
                <Handle type="target" position={Position.Left}
                    className="!w-3 !h-3 !bg-[#1A1A1A] !border-2 !border-[#333]" />
            )}
            <Handle type="source" position={Position.Right}
                className="!w-3 !h-3 !bg-[#1A1A1A] !border-2 !border-[#333]" />
        </div>
    );
};

export default memo(CustomNode);