import type { LucideIcon } from "lucide-react"

interface Agent {
  name: string
  icon: LucideIcon
  color: string
  bgColor: string
}

interface InterAgentMessage {
  id: string
  fromAgent: string
  toAgent?: string
  message: string
  timestamp: Date
  type: "coordination" | "question" | "update" | "suggestion" | "completion"
  priority: "low" | "normal" | "high"
}

interface ConversationTemplate {
  taskType: string
  messages: Omit<InterAgentMessage, "id" | "timestamp">[]
}

export const conversationTemplates: ConversationTemplate[] = [
  {
    taskType: "marketing-campaign",
    messages: [
      {
        fromAgent: "Research Agent",
        message:
          "Starting market research for the campaign. I'll analyze competitor strategies and target demographics.",
        type: "coordination",
        priority: "normal",
      },
      {
        fromAgent: "Web Agent",
        toAgent: "Research Agent",
        message: "Perfect! I'll prepare content frameworks while you gather data. What's our primary target age group?",
        type: "question",
        priority: "normal",
      },
      {
        fromAgent: "Research Agent",
        toAgent: "Web Agent",
        message:
          "Primary target is 25-40 years old, tech-savvy professionals. High engagement on LinkedIn and Instagram.",
        type: "update",
        priority: "normal",
      },
      {
        fromAgent: "Web Agent",
        message:
          "Excellent! I'll focus on professional yet engaging content. Creating LinkedIn articles and Instagram visual content.",
        type: "coordination",
        priority: "normal",
      },
      {
        fromAgent: "Research Agent",
        message: "Found that our competitors are weak in video content. Opportunity for differentiation there.",
        type: "suggestion",
        priority: "high",
      },
      {
        fromAgent: "Web Agent",
        toAgent: "Research Agent",
        message: "Great insight! I'll prioritize video content creation. Can you share the competitor analysis data?",
        type: "question",
        priority: "normal",
      },
      {
        fromAgent: "Research Agent",
        message: "Research phase complete. Sharing comprehensive competitor analysis and market insights now.",
        type: "completion",
        priority: "high",
      },
      {
        fromAgent: "Web Agent",
        message: "Received all data. Creating final campaign materials with video-first strategy. ETA 3 minutes.",
        type: "coordination",
        priority: "high",
      },
    ],
  },
  {
    taskType: "business-strategy",
    messages: [
      {
        fromAgent: "Research Agent",
        message: "Beginning comprehensive market analysis for business strategy development.",
        type: "coordination",
        priority: "normal",
      },
      {
        fromAgent: "Data Analysis",
        toAgent: "Research Agent",
        message: "I'll prepare financial models and performance metrics. What's our primary business focus?",
        type: "question",
        priority: "normal",
      },
      {
        fromAgent: "Research Agent",
        toAgent: "Data Analysis",
        message: "Focus on SaaS market expansion. I'm seeing strong growth in enterprise segment.",
        type: "update",
        priority: "normal",
      },
      {
        fromAgent: "Content Synthesis",
        message:
          "Standing by to compile final strategy document. Will need both market data and financial projections.",
        type: "coordination",
        priority: "normal",
      },
      {
        fromAgent: "Data Analysis",
        message: "Financial analysis shows 40% growth potential in enterprise segment. ROI projections looking strong.",
        type: "update",
        priority: "normal",
      },
      {
        fromAgent: "Research Agent",
        toAgent: "Content Synthesis",
        message: "Market research complete. Enterprise segment has 3x higher LTV than SMB. Recommend strategic pivot.",
        type: "suggestion",
        priority: "high",
      },
      {
        fromAgent: "Content Synthesis",
        message:
          "Excellent findings! Synthesizing strategy with enterprise-first approach. Including risk mitigation plans.",
        type: "coordination",
        priority: "normal",
      },
      {
        fromAgent: "Data Analysis",
        toAgent: "Content Synthesis",
        message: "Sending final financial models and 5-year projections. Break-even at month 18 with enterprise focus.",
        type: "completion",
        priority: "high",
      },
      {
        fromAgent: "Content Synthesis",
        message:
          "Strategy document complete! Comprehensive plan with market analysis, financial projections, and implementation roadmap.",
        type: "completion",
        priority: "high",
      },
    ],
  },
  {
    taskType: "product-development",
    messages: [
      {
        fromAgent: "Research Agent",
        message: "Starting user research and market validation for product development.",
        type: "coordination",
        priority: "normal",
      },
      {
        fromAgent: "Data Analysis",
        message: "I'll analyze user behavior patterns and feature usage data. What's our target user persona?",
        type: "question",
        priority: "normal",
      },
      {
        fromAgent: "Web Agent",
        toAgent: "Research Agent",
        message: "Ready to create product documentation and marketing materials. What's the core value proposition?",
        type: "question",
        priority: "normal",
      },
      {
        fromAgent: "Research Agent",
        message: "Target persona: Product managers at mid-size companies. Core value: Streamlined workflow automation.",
        type: "update",
        priority: "normal",
      },
      {
        fromAgent: "Data Analysis",
        toAgent: "Research Agent",
        message:
          "Found that 78% of target users struggle with manual processes. Automation is definitely the right focus.",
        type: "update",
        priority: "normal",
      },
      {
        fromAgent: "Web Agent",
        message: "Perfect! I'll emphasize time-saving and efficiency in all marketing materials.",
        type: "coordination",
        priority: "normal",
      },
      {
        fromAgent: "Research Agent",
        message: "User interviews reveal demand for Slack integration and mobile app. High priority features.",
        type: "suggestion",
        priority: "high",
      },
      {
        fromAgent: "Data Analysis",
        message:
          "Analytics confirm: Users with integrations have 3x higher retention. Mobile usage growing 25% monthly.",
        type: "update",
        priority: "high",
      },
      {
        fromAgent: "Web Agent",
        toAgent: "Data Analysis",
        message:
          "I'll highlight integration capabilities prominently. Can you share the retention data for the landing page?",
        type: "question",
        priority: "normal",
      },
      {
        fromAgent: "Data Analysis",
        message: "Product analysis complete. Sharing user behavior insights and feature prioritization matrix.",
        type: "completion",
        priority: "high",
      },
      {
        fromAgent: "Web Agent",
        message: "All materials ready! Product documentation, marketing site, and launch campaign complete.",
        type: "completion",
        priority: "high",
      },
    ],
  },
]

export function generateInterAgentConversation(
  taskType: string,
  agents: Agent[],
  collaborationId: string,
): InterAgentMessage[] {
  const template = conversationTemplates.find((t) => t.taskType === taskType)
  if (!template) {
    return generateGenericConversation(agents, collaborationId)
  }

  return template.messages.map((msg, index) => ({
    ...msg,
    id: `${collaborationId}-msg-${index}`,
    timestamp: new Date(Date.now() + index * 2000), // Stagger messages by 2 seconds
  }))
}

function generateGenericConversation(agents: Agent[], collaborationId: string): InterAgentMessage[] {
  const messages: InterAgentMessage[] = []

  // Generic coordination messages
  agents.forEach((agent, index) => {
    messages.push({
      id: `${collaborationId}-generic-${index}`,
      fromAgent: agent.name,
      message: `${agent.name} ready for collaboration. I'll handle ${agent.specialties[0].toLowerCase()}.`,
      timestamp: new Date(Date.now() + index * 1500),
      type: "coordination",
      priority: "normal",
    })
  })

  return messages
}
