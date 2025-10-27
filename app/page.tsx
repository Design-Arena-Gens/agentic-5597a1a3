'use client'

import { useState } from 'react'
import { Users, Brain, Loader2 } from 'lucide-react'
import AgentTeam from './components/AgentTeam'
import ConversationPanel from './components/ConversationPanel'

export default function Home() {
  const [activeSession, setActiveSession] = useState(false)
  const [userRequest, setUserRequest] = useState('')
  const [conversations, setConversations] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleStartSession = async () => {
    if (!userRequest.trim()) return

    setIsProcessing(true)
    setActiveSession(true)

    try {
      const response = await fetch('/api/agents/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: userRequest })
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(line => line.trim())

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                setConversations(prev => [...prev, data])
              } catch (e) {
                console.error('Parse error:', e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setActiveSession(false)
    setUserRequest('')
    setConversations([])
    setIsProcessing(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-blue-500" />
            <h1 className="text-5xl font-bold text-white">AI Agent Team</h1>
          </div>
          <p className="text-gray-400 text-lg">
            High-IQ Multi-Agent System for Research, Planning & Development
          </p>
        </div>

        {!activeSession ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                Meet Your Team
              </h2>

              <AgentTeam />

              <div className="mt-8">
                <label className="block text-gray-300 text-sm font-semibold mb-3">
                  What would you like the team to work on?
                </label>
                <textarea
                  value={userRequest}
                  onChange={(e) => setUserRequest(e.target.value)}
                  placeholder="E.g., Build a real-time chat application with user authentication, design a microservices architecture for e-commerce, or create a machine learning pipeline..."
                  className="w-full h-40 px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                />

                <button
                  onClick={handleStartSession}
                  disabled={!userRequest.trim() || isProcessing}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Initializing Team...
                    </>
                  ) : (
                    'Start Team Collaboration'
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Team Discussion</h2>
              <button
                onClick={handleReset}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                New Session
              </button>
            </div>

            <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700">
              <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Request:</h3>
                <p className="text-white">{userRequest}</p>
              </div>

              <ConversationPanel conversations={conversations} isProcessing={isProcessing} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
