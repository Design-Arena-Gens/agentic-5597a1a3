import { Shield, BarChart3, Wrench, Target, Building2 } from 'lucide-react'

const agents = [
  {
    name: 'Team Leader',
    icon: Shield,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    role: 'Strategic Oversight & Coordination',
    capabilities: ['Team coordination', 'Decision making', 'Strategic planning', 'Quality control']
  },
  {
    name: 'Data Analyst',
    icon: BarChart3,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    role: 'Data Analysis & Insights',
    capabilities: ['Data modeling', 'Statistical analysis', 'Performance metrics', 'Research']
  },
  {
    name: 'Engineer',
    icon: Wrench,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    role: 'Implementation & Development',
    capabilities: ['Full-stack development', 'Code optimization', 'Testing', 'Debugging']
  },
  {
    name: 'Product Manager',
    icon: Target,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    role: 'Requirements & User Experience',
    capabilities: ['Requirements gathering', 'Feature prioritization', 'User stories', 'Roadmapping']
  },
  {
    name: 'Architect',
    icon: Building2,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    role: 'System Design & Architecture',
    capabilities: ['System design', 'Technology selection', 'Scalability planning', 'Best practices']
  }
]

export default function AgentTeam() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => {
        const Icon = agent.icon
        return (
          <div
            key={agent.name}
            className="bg-gray-900 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className={`${agent.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${agent.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg mb-1">{agent.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{agent.role}</p>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
