export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: string;
  date: string;
  status: "draft" | "published";
  readTime: string;
  additionalImages?: string[];
  videoUrl?: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: "unread" | "read" | "resolved";
}

export interface CarouselSlide {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  order: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive";
  avatar?: string;
  joinDate?: string;
  password?: string;
}

export interface Activity {
  id: string;
  type: "news_add" | "news_edit" | "news_delete" | "carousel_add" | "carousel_edit" | "carousel_delete" | "message_reply" | "user_register" | "user_delete";
  actor: string;
  description: string;
  timestamp: string;
  icon: string;
}

// Mock Articles Data
export const mockArticles: Article[] = [
  {
    id: "1",
    title: "Market Trends: Q4 Investment Outlook",
    excerpt:
      "Explore the latest market trends and investment opportunities for Q4 2024.",
    content: "Full article content here...",
    category: "market",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    author: "James Richardson",
    date: "Dec 15, 2024",
    status: "published",
    readTime: "4 mins",
  },
  {
    id: "2",
    title: "Real Estate Growth: Prime Locations",
    excerpt: "Discover premium real estate investment opportunities in emerging markets.",
    content: "Full article content here...",
    category: "realestate",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    author: "Sarah Mitchell",
    date: "Dec 12, 2024",
    status: "published",
    readTime: "4 mins",
  },
  {
    id: "3",
    title: "Portfolio Management Best Practices",
    excerpt: "Learn how successful investors manage their portfolios effectively.",
    content: "Full article content here...",
    category: "education",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    author: "David Chen",
    date: "Dec 10, 2024",
    status: "published",
    readTime: "4 mins",
  },
];

// Mock Messages Data
export const mockMessages: Message[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1 (212) 555-0100",
    subject: "Investment Inquiry",
    message:
      "I'm interested in learning more about your investment advisory services...",
    date: "Dec 18, 2024",
    status: "unread",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 (212) 555-0101",
    subject: "Real Estate Question",
    message: "Do you have any current real estate projects available?",
    date: "Dec 17, 2024",
    status: "read",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael@example.com",
    phone: "+1 (212) 555-0102",
    subject: "Partnership Opportunity",
    message: "I'd like to discuss a potential partnership with Royal Dansity...",
    date: "Dec 16, 2024",
    status: "resolved",
  },
];

// Mock Carousel Data
export const mockCarouselSlides: CarouselSlide[] = [
  {
    id: "1",
    title: "Building Sustainable Wealth Through Strategic Investments",
    description:
      "Discover expert investment opportunities tailored to your financial goals.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
    buttonText: "Learn More",
    buttonLink: "/about",
    order: 1,
  },
  {
    id: "2",
    title: "Premier Real Estate Investment Opportunities",
    description:
      "Access exclusive real estate developments and investment properties.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
    buttonText: "Explore Properties",
    buttonLink: "/services",
    order: 2,
  },
  {
    id: "3",
    title: "Expert Portfolio Management Solutions",
    description:
      "Let our experienced advisors manage your investment portfolio.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
    buttonText: "Get Started",
    buttonLink: "/contact",
    order: 3,
  },
];

// Mock Admin Users
export const mockAdmins: Record<string, User & { password: string }> = {
  "admin@royaldansity.com": {
    id: "1",
    email: "admin@royaldansity.com",
    name: "Admin User",
    role: "admin",
    status: "active",
    password: "admin123",
    joinDate: "Jan 1, 2024",
  },
  "editor@royaldansity.com": {
    id: "2",
    email: "editor@royaldansity.com",
    name: "Editor User",
    role: "editor",
    status: "active",
    password: "editor123",
    joinDate: "Jan 15, 2024",
  },
};

// Mock Users List
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@royaldansity.com",
    name: "Admin User",
    role: "admin",
    status: "active",
    joinDate: "Jan 1, 2024",
  },
  {
    id: "2",
    email: "editor@royaldansity.com",
    name: "Editor User",
    role: "editor",
    status: "active",
    joinDate: "Jan 15, 2024",
  },
  {
    id: "3",
    email: "john.viewer@royaldansity.com",
    name: "John Viewer",
    role: "viewer",
    status: "active",
    joinDate: "Feb 3, 2024",
  },
  {
    id: "4",
    email: "sarah.editor@royaldansity.com",
    name: "Sarah Editor",
    role: "editor",
    status: "active",
    joinDate: "Feb 10, 2024",
  },
  {
    id: "5",
    email: "michael.viewer@royaldansity.com",
    name: "Michael Viewer",
    role: "viewer",
    status: "inactive",
    joinDate: "Dec 20, 2023",
  },
  {
    id: "6",
    email: "emma.admin@royaldansity.com",
    name: "Emma Admin",
    role: "admin",
    status: "active",
    joinDate: "Jan 8, 2024",
  },
];

// Mock Analytics Data
export const mockAnalytics = {
  totalVisitors: 15234,
  pageViews: 42891,
  avgSessionDuration: "3m 24s",
  bounceRate: "34.2%",
  topPages: [
    { path: "/", views: 5234, visitors: 4123 },
    { path: "/about", views: 3421, visitors: 2890 },
    { path: "/services", views: 2987, visitors: 2345 },
    { path: "/news", views: 2654, visitors: 1987 },
    { path: "/contact", views: 1543, visitors: 1234 },
  ],
  trafficTrend: [
    { date: "Dec 1", visitors: 1200 },
    { date: "Dec 2", visitors: 1900 },
    { date: "Dec 3", visitors: 1400 },
    { date: "Dec 4", visitors: 2200 },
    { date: "Dec 5", visitors: 1800 },
    { date: "Dec 6", visitors: 2500 },
    { date: "Dec 7", visitors: 2100 },
  ],
};

// Mock Activities Data
export const mockActivities: Activity[] = [
  {
    id: "1",
    type: "news_add",
    actor: "admin@royaldansity.com",
    description: "Published new article 'Market Trends: Q4 Investment Outlook'",
    timestamp: "2024-12-18T10:42:00Z",
    icon: "📰",
  },
  {
    id: "2",
    type: "carousel_edit",
    actor: "editor@royaldansity.com",
    description: "Updated carousel slide 'Building Sustainable Wealth'",
    timestamp: "2024-12-17T15:30:00Z",
    icon: "🎠",
  },
  {
    id: "3",
    type: "message_reply",
    actor: "admin@royaldansity.com",
    description: "Replied to message from Michael (michael@example.com)",
    timestamp: "2024-12-17T14:15:00Z",
    icon: "✉️",
  },
  {
    id: "4",
    type: "carousel_add",
    actor: "editor@royaldansity.com",
    description: "Created new carousel slide 'Real Estate Growth'",
    timestamp: "2024-12-16T09:20:00Z",
    icon: "🎠",
  },
  {
    id: "5",
    type: "news_edit",
    actor: "editor@royaldansity.com",
    description: "Updated article 'Real Estate Growth: Prime Locations'",
    timestamp: "2024-12-15T11:45:00Z",
    icon: "📰",
  },
  {
    id: "6",
    type: "user_register",
    actor: "system",
    description: "New user registered: John Smith (john@example.com)",
    timestamp: "2024-12-14T08:30:00Z",
    icon: "👤",
  },
];
