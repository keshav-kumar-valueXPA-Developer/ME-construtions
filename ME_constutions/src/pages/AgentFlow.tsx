import React from "react";
import {
  Database,
  Calculator,
  AlertTriangle,
  BarChart,
  Shield,
  FileText,
} from "lucide-react";

const agents = [
  {
    id: "data",
    title: "Data Agent",
    description: "Validates and processes input data",
    icon: Database,
    status: "active",
  },
  {
    id: "calculation",
    title: "Calculation Agent",
    description: "Computes KPIs and metrics",
    icon: Calculator,
    status: "active",
  },
  {
    id: "risk",
    title: "Risk Agent",
    description: "Monitors risks and compliance",
    icon: Shield,
    status: "idle",
  },
  {
    id: "critique",
    title: "Critique Agent",
    description: "Detects anomalies and patterns",
    icon: AlertTriangle,
    status: "idle",
  },
  {
    id: "reporting",
    title: "Reporting Agent",
    description: "Generates reports and visualizations",
    icon: BarChart,
    status: "active",
  },
];

export default function AgentFlow() {
  return (
    <div className="p-8 flex flex-col items-center relative">
      <h1 className="text-2xl font-semibold text-gray-900">Agent Flow</h1>
      <p className="text-gray-600 mb-8">Visual representation of agent orchestration</p>

      {/* Flowchart container */}
      <div className="relative flex flex-col items-center space-y-6 w-full max-w-lg">
        {/* SVG for arrows */}
        <svg className="absolute w-full h-full" viewBox="0 0 400 400">
          {/* First row connection (Left to Right) */}
          <line x1="120" y1="90" x2="280" y2="90" stroke="gray" strokeWidth="2" markerEnd="url(#arrow)" />
          
          {/* Second row connection (Right to Left) */}
          <line x1="280" y1="180" x2="120" y2="180" stroke="gray" strokeWidth="2" markerEnd="url(#arrow)" />
          
          {/* Top to Middle Arrow */}
          <line x1="250" y1="90" x2="250" y2="180" stroke="gray" strokeWidth="2" markerEnd="url(#arrow)" />

          {/* Middle to Bottom Arrow */}
          <line x1="150" y1="230" x2="200" y2="310" stroke="gray" strokeWidth="2" markerEnd="url(#arrow)" />

          {/* Arrowhead */}
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="gray" />
            </marker>
          </defs>
        </svg>

        {/* Top Row */}
        <div className="flex justify-center space-x-12">
          {agents.slice(0, 2).map((agent) => (
            <AgentBox key={agent.id} agent={agent} />
          ))}
        </div>

        {/* Middle Row */}
        <div className="flex justify-center space-x-12">
          {agents.slice(2, 4).map((agent) => (
            <AgentBox key={agent.id} agent={agent} />
          ))}
        </div>

        {/* Bottom Row */}
        <div className="flex justify-center">
          <AgentBox agent={agents[4]} />
        </div>
      </div>
    </div>
  );
}

function AgentBox({ agent }) {
  return (
    <div className="flex flex-col items-center w-[160px] h-[160px] text-center p-3 rounded-lg border-2 shadow-md bg-white relative">
      <div
        className={`p-2 rounded-lg ${
          agent.status === "active"
            ? "bg-blue-100 text-blue-600"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        <agent.icon className="h-8 w-8" />
      </div>
      <h3 className="font-medium text-gray-900 text-sm mt-2">{agent.title}</h3>
      <p className="text-xs text-gray-500 mt-1">{agent.description}</p>
    </div>
  );
}