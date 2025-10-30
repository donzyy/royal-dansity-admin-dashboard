import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import axios from "@/lib/axios";
import { io } from "socket.io-client";

interface CarouselSlide {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonLink?: string;  // Changed from 'link' to 'buttonLink'
  buttonText?: string;
  order: number;
  isActive: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Fallback slides in case API fails
const fallbackSlides: CarouselSlide[] = [
  {
    _id: '1',
    title: "Building Sustainable Wealth Through Strategic Investments",
    description:
      "Discover expert investment opportunities tailored to your financial goals. Our team guides you toward long-term prosperity.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
    buttonText: "Learn More",
    buttonLink: "/about",
    order: 1,
    isActive: true,
  },
  {
    _id: '2',
    title: "Premier Real Estate Investment Opportunities",
    description:
      "Access exclusive real estate developments and investment properties that generate consistent returns.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
    buttonText: "Explore Properties",
    buttonLink: "/services",
    order: 2,
    isActive: true,
  },
  {
    _id: '3',
    title: "Expert Portfolio Management Solutions",
    description:
      "Let our experienced advisors manage your investment portfolio with precision and care.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
    buttonText: "Get Started",
    buttonLink: "/contact",
    order: 3,
    isActive: true,
  },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState<CarouselSlide[]>(fallbackSlides);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch carousel slides from API
    const fetchSlides = async () => {
      try {
        const response = await axios.get(`/carousel`);
        if (response.data.success && response.data.data.length > 0) {
          // Filter active slides and sort by order
          const activeSlides = response.data.data
            .filter((slide: CarouselSlide) => slide.isActive)
            .sort((a: CarouselSlide, b: CarouselSlide) => a.order - b.order);
          
          if (activeSlides.length > 0) {
            setSlides(activeSlides);
          }
        }
      } catch (error) {
        console.error('Error fetching carousel slides:', error);
        // Keep fallback slides on error
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();

    // Set up Socket.IO for real-time updates
    const socket = io(import.meta.env.VITE_SOCKET_URL || API_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    // Listen for carousel updates
    socket.on('carousel:updated', (updatedSlide: CarouselSlide) => {
      console.log('✏️ Carousel slide updated event received:', updatedSlide);
      setSlides((prevSlides) => {
        const index = prevSlides.findIndex(slide => slide._id === updatedSlide._id);
        if (index !== -1) {
          const newSlides = [...prevSlides];
          newSlides[index] = updatedSlide;
          return newSlides.filter(s => s.isActive).sort((a, b) => a.order - b.order);
        }
        return prevSlides;
      });
    });

    socket.on('carousel:created', (newSlide: CarouselSlide) => {
      console.log('➕ Carousel slide created event received:', newSlide);
      if (newSlide.isActive) {
        setSlides((prevSlides) => 
          [...prevSlides, newSlide].sort((a, b) => a.order - b.order)
        );
      }
    });

    socket.on('carousel:deleted', (slideId: string) => {
      console.log('🗑️ Carousel slide deleted event received:', slideId);
      setSlides((prevSlides) => {
        console.log('Current slides before delete:', prevSlides.map(s => s._id));
        const newSlides = prevSlides.filter(slide => slide._id !== slideId);
        console.log('Slides after delete:', newSlides.map(s => s._id));
        return newSlides;
      });
    });

    socket.on('carousel:reordered', (allSlides: CarouselSlide[]) => {
      console.log('🔄 Carousel slides reordered event received');
      // Update with all slides, filtering for active and sorting
      const activeSlides = allSlides
        .filter((slide: CarouselSlide) => slide.isActive)
        .sort((a: CarouselSlide, b: CarouselSlide) => a.order - b.order);
      setSlides(activeSlides);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  return (
    <div className="relative w-full h-screen">
      <Swiper
        key={slides.map(s => s._id).join(',')} // Force re-render when slides change
        modules={[Autoplay, Navigation]}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        navigation={{
          nextEl: ".hero-swiper-button-next",
          prevEl: ".hero-swiper-button-prev",
        }}
        loop={slides.length > 1} // Only loop if more than 1 slide
        className="w-full h-full"
      >
        {slides.map((slide) => {
          // Handle both absolute URLs (http/https) and relative paths (local uploads)
          let imageUrl: string;
          
          if (slide.image.startsWith('http://') || slide.image.startsWith('https://')) {
            // External URL - use as is
            imageUrl = slide.image;
          } else if (slide.image.startsWith('/uploads/')) {
            // Local upload - prepend API_URL
            imageUrl = `${API_URL}${slide.image}`;
          } else if (slide.image.startsWith('/')) {
            // Other absolute path - use as is (might be a public asset)
            imageUrl = slide.image;
          } else {
            // Relative path - prepend API_URL and /
            imageUrl = `${API_URL}/${slide.image}`;
          }

          return (
          <SwiperSlide key={slide._id} className="relative w-full h-full">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${imageUrl})`,
              }}
            >
              <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center text-white max-w-3xl px-6 md:px-12">
                {slide.subtitle && (
                  <p className="text-lg md:text-xl mb-4 opacity-80 font-light">
                    {slide.subtitle}
                  </p>
                )}
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  {slide.title}
                </h1>
                {slide.description && (
                  <p className="text-lg md:text-xl mb-8 opacity-90">
                    {slide.description}
                  </p>
                )}
                {slide.buttonLink && slide.buttonText && (
                  <a
                    href={slide.buttonLink}
                    className="inline-block bg-royal-gold hover:bg-yellow-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {slide.buttonText}
                  </a>
                )}
                {!slide.buttonLink && slide.buttonText && (
                  <button
                    className="inline-block bg-royal-gold hover:bg-yellow-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {slide.buttonText}
                  </button>
                )}
              </div>
            </div>
          </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Navigation Buttons */}
      <button 
        className="hero-swiper-button-prev hidden lg:block absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all duration-300"
        aria-label="Previous slide"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button 
        className="hero-swiper-button-next hidden lg:block absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all duration-300"
        aria-label="Next slide"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
