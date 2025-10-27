import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import AdminLayout from "@/dashboard/components/AdminLayout";
import { rolesAPI } from "@/lib/api";
import { PageHeader } from "@/dashboard/components/PageHeader";

interface Permission {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
}

export default function AdminRoleEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const permissionsRes = await rolesAPI.getPermissions();
      setPermissions(permissionsRes.data.permissions || []);
      setGroupedPermissions(permissionsRes.data.grouped || {});

      if (isEditMode && id) {
        const roleRes = await rolesAPI.getById(id);
        const role = roleRes.data.role;
        
        if (role.isSystem) {
          toast.error("Cannot edit system roles");
          navigate("/admin/roles");
          return;
        }

        setFormData({
          name: role.name,
          description: role.description,
          permissions: role.permissions,
        });
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
      navigate("/admin/roles");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    try {
      setSaving(true);
      if (isEditMode && id) {
        await rolesAPI.update(id, formData);
        toast.success("Role updated successfully!");
      } else {
        await rolesAPI.create(formData);
        toast.success("Role created successfully!");
      }
      navigate("/admin/roles");
    } catch (error: any) {
      console.error("Error saving role:", error);
      toast.error(error.response?.data?.message || "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permissionSlug: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionSlug)
        ? prev.permissions.filter((p) => p !== permissionSlug)
        : [...prev.permissions, permissionSlug],
    }));
  };

  const toggleAllInCategory = (category: string) => {
    const categoryPerms = groupedPermissions[category] || [];
    const categoryPermSlugs = categoryPerms.map((p) => p.slug);
    const allSelected = categoryPermSlugs.every((slug) =>
      formData.permissions.includes(slug)
    );

    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !categoryPermSlugs.includes(p))
        : [...new Set([...prev.permissions, ...categoryPermSlugs])],
    }));
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
        <PageHeader
          title={isEditMode ? "Edit Role" : "Create New Role"}
          subtitle={isEditMode ? "Update role details and permissions" : "Create a new custom role with specific permissions"}
        />

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-royal-black mb-6">Role Information</h2>
            
            <div className="space-y-6">
              {/* Role Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-royal-gold focus:outline-none"
                  placeholder="e.g., Content Manager"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-royal-gold focus:outline-none"
                  placeholder="Brief description of this role"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-royal-black">
                Permissions *
              </h2>
              <span className="text-sm font-semibold text-royal-gold">
                {formData.permissions.length} selected
              </span>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div
                  key={category}
                  className="border-2 border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-lg text-gray-800 capitalize">
                      {category}
                    </h4>
                    <button
                      type="button"
                      onClick={() => toggleAllInCategory(category)}
                      className="text-sm text-royal-gold hover:text-yellow-600 font-semibold transition-colors"
                    >
                      {perms.every((p) => formData.permissions.includes(p.slug))
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {perms.map((perm) => (
                      <label
                        key={perm._id}
                        className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.slug)}
                          onChange={() => togglePermission(perm.slug)}
                          className="mt-1 w-5 h-5 text-royal-gold border-gray-300 rounded focus:ring-royal-gold"
                        />
                        <div>
                          <p className="font-semibold text-sm text-gray-800">
                            {perm.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {perm.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/roles")}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-royal-gold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all"
            >
              {saving
                ? "Saving..."
                : isEditMode
                ? "Update Role"
                : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

