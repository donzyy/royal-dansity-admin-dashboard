import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "@/lib/axios";
import AdminLayout from "@/dashboard/components/AdminLayout";
import DashboardNotFound from "@/dashboard/components/DashboardNotFound";
import toast from "react-hot-toast";

export default function AdminCarouselEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const isCreateMode = id === 'create' || !id;
  
  const [loading, setLoading] = useState(!isCreateMode);
  const [error, setError] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    buttonText: '',
    buttonLink: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    if (!isCreateMode && id) {
      fetchSlide();
    }
  }, [id, isCreateMode]);

  const fetchSlide = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/carousel/${id}`);
      
      if (response.data.success) {
        const slide = response.data.data.slide;
        
        setFormData({
          title: slide.title || '',
          subtitle: slide.subtitle || '',
          description: slide.description || '',
          image: slide.image || '',
          buttonText: slide.buttonText || '',
          buttonLink: slide.buttonLink || '',
          order: slide.order || 0,
          isActive: slide.isActive !== undefined ? slide.isActive : true,
        });

        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        
        // Set image preview
        const imagePreviewUrl = slide.image 
          ? (slide.image.startsWith('http') ? slide.image : `${API_BASE}${slide.image}`)
          : "";
        setImagePreview(imagePreviewUrl);
      }
    } catch (err: any) {
      console.error('Error fetching slide:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to server
        const token = localStorage.getItem('accessToken');
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        uploadFormData.append('uploadType', 'carousel');

        const response = await axios.post('/upload/image', uploadFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          setFormData((prev) => ({
            ...prev,
            image: response.data.data.path,
          }));
          toast.success('Image uploaded successfully!');
        }
      } catch (error: any) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('accessToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      // Prepare data with proper types
      const dataToSend = {
        ...formData,
        order: Number(formData.order),
      };

      if (isCreateMode) {
        const response = await axios.post('/carousel', dataToSend, config);
        if (response.data.success) {
          toast.success('Carousel slide created successfully!');
          setTimeout(() => navigate('/admin/carousel'), 500);
        }
      } else {
        const response = await axios.put(`/carousel/${id}`, dataToSend, config);
        if (response.data.success) {
          toast.success('Carousel slide updated successfully!');
          setTimeout(() => navigate(`/admin/carousel/${id}`), 500);
        }
      }
    } catch (error: any) {
      console.error('Error saving slide:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to save slide');
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

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <DashboardNotFound
            title="Carousel Slide Not Found"
            message="The slide you're trying to edit doesn't exist or may have been deleted."
            backButtonText="Back to Carousel"
            backButtonPath="/admin/carousel"
            icon="🎠"
          />
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
              {isCreateMode ? 'Create New Carousel Slide' : 'Edit Carousel Slide'}
            </h1>
            <p className="text-gray-600">
              {isCreateMode ? 'Create a new slide for the homepage carousel' : 'Update slide information'}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/carousel')}
            className="text-royal-gold hover:text-yellow-600 font-bold transition-colors"
          >
            ← Back to Carousel
          </button>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Slide Content */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-royal-black">
                Slide Content
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    placeholder="e.g., Welcome to Royal Dansity"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    placeholder="e.g., Your trusted investment partner"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none resize-none"
                    placeholder="Brief description of this slide"
                  />
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-2xl font-bold text-royal-black">
                Featured Image
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex-1 relative cursor-pointer">
                    <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-royal-gold transition-colors text-center">
                      <p className="text-gray-600 font-semibold">📤 Upload Image</p>
                      <p className="text-xs text-gray-500">or drag and drop</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {imagePreview && (
                  <div className="flex items-start gap-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 mb-2">
                        Preview
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setFormData((prev) => ({ ...prev, image: "" }));
                        }}
                        className="text-sm text-red-600 hover:text-red-800 font-semibold"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Button Settings */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-2xl font-bold text-royal-black">Call-to-Action Button</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    placeholder="e.g., Learn More"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Button Link
                  </label>
                  <input
                    type="text"
                    name="buttonLink"
                    value={formData.buttonLink}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    placeholder="e.g., /services or https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Slide Settings */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-2xl font-bold text-royal-black">Slide Settings</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="order" className="block text-sm font-semibold text-royal-black mb-2">
                    Display Order
                  </label>
                  <input
                    id="order"
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min={0}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    aria-label="Display order"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Lower numbers appear first (0 = first slide)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Status
                  </label>
                  <label htmlFor="isActive" className="flex items-center gap-3 cursor-pointer mt-3">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                      className="w-5 h-5 text-royal-gold focus:ring-royal-gold rounded"
                      aria-label="Slide active status"
                    />
                    <span className="text-sm font-semibold text-gray-700">Active (visible on homepage)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 border-t pt-6">
              <button
                type="submit"
                className="bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
              >
                💾 {isCreateMode ? 'Create Slide' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/carousel')}
                className="bg-gray-300 hover:bg-gray-400 text-royal-black font-bold py-3 px-8 rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

