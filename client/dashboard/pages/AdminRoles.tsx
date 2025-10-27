import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import AdminLayout from "@/dashboard/components/AdminLayout";
import { rolesAPI } from "@/lib/api";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

interface Role {
  _id: string;
  name: string;
  slug: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
}

export default function AdminRoles() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permissionsRes] = await Promise.all([
        rolesAPI.getAll(),
        rolesAPI.getPermissions(),
      ]);

      setRoles(rolesRes.data.roles || []);
      setPermissions(permissionsRes.data.permissions || []);
      setGroupedPermissions(permissionsRes.data.grouped || {});
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load roles and permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate("/admin/roles/create");
  };

  const handleEdit = (role: Role) => {
    if (role.isSystem) {
      toast.error("Cannot edit system roles");
      return;
    }
    navigate(`/admin/roles/edit/${role._id}`);
  };

  const handleDelete = async (role: Role) => {
    if (role.isSystem) {
      toast.error("Cannot delete system roles");
      return;
    }

    const result = await Swal.fire({
      title: "Delete Role?",
      text: `Are you sure you want to delete "${role.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await rolesAPI.delete(role._id);
        toast.success("Role deleted successfully!");
        fetchData();
      } catch (error: any) {
        console.error("Error deleting role:", error);
        toast.error(error.response?.data?.message || "Failed to delete role");
      }
    }
  };


  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-gold"></div>
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
              🔐 Role Management
            </h1>
            <p className="text-gray-600">
              Create and manage custom roles with specific permissions
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Role
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">
              Total Roles
            </p>
            <p className="text-3xl font-bold text-blue-600">{roles.length}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">
              Custom Roles
            </p>
            <p className="text-3xl font-bold text-green-600">
              {roles.filter((r) => !r.isSystem).length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">
              Permissions
            </p>
            <p className="text-3xl font-bold text-purple-600">
              {permissions.length}
            </p>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <motion.div
              key={role._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:border-royal-gold transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-royal-black mb-1">
                    {role.name}
                    {role.isSystem && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        System
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Permissions: {role.permissions.length}
                </p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((perm) => (
                    <span
                      key={perm}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {perm.replace(/_/g, " ")}
                    </span>
                  ))}
                  {role.permissions.length > 3 && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      +{role.permissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(role)}
                  disabled={role.isSystem}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    role.isSystem
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(role)}
                  disabled={role.isSystem}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    role.isSystem
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

