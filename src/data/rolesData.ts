export const rolesData = [
  {
    id: 1,
    title: "Student",
    date: "Learning",
    content: "Embark on a personalized learning journey. Access world-class courses, track your growth with advanced analytics, and earn verified credentials that open doors.",
    category: "Learner",
    icon: "graduationCap",
    relatedIds: [2, 4], // Instructor, Freelancer
    status: "in-progress" as const,
    energy: 100,
    features: [
      "Curated AI Learning Paths",
      "Interactive Quizzes & Assignments",
      "Real-time Progress Tracking",
      "Blockchain-Verified Certificates"
    ]
  },
  {
    id: 2,
    title: "Instructor",
    date: "Teaching",
    content: "Transform your expertise into income. Build engaging courses, mentor students globally, and leverage powerful tools to manage your education business.",
    category: "Educator",
    icon: "users",
    relatedIds: [1, 5], 
    status: "completed" as const,
    energy: 90,
    features: [
      "Advanced Course Creation Studio",
      "Detailed Student Analytics",
      "Automated Revenue Payouts",
      "Live Session Management"
    ]
  },
  {
    id: 3,
    title: "Admin",
    date: "System",
    content: "Maintain total control over your platform. Orchestrate user roles, oversee financial flows, and ensure system integrity with enterprise-grade tools.",
    category: "Operations",
    icon: "shield",
    relatedIds: [1, 2, 4, 5],
    status: "in-progress" as const,
    energy: 60,
    features: [
      "System-wide Analytics Dashboard",
      "User & Content Management",
      "Financial Oversight & Refunds",
      "Security & Audit Logs"
    ]
  },
  {
    id: 4,
    title: "Freelancer",
    date: "Working",
    content: "Monetize your skills on your own terms. Connect with clients, showcase your portfolio, and deliver projects via a seamless, secure workspace.",
    category: "Professional",
    icon: "briefcase",
    relatedIds: [1, 5],
    status: "pending" as const,
    energy: 85,
    features: [
      "Global Talent Marketplace",
      "Self-Branding Profile Tools",
      "Direct Client Messaging",
      "Secure Project Milestones"
    ]
  },
  {
    id: 5,
    title: "Organizer",
    date: "Events",
    content: "Empower your organization. Manage teams, assign private training, and track skill development across your entire workforce.",
    category: "Community",
    icon: "layout",
    relatedIds: [1, 2, 4],
    status: "completed" as const,
    energy: 75,
    features: [
      "Multi-level Team Management",
      "Private Course Library",
      "Role-Based Access Control",
      "Enterprise Performance Reports"
    ]
  },
];