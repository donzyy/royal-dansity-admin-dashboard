import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import AdminLayout from "@/dashboard/components/AdminLayout";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface CarouselSlide {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminCarousel() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [socket, setSocket] = useState<Socket | null>(null);

  // Socket.IO setup
  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('carousel:created', (data: CarouselSlide) => {
      console.log('Carousel slide created:', data);
      fetchSlides();
      toast.success('New carousel slide created!');
    });

    newSocket.on('carousel:updated', (data: CarouselSlide) => {
      console.log('Carousel slide updated:', data);
      setSlides(prev => prev.map(slide =>
        slide._id === data._id ? data : slide
      ));
      toast.success('Carousel slide updated!');
    });

    newSocket.on('carousel:deleted', (data: string) => {
      console.log('Carousel slide deleted:', data);
      setSlides(prev => prev.filter(slide => slide._id !== data));
      toast.success('Carousel slide deleted!');
    });

    newSocket.on('carousel:reordered', (data: CarouselSlide[]) => {
      console.log('Carousel slides reordered:', data);
      setSlides(data);
      toast.success('Slide order updated!');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [currentPage, filterStatus, searchTerm]);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const params: any = {};

      if (filterStatus !== 'all') {
        params.isActive = filterStatus === 'active';
      }

      const response = await axios.get(`${API_URL}/api/carousel`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (response.data.success) {
        let fetchedSlides = response.data.data;
        
        // Client-side search
        if (searchTerm) {
          fetchedSlides = fetchedSlides.filter((slide: CarouselSlide) =>
            slide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slide.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slide.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slide.buttonText?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        // Client-side pagination
        const total = fetchedSlides.length;
        const pages = Math.ceil(total / 10);
        const start = (currentPage - 1) * 10;
        const paginatedSlides = fetchedSlides.slice(start, start + 10);

        setSlides(paginatedSlides);
        setPagination({
          page: currentPage,
          limit: 10,
          total: total,
          pages: pages,
        });
      }
    } catch (error) {
      console.error('Error fetching carousel slides:', error);
      toast.error('Failed to fetch carousel slides');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSlides();
  };

  const handleReorder = async (slideId: string, direction: 'up' | 'down') => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `${API_URL}/api/carousel/${slideId}/reorder`,
        { direction },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // The socket event will update the slides
        toast.success(`Slide moved ${direction}`);
      }
    } catch (error: any) {
      console.error('Error reordering slide:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to reorder slide');
      }
    }
  };

  const handleDelete = async (slideId: string, slideTitle: string) => {
    const result = await Swal.fire({
      title: 'Delete Carousel Slide?',
      html: `Are you sure you want to delete <strong>${slideTitle}</strong>?<br><br><span style="color: #DC2626;">⚠️ This action cannot be undone!</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`${API_URL}/api/carousel/${slideId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Swal.fire({
          title: 'Deleted!',
          text: `Slide "${slideTitle}" has been deleted.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error: any) {
        console.error('Error deleting slide:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete slide',
          icon: 'error',
        });
      }
    }
  };

  // Stats calculations
  const stats = {
    total: pagination.total,
    active: slides.filter((s) => s.isActive).length,
    inactive: slides.filter((s) => !s.isActive).length,
  };

  // Loading state
  if (loading && slides.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-royal-gold mb-4"></div>
            <p className="text-gray-600 text-lg">Loading carousel slides...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-royal-black mb-2">
              🎠 Carousel Management
            </h1>
            <p className="text-gray-600">Manage homepage carousel slides</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/carousel/create')}
            className="bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Slide
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Total Slides</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Inactive</p>
            <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Slides
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by title, subtitle, description..."
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none transition-colors"
                />
                <button
                  onClick={handleSearch}
                  className="bg-royal-gold hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Carousel Slides Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-royal-gold/10 to-yellow-100 border-b-2 border-royal-gold">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <span className="font-bold text-royal-black">Order</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="font-bold text-royal-black">Slide</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="font-bold text-royal-black">Status</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="font-bold text-royal-black">Button</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="font-bold text-royal-black">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {slides.map((slide) => (
                    <motion.tr
                      key={slide._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-600">{slide.order}</span>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleReorder(slide._id, 'up')}
                              className="p-1 text-gray-600 hover:text-royal-gold hover:bg-yellow-50 rounded transition-colors"
                              title="Move Up"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleReorder(slide._id, 'down')}
                              className="p-1 text-gray-600 hover:text-royal-gold hover:bg-yellow-50 rounded transition-colors"
                              title="Move Down"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              slide.image.startsWith('http')
                                ? slide.image
                                : `${API_URL}${slide.image}`
                            }
                            alt={slide.title}
                            className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <div>
                            <p className="font-semibold text-royal-black">{slide.title}</p>
                            {slide.subtitle && (
                              <p className="text-sm text-gray-600">{slide.subtitle}</p>
                            )}
                            {slide.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {slide.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-semibold ${
                            slide.isActive ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {slide.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {slide.buttonText && slide.buttonLink ? (
                          <div>
                            <p className="text-sm font-semibold text-royal-black">
                              {slide.buttonText}
                            </p>
                            <p className="text-xs text-gray-500">{slide.buttonLink}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No button</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/carousel/${slide._id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => navigate(`/admin/carousel/edit/${slide._id}`)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(slide._id, slide.title)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {slides.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎠</div>
              <p className="text-gray-600 font-semibold text-lg mb-2">No carousel slides found</p>
              <p className="text-gray-500 mb-6">
                {filterStatus !== 'all'
                  ? 'Try adjusting your filter'
                  : 'Create your first carousel slide to get started'}
              </p>
              {filterStatus === 'all' && (
                <button
                  onClick={() => navigate('/admin/carousel/create')}
                  className="bg-royal-gold hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
                >
                  Create First Slide
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {slides.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total slides)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold hover:border-royal-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === pagination.pages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${
                          currentPage === page
                            ? 'bg-royal-gold text-white border-royal-gold'
                            : 'border-gray-200 hover:border-royal-gold'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 py-2">...</span>;
                  }
                  return null;
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                  disabled={currentPage === pagination.pages}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold hover:border-royal-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
