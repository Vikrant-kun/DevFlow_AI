import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, Zap, Sparkles, Bell, Code, Database, Mail } from 'lucide-react';
import { cn } from '../lib/utils';

const iconMap = {
    'git-branch': GitBranch,
    'zap': Zap,
    'sparkles': Sparkles,
    'bell': Bell,
    'code': Code,
    'database': Database,
    'mail': Mail,
    'play': Zap,
    'trigger': GitBranch,
    'action': Zap,
    'ai': Sparkles,
    'notification': Bell,
};

const typeColors = {
    trigger: { strip: '#6EE7B7', text: '#6EE7B7', iconBg: 'rgba(110,231,183,0.12)', label: '#F1F5F9', shadow: '0 0 20px rgba(110,231,183,0.15)' },
    action: { strip: '#64748B', text: '#94A3B8', iconBg: 'rgba(148,163,184,0.10)', label: '#F1F5F9', shadow: '0 0 20px rgba(100,116,139,0.15)' },
    ai: { strip: '#A78BFA', text: '#A78BFA', iconBg: 'rgba(167,139,250,0.12)', label: '#F1F5F9', shadow: '0 0 20px rgba(167,139,250,0.20)' },
    notification: { strip: '#F59E0B', text: '#F59E0B', iconBg: 'rgba(245,158,11,0.12)', label: '#F1F5F9', shadow: '0 0 20px rgba(245,158,11,0.15)' },
};

const CustomNode = ({ data, selected }) => {
    const rawType = data?.type || 'action';
    const type = typeColors[rawType] ? rawType : 'action';
    const colors = typeColors[type];

    const label = data?.label || 'Step';
    const description = data?.description || '';
    const icon = data?.icon;

    const IconComponent = iconMap[icon] || iconMap[type] || Zap;

    return (
        <div
            className={cn(
                'relative w-[260px] bg-[#111] border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer',
                selected ? 'border-[#6EE7B7]/60' : 'border-[#222] hover:border-[#333]'
            )}
            style={{ boxShadow: selected ? colors.shadow : 'none' }}
        >
            {/* Colored left strip */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                style={{ background: colors.strip }} />

            <div className="pl-5 pr-4 py-3.5">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="mt-0.5 p-1.5 rounded-lg shrink-0"
                        style={{ background: colors.iconBg }}>
                        <IconComponent className="w-4 h-4" style={{ color: colors.text }} />
                    </div>

                    {/* Text */}
                    <div className="min-w-0">
                        <div className="font-mono text-sm font-semibold leading-snug truncate"
                            style={{ color: colors.label }}>
                            {label}
                        </div>
                        <div className="font-mono text-[9px] uppercase tracking-widest mt-0.5 mb-1.5"
                            style={{ color: colors.text }}>
                            {type}
                        </div>
                        <div className="font-mono text-[10px] leading-relaxed line-clamp-2"
                            style={{ color: '#64748B' }}>
                            {description}
                        </div>
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