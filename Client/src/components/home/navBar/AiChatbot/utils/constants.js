
export const GUIDED_EXPERIENCES = {
  "study planning": {
    steps: [
      {
        id: 1,
        question: "What subject do you need help with?",
        options: ["Mathematics", "Science", "Languages", "History", "Computer Science", "Other"],
        type: "subject"
      },
      {
        id: 2,
        question: "What's your timeline?",
        options: ["Urgent (this week)", "Short-term (2-4 weeks)", "Long-term (1-3 months)", "Ongoing learning"],
        type: "timeline"
      },
      {
        id: 3,
        question: "What's your preferred learning style?",
        options: ["Visual learner", "Auditory learner", "Hands-on practice", "Reading/writing", "Mixed approach"],
        type: "style"
      },
      {
        id: 4,
        question: "What specific goal do you have?",
        options: ["Exam preparation", "Skill mastery", "Project completion", "General understanding", "Career advancement"],
        type: "goal"
      }
    ],
    finalResponse: (answers) => `🎯 **Your Personalized Study Plan**

Based on your preferences, here's your customized learning path:

**Subject Focus:** ${answers.subject}
**Timeline:** ${answers.timeline}
**Learning Style:** ${answers.style}
**Primary Goal:** ${answers.goal}

**Recommended Actions:**
1. **Session Type:** ${answers.timeline === 'Urgent (this week)' ? 'Intensive 1-on-1 tutoring' : 'Group study sessions'}
2. **Study Materials:** ${answers.style === 'Visual learner' ? 'Visual notes and diagrams' : 'Comprehensive text resources'}
3. **Practice Approach:** ${answers.goal === 'Exam preparation' ? 'Mock tests and quizzes' : 'Project-based learning'}
4. **Schedule:** ${answers.timeline === 'Long-term (1-3 months)' ? 'Weekly 2-hour sessions' : 'Daily 1-hour sessions'}

**Next Steps:**
• Book your first session now
• Set up your study materials
• Connect with peers studying ${answers.subject}
• Track your progress weekly

*Ready to start your learning journey? I can help you book your first session!*`
  },
  "session booking": {
    steps: [
      {
        id: 1,
        question: "What type of session are you looking for?",
        options: ["Group Study", "1-on-1 Tutoring", "Exam Prep", "Topic Deep Dive", "Project Help"],
        type: "sessionType"
      },
      {
        id: 2,
        question: "Preferred time of day?",
        options: ["Morning (8AM-12PM)", "Afternoon (12PM-5PM)", "Evening (5PM-9PM)", "Weekend"],
        type: "timePreference"
      },
      {
        id: 3,
        question: "Session duration?",
        options: ["30 minutes", "1 hour", "1.5 hours", "2 hours"],
        type: "duration"
      },
      {
        id: 4,
        question: "Do you need any specific tools?",
        options: ["Whiteboard", "Screen sharing", "Recording", "File sharing", "All basic tools"],
        type: "tools"
      }
    ],
    finalResponse: (answers) => `📅 **Session Booking Summary**

Perfect! Here's your session setup:

**Session Type:** ${answers.sessionType}
**Preferred Time:** ${answers.timePreference}
**Duration:** ${answers.duration}
**Tools:** ${answers.tools}

**Available Sessions Matching Your Preferences:**
• **Tomorrow ${answers.timePreference}** - ${answers.sessionType} on your chosen topic
• **This Weekend** - Group study with peers
• **Flexible Slots** - Multiple ${answers.duration} sessions available

**Session Features Included:**
✅ Real-time collaboration
✅ ${answers.tools} access
✅ Progress tracking
✅ Session recording
✅ Expert support

**Ready to confirm your booking?** 
*Click "Book Now" to secure your spot, or ask me about specific topics!*`
  },
  "note taking": {
    steps: [
      {
        id: 1,
        question: "What will you be taking notes for?",
        options: ["Lecture/Class", "Book/Reading", "Research", "Meeting", "Personal Study", "Project"],
        type: "purpose"
      },
      {
        id: 2,
        question: "Preferred note format?",
        options: ["Text Notes", "Audio Notes", "Visual Notes", "Flashcards", "Mixed Format"],
        type: "format"
      },
      {
        id: 3,
        question: "How organized do you want your notes?",
        options: ["Simple & Quick", "Moderately Organized", "Highly Structured", "Academic Standard"],
        type: "organization"
      },
      {
        id: 4,
        question: "Do you need AI assistance?",
        options: ["Auto-summarization", "Key points extraction", "Mind maps", "Study questions", "All features"],
        type: "aiFeatures"
      }
    ],
    finalResponse: (answers) => `📝 **Your Smart Note-Taking Setup**

Excellent choice! Here's your customized note-taking system:

**Purpose:** ${answers.purpose}
**Format:** ${answers.format}
**Organization Level:** ${answers.organization}
**AI Features:** ${answers.aiFeatures}

**Recommended Setup:**
1. **Template:** ${answers.organization === 'Highly Structured' ? 'Cornell Note System' : 'Bullet-point format'}
2. **Tools:** ${answers.format === 'Visual Notes' ? 'Diagram creator + text editor' : 'Advanced text editor with audio sync'}
3. **AI Assistance:** ${answers.aiFeatures} enabled
4. **Organization:** ${answers.organization === 'Simple & Quick' ? 'Tag-based system' : 'Folder hierarchy with tags'}

**Pro Features Activated:**
• Smart search across all notes
• Cross-reference similar content
• Automatic backup to cloud
• Mobile sync available
• Export to multiple formats

**Getting Started:**
1. Create your first note template
2. Set up your organization system
3. Enable AI features
4. Start capturing knowledge!

*Would you like me to create your first note template now?*`
  }
};

export const HARDCODED_RESPONSES = {
  "show me study sessions": `🎯 **Study Sessions at Studia**

We offer various types of study sessions to suit your learning style:

• **Group Study Sessions** - Collaborate with peers (2-5 people)
• **1-on-1 Tutoring** - Personalized attention from expert tutors
• **Exam Prep Sessions** - Focused preparation for upcoming tests
• **Topic Deep Dives** - Master specific subjects in detail

**Features:**
✅ Real-time whiteboard collaboration
✅ Screen sharing capabilities  
✅ Session recording and playback
✅ Progress tracking and analytics

*What specific type of session are you interested in? I can help you find the perfect fit!*`,

  "how do i join learning games": `🎮 **Join Learning Games**

Getting started with our educational games is easy! Here's how:

**Step-by-Step Guide:**
1. **Browse Games** - Explore our game library by subject and difficulty
2. **Choose Your Game** - Select from quizzes, puzzles, or interactive challenges
3. **Invite Friends** (Optional) - Play solo or with study buddies
4. **Track Progress** - Earn points and unlock achievements

**Popular Game Categories:**
• 🧠 Brain Teasers & Puzzles
• 📚 Subject-Specific Challenges  
• 🏆 Competitive Learning Tournaments
• 🤝 Collaborative Team Games

*Ready to make learning fun? Which subject would you like to game-ify?*`,

  "how can i create study notes": `📝 **Create Smart Study Notes**

Studia's AI-powered note-taking system helps you create effective study materials:

**Note Creation Options:**
• **Text Notes** - Traditional typing with rich formatting
• **Audio Notes** - Record and transcribe lectures
• **Visual Notes** - Add diagrams, screenshots, and images
• **Flashcards** - Create interactive study cards

**AI-Powered Features:**
🤖 **Auto-Summarization** - Condense long texts
🎯 **Key Point Extraction** - Identify important concepts
📊 **Visual Organization** - Mind maps and flowcharts
🔍 **Smart Search** - Find notes instantly

**Pro Tips:**
• Use the Cornell note-taking method
• Color-code by topic or priority
• Add timestamps for video content
• Share notes with study groups

*Would you like help setting up your first note-taking system?*`,

  "i need help with learning": `💫 **Learning Support & Resources**

I'm here to help you overcome any learning challenges! Here are our support options:

**Immediate Help:**
• 🎯 **Personalized Tutoring** - Get 1-on-1 expert help
• 📚 **Study Plan Creation** - Custom learning roadmap
• 🧠 **Learning Strategy** - Effective study techniques
• ⏰ **Time Management** - Schedule optimization

**Additional Resources:**
• Video tutorials and walkthroughs
• Practice exercises with solutions
• Progress tracking and analytics
• Peer support communities

**Common Solutions:**
• Breaking down complex topics
• Improving focus and concentration
• Managing study stress
• Preparing for exams effectively

*Tell me more about what you're struggling with, and I'll provide specific guidance!*`,

  "who are you": `🤖 **About Studia AI**

I'm your intelligent learning assistant, powered by advanced AI technology! Here's what I can do for you:

**My Capabilities:**
• Answer questions about all Studia features
• Help you create effective study plans
• Explain complex concepts in simple terms
• Recommend learning resources and sessions
• Assist with note-taking and organization
• Provide motivation and learning strategies

**My Mission:**
To make your learning journey more effective, engaging, and personalized! I'm here 24/7 to support your educational goals.

**Quick Facts:**
• Powered by Gemini AI technology
• Integrated with all Studia platforms
• Constantly learning and improving
• Your personal learning companion

*What would you like to explore together today?*`,

  "about": `🏫 **About Studia Platform**

Studia is your comprehensive learning ecosystem designed to transform how you learn and grow:

**Our Vision:**
To create a world where learning is personalized, engaging, and accessible to everyone.

**Key Features:**
🎓 **Smart Sessions** - Interactive study environments
🤖 **AI Assistant** (That's me!) - 24/7 learning support
🎮 **Learning Games** - Gamified education
📝 **Digital Notes** - Advanced note-taking system
📊 **Progress Analytics** - Track your learning journey

**What Makes Us Different:**
• Personalized learning paths for every student
• AI-powered content recommendations
• Collaborative learning communities
• Real-time progress tracking
• Multi-format content support

**Join 50,000+ learners** who are already transforming their education with Studia!

*Ready to start your learning journey?*`,

  "what is studia": `🚀 **Welcome to Studia!**

Studia is an innovative learning platform that combines cutting-edge technology with proven educational methods:

**Core Platform Features:**

📚 **Study Sessions**
- Live and recorded learning sessions
- Interactive whiteboards and tools
- Group collaboration spaces
- Expert tutor availability

🎯 **AI-Powered Learning**
- Personalized study recommendations
- Smart content organization
- Progress analytics and insights
- Adaptive learning paths

🎮 **Educational Games**
- Subject-specific challenges
- Competitive learning tournaments
- Collaborative team activities
- Achievement and reward system

📝 **Smart Note-Taking**
- Multi-format note creation
- AI-powered summarization
- Easy organization and search
- Sharing and collaboration

**Our Mission:** To make quality education engaging, accessible, and effective for every learner.

*Which feature would you like to explore first?*`
};

export const QUICK_ACTIONS = [
  { label: "Find Sessions", query: "Show me study sessions"},
  { label: "Join Games", query: "How do I join learning games?"},
  { label: "Create Notes", query: "How can I create study notes?"},
  { label: "Get Help", query: "I need help with learning"},
];

export const TRENDING_FEATURES = [
  { name: "Study Sessions", emoji: "📚", users: "1.2K" },
  { name: "AI Notes", emoji: "🤖", users: "2.5K" },
  { name: "Game Learning", emoji: "🎮", users: "1.8K" },
  { name: "Live Classes", emoji: "🎥", users: "3.2K" }
];