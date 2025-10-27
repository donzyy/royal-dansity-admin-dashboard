import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import AdminLayout from "@/dashboard/components/AdminLayout";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'article' | 'carousel' | 'general';
  color?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

type SortField = "name" | "type" | "order" | "createdAt";
type SortOrder = "asc" | "desc";

export default function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [sortField, setSortField] = useState<SortField>("order");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [socket, setSocket] = useState<Socket | null>(null);

  // Socket.IO setup
  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('category:created', (data: Category) => {
      console.log('Category created:', data);
      fetchCategories();
      toast.success('New category created!');
    });

    newSocket.on('category:updated', (data: Category) => {
      console.log('Category updated:', data);
      setCategories(prev => prev.map(cat =>
        cat._id === data._id ? data : cat
      ));
      toast.success('Category updated!');
    });

    newSocket.on('category:deleted', (data: string) => {
      console.log('Category deleted:', data);
      setCategories(prev => prev.filter(cat => cat._id !== data));
      toast.success('Category deleted!');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [currentPage, filterType, filterStatus, searchTerm, sortField, sortOrder]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const params: any = {};

      if (filterType !== 'all') {
        params.type = filterType;
      }

      if (filterStatus !== 'all') {
        params.isActive = filterStatus === 'active';
      }

      const response = await axios.get(`${API_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (response.data.success) {
        let sortedCategories = [...response.data.data.categories];
        
        // Client-side search
        if (searchTerm) {
          sortedCategories = sortedCategories.filter((cat: Category) =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        // Client-side sorting
        sortedCategories.sort((a: Category, b: Category) => {
          let aVal: any = a[sortField];
          let bVal: any = b[sortField];

          if (sortField === 'createdAt') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
          }

          if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
          }

          if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });

        // Client-side pagination
        const total = sortedCategories.length;
        const pages = Math.ceil(total / 10);
        const start = (currentPage - 1) * 10;
        const paginatedCategories = sortedCategories.slice(start, start + 10);

        setCategories(paginatedCategories);
        setPagination({
          page: currentPage,
          limit: 10,
          total: total,
          pages: pages,
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleDelete = async (category: Category) => {
    const result = await Swal.fire({
      title: 'Delete Category?',
      html: `Are you sure you want to delete <strong>${category.name}</strong>?<br><br><span style="color: #DC2626;">⚠️ This action cannot be undone!</span>`,
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
        await axios.delete(`${API_URL}/api/categories/${category._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Swal.fire({
          title: 'Deleted!',
          text: `Category "${category.name}" has been deleted.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error: any) {
        console.error('Error deleting category:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete category',
          icon: 'error',
        });
      }
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCategories();
  };

  // Stats calculations
  const stats = {
    total: pagination.total,
    active: categories.filter((c) => c.isActive).length,
    article: categories.filter((c) => c.type === 'article').length,
    carousel: categories.filter((c) => c.type === 'carousel').length,
  };

  // Loading state
  if (loading && categories.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-royal-gold mb-4"></div>
            <p className="text-gray-600 text-lg">Loading categories...</p>
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
              🏷️ Category Management
            </h1>
            <p className="text-gray-600">
              Manage categories for articles, carousel, and other content
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/categories/create')}
            className="bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Category
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Total Categories</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Article Categories</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.article}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Carousel Categories</p>
            <p className="text-3xl font-bold text-purple-600">{stats.carousel}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Categories
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name, slug, description..."
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

            {/* Type Filter */}
            <div>
              <label htmlFor="typeFilter" className="block text-sm font-semibold text-gray-700 mb-2">
                Type
              </label>
              <select
                id="typeFilter"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none transition-colors"
              >
                <option value="all">All Types</option>
                <option value="article">Article</option>
                <option value="carousel">Carousel</option>
                <option value="general">General</option>
              </select>
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

        {/* Categories Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-royal-gold/10 to-yellow-100 border-b-2 border-royal-gold">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="font-bold text-royal-black hover:text-yellow-600 transition-colors flex items-center gap-1"
                    >
                      Category {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('type')}
                      className="font-bold text-royal-black hover:text-yellow-600 transition-colors flex items-center gap-1"
                    >
                      Type {getSortIcon('type')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="font-bold text-royal-black">Status</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('order')}
                      className="font-bold text-royal-black hover:text-yellow-600 transition-colors flex items-center gap-1"
                    >
                      Order {getSortIcon('order')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="font-bold text-royal-black">Color</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="font-bold text-royal-black">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {categories.map((category) => (
                    <motion.tr
                      key={category._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-royal-black">{category.name}</p>
                          <p className="text-sm text-gray-500">{category.description || category.slug}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 capitalize">
                          {category.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${
                          category.isActive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{category.order}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded border border-gray-300"
                            style={{ backgroundColor: category.color || '#D4AF37' }}
                            title={category.color}
                            role="img"
                            aria-label={`Category color ${category.color}`}
                          />
                          <span className="text-xs text-gray-600">{category.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/categories/edit/${category._id}`)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
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
          {categories.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏷️</div>
              <p className="text-gray-600 font-semibold text-lg mb-2">No categories found</p>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first category to get started'}
              </p>
              {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
                <button
                  onClick={() => navigate('/admin/categories/create')}
                  className="bg-royal-gold hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
                >
                  Create First Category
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {categories.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total categories)
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
