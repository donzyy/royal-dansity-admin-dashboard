import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "@/lib/axios";
import AdminLayout from "@/dashboard/components/AdminLayout";
import DashboardNotFound from "@/dashboard/components/DashboardNotFound";
import { toast } from "sonner";

export default function AdminNewsEdit() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Check if we're in create mode
  const isCreateMode = id === 'create' || !id;
  
  const [loading, setLoading] = useState(!isCreateMode);
  const [error, setError] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(isCreateMode ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" : "");
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingAdditionalFiles, setPendingAdditionalFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([]);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    author: "",
    readTime: "5 min read",
    status: "draft" as const,
    additionalImages: [] as string[],
    videoUrl: "",
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories', {
          params: { type: 'article', isActive: true },
        });
        if (response.data.success) {
          setCategories(response.data.data.categories);
          // Set first category as default if in create mode
          if (isCreateMode && response.data.data.categories.length > 0) {
            setFormData(prev => ({
              ...prev,
              category: response.data.data.categories[0].name,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, [isCreateMode]);

  // Fetch article data if in edit mode
  useEffect(() => {
    if (!isCreateMode && id) {
      fetchArticle();
    }
  }, [id, isCreateMode]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/articles/${id}`);
      
      if (response.data.success) {
        // Backend returns data.article, not data.data
        const article = response.data.data.article || response.data.data;
        
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        
        // Convert image paths to full URLs for preview
        const imagePreviewUrl = article.image 
          ? (article.image.startsWith('http') ? article.image : `${API_BASE}${article.image}`)
          : "";
          
        const additionalImagesPreviewUrls = (article.additionalImages || []).map((img: string) => 
          img.startsWith('http') ? img : `${API_BASE}${img}`
        );
        
        setFormData({
          title: article.title || "",
          excerpt: article.excerpt || "",
          content: article.content || "",
          category: article.category || "market",
          image: article.image || "",
          author: article.authorName || article.author?.name || "",
          readTime: article.readTime || "",
          status: article.status || "draft",
          additionalImages: article.additionalImages || [],
          videoUrl: article.videoUrl || "",
        });
        setImagePreview(imagePreviewUrl);
        setAdditionalImagePreviews(additionalImagesPreviewUrls);
      }
    } catch (err: any) {
      console.error('Error fetching article:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-royal-gold mb-4"></div>
            <p className="text-gray-600 text-lg">Loading article...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <DashboardNotFound
            title="Article Not Found"
            message="The article you're trying to edit doesn't exist or may have been deleted."
            backButtonText="Back to News Management"
            backButtonPath="/admin/news"
            icon="📰"
          />
        </div>
      </AdminLayout>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setPendingImageFile(file);
  };

  const handleAdditionalImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const previews: string[] = [];
    const selected = Array.from(files);
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        // Set after all readers finish roughly; acceptable for UX here
        setAdditionalImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    setPendingAdditionalFiles((prev) => [...prev, ...selected]);
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Prepare data for API
      const apiData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category, // Use category name directly
        image: formData.image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        status: formData.status,
        readTime: formData.readTime || "5 min read",
        additionalImages: formData.additionalImages,
        videoUrl: formData.videoUrl || undefined,
        tags: formData.videoUrl ? formData.videoUrl.split(',').map(t => t.trim()) : [],
      };

      const token = localStorage.getItem('accessToken');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Upload pending featured image first, if any
      if (pendingImageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('uploadType', 'article');
        uploadFormData.append('image', pendingImageFile);
        const uploadRes = await axios.post('/upload/image', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadRes.data?.success) {
          apiData.image = uploadRes.data.data.path;
        }
      }

      // Upload any pending additional images, if any
      if (pendingAdditionalFiles.length > 0) {
        const multiForm = new FormData();
        multiForm.append('uploadType', 'article');
        pendingAdditionalFiles.forEach((file) => multiForm.append('images', file));
        const multiRes = await axios.post('/upload/images', multiForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (multiRes.data?.success) {
          const uploadedFiles = multiRes.data.data.files;
          const newPaths = uploadedFiles.map((f: any) => f.path);
          apiData.additionalImages = [...apiData.additionalImages, ...newPaths];
        }
      }

      if (isCreateMode) {
        // Create new article
        const response = await axios.post('/articles', apiData, config);

        if (response.data.success) {
          toast.success("Article created successfully!");
          setTimeout(() => navigate('/admin/news'), 500);
        }
      } else {
        // Update existing article
        const response = await axios.put(`/articles/${id}`, apiData, config);

        if (response.data.success) {
          toast.success("Article updated successfully!");
          setTimeout(() => navigate(`/admin/news/${id}`), 500);
        }
      }
    } catch (error: any) {
      console.error('Error saving article:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save article');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-royal-black mb-2">
              {isCreateMode ? 'Create New Article' : 'Edit Article'}
            </h1>
            <p className="text-gray-600">
              {isCreateMode ? 'Create a new article for your website' : 'Update article content and metadata'}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/news')}
            className="text-royal-gold hover:text-yellow-600 font-bold transition-colors"
          >
            ← Back to News Management
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
                    Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    placeholder="Article title"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-royal-black mb-2">
                    Category <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                  >
                    {categories.length === 0 ? (
                      <option value="">Loading categories...</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Read Time
                  </label>
                  <input
                    type="text"
                    name="readTime"
                    value={formData.readTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    placeholder="e.g., 5 min read"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-royal-black mb-2">
                    Status <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
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
                      onChange={handleImageSelect}
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

            {/* Additional Media */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-2xl font-bold text-royal-black">
                Additional Media
              </h2>

              <div>
                <label className="block text-sm font-semibold text-royal-black mb-2">
                  Additional Images
                </label>
                <div className="mb-4">
                  <label className="flex-1 relative cursor-pointer">
                    <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-royal-gold transition-colors text-center">
                      <p className="text-gray-600 font-semibold">
                        📸 Upload Additional Images
                      </p>
                      <p className="text-xs text-gray-500">
                        Multiple files allowed
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {additionalImagePreviews.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-3">
                      Additional Images ({additionalImagePreviews.length})
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {additionalImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Additional ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-royal-black mb-2">
                  Embedded Video URL (Optional)
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Supports YouTube and Vimeo URLs
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-2xl font-bold text-royal-black">Content</h2>

              <div>
                <label className="block text-sm font-semibold text-royal-black mb-2">
                  Excerpt <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none resize-none"
                  placeholder="Brief summary of the article"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-royal-black mb-2">
                  Full Content <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none resize-none"
                  placeholder="Full article content"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 border-t pt-6">
              <button
                type="submit"
                className="bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
              >
                💾 Save Changes
              </button>
              <button
                type="button"
                onClick={() => navigate(`/admin/news/${id}`)}
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
