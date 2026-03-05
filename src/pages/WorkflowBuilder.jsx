import { useState, useCallback, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, X, Plus, Terminal } from 'lucide-react';
import { Button } from '../components/ui/Button';
import CustomNode from '../components/CustomNode';
import TopBar from '../components/TopBar';

import { useLocation } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { templateNodesData } from '../lib/templateNodes';

const nodeTypes = { custom: CustomNode };

const initialNodes = [];
const initialEdges = [];

const WorkflowBuilder = () => {
    const [title, setTitle] = useState('Untitled Workflow');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('claude');
    const [isGenerating, setIsGenerating] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const { showToast } = useToast();
    const location = useLocation();

    const placeholders = [
        ">_ When a PR is merged to main, run tests and notify Slack...",
        ">_ Every night at 2am, sync staging with production...",
        ">_ When a Jira bug is filed, assign it and alert the team...",
        ">_ When a deploy fails, rollback and page on-call engineer..."
    ];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const templateSlug = params.get('template');

        if (templateSlug && templateNodesData[templateSlug]) {
            const tpl = templateNodesData[templateSlug];

            // Format title text from slug
            const titleText = templateSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            setTitle(titleText);

            // Stagger entrance animation
            setNodes([]);
            setEdges([]);

            tpl.nodes.forEach((node, idx) => {
                setTimeout(() => {
                    setNodes((nds) => [...nds, node]);
                    if (idx > 0 && tpl.edges[idx - 1]) {
                        setEdges((eds) => [...eds, { ...tpl.edges[idx - 1], animated: true, style: { stroke: '#444', strokeWidth: 2, strokeDasharray: '5,5' } }]);
                    }
                }, idx * 150);
            });
        }
    }, [location, setNodes, setEdges]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setPlaceholderIndex((current) => (current + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(intervalId);
    }, []);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#444', strokeWidth: 2, strokeDasharray: '5,5' } }, eds)), [setEdges]);

    const handleNodeClick = (_, node) => {
        setSelectedNode(node);
    };

    const handlePaneClick = () => {
        setSelectedNode(null);
    };

    const handleGenerate = async () => {
        try {
            console.log('API KEY:', import.meta.env.VITE_GEMINI_API_KEY)
            console.log('Prompt:', prompt)
            if (!prompt.trim()) return;

            if (model !== 'claude' && model !== 'gemini') {
                alert('Coming soon — only Gemini/Claude available in beta');
                return;
            }

            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                alert('Missing VITE_GEMINI_API_KEY in environment');
                return;
            }

            setIsGenerating(true);
            setSelectedNode(null);

            try {
                const systemPrompt = `You are a workflow automation expert for developer teams.
Convert the user's description into a structured pipeline.
Return ONLY valid JSON, no explanation, no markdown, no backticks:
{
  "nodes": [
    {
      "id": "1",
      "type": "trigger|action|ai|notification",
      "label": "Short Name",
      "description": "What this step does",
      "icon": "git-branch|zap|sparkles|bell|code|database|mail"
    }
  ],
  "edges": [{ "source": "1", "target": "2" }]
}
Rules: first node always trigger, max 8 nodes, labels 2-4 words, descriptions one sentence.`;

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: systemPrompt + '\n\n' + prompt }] }],
                            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }

                const data = await response.json();
                const responseText = data.candidates[0].content.parts[0].text;
                const parsedData = JSON.parse(responseText);

                const newNodesData = parsedData.nodes;
                const newEdgesData = parsedData.edges;

                if (!newNodesData) throw new Error("Invalid format received");

                // Clear existing
                setNodes([]);
                setEdges([]);

                // Layout nodes horizontally
                const spacedNodes = newNodesData.map((node, i) => ({
                    id: node.id,
                    type: 'custom',
                    position: { x: 100 + (i * 350), y: 250 }, // 350px gap
                    data: node,
                }));

                // Format edges
                const formattedEdges = (newEdgesData || []).map((edge, i) => ({
                    id: `e${edge.source}-${edge.target}`,
                    source: edge.source,
                    target: edge.target,
                    animated: true,
                    style: { stroke: '#444', strokeWidth: 2, strokeDasharray: '5,5' }
                }));

                // Stagger entrance animation by pushing to state sequentially
                spacedNodes.forEach((node, idx) => {
                    setTimeout(() => {
                        setNodes((nds) => [...nds, node]);
                        // Add connecting edge when the node appears (if it's not the first node)
                        if (idx > 0 && formattedEdges[idx - 1]) {
                            setEdges((eds) => [...eds, formattedEdges[idx - 1]]);
                        }
                    }, idx * 150); // 150ms delay per node requested
                });

                setTimeout(() => {
                    alert('Pipeline generated — ' + spacedNodes.length + ' steps');
                    setIsGenerating(false);
                    setPrompt('');
                }, spacedNodes.length * 150 + 100);

            } catch (error) {
                console.error(error);
                alert("Generation failed — please try again");
                setIsGenerating(false);
            }
        } catch (err) {
            console.error(err);
            alert("Crash in handleGenerate: " + err.message);
        }
    };

    return (
        <div className="h-screen flex flex-col w-full">
            <TopBar title={
                <div
                    className="flex items-center cursor-pointer group"
                    onClick={() => setIsEditingTitle(true)}
                >
                    {isEditingTitle ? (
                        <input
                            autoFocus
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => setIsEditingTitle(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                            className="bg-transparent font-mono text-lg font-bold text-text-primary outline-none border-b border-primary"
                        />
                    ) : (
                        <h1 className="font-mono text-lg font-bold text-text-primary group-hover:text-primary transition-colors">{title}</h1>
                    )}
                </div>
            }>
                <Button variant="ghost" className="gap-2 mr-2">
                    Save Draft
                </Button>
                <Button variant="primary" className="gap-2 shadow-glow-primary">
                    <Play className="w-4 h-4 fill-primary" /> Run Pipeline
                </Button>
            </TopBar>

            <div className="flex-1 relative flex overflow-hidden">
                {/* Canvas Area */}
                <div className="flex-1 h-full relative" style={{ width: selectedNode ? '80%' : '100%', transition: 'width 0.3s ease' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={handleNodeClick}
                        onPaneClick={handlePaneClick}
                        nodeTypes={nodeTypes}
                        proOptions={{ hideAttribution: true }}
                        fitView
                        className="bg-[#080808]"
                        minZoom={0.2}
                    >
                        <Background color="#222" gap={20} size={2} />
                        <Controls className="fill-white text-black" />

                        {nodes.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                                <div className="font-mono text-xl text-[#1A1A1A] max-w-lg text-center leading-relaxed font-bold tracking-tight">
                                    {`>_`} describe your workflow below to get started
                                </div>
                            </div>
                        )}

                        <div className="absolute top-4 right-4 z-10 flex gap-4 font-mono text-[10px] uppercase tracking-widest bg-[#111] border border-[#1A1A1A] p-2 opacity-50 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7]"></span><span className="text-[#6EE7B7]">trigger</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#64748B]"></span><span className="text-[#64748B]">action</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]"></span><span className="text-[#A78BFA]">ai</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span><span className="text-[#F59E0B]">notification</span></div>
                        </div>
                    </ReactFlow>

                    {/* AI Input Bar */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-10">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`bg-[#111111] border border-[#222] shadow-2xl p-1.5 flex items-center gap-2 backdrop-blur-md rounded-none ${isGenerating ? 'animate-pulse' : ''}`}
                        >
                            <input
                                type="text"
                                placeholder={placeholders[placeholderIndex]}
                                className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-text-primary placeholder:text-text-secondary py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={isGenerating}
                            />
                            <div className="h-6 w-px bg-[#222]"></div>
                            <select
                                className="bg-transparent border-none outline-none font-mono text-xs text-[#64748B] py-3 px-2 appearance-none cursor-pointer hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                disabled={isGenerating}
                            >
                                <option value="claude">Claude 3.5</option>
                                <option value="gpt4">GPT-4o</option>
                                <option value="gemini">Gemini 1.5</option>
                                <option value="grok">Grok 2</option>
                            </select>
                            <Button
                                className="gap-2 h-10 px-5 bg-[#6EE7B7] hover:bg-[#34D399] text-[#080808] border-none rounded-none font-mono text-xs shadow-none disabled:opacity-80 disabled:cursor-wait"
                                disabled={!prompt.trim() || isGenerating}
                                onClick={handleGenerate}
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-[#080808] border-t-transparent rounded-full animate-spin"></div>
                                        Building...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Generate
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </div>
                </div>

                {/* Right Panel */}
                <AnimatePresence>
                    {selectedNode && (
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-[280px] md:w-[320px] bg-[#111111] border-l border-[#222222] h-full shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20 absolute right-0 flex flex-col"
                        >
                            <div className="h-16 border-b border-[#222222] flex items-center justify-between px-6 shrink-0">
                                <h3 className="font-mono text-sm font-semibold text-[#6EE7B7] lowercase tracking-wider">node_config</h3>
                                <button onClick={() => setSelectedNode(null)} className="text-[#64748B] hover:text-[#F1F5F9] transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto space-y-6 hidden-scrollbar">
                                <div>
                                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Node Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#0D0D0D] border border-[#222222] rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors"
                                        defaultValue={selectedNode.data.label}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Description</label>
                                    <textarea
                                        className="w-full bg-[#0D0D0D] border border-[#222222] rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors min-h-[80px] resize-none"
                                        defaultValue={selectedNode.data.description}
                                    />
                                </div>

                                <div className="pt-4 border-t border-[#222222]">
                                    <label className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3 block">Step Settings</label>
                                    <div className="bg-[#0A0A0A] border border-[#1A1A1A] border-dashed rounded-none p-6 text-center text-xs font-mono text-[#64748B] flex flex-col items-center gap-3">
                                        <Terminal className="w-5 h-5 text-[#333]" />
                                        <span>&gt;_ click any node to configure</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-[#222222] shrink-0">
                                <button className="w-full text-xs font-mono font-bold text-[#F87171] bg-[#111] hover:bg-[#F87171]/10 border border-[#F87171] px-6 py-2.5 transition-colors rounded-none whitespace-nowrap">
                                    delete_step
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WorkflowBuilder;
