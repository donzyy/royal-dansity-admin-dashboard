import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import AdminLayout from "@/dashboard/components/AdminLayout";
import DashboardNotFound from "@/dashboard/components/DashboardNotFound";

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

export default function AdminCarouselDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [slide, setSlide] = useState<CarouselSlide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSlide();
    }
  }, [id]);

  const fetchSlide = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/carousel/${id}`);

      if (response.data.success) {
        setSlide(response.data.data.slide);
      }
    } catch (err: any) {
      console.error('Error fetching slide:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!slide) return;

    const result = await Swal.fire({
      title: 'Delete Carousel Slide?',
      html: `Are you sure you want to delete <strong>${slide.title}</strong>?<br><br><span style="color: #DC2626;">⚠️ This action cannot be undone!</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/carousel/${slide._id}`);

        Swal.fire({
          title: 'Deleted!',
          text: `Slide "${slide.title}" has been deleted.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });

        setTimeout(() => navigate('/admin/carousel'), 500);
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-royal-gold mb-4"></div>
            <p className="text-gray-600 text-lg">Loading slide...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !slide) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <DashboardNotFound
            title="Carousel Slide Not Found"
            message="The slide you're looking for doesn't exist or may have been deleted."
            backButtonText="Back to Carousel"
            backButtonPath="/admin/carousel"
            icon="🎠"
          />
        </div>
      </AdminLayout>
    );
  }

  const imageUrl = slide.image.startsWith('http')
    ? slide.image
    : `${API_URL}${slide.image}`;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-royal-black mb-2">
              Carousel Slide Preview
            </h1>
            <p className="text-gray-600">Preview how this slide will appear on the homepage</p>
          </div>
          <button
            onClick={() => navigate('/admin/carousel')}
            className="text-royal-gold hover:text-yellow-600 font-bold transition-colors"
          >
            ← Back to Carousel
          </button>
        </div>

        {/* Slide Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200"
        >
          {/* Hero Preview */}
          <div className="relative h-[500px] bg-gradient-to-br from-gray-900 to-gray-700">
            <img
              src={imageUrl}
              alt={slide.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
              <div className="container mx-auto px-8">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-2xl text-white"
                >
                  <h2 className="text-5xl font-bold mb-4">{slide.title}</h2>
                  {slide.subtitle && (
                    <p className="text-2xl mb-4 text-yellow-400">{slide.subtitle}</p>
                  )}
                  {slide.description && (
                    <p className="text-lg mb-6 text-gray-200">{slide.description}</p>
                  )}
                  {slide.buttonText && slide.buttonLink && (
                    <button className="bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300">
                      {slide.buttonText}
                    </button>
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Slide Details */}
          <div className="p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-royal-black mb-6">Slide Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Title</p>
                  <p className="text-lg text-royal-black">{slide.title}</p>
                </div>
                {slide.subtitle && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Subtitle</p>
                    <p className="text-lg text-royal-black">{slide.subtitle}</p>
                  </div>
                )}
                {slide.description && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Description</p>
                    <p className="text-lg text-royal-black">{slide.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Display Order</p>
                  <p className="text-lg text-royal-black">{slide.order}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      slide.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {slide.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {slide.buttonText && (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Button Text</p>
                      <p className="text-lg text-royal-black">{slide.buttonText}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Button Link</p>
                      <p className="text-lg text-blue-600">{slide.buttonLink || 'N/A'}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Created</p>
                  <p className="text-lg text-royal-black">
                    {new Date(slide.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Last Updated</p>
                  <p className="text-lg text-royal-black">
                    {new Date(slide.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                onClick={() => navigate(`/admin/carousel/edit/${slide._id}`)}
                className="bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Slide
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Slide
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}


