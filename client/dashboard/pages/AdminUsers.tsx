import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { io, Socket } from "socket.io-client";
import AdminLayout from "@/dashboard/components/AdminLayout";
import {
  StatsCards,
  SearchBar,
  FilterSelect,
  DataTable,
  TableActionButton,
  Pagination,
  PageHeader,
  StatusBadge,
  LoadingSpinner,
  type StatCard,
  type Column,
} from "@/dashboard/components";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive';
  avatar?: string;
  joinDate: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  editors: number;
  viewers: number;
}

type SortField = "name" | "email" | "role" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    editors: 0,
    viewers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 15 });
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const params: any = {
        page: currentPage,
        limit: pagination.limit,
        sort: sortOrder === 'asc' ? sortField : `-${sortField}`,
      };

      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await axios.get('/users', { params });

      setUsers(response.data.data.users);
      setStats(response.data.data.stats);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter, sortField, sortOrder]);

  // Socket.IO for real-time updates
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || API_URL);
    setSocket(newSocket);

    newSocket.on('user:created', () => {
      fetchUsers();
    });

    newSocket.on('user:updated', () => {
      fetchUsers();
    });

    newSocket.on('user:deleted', () => {
      fetchUsers();
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      await axios.put(`/users/${id}`, { status: newStatus });

      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  // Handle role change
  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      const token = localStorage.getItem('accessToken');

      await axios.put(`/users/${id}`, { role: newRole });

      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      text: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/users/${id}`);

        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error: any) {
        console.error('Error deleting user:', error);
        toast.error(error.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  // Filter users client-side by search query
  const filteredUsers = users.filter((user) => {
    const search = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  });

  // Stats cards - Reorder for 3 columns layout
  const statsCards: StatCard[] = [
    { label: 'Total Users', value: stats.total, color: 'purple' },
    { label: 'Admins', value: stats.admins, color: 'blue' },
    { label: 'Editors', value: stats.editors, color: 'yellow' },
    { label: 'Active Users', value: stats.active, color: 'green' },
    { label: 'Inactive Users', value: stats.inactive, color: 'red' },
    { label: 'Viewers', value: stats.viewers, color: 'gray' },
  ];

  // Table columns
  const columns: Column[] = [
    {
      header: 'Name',
      sortable: true,
      onSort: () => handleSort('name'),
      align: 'left',
    },
    {
      header: 'Email',
      sortable: true,
      onSort: () => handleSort('email'),
      align: 'left',
    },
    {
      header: 'Role',
      sortable: true,
      onSort: () => handleSort('role'),
      align: 'center',
    },
    {
      header: 'Status',
      sortable: true,
      onSort: () => handleSort('status'),
      align: 'center',
    },
    {
      header: 'Join Date',
      sortable: true,
      onSort: () => handleSort('createdAt'),
      align: 'left',
    },
    {
      header: 'Actions',
      align: 'center',
      width: 'w-48',
    },
  ];

  // Check if routes exist - for now navigate to create/edit routes
  const handleViewUser = (id: string) => {
    // Navigate to user detail page
    navigate(`/admin/users/${id}`);
  };

  const handleEditUser = (id: string) => {
    // Navigate to user edit page
    navigate(`/admin/users/edit/${id}`);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-royal-black mb-2">Users Management</h1>
            <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
          </div>
          <button
            onClick={() => navigate('/admin/users/create')}
            className="flex items-center gap-2 px-6 py-3 bg-royal-gold text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
          >
            <span>+</span>
            <span>New User</span>
          </button>
        </div>

        <div className="mb-8">
          <StatsCards stats={statsCards} />
        </div>

        <div className="mb-8 bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
          <div className="grid md:grid-cols-3 gap-6">
                <div>
              <label htmlFor="search-users" className="block text-sm font-semibold text-gray-700 mb-2">
                Search Users
                  </label>
              <div className="flex gap-2">
                  <input
                  id="search-users"
                    type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-royal-gold focus:border-royal-gold"
                />
                <button
                  onClick={() => {}}
                  className="px-6 py-3 bg-royal-gold text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
            <FilterSelect
              label="Role"
              id="roleFilter"
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'admin', label: 'Admin' },
                { value: 'editor', label: 'Editor' },
                { value: 'viewer', label: 'Viewer' },
              ]}
            />
            <FilterSelect
              label="Status"
              id="statusFilter"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading users..." />
        ) : (
          <DataTable
            columns={columns}
            sortField={sortField}
            sortOrder={sortOrder}
            emptyMessage="No users found"
            pagination={{
              currentPage: pagination.page,
              totalPages: pagination.pages || 1,
              totalItems: pagination.total,
              onPageChange: setCurrentPage,
              itemLabel: 'users',
            }}
          >
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-royal-gold/20 flex items-center justify-center font-bold text-royal-gold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-royal-black">{user.name}</span>
                  </div>
                      </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4 text-center">
                        <select
                          value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="px-3 py-1 rounded-full text-xs font-bold border-2 border-gray-200 focus:border-royal-gold focus:outline-none capitalize"
                    aria-label={`Change role for ${user.name}`}
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>
                <td className="px-6 py-4 text-center">
                  <StatusBadge status={user.status} />
                      </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                      </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <TableActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewUser(user._id);
                      }}
                      icon="view"
                      title="View Details"
                      color="blue"
                    />
                    <TableActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditUser(user._id);
                      }}
                      icon="edit"
                      title="Edit"
                      color="green"
                    />
                    <TableActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(user._id, user.status);
                      }}
                      icon="check"
                      title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                      color={user.status === 'active' ? 'yellow' : 'green'}
                    />
                    <TableActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(user._id, user.name);
                      }}
                      icon="delete"
                      title="Delete"
                      color="red"
                    />
                  </div>
                      </td>
                    </tr>
            ))}
          </DataTable>
        )}
      </div>
    </AdminLayout>
  );
}
