import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Play, Save, Settings2, Github, Terminal, Zap, Bell, CheckCircle2 } from 'lucide-react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Handle,
    Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Node Components
const TriggerNode = ({ data, selected }) => (
    <div className={`px-4 py-3 shadow-glow-primary rounded-xl bg-surface-2 border-2 ${selected ? 'border-primary' : 'border-primary/50'} text-text-primary min-w-[150px]`}>
        <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary/20 rounded-md text-primary"><Github className="w-4 h-4" /></div>
            <div className="font-semibold text-sm">{data.label}</div>
        </div>
        <div className="text-xs text-text-secondary">When PR is merged</div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-primary border-2 border-surface-2" />
    </div>
);

const ActionNode = ({ data, selected }) => (
    <div className={`px-4 py-3 rounded-xl bg-surface-2 border-2 ${selected ? 'border-text-primary' : 'border-border'} text-text-primary min-w-[150px]`}>
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-text-secondary border-2 border-surface-2" />
        <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-surface-1 rounded-md text-text-primary"><Terminal className="w-4 h-4" /></div>
            <div className="font-semibold text-sm">{data.label}</div>
        </div>
        <div className="text-xs text-text-secondary">npm run test</div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-text-secondary border-2 border-surface-2" />
    </div>
);

const AINode = ({ data, selected }) => (
    <div className={`px-4 py-3 shadow-[0_0_15px_rgba(167,139,250,0.3)] rounded-xl bg-surface-2 border-2 ${selected ? 'border-ai' : 'border-ai/50'} text-text-primary min-w-[150px]`}>
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-ai border-2 border-surface-2" />
        <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-ai/20 rounded-md text-ai animate-pulse"><Zap className="w-4 h-4" /></div>
            <div className="font-semibold text-sm">{data.label}</div>
        </div>
        <div className="text-xs text-text-secondary">Claude 3.5 Sonnet</div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-ai border-2 border-surface-2" />
    </div>
);

const NotifyNode = ({ data, selected }) => (
    <div className={`px-4 py-3 shadow-[0_0_15px_rgba(245,158,11,0.3)] rounded-xl bg-surface-2 border-2 ${selected ? 'border-amber-500' : 'border-amber-500/50'} text-text-primary min-w-[150px]`}>
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-amber-500 border-2 border-surface-2" />
        <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-amber-500/20 rounded-md text-amber-500"><Bell className="w-4 h-4" /></div>
            <div className="font-semibold text-sm">{data.label}</div>
        </div>
        <div className="text-xs text-text-secondary">#engineering channel</div>
    </div>
);

const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
    ai: AINode,
    notify: NotifyNode,
};

const initialNodes = [
    { id: '1', type: 'trigger', position: { x: 50, y: 150 }, data: { label: 'PR Merged' } },
    { id: '2', type: 'action', position: { x: 300, y: 150 }, data: { label: 'Run Tests' } },
    { id: '3', type: 'ai', position: { x: 550, y: 150 }, data: { label: 'Generate Release Notes' } },
    { id: '4', type: 'notify', position: { x: 800, y: 150 }, data: { label: 'Notify Slack' } },
];
const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6EE7B7', strokeWidth: 2 } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#444444', strokeWidth: 2 } },
    { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#A78BFA', strokeWidth: 2 } },
];

const WorkflowBuilder = () => {
    const { id } = useParams();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [title, setTitle] = useState('Production Deploy & Release');
    const [selectedNode, setSelectedNode] = useState(null);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#444444', strokeWidth: 2 } }, eds)), [setEdges]);

    return (
        <div className="h-full flex flex-col -m-6">
            {/* Builder Top Bar */}
            <div className="h-14 border-b border-border bg-surface-1 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-transparent text-lg font-semibold text-text-primary outline-none focus:border-b border-primary max-w-[300px]"
                    />
                    <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20"><CheckCircle2 className="w-3 h-3" /> Saved</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="gap-2"><Save className="w-4 h-4" /> Save</Button>
                    <Button size="sm" className="gap-2 text-sm h-9"><Play className="w-4 h-4" /> Run Workflow</Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Canvas Area */}
                <div className="flex-1 relative bg-[#080808]">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        onNodeClick={(e, node) => setSelectedNode(node)}
                        onPaneClick={() => setSelectedNode(null)}
                        fitView
                        className="react-flow-dark"
                    >
                        <Background color="#222222" gap={20} size={2} />
                        <Controls className="bg-surface-2 border border-border fill-text-primary" />
                    </ReactFlow>
                </div>

                {/* Right Panel - Node Details */}
                {selectedNode && (
                    <div className="w-80 border-l border-border bg-surface-1 border-t-0 p-4 shrink-0 overflow-y-auto hidden-scrollbar flex flex-col animate-in slide-in-from-right-8 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold flex items-center gap-2"><Settings2 className="w-4 h-4 text-text-secondary" /> Node Settings</h3>
                            <span className="text-xs uppercase tracking-wider text-text-secondary bg-surface-2 px-2 py-1 rounded">{selectedNode.type}</span>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div>
                                <label className="block text-xs text-text-secondary mb-1">Node Label</label>
                                <input
                                    type="text"
                                    value={selectedNode.data.label}
                                    readOnly
                                    className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none"
                                />
                            </div>

                            {selectedNode.type === 'ai' && (
                                <div>
                                    <label className="block text-xs text-text-secondary mb-1">AI Model</label>
                                    <select className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none">
                                        <option>Claude 3.5 Sonnet</option>
                                        <option>GPT-4o</option>
                                        <option>Gemini 1.5 Pro</option>
                                    </select>
                                </div>
                            )}

                            {selectedNode.type === 'ai' && (
                                <div>
                                    <label className="block text-xs text-text-secondary mb-1">System Prompt</label>
                                    <textarea
                                        className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none h-32 font-mono text-xs text-text-secondary leading-relaxed resize-none"
                                        defaultValue="You are an expert technical writer. Review the diff from the previous node and generate a concise, human-readable release note summary. Focus on user-facing changes."
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 mt-auto border-t border-border">
                            <Button variant="ghost" className="w-full text-error hover:bg-error/10 hover:text-error hover:border-error border-border">Delete Node</Button>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .react-flow__node { width: auto; }
        .react-flow__controls button { background: #1A1A1A; border-bottom: 1px solid #222; }
        .react-flow__controls button:hover { background: #222; }
        .react-flow__controls button svg { fill: #F1F5F9; }
      `}} />
        </div>
    );
};

export default WorkflowBuilder;
