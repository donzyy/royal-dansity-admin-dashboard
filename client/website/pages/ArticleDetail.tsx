import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "@/lib/axios";
import Header from "@/website/components/Header";
import Footer from "@/website/components/Footer";
import BackToTop from "@/website/components/BackToTop";

interface Article {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  slug: string;
  category: string;
  readTime: string;
  publishedAt?: string;
  createdAt: string;
  authorName: string;
  tags?: string[];
  additionalImages?: string[];
  videoUrl?: string;
  views: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Fetch article by slug
        const response = await axios.get(`/articles/slug/${slug}`);
        
        if (response.data.success) {
          setArticle(response.data.data.article);
          
          // Fetch related articles in the same category
          const relatedResponse = await axios.get(`/articles`, {
            params: {
              category: response.data.data.article.category,
              status: 'published',
              limit: 4,
            },
          });
          
          if (relatedResponse.data.success) {
            // Filter out the current article from related articles
            const related = relatedResponse.data.data.articles.filter(
              (a: Article) => a._id !== response.data.data.article._id
            ).slice(0, 3);
            setRelatedArticles(related);
          }
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  // Fallback old articles for demo purposes
  const oldArticles: Record<string, any> = {
    "1": {
      id: 1,
      title: "Market Trends: Q4 Investment Outlook",
      category: "market",
      date: "Dec 15, 2024",
      author: "James Richardson",
      role: "Chief Investment Officer",
      readTime: "4 mins",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
      content: `
        <h2>Understanding Q4 Market Dynamics</h2>
        <p>As we approach the final quarter of 2024, market dynamics continue to shift in response to global economic conditions. Investment opportunities abound for those who understand the landscape and position themselves strategically.</p>

        <h2>Key Market Trends</h2>
        <p>The fourth quarter has historically presented unique challenges and opportunities for investors. This year is no exception, with several critical trends shaping the investment landscape:</p>

        <h3>Rising Interest Rates and Fixed Income</h3>
        <p>The Federal Reserve's policy decisions continue to reverberate through financial markets. For investors, this means higher yields on bonds and fixed-income securities, making a balanced portfolio increasingly attractive.</p>

        <h3>Technology Sector Evolution</h3>
        <p>Tech stocks continue to evolve, with artificial intelligence and machine learning driving innovation. Companies investing in these technologies are positioning themselves for long-term growth, creating compelling investment opportunities for forward-thinking investors.</p>

        <h2>Portfolio Diversification Strategies</h2>
        <p>In uncertain times, diversification remains a cornerstone of successful investing. Our analysis suggests that a well-balanced portfolio across different asset classes, geographies, and sectors can help mitigate risk while capturing growth opportunities.</p>

        <p>Consider allocating portions of your portfolio to:</p>
        <ul>
          <li>Emerging markets with strong growth potential</li>
          <li>Real estate investment trusts (REITs) offering stable income</li>
          <li>Technology and innovation-focused companies</li>
          <li>Traditional blue-chip companies with dividend histories</li>
        </ul>

        <h2>Emerging Market Opportunities</h2>
        <p>While developed markets offer stability, emerging markets present compelling growth opportunities. Asian markets, in particular, are experiencing robust economic growth with expanding middle-class consumer bases driving demand.</p>

        <h2>The Importance of Long-Term Vision</h2>
        <p>Market volatility can be unsettling, but it's important to remember that successful investing is a long-term endeavor. Those who maintain discipline and stick to their investment strategy tend to achieve superior returns over time.</p>

        <h2>Looking Ahead</h2>
        <p>As we enter Q4 2024, maintaining a strategic perspective is crucial. By understanding market trends, diversifying appropriately, and staying focused on long-term goals, investors can navigate uncertainty and position themselves for sustainable wealth accumulation.</p>

        <p>If you'd like to discuss your portfolio strategy for the upcoming quarter, our team of investment advisors is here to help.</p>
      `,
    },
    "2": {
      id: 2,
      title: "Real Estate Growth: Prime Locations",
      category: "realestate",
      date: "Dec 12, 2024",
      author: "Sarah Mitchell",
      role: "Head of Real Estate",
      readTime: "4 mins",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
      content: `
        <h2>The Real Estate Investment Landscape in 2024</h2>
        <p>Real estate continues to be one of the most stable and rewarding investment vehicles available to modern investors. In this comprehensive guide, we examine the top emerging markets and prime locations that are poised for significant growth.</p>

        <h2>Strategic Location Selection</h2>
        <p>Successful real estate investing begins with location. The mantra "location, location, location" remains true today. Prime locations are characterized by strong economic fundamentals, population growth, and infrastructure development.</p>

        <h3>Urban Centers with Growth Potential</h3>
        <p>Major metropolitan areas continue to attract investors and residents alike. Cities with diversified economies, strong job markets, and cultural attractions offer reliable returns and long-term appreciation potential.</p>

        <h3>Emerging Suburban Markets</h3>
        <p>As remote work reshapes how people live, emerging suburban markets near major cities are experiencing unprecedented growth. These areas offer more affordable entry points while still benefiting from proximity to urban centers.</p>

        <h2>Investment Property Types</h2>
        <p>Real estate investments take many forms, each with distinct characteristics and return profiles:</p>
        <ul>
          <li><strong>Residential Properties:</strong> Apartments, single-family homes, and multi-unit dwellings provide steady rental income</li>
          <li><strong>Commercial Real Estate:</strong> Office spaces and retail properties offer higher yields for sophisticated investors</li>
          <li><strong>Mixed-Use Developments:</strong> Combining residential, commercial, and entertainment spaces create synergistic value</li>
          <li><strong>Industrial Properties:</strong> Warehouses and logistics facilities benefit from e-commerce growth</li>
        </ul>

        <h2>Market Conditions and Opportunities</h2>
        <p>The current market presents unique opportunities for discerning investors. Interest rate environment, construction costs, and demographic trends all favor strategic real estate investments.</p>

        <h2>Due Diligence in Real Estate Investing</h2>
        <p>Before committing capital to any real estate investment, thorough due diligence is essential. This includes market analysis, property inspection, financial analysis, and understanding local regulations.</p>

        <h2>Building a Real Estate Portfolio</h2>
        <p>Successful real estate investors build diversified portfolios across different property types and geographic markets. This approach reduces risk while capturing growth opportunities across the real estate spectrum.</p>

        <p>Our team has identified several promising real estate opportunities that align with the shifting investment landscape. Contact us to learn more about our real estate investment options.</p>
      `,
    },
    "3": {
      id: 3,
      title: "Portfolio Management Best Practices",
      category: "education",
      date: "Dec 10, 2024",
      author: "David Chen",
      role: "Portfolio Manager",
      readTime: "4 mins",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
      content: `
        <h2>Foundations of Effective Portfolio Management</h2>
        <p>Effective portfolio management is the cornerstone of long-term investing success. Whether you're managing a personal portfolio or overseeing institutional assets, fundamental principles guide the path to financial success.</p>

        <h2>Key Principles of Portfolio Management</h2>
        <p>Successful portfolio managers follow a disciplined approach based on time-tested principles:</p>

        <h3>1. Asset Allocation</h3>
        <p>Determining the right mix of stocks, bonds, real estate, and other assets is crucial. Asset allocation should reflect your risk tolerance, time horizon, and financial goals.</p>

        <h3>2. Diversification</h3>
        <p>Diversification across asset classes, sectors, and geographies reduces risk while maintaining growth potential. A well-diversified portfolio is more resilient to market volatility.</p>

        <h3>3. Regular Rebalancing</h3>
        <p>As markets move, portfolio allocations can drift from target levels. Regular rebalancing helps maintain your intended risk profile and prevents overexposure to any single asset class.</p>

        <h2>Risk Management Strategies</h2>
        <p>Managing risk is as important as pursuing returns. Key risk management strategies include:</p>
        <ul>
          <li>Maintaining adequate emergency reserves</li>
          <li>Using diversification to reduce unsystematic risk</li>
          <li>Hedging strategies for significant positions</li>
          <li>Regular portfolio monitoring and adjustment</li>
        </ul>

        <h2>Performance Monitoring and Evaluation</h2>
        <p>Regular performance review helps ensure your portfolio remains on track to achieve your goals. This includes monitoring returns, comparing against appropriate benchmarks, and assessing whether your strategy remains suitable.</p>

        <h2>The Role of Emotions in Investing</h2>
        <p>One of the biggest challenges in portfolio management is managing emotions. Fear and greed can lead to poor decisions. Successful investors maintain discipline and stick to their long-term strategy even during market volatility.</p>

        <h2>Tax-Efficient Investing</h2>
        <p>Tax efficiency is often overlooked but can significantly impact long-term returns. Strategies include tax-loss harvesting, placing tax-inefficient investments in tax-advantaged accounts, and timing security sales strategically.</p>

        <h2>Working with a Professional Portfolio Manager</h2>
        <p>Many investors benefit from working with professional portfolio managers who can provide expertise, discipline, and emotional detachment from market fluctuations. Our portfolio managers have decades of combined experience managing diverse client portfolios.</p>

        <p>Ready to optimize your portfolio management approach? Contact us today for a consultation.</p>
      `,
    },
    "4": {
      id: 4,
      title: "Global Investment Opportunities",
      category: "market",
      date: "Dec 8, 2024",
      author: "James Richardson",
      role: "Chief Investment Officer",
      readTime: "4 mins",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
      content: `
        <h2>The Case for Global Diversification</h2>
        <p>In an increasingly interconnected world, global diversification has become more important than ever. Investors who limit themselves to domestic markets miss significant opportunities for growth and risk reduction.</p>

        <h2>Emerging Markets: Growth Engines of the Future</h2>
        <p>Emerging market economies are growing faster than developed economies, driven by industrialization, urbanization, and expanding middle classes. These markets offer compelling opportunities for long-term investors.</p>

        <h3>Asia-Pacific Region</h3>
        <p>The Asia-Pacific region represents the future of global economic growth. With over 60% of the world's population and rapidly rising incomes, this region offers unprecedented investment opportunities.</p>

        <h3>Latin America</h3>
        <p>Latin America combines natural resources, developing infrastructure, and growing consumer markets. Countries in this region are positioning themselves as key players in global trade.</p>

        <h3>Africa: The Frontier Market</h3>
        <p>Africa's young, growing population and abundant natural resources make it one of the most exciting investment frontiers. While higher risk, the potential returns are substantial for patient investors.</p>

        <h2>Developed Market Opportunities</h2>
        <p>While emerging markets get attention, developed markets still offer valuable opportunities, particularly in technology, healthcare, and renewable energy sectors.</p>

        <h2>Currency Considerations</h2>
        <p>When investing globally, currency fluctuations can significantly impact returns. Investors must consider currency hedging strategies to protect against unfavorable exchange rate movements.</p>

        <h2>Geopolitical Risks</h2>
        <p>Global investing requires understanding geopolitical risks. Trade policies, political stability, and regulatory environments vary significantly across countries and can impact investment returns.</p>

        <h2>Building a Global Portfolio</h2>
        <p>A well-constructed global portfolio balances opportunities across developed and emerging markets, different sectors, and different asset classes. This diversification provides both growth and stability.</p>

        <h2>The Future of Global Investing</h2>
        <p>As globalization continues to evolve, opportunities for international investors will expand. Those who position themselves to capitalize on global trends will benefit substantially.</p>

        <p>Our global investment team has identified compelling opportunities across multiple regions and asset classes. Let's discuss how to incorporate global investments into your portfolio.</p>
      `,
    },
  };

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const extractVideoId = (url: string): { id: string; type: "youtube" | "vimeo" } | null => {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return { id: youtubeMatch[1], type: "youtube" };
    }

    // Vimeo
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return { id: vimeoMatch[1], type: "vimeo" };
    }

    return null;
  };

  // Share functionality
  const getArticleUrl = () => {
    return window.location.href;
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'linkedin' | 'copy') => {
    const url = getArticleUrl();
    const title = article?.title || '';
    const text = article?.excerpt || '';

    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        });
        break;
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <Header />
        <div className="pt-40 pb-20">
          <div className="container mx-auto px-6 md:px-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-royal-gold"></div>
            <p className="mt-6 text-gray-600">Loading article...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="w-full">
        <Header />
        <div className="pt-40 pb-20">
          <div className="container mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold text-royal-black mb-4">Article Not Found</h1>
              <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
              <Link
                to="/news"
                className="inline-block bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
              >
                Back to News
              </Link>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Header />

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-96 md:h-[500px] w-full overflow-hidden mt-24"
      >
        <img
          src={article.image.startsWith('http') ? article.image : `${API_URL}${article.image}`}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-6 md:px-12 max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4"
            >
              <span className="inline-block bg-royal-gold/90 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {article.category}
              </span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold leading-tight mb-4"
            >
              {article.title}
            </motion.h1>
          </div>
        </div>
      </motion.div>

      {/* Article Content */}
      <div className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="md:col-span-2">
              {/* Article Meta */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b-2 border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal-gold to-royal-copper flex items-center justify-center text-white font-bold">
                    {article.authorName?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "RD"}
                  </div>
                  <div>
                    <p className="font-semibold text-royal-black">{article.authorName || "Royal Dansity"}</p>
                    <p className="text-sm text-gray-500">Author</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                  <span>•</span>
                  <span>{article.views} views</span>
                </div>
              </motion.div>

              {/* Article Body */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="prose prose-lg max-w-none mb-12"
              >
                <div
                  dangerouslySetInnerHTML={{ __html: article.content }}
                  className="text-gray-700 space-y-6"
                  style={{
                    "--tw-prose-body": "rgb(75, 85, 99)",
                    "--tw-prose-headings": "rgb(28, 36, 52)",
                  } as React.CSSProperties}
                />
              </motion.div>

              {/* Custom styling for article content */}
              <style>{`
                .prose h2 {
                  font-size: 1.875rem;
                  font-weight: 700;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  color: #1c2434;
                }

                .prose h3 {
                  font-size: 1.375rem;
                  font-weight: 600;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                  color: #1c2434;
                }

                .prose p {
                  margin-bottom: 1rem;
                  line-height: 1.75;
                }

                .prose ul {
                  margin-left: 1.5rem;
                  margin-bottom: 1rem;
                }

                .prose li {
                  margin-bottom: 0.5rem;
                }

                .prose strong {
                  font-weight: 600;
                  color: #1c2434;
                }
              `}</style>

              {/* Embedded Video */}
              {article.videoUrl && (() => {
                const videoInfo = extractVideoId(article.videoUrl);
                if (!videoInfo) return null;

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mb-12"
                  >
                    <h2 className="text-2xl font-bold text-royal-black mb-6">
                      Featured Video
                    </h2>
                    <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-900 aspect-video">
                      {videoInfo.type === "youtube" && (
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${videoInfo.id}`}
                          title="Featured Video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      )}
                      {videoInfo.type === "vimeo" && (
                        <iframe
                          className="w-full h-full"
                          src={`https://player.vimeo.com/video/${videoInfo.id}`}
                          title="Featured Video"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      )}
                    </div>
                  </motion.div>
                );
              })()}

              {/* Additional Images Gallery */}
              {article.additionalImages &&
                article.additionalImages.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="mb-12"
                  >
                    <h2 className="text-2xl font-bold text-royal-black mb-6">
                      Image Gallery
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {article.additionalImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                          <img
                            src={imgUrl.startsWith('http') ? imgUrl : `${API_URL}${imgUrl}`}
                            alt={`Gallery image ${idx + 1}`}
                            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              {/* Share Section */}
              <div className="bg-royal-container rounded-2xl p-8 mb-8">
                <h3 className="text-lg font-bold text-royal-black mb-4">Share This Article</h3>
                <div className="flex flex-wrap gap-3">
                  {/* Facebook */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare('facebook')}
                    className="flex items-center gap-2 bg-[#1877F2] text-white px-5 py-3 rounded-lg hover:bg-[#0d65d9] transition-all duration-300 shadow-md"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </motion.button>

                  {/* Twitter/X */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare('twitter')}
                    className="flex items-center gap-2 bg-[#000000] text-white px-5 py-3 rounded-lg hover:bg-[#333333] transition-all duration-300 shadow-md"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Twitter
                  </motion.button>

                  {/* LinkedIn */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center gap-2 bg-[#0A66C2] text-white px-5 py-3 rounded-lg hover:bg-[#004182] transition-all duration-300 shadow-md"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </motion.button>

                  {/* Copy Link */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare('copy')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-lg transition-all duration-300 shadow-md ${
                      copySuccess
                        ? 'bg-green-500 text-white'
                        : 'bg-white border-2 border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-white'
                    }`}
                  >
                    {copySuccess ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Link
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-royal-gold to-royal-purple rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
                <p className="mb-6 opacity-90">
                  Discuss your investment goals with our expert advisors.
                </p>
                <Link
                  to="/contact"
                  className="inline-block bg-white text-royal-purple font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                  Schedule a Consultation
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* Related Articles */}
              <div className="bg-royal-container rounded-2xl p-8 sticky top-24">
                <h3 className="text-xl font-bold text-royal-black mb-6">Related Articles</h3>
                <div className="space-y-6">
                  {relatedArticles.length > 0 ? (
                    relatedArticles.map((relatedArticle) => (
                      <Link
                        key={relatedArticle._id}
                        to={`/article/${relatedArticle.slug}`}
                        className="block group hover:opacity-80 transition-opacity"
                      >
                        <h4 className="font-semibold text-royal-black mb-2 group-hover:text-royal-gold transition-colors line-clamp-2">
                          {relatedArticle.title}
                        </h4>
                        <p className="text-sm text-gray-600">{formatDate(relatedArticle.publishedAt || relatedArticle.createdAt)}</p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-600">No related articles found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
}
