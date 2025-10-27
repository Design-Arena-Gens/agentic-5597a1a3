import { NextRequest } from 'next/server'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

interface AgentMessage {
  agent: string
  message: string
  timestamp: number
  type?: 'analysis' | 'plan' | 'implementation' | 'review'
}

const agentRoles = {
  'Team Leader': {
    systemPrompt: `You are a Team Leader AI agent with exceptional strategic thinking and coordination abilities. Your role is to:
- Analyze the overall project requirements and set clear objectives
- Coordinate between different team members
- Make high-level decisions and provide strategic direction
- Ensure quality and coherence across all aspects
- Identify potential risks and mitigation strategies
You are highly intelligent, decisive, and focused on delivering excellent results.`,
    order: 1
  },
  'Product Manager': {
    systemPrompt: `You are a Product Manager AI agent with deep expertise in requirements gathering and user experience. Your role is to:
- Define detailed user requirements and use cases
- Create user stories and acceptance criteria
- Prioritize features based on value and feasibility
- Ensure the solution meets user needs
- Define success metrics and KPIs
You are user-focused, analytical, and excellent at translating needs into actionable requirements.`,
    order: 2
  },
  'Architect': {
    systemPrompt: `You are an Architect AI agent with mastery over system design and technology selection. Your role is to:
- Design scalable and maintainable system architecture
- Select appropriate technologies and frameworks
- Define component interactions and data flow
- Establish architectural patterns and best practices
- Ensure non-functional requirements (performance, security, scalability)
You are technically brilliant, forward-thinking, and create robust architectural solutions.`,
    order: 3
  },
  'Data Analyst': {
    systemPrompt: `You are a Data Analyst AI agent with expertise in data modeling and analysis. Your role is to:
- Design data models and database schemas
- Analyze data requirements and flows
- Identify data sources and integration points
- Define analytics and reporting needs
- Ensure data quality and governance
You are detail-oriented, analytical, and skilled at uncovering insights from data requirements.`,
    order: 4
  },
  'Engineer': {
    systemPrompt: `You are an Engineer AI agent with exceptional coding and implementation skills. Your role is to:
- Implement features based on requirements and architecture
- Write clean, efficient, and maintainable code
- Suggest specific technologies, libraries, and tools
- Identify technical challenges and solutions
- Propose implementation approaches and best practices
You are highly skilled across multiple programming languages and frameworks, pragmatic, and focused on building robust solutions.`,
    order: 5
  }
}

async function callClaudeAPI(systemPrompt: string, userMessage: string, conversationHistory: string): Promise<string> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `${conversationHistory}\n\nOriginal Request: ${userMessage}\n\nBased on the discussion so far, provide your expert input. Be specific, actionable, and build upon what others have said. Keep your response focused and valuable.`
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.content[0].text
  } catch (error) {
    console.error('Error calling Claude API:', error)
    return `I encountered an error while processing. Please ensure the ANTHROPIC_API_KEY environment variable is set correctly.`
  }
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()
  const { request } = await req.json()

  const stream = new ReadableStream({
    async start(controller) {
      const messages: AgentMessage[] = []

      const sendMessage = (agent: string, message: string, type?: AgentMessage['type']) => {
        const msg: AgentMessage = {
          agent,
          message,
          timestamp: Date.now(),
          type
        }
        messages.push(msg)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`))
      }

      try {
        // Sort agents by order
        const sortedAgents = Object.entries(agentRoles).sort((a, b) => a[1].order - b[1].order)

        // First round: Initial analysis
        for (const [agentName, config] of sortedAgents) {
          const conversationHistory = messages
            .map(m => `${m.agent}: ${m.message}`)
            .join('\n\n')

          const response = await callClaudeAPI(
            config.systemPrompt,
            request,
            conversationHistory
          )

          const type = agentName === 'Team Leader' ? 'analysis' :
                      agentName === 'Architect' ? 'plan' :
                      agentName === 'Engineer' ? 'implementation' : undefined

          sendMessage(agentName, response, type)
        }

        // Second round: Team Leader synthesis and Engineer detailed plan
        const conversationHistory = messages
          .map(m => `${m.agent}: ${m.message}`)
          .join('\n\n')

        const leaderSynthesis = await callClaudeAPI(
          agentRoles['Team Leader'].systemPrompt + '\n\nNow synthesize all inputs into a coherent plan with clear next steps.',
          request,
          conversationHistory
        )
        sendMessage('Team Leader', leaderSynthesis, 'review')

        const engineerDetails = await callClaudeAPI(
          agentRoles['Engineer'].systemPrompt + '\n\nProvide a detailed technical implementation plan with specific steps, technologies, and code structure.',
          request,
          conversationHistory + `\n\nTeam Leader: ${leaderSynthesis}`
        )
        sendMessage('Engineer', engineerDetails, 'implementation')

      } catch (error) {
        console.error('Stream error:', error)
        sendMessage('System', 'An error occurred during the collaboration process.')
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
