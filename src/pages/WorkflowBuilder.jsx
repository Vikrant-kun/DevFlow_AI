import { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlow, Background, Panel, useReactFlow, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, X, Save, BookOpen, Check, ChevronsUpDown, ArrowUp, Lightbulb, Plus, Minus, Maximize, Lock, Unlock, Terminal } from 'lucide-react';
import CustomNode from '../components/CustomNode';
import TopBar from '../components/TopBar';
import { useLocation } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { templateNodesData } from '../lib/templateNodes';

const nodeTypes = { custom: CustomNode };

const RECIPES = [
    { title: 'PR Changelog', desc: 'When a PR is merged to main, generate a changelog using AI and post it to Slack.', tag: 'GitHub + AI + Slack' },
    { title: 'Vercel Log Analysis', desc: 'If a Vercel deploy fails, analyze logs with AI and email the fix to the team.', tag: 'Vercel + AI + Email' },
    { title: 'Secret Scanner', desc: 'Scan new commits for leaked secrets; if found, notify #security and lock the branch.', tag: 'GitHub + Security' },
    { title: 'Stale Issue Labeler', desc: "Find GitHub issues with no activity for 14 days and label them as 'stale' automatically.", tag: 'GitHub + Automation' },
];

const SUGGESTIONS = [
    { label: 'Automate PRs', prompt: 'When a PR is merged to main, run tests and notify the team on Slack.' },
    { label: 'Rollback deploys', prompt: 'When a deployment fails, auto-rollback and alert the on-call engineer.' },
    { label: 'Assign issues', prompt: 'When a new GitHub issue is created, auto-assign it and send an email.' },
    { label: 'Daily backups', prompt: 'Every night at 2am, backup the database and upload it to S3.' },
];

const AGENTS = [
    { id: 'groq', name: 'Groq', desc: 'Llama 3.3 70B', icon: '⚡️' },
    { id: 'claude', name: 'Claude', desc: 'Sonnet 3.5', icon: '🧠' },
    { id: 'gemini', name: 'Gemini', desc: 'Gemini 2.0 Pro', icon: '✨' },
    { id: 'gpt4', name: 'GPT-4o', desc: 'OpenAI', icon: '🤖' }
];

// ── CUSTOM CANVAS CONTROLS ───────────────────────────────────────────────────

const CustomCanvasControls = ({ isLocked, setIsLocked }) => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    return (
        <Panel position="bottom-left" className="hidden md:flex flex-col bg-[#111] border border-[#222] rounded-xl shadow-xl overflow-hidden mb-[100px] ml-4">
            <button onClick={() => zoomIn({ duration: 300 })} className="p-2 border-b border-[#222] text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] transition-colors" title="Zoom In">
                <Plus className="w-4 h-4" />
            </button>
            <button onClick={() => zoomOut({ duration: 300 })} className="p-2 border-b border-[#222] text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] transition-colors" title="Zoom Out">
                <Minus className="w-4 h-4" />
            </button>
            <button onClick={() => fitView({ duration: 800, padding: 0.3 })} className="p-2 border-b border-[#222] text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] transition-colors" title="Fit View (Fullscreen)">
                <Maximize className="w-4 h-4" />
            </button>
            <button onClick={() => setIsLocked(!isLocked)} className="p-2 text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] transition-colors" title={isLocked ? "Unlock Canvas" : "Lock Canvas"}>
                {isLocked ? <Lock className="w-4 h-4 text-[#F87171]" /> : <Unlock className="w-4 h-4" />}
            </button>
        </Panel>
    );
};

// ── ISOLATED COMPONENTS ──────────────────────────────────────────────────────

const AgentSelector = ({ value, onChange, disabled }) => {
    const [open, setOpen] = useState(false);
    const selected = AGENTS.find(a => a.id === value) || AGENTS[0];
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative shrink-0" ref={ref}>
            <button
                type="button" disabled={disabled} onClick={() => setOpen(!open)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#222] bg-[#0D0D0D] transition-all hover:bg-[#1A1A1A] disabled:opacity-50"
            >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111] border border-[#222] text-[10px] shrink-0 text-[#F1F5F9]">
                    {selected.icon}
                </div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
                        className="absolute bottom-[calc(100%+8px)] left-0 w-[180px] bg-[#0D0D0D] border border-[#222] rounded-xl shadow-2xl overflow-hidden z-[100]">
                        <div className="p-1">
                            {AGENTS.map(agent => (
                                <button key={agent.id} onClick={() => { onChange(agent.id); setOpen(false); }}
                                    className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-[#1A1A1A] transition-colors text-left group">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#111] border border-[#222] text-xs">{agent.icon}</div>
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs text-[#F1F5F9] group-hover:text-[#6EE7B7] transition-colors">{agent.name}</span>
                                            <span className="font-mono text-[9px] text-[#64748B]">{agent.desc}</span>
                                        </div>
                                    </div>
                                    {value === agent.id && <Check className="w-4 h-4 text-[#6EE7B7]" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const UnifiedPromptBox = ({ prompt, setPrompt, model, setModel, isGenerating, handleGenerate, onToggleRecipes, isRecipeOpen, onToggleSuggestions, isSuggestionsOpen, hasStarted }) => {
    const textareaRef = useRef(null);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const placeholders = [
        "When a PR is merged, run tests and notify Slack...",
        "Every night at 2am, sync staging with production...",
        "When a deploy fails, rollback and page on-call..."
    ];

    useEffect(() => {
        const id = setInterval(() => setPlaceholderIndex(p => (p + 1) % placeholders.length), 3000);
        return () => clearInterval(id);
    }, []);

    const resizeTextarea = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    };

    const activePlaceholder = hasStarted ? "Describe your workflow..." : `>_ ${placeholders[placeholderIndex]}`;

    return (
        <div className="w-full max-w-2xl mx-auto rounded-[24px] border border-[#333] bg-[#111]/95 backdrop-blur-xl p-2 shadow-[0_8px_40px_rgba(0,0,0,0.8)] transition-all duration-300 flex flex-col pointer-events-auto">
            <textarea
                ref={textareaRef}
                placeholder={activePlaceholder}
                className="w-full resize-none bg-transparent px-3 pt-2 pb-3 text-sm md:text-base text-[#F1F5F9] placeholder:text-[#555] focus:outline-none disabled:opacity-50 font-mono scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent leading-normal"
                style={{ minHeight: '48px', overflowY: 'auto' }}
                rows={1}
                value={prompt}
                onChange={e => { setPrompt(e.target.value); resizeTextarea(); }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                disabled={isGenerating}
            />

            <div className="flex items-center justify-between px-1 pt-1.5 border-t border-[#222]/80 mt-1 shrink-0">
                <div className="flex items-center gap-2">
                    <AgentSelector value={model} onChange={setModel} disabled={isGenerating} />

                    <button
                        onClick={onToggleRecipes}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${isRecipeOpen ? 'bg-[#6EE7B7]/10 border-[#6EE7B7]/30 text-[#6EE7B7]' : 'border-transparent bg-[#0D0D0D] border-[#222] text-[#64748B] hover:bg-[#1A1A1A] hover:text-[#F1F5F9]'}`}
                    >
                        <BookOpen className="h-3.5 w-3.5" />
                    </button>

                    <button
                        onClick={onToggleSuggestions}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${isSuggestionsOpen ? 'bg-[#6EE7B7]/10 border-[#6EE7B7]/30 text-[#6EE7B7]' : 'border-transparent bg-[#0D0D0D] border-[#222] text-[#64748B] hover:bg-[#1A1A1A] hover:text-[#F1F5F9]'}`}
                    >
                        <Lightbulb className="h-3.5 w-3.5" />
                    </button>
                </div>

                <button
                    disabled={!prompt.trim() || isGenerating}
                    onClick={handleGenerate}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6EE7B7] text-[#080808] transition-all hover:bg-[#34D399] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                    {isGenerating ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#080808]/40 border-t-[#080808]" />
                    ) : (
                        <ArrowUp className="h-4 w-4" />
                    )}
                </button>
            </div>
        </div>
    );
};

// ── MAIN APP ─────────────────────────────────────────────────────────────────

const WorkflowBuilder = () => {
    const [title, setTitle] = useState('Untitled Workflow');
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('groq');
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isRecipeOpen, setIsRecipeOpen] = useState(false);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null); // Node Edit State Restored
    const [currentWorkflowId, setCurrentWorkflowId] = useState(null);
    const [isCanvasLocked, setIsCanvasLocked] = useState(false);

    const { showToast } = useToast();
    const location = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const templateSlug = params.get('template');
        if (templateSlug && templateNodesData[templateSlug]) {
            const tpl = templateNodesData[templateSlug];
            setTitle(templateSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
            setNodes([]); setEdges([]);
            setHasStarted(true);
            tpl.nodes.forEach((node, idx) => {
                setTimeout(() => {
                    setNodes(nds => [...nds, node]);
                    if (idx > 0 && tpl.edges[idx - 1])
                        setEdges(eds => [...eds, { ...tpl.edges[idx - 1], animated: true, style: { stroke: '#333', strokeWidth: 2, strokeDasharray: '6,6' } }]);
                }, idx * 150);
            });
        }
    }, [location, setNodes, setEdges]);

    const onConnect = useCallback((params) =>
        setEdges(eds => addEdge({ ...params, animated: true, style: { stroke: '#333', strokeWidth: 2, strokeDasharray: '6,6' } }, eds)), [setEdges]);

    const handleNodeClick = (_, node) => setSelectedNode(node);
    const handlePaneClick = () => setSelectedNode(null);

    const handleSaveDraft = async () => {
        if (!user) { showToast('Log in to save.', 'error'); return; }
        try {
            let data, error;
            if (currentWorkflowId) {
                ({ data, error } = await supabase.from('workflows').update({ name: title, nodes, edges, updated_at: new Date().toISOString() }).eq('id', currentWorkflowId).select().single());
            } else {
                ({ data, error } = await supabase.from('workflows').insert({ user_id: user.id, name: title, nodes, edges, status: 'draft' }).select().single());
            }
            if (error) throw error;
            setCurrentWorkflowId(data.id);
            showToast('Workflow saved', 'success');
        } catch (err) {
            showToast('Failed to save', 'error');
        }
    };

    const handleRunPipeline = async () => {
        if (!user) { showToast('Log in to run.', 'error'); return; }
        if (!currentWorkflowId) await handleSaveDraft();
        try {
            const { error } = await supabase.from('workflow_runs').insert({
                user_id: user.id, workflow_id: currentWorkflowId,
                workflow_name: title, status: 'success',
                started_at: new Date().toISOString(), duration: '1m 24s', triggered_by: 'manual'
            });
            if (error) throw error;
            showToast('Pipeline executed successfully', 'success');
        } catch (err) {
            showToast('Failed to run pipeline', 'error');
        }
    };

    const handleGenerate = async () => {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;
        if (!prompt.trim()) return;
        setHasStarted(true);
        setIsGenerating(true);
        setIsRecipeOpen(false);
        setIsSuggestionsOpen(false);
        setSelectedNode(null);
        try {
            const systemPrompt = `You are a workflow expert. Return ONLY JSON: {"nodes":[{"id":"1","type":"custom","data":{"label":"Step","description":"info","icon":"zap"}}],"edges":[{"source":"1","target":"2"}]}`;
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }] })
            });
            const data = await res.json();
            const raw = data.choices[0].message.content.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(raw);

            setNodes([]); setEdges([]);
            const isMobile = window.innerWidth < 768;

            // Perfect Spacing for both views to show dashed lines
            const horizontalSpacing = isMobile ? 280 : 380;

            const spacedNodes = parsed.nodes.map((n, i) => ({
                id: n.id, type: 'custom',
                position: { x: 50 + i * horizontalSpacing, y: 150 },
                data: n.data || n,
            }));
            const formattedEdges = (parsed.edges || []).map(e => ({
                id: `e${e.source}-${e.target}`, source: e.source, target: e.target,
                animated: true, style: { stroke: '#333', strokeWidth: 2, strokeDasharray: '6,6' }
            }));

            spacedNodes.forEach((node, idx) => {
                setTimeout(() => {
                    setNodes(nds => [...nds, node]);
                    if (idx > 0 && formattedEdges[idx - 1]) setEdges(eds => [...eds, formattedEdges[idx - 1]]);
                }, idx * 150);
            });
            setIsGenerating(false);
            setPrompt('');
        } catch (err) {
            setIsGenerating(false);
            showToast('Generation failed', 'error');
        }
    };

    return (
        <div className="h-[100dvh] flex flex-col w-full overflow-hidden bg-[#080808]">
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @media (max-width: 767px) {
                    .react-flow__controls { display: none !important; }
                }
            `}</style>

            <TopBar title={title}>
                <div className="flex items-center gap-2">
                    <button onClick={handleSaveDraft} className="flex items-center gap-1.5 font-mono text-[10px] md:text-xs text-[#64748B] hover:text-[#F1F5F9] border border-[#222] px-2.5 md:px-3 py-1.5 transition-colors rounded-xl bg-[#111]">
                        <Save className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Save</span>
                    </button>
                    <button onClick={handleRunPipeline} className="flex items-center gap-1.5 font-mono text-[10px] md:text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] px-3.5 md:px-4 py-1.5 transition-colors rounded-xl">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span className="hidden sm:inline">Run</span>
                    </button>
                </div>
            </TopBar>

            <div className="flex-1 flex overflow-hidden relative">

                {/* ── LEFT: RECIPE DRAWER ─────────────────────────────────── */}
                <AnimatePresence>
                    {isRecipeOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="md:hidden fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
                                onClick={() => setIsRecipeOpen(false)}
                            />
                            <motion.div
                                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                                className="absolute left-0 top-0 bottom-0 w-[280px] md:w-[320px] bg-[#0D0D0D] border-r border-[#222] z-[101] overflow-hidden shadow-2xl flex flex-col"
                            >
                                <div className="h-14 flex items-center justify-between px-5 border-b border-[#222] shrink-0">
                                    <span className="font-mono text-xs text-[#6EE7B7] uppercase font-bold tracking-widest">Recipe_Library</span>
                                    <button onClick={() => setIsRecipeOpen(false)} className="text-[#64748B] hover:text-[#F1F5F9]"><X className="w-5 h-5" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#333]">
                                    {RECIPES.map(r => (
                                        <button key={r.title} onClick={() => { setPrompt(r.desc); setIsRecipeOpen(false); }}
                                            className="w-full text-left bg-[#111] border border-[#1A1A1A] hover:border-[#6EE7B7]/40 rounded-xl p-4 transition-all group shadow-md">
                                            <div className="font-mono text-xs text-[#F1F5F9] group-hover:text-[#6EE7B7] mb-1 font-bold">{r.title}</div>
                                            <div className="font-mono text-[10px] text-[#64748B] leading-relaxed mb-2">{r.desc}</div>
                                            <span className="font-mono text-[9px] text-[#64748B] bg-[#0D0D0D] border border-[#222] px-2 py-0.5 rounded-full">{r.tag}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* ── RIGHT: SUGGESTIONS DRAWER ───────────────────────────── */}
                <AnimatePresence>
                    {isSuggestionsOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="md:hidden fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
                                onClick={() => setIsSuggestionsOpen(false)}
                            />
                            <motion.div
                                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                                className="absolute right-0 top-0 bottom-0 w-[280px] md:w-[320px] bg-[#0D0D0D] border-l border-[#222] z-[101] overflow-hidden shadow-2xl flex flex-col"
                            >
                                <div className="h-14 flex items-center justify-between px-5 border-b border-[#222] shrink-0">
                                    <span className="font-mono text-xs text-[#6EE7B7] uppercase font-bold tracking-widest">Suggestions</span>
                                    <button onClick={() => setIsSuggestionsOpen(false)} className="text-[#64748B] hover:text-[#F1F5F9]"><X className="w-5 h-5" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#333]">
                                    {SUGGESTIONS.map(s => (
                                        <button key={s.label} onClick={() => { setPrompt(s.prompt); setIsSuggestionsOpen(false); }}
                                            className="w-full text-left bg-[#111] border border-[#1A1A1A] hover:border-[#6EE7B7]/40 rounded-xl p-4 transition-all group shadow-md">
                                            <div className="font-mono text-xs text-[#F1F5F9] group-hover:text-[#6EE7B7] mb-1 font-bold">{s.label}</div>
                                            <div className="font-mono text-[10px] text-[#64748B] leading-relaxed">{s.prompt}</div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* ── RIGHT: NODE EDIT PANEL (RESTORED) ────────────────────── */}
                <AnimatePresence>
                    {selectedNode && (
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 bottom-0 w-[280px] md:w-[320px] bg-[#0D0D0D] border-l border-[#222] z-20 flex flex-col shadow-2xl"
                        >
                            <div className="h-14 border-b border-[#222] flex items-center justify-between px-5 shrink-0">
                                <h3 className="font-mono text-xs font-semibold text-[#6EE7B7] uppercase tracking-widest">node_config</h3>
                                <button onClick={() => setSelectedNode(null)} className="text-[#64748B] hover:text-[#F1F5F9] transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-5 flex-1 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-[#333]">
                                <div>
                                    <label className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider mb-2 block">Node Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-2.5 text-sm font-mono text-[#F1F5F9] outline-none focus:border-[#6EE7B7] transition-colors"
                                        defaultValue={selectedNode.data.label}
                                    />
                                </div>
                                <div>
                                    <label className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider mb-2 block">Description</label>
                                    <textarea
                                        className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-2.5 text-sm font-mono text-[#F1F5F9] outline-none focus:border-[#6EE7B7] transition-colors min-h-[80px] resize-none"
                                        defaultValue={selectedNode.data.description}
                                    />
                                </div>
                                <div className="pt-4 border-t border-[#222]">
                                    <label className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider mb-3 block">Step Settings</label>
                                    <div className="bg-[#111] border border-[#222] border-dashed rounded-xl p-6 text-center text-xs font-mono text-[#64748B] flex flex-col items-center gap-3">
                                        <Terminal className="w-5 h-5 text-[#444]" />
                                        <span>&gt;_ click any node to configure</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-[#222] shrink-0 bg-[#080808]">
                                <button className="w-full font-mono text-xs font-bold text-[#F87171] bg-[#F87171]/10 hover:bg-[#F87171]/20 border border-[#F87171]/50 py-2.5 transition-colors rounded-xl lowercase">
                                    delete_step
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── CANVAS ───────────────────────────────────────────── */}
                <div className="flex-1 relative overflow-hidden" style={{ width: selectedNode ? 'calc(100% - 320px)' : '100%', transition: 'width 0.3s ease' }}>
                    <ReactFlow
                        nodes={nodes} edges={edges}
                        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={handleNodeClick}
                        onPaneClick={handlePaneClick}
                        nodeTypes={nodeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.3, minZoom: 0.4, maxZoom: 1.2 }}
                        defaultEdgeOptions={{ animated: true, style: { stroke: '#333', strokeWidth: 2, strokeDasharray: '6,6' } }}
                        className="bg-[#080808] w-full h-full"

                        nodesDraggable={!isCanvasLocked}
                        nodesConnectable={!isCanvasLocked}
                        elementsSelectable={!isCanvasLocked}
                        panOnDrag={!isCanvasLocked}
                        zoomOnScroll={!isCanvasLocked}
                        zoomOnPinch={!isCanvasLocked}
                    >
                        <Background color="#1A1A1A" gap={25} size={1} />

                        <CustomCanvasControls isLocked={isCanvasLocked} setIsLocked={setIsCanvasLocked} />

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none px-6">
                            <span className="font-mono font-extrabold uppercase text-center leading-none tracking-tighter text-[#111] opacity-50" style={{ fontSize: 'clamp(32px, 10vw, 120px)' }}>
                                describe your<br />workflow below
                            </span>
                        </div>
                    </ReactFlow>
                </div>
            </div>

            {/* ── DYNAMIC PROMPT BAR ─────────────────────────────────────── */}
            <div
                className={`fixed left-0 right-0 z-[50] px-4 md:px-8 flex justify-center pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${hasStarted
                    ? 'bottom-6 md:bottom-10 pb-[env(safe-area-inset-bottom,0px)]'
                    : 'top-1/2 -translate-y-1/2'
                    }`}
            >
                <div className="w-full max-w-2xl pointer-events-auto">
                    {/* ── FLOATING SUGGESTIONS (Disappears when started) ── */}
                    <AnimatePresence>
                        {!hasStarted && (
                            <motion.div
                                initial={{ opacity: 1 }} exit={{ opacity: 0, y: 10 }}
                                className="w-full flex flex-wrap justify-center gap-2 mb-3 px-2"
                            >
                                {SUGGESTIONS.map(s => (
                                    <button key={s.label} onClick={() => setPrompt(s.prompt)}
                                        className="bg-[#111]/80 backdrop-blur-md hover:bg-[#1A1A1A] border border-[#222] text-[#64748B] hover:text-[#F1F5F9] font-mono text-[10px] md:text-[11px] px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all shadow-lg">
                                        {s.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <UnifiedPromptBox
                        prompt={prompt} setPrompt={setPrompt}
                        model={model} setModel={setModel}
                        isGenerating={isGenerating} handleGenerate={handleGenerate}
                        onToggleRecipes={() => setIsRecipeOpen(!isRecipeOpen)}
                        isRecipeOpen={isRecipeOpen}
                        onToggleSuggestions={() => setIsSuggestionsOpen(!isSuggestionsOpen)}
                        isSuggestionsOpen={isSuggestionsOpen}
                        hasStarted={hasStarted}
                    />
                </div>
            </div>

        </div>
    );
};

export default WorkflowBuilder;