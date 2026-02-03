// ============================================
// AEGIS - AI Pedagogical Assistant Service
// ============================================

import type { AIMessage, AIExplanation, AlertSeverity, SecurityAction } from '@aegis/shared';
import { v4 as uuidv4 } from 'uuid';

interface AIContext {
  conversationHistory: AIMessage[];
  unresolvedAlerts: number;
  recentBreaches: string[];
}

// Security knowledge base for generating responses
const securityKnowledge: Record<string, {
  explanation: string;
  riskLevel: AlertSeverity;
  tips: string[];
}> = {
  'password': {
    explanation: 'Passwords are the primary defense for your online accounts. A strong password is long (12+ characters), unique for each account, and combines letters, numbers, and symbols. Never share passwords or use personal information that could be guessed.',
    riskLevel: 'high',
    tips: [
      'Use a password manager to generate and store unique passwords',
      'Enable two-factor authentication wherever possible',
      'Never reuse passwords across different services',
      'Check if your passwords have been leaked using breach databases',
    ],
  },
  '2fa': {
    explanation: 'Two-factor authentication (2FA) adds a second layer of security beyond your password. Even if someone steals your password, they cannot access your account without the second factor - usually your phone or a hardware key.',
    riskLevel: 'medium',
    tips: [
      'Use authenticator apps (Google Authenticator, Authy) instead of SMS',
      'Save backup codes in a secure location',
      'Consider hardware security keys for high-value accounts',
      'Enable 2FA on your email first - it protects all other accounts',
    ],
  },
  'phishing': {
    explanation: 'Phishing attacks trick you into revealing sensitive information by impersonating legitimate services. These attacks often come via email, SMS, or fake websites that look authentic but are designed to steal your credentials.',
    riskLevel: 'high',
    tips: [
      'Always check the sender email address carefully',
      'Hover over links before clicking to see the real URL',
      'Legitimate services never ask for passwords via email',
      'When in doubt, go directly to the website instead of clicking links',
    ],
  },
  'breach': {
    explanation: 'A data breach occurs when unauthorized individuals access confidential information from a service. When your data is in a breach, attackers may have your email, password, or other personal information. Quick action is essential to minimize damage.',
    riskLevel: 'critical',
    tips: [
      'Change your password immediately on the breached service',
      'Change passwords on any other service where you used the same password',
      'Monitor your accounts for suspicious activity',
      'Consider enabling fraud alerts on your financial accounts',
    ],
  },
  'encryption': {
    explanation: 'Encryption converts your data into unreadable code that can only be decrypted with the correct key. End-to-end encryption means only you and the intended recipient can read the data - not even the service provider.',
    riskLevel: 'low',
    tips: [
      'Enable device encryption on your computer and phone',
      'Use encrypted messaging apps for sensitive conversations',
      'Look for HTTPS in your browser when entering sensitive data',
      'Consider encrypting sensitive files before cloud storage',
    ],
  },
  'social engineering': {
    explanation: 'Social engineering manipulates people into revealing confidential information or taking actions that compromise security. Attackers exploit human psychology - trust, fear, urgency - rather than technical vulnerabilities.',
    riskLevel: 'high',
    tips: [
      'Verify requests through a separate communication channel',
      'Be suspicious of urgent requests for information or money',
      'Dont share personal details publicly on social media',
      'Train yourself to pause and think before acting on requests',
    ],
  },
};

/**
 * Generate an AI response to a user message
 */
export async function generateAIResponse(
  message: string,
  context: AIContext
): Promise<string> {
  const lowerMessage = message.toLowerCase();

  // Analyze the message to determine intent
  const intent = analyzeIntent(lowerMessage);

  // Generate contextual response
  let response = '';

  switch (intent.type) {
    case 'greeting':
      response = generateGreeting(context);
      break;
    case 'question':
      response = generateAnswer(intent.topic, context);
      break;
    case 'help':
      response = generateHelp(context);
      break;
    case 'status':
      response = generateStatus(context);
      break;
    default:
      response = generateGenericResponse(message, context);
  }

  return response;
}

/**
 * Analyze user intent from message
 */
function analyzeIntent(message: string): { type: string; topic?: string } {
  // Greeting patterns
  if (/^(hi|hello|hey|bonjour|salut)/i.test(message)) {
    return { type: 'greeting' };
  }

  // Help request
  if (/help|aide|comment|how/i.test(message)) {
    return { type: 'help' };
  }

  // Status check
  if (/status|state|score|how am i|comment je|ma securite/i.test(message)) {
    return { type: 'status' };
  }

  // Topic detection
  const topics = Object.keys(securityKnowledge);
  for (const topic of topics) {
    if (message.includes(topic) || message.includes(topic.replace(' ', ''))) {
      return { type: 'question', topic };
    }
  }

  // Question patterns
  if (/what|why|how|when|where|quest-ce|pourquoi|comment/i.test(message)) {
    return { type: 'question' };
  }

  return { type: 'general' };
}

/**
 * Generate greeting response
 */
function generateGreeting(context: AIContext): string {
  const greetings = [
    'Hello! Im your security assistant. How can I help you stay safe online today?',
    'Hi there! Ready to improve your digital security. What would you like to know?',
    'Welcome back! I\'m here to help with any security questions you have.',
  ];

  let response = greetings[Math.floor(Math.random() * greetings.length)];

  if (context.unresolvedAlerts > 0) {
    response += `\n\nI noticed you have ${context.unresolvedAlerts} unresolved security alert${context.unresolvedAlerts > 1 ? 's' : ''}. Would you like me to explain what actions you should take?`;
  }

  return response;
}

/**
 * Generate answer to a security question
 */
function generateAnswer(topic: string | undefined, context: AIContext): string {
  if (topic && securityKnowledge[topic]) {
    const knowledge = securityKnowledge[topic];
    let response = knowledge.explanation;

    response += '\n\n**Tips:**\n';
    knowledge.tips.forEach((tip, index) => {
      response += `${index + 1}. ${tip}\n`;
    });

    return response;
  }

  // Generic helpful response
  return `That's a great security question! Here's what you should know:

Security is about protecting your digital identity and data. The key principles are:

1. **Strong, unique passwords** - Use a different password for each account
2. **Two-factor authentication** - Add a second layer of protection
3. **Stay vigilant** - Be cautious of suspicious emails and links
4. **Keep software updated** - Security patches fix known vulnerabilities

Is there a specific security topic you'd like me to explain in more detail?`;
}

/**
 * Generate help response
 */
function generateHelp(context: AIContext): string {
  return `I'm here to help you understand and improve your digital security. Here's what I can do:

**Ask me about:**
- Password security and best practices
- Two-factor authentication (2FA)
- Phishing attacks and how to spot them
- What to do when your data is in a breach
- Encryption and privacy
- Social engineering attacks

**I can also:**
- Explain your security alerts in plain language
- Suggest actions to improve your security score
- Help you understand what data was exposed in a breach

What would you like to know more about?`;
}

/**
 * Generate status response
 */
function generateStatus(context: AIContext): string {
  let response = 'Here\'s a summary of your security status:\n\n';

  if (context.unresolvedAlerts === 0) {
    response += '**Alerts:** No unresolved security alerts. Great job staying on top of things!\n';
  } else {
    response += `**Alerts:** You have ${context.unresolvedAlerts} unresolved alert${context.unresolvedAlerts > 1 ? 's' : ''} that need${context.unresolvedAlerts === 1 ? 's' : ''} attention.\n`;
  }

  if (context.recentBreaches.length > 0) {
    response += `\n**Recent breaches affecting you:** ${context.recentBreaches.join(', ')}\n`;
    response += '\nI recommend addressing these breaches by changing your passwords and enabling 2FA where possible.';
  } else {
    response += '\n**Breaches:** No recent breaches detected for your monitored assets.';
  }

  response += '\n\nWould you like me to explain any of your alerts or suggest specific actions?';

  return response;
}

/**
 * Generate generic response
 */
function generateGenericResponse(message: string, context: AIContext): string {
  return `I understand you're asking about "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}".

To give you the best guidance, could you be more specific? For example, you can ask me:

- "What should I do about a data breach?"
- "How do I create a strong password?"
- "Why is two-factor authentication important?"
- "What are the signs of a phishing email?"

I'm here to help make cybersecurity clear and actionable for you.`;
}

/**
 * Explain a specific security topic
 */
export async function explainSecurityTopic(
  topic: string,
  context?: string
): Promise<AIExplanation> {
  const lowerTopic = topic.toLowerCase();

  // Find matching knowledge
  let knowledge = securityKnowledge[lowerTopic];

  // Try partial matching
  if (!knowledge) {
    for (const [key, value] of Object.entries(securityKnowledge)) {
      if (lowerTopic.includes(key) || key.includes(lowerTopic)) {
        knowledge = value;
        break;
      }
    }
  }

  // Default explanation if topic not found
  if (!knowledge) {
    return {
      topic,
      summary: `${topic} is an important aspect of digital security.`,
      details: `While I don't have specific information about "${topic}", here are general security principles that apply:

1. Always use strong, unique passwords for each account
2. Enable two-factor authentication wherever possible
3. Be cautious of unexpected requests for personal information
4. Keep your software and devices updated
5. Regularly monitor your accounts for suspicious activity

If you'd like me to explain a related topic, please let me know!`,
      riskLevel: 'medium',
      actionable: [],
    };
  }

  // Build actionable items from tips
  const actionable: SecurityAction[] = knowledge.tips.slice(0, 3).map((tip, index) => ({
    id: uuidv4(),
    type: 'security_audit',
    title: tip,
    description: `Recommended action based on ${topic} best practices`,
    priority: index === 0 ? 'high' : 'medium',
    estimatedTime: '10 minutes',
    isCompleted: false,
    xpReward: 25,
  }));

  return {
    topic,
    summary: knowledge.explanation.split('.')[0] + '.',
    details: knowledge.explanation,
    riskLevel: knowledge.riskLevel,
    actionable,
    sources: [
      'NIST Cybersecurity Framework',
      'OWASP Security Guidelines',
      'CISA Security Best Practices',
    ],
  };
}
