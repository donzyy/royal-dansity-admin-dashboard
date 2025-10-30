import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "@/lib/axios";
import AdminLayout from "@/dashboard/components/AdminLayout";
import DashboardNotFound from "@/dashboard/components/DashboardNotFound";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdminCategoryEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const isCreateMode = id === 'create' || !id;
  
  const [loading, setLoading] = useState(!isCreateMode);
  const [error, setError] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'article' as 'article' | 'carousel' | 'general',
    color: '#D4AF37',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    if (!isCreateMode && id) {
      fetchCategory();
    }
  }, [id, isCreateMode]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/categories/${id}`);
      
      if (response.data.success) {
        const category = response.data.data.category;
        setFormData({
          name: category.name || '',
          description: category.description || '',
          type: category.type || 'article',
          color: category.color || '#D4AF37',
          isActive: category.isActive !== undefined ? category.isActive : true,
          order: category.order || 0,
        });
      }
    } catch (err: any) {
      console.error('Error fetching category:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('accessToken');
      const config = {} as const;

      // Prepare data with proper types
      const dataToSend = {
        ...formData,
        order: Number(formData.order), // Convert string to number
      };

      if (isCreateMode) {
        const response = await axios.post(`/categories`, dataToSend, config);
        if (response.data.success) {
          toast.success('Category created successfully!');
          setTimeout(() => navigate('/admin/categories'), 500);
        }
      } else {
        const response = await axios.put(`/categories/${id}`, dataToSend, config);
        if (response.data.success) {
          toast.success('Category updated successfully!');
          setTimeout(() => navigate('/admin/categories'), 500);
        }
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to save category');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-royal-gold mb-4"></div>
            <p className="text-gray-600 text-lg">Loading category...</p>
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
            title="Category Not Found"
            message="The category you're trying to edit doesn't exist or may have been deleted."
            backButtonText="Back to Categories"
            backButtonPath="/admin/categories"
            icon="🏷️"
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
              {isCreateMode ? 'Create New Category' : 'Edit Category'}
            </h1>
            <p className="text-gray-600">
              {isCreateMode ? 'Create a new category for your content' : 'Update category information'}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/categories')}
            className="text-royal-gold hover:text-yellow-600 font-bold transition-colors"
          >
            ← Back to Categories
          </button>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-royal-black">
                Basic Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Category Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    placeholder="e.g., Market Analysis"
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-semibold text-royal-black mb-2">
                    Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                  >
                    <option value="article">Article</option>
                    <option value="carousel">Carousel</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="order" className="block text-sm font-semibold text-royal-black mb-2">
                    Order
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
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-royal-black mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none resize-none"
                  placeholder="Brief description of this category"
                />
              </div>
            </div>

            {/* Appearance */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-2xl font-bold text-royal-black">Appearance</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="color" className="block text-sm font-semibold text-royal-black mb-2">
                    Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      id="colorPicker"
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-20 h-12 border-2 border-gray-200 rounded-lg cursor-pointer"
                      aria-label="Color picker"
                    />
                    <input
                      id="color"
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                      placeholder="#D4AF37"
                      aria-label="Color hex code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Status
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer mt-3">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                      className="w-5 h-5 text-royal-gold focus:ring-royal-gold rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Active</span>
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
                💾 {isCreateMode ? 'Create Category' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/categories')}
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

