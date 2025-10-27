import { Shield, BarChart3, Wrench, Target, Building2, Loader2 } from 'lucide-react'

interface Message {
  agent: string
  message: string
  timestamp: number
  type?: 'analysis' | 'plan' | 'implementation' | 'review'
}

interface ConversationPanelProps {
  conversations: Message[]
  isProcessing: boolean
}

const agentConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  'Team Leader': { icon: Shield, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  'Data Analyst': { icon: BarChart3, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  'Engineer': { icon: Wrench, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  'Product Manager': { icon: Target, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  'Architect': { icon: Building2, color: 'text-red-500', bgColor: 'bg-red-500/10' }
}

export default function ConversationPanel({ conversations, isProcessing }: ConversationPanelProps) {
  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {conversations.length === 0 && isProcessing && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-gray-400">Team is analyzing your request...</p>
          </div>
        </div>
      )}

      {conversations.map((conv, idx) => {
        const config = agentConfig[conv.agent] || {
          icon: Shield,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10'
        }
        const Icon = config.icon

        return (
          <div
            key={idx}
            className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all animate-fadeIn"
          >
            <div className="flex items-start gap-3">
              <div className={`${config.bgColor} p-2 rounded-lg flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{conv.agent}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(conv.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {conv.message}
                </p>
                {conv.type && (
                  <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded">
                    {conv.type}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {isProcessing && conversations.length > 0 && (
        <div className="flex items-center gap-2 text-gray-400 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Team is collaborating...</span>
        </div>
      )}
    </div>
  )
}
