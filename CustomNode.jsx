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
    'trigger': GitBranch,
    'action': Zap,
    'ai': Sparkles,
    'notification': Bell
};

const typeColors = {
    trigger: {
        border: 'bg-[#6EE7B7]',
        text: 'text-[#6EE7B7]',
        shadow: 'hover:shadow-glow-primary'
    },
    action: {
        border: 'bg-[#64748B]',
        text: 'text-[#64748B]',
        shadow: 'hover:shadow-[0_0_20px_rgba(100,116,139,0.3)]'
    },
    ai: {
        border: 'bg-[#F1F5F9]',
        text: 'text-[#F1F5F9]',
        shadow: 'hover:shadow-[0_0_20px_rgba(241,245,249,0.4)]'
    },
    notification: {
        border: 'bg-[#F59E0B]',
        text: 'text-[#F59E0B]',
        shadow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]'
    }
};

const CustomNode = ({ data, selected }) => {
    const { type = 'action', label, description, icon } = data || {};
    const colors = typeColors[type] || typeColors.action;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;




    // choose icon
    const IconComponent = iconMap[icon] || iconMap[type] || Zap;

    return (
        <div
            className={cn(
                "relative w-[280px] bg-[#111111] border rounded-xl overflow-hidden transition-all duration-300",
                selected ? "border-[#6EE7B7]" : "border-[#222222]",
                colors.shadow
            )}
        >
            {/* left color strip */}
            <div
                className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    colors.border
                )}
            />

            <div className="pl-4 pr-3 py-3">
                <div className="flex items-start gap-3">
                    <div
                        className={cn(
                            "mt-0.5 p-1.5 rounded-xl bg-[#222222]",
                            colors.text
                        )}
                    >
                        <IconComponent className="w-4 h-4" />
                    </div>

                    <div>
                        <div className="font-semibold text-text-primary text-sm tracking-tight">
                            {label}
                        </div>

                        <div className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mt-0.5 mb-1">
                            {type}
                        </div>

                        <div className="text-xs text-[#888888] leading-tight line-clamp-2">
                            {description}
                        </div>
                    </div>
                </div>
            </div>

            {/* Target Handle (Input) */}
            {type !== 'trigger' && (
                <Handle
                    type="target"
                    position={isMobile ? Position.Top : Position.Left}
                    // ID must match the AI generation logic below
                    id={isMobile ? "top" : "left"}
                    className="!w-2 !h-2 !bg-[#222] !border-2 !border-[#444]"
                />
            )}

            {/* Source Handle (Output) */}
            <Handle
                type="source"
                position={isMobile ? Position.Bottom : Position.Right}
                // ID must match the AI generation logic below
                id={isMobile ? "bottom" : "right"}
                className="!w-2 !h-2 !bg-[#222] !border-2 !border-[#444]"
            />







        </div>
    );
};

export default memo(CustomNode);