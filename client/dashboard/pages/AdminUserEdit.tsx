import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import AdminLayout from "@/dashboard/components/AdminLayout";
import DashboardNotFound from "@/dashboard/components/DashboardNotFound";
import PasswordStrengthIndicator from "@/shared/components/PasswordStrengthIndicator";
import { LoadingSpinner } from "@/dashboard/components";
import { usersAPI, rolesAPI } from "@/lib/api";
import {
  validatePassword,
  passwordsMatch,
  generateSecurePassword,
  type PasswordValidation,
} from "@/lib/passwordUtils";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Role {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
}

export default function AdminUserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isCreateMode = location.pathname.includes('/create');

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!isCreateMode);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation | null>(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchRoles();
    if (!isCreateMode && id) {
      fetchUser();
    }
  }, [id, isCreateMode]);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await rolesAPI.getAll();
      const fetchedRoles = response.data.roles || [];
      setRoles(fetchedRoles);
      
      // Set default role to 'viewer' if available
      if (isCreateMode && fetchedRoles.length > 0) {
        const viewerRole = fetchedRoles.find((r: Role) => r.slug === 'viewer');
        if (viewerRole) {
          setFormData(prev => ({ ...prev, role: viewerRole.slug }));
        } else {
          setFormData(prev => ({ ...prev, role: fetchedRoles[0].slug }));
        }
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getById(id!);
      const fetchedUser = response.data.user;
      setUser(fetchedUser);
      setFormData({
        name: fetchedUser.name,
        email: fetchedUser.email,
        password: "",
        confirmPassword: "",
        role: fetchedUser.role,
      });
    } catch (error: any) {
      console.error('Error fetching user:', error);
      if (error.message?.includes('404')) {
        setNotFound(true);
      } else {
        toast.error('Failed to load user data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate password in real-time
    if (name === "password" && value) {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    } else if (name === "password" && !value) {
      setPasswordValidation(null);
    }

    // Check password match in real-time
    if (name === "password" || name === "confirmPassword") {
      const passwordValue = name === "password" ? value : formData.password;
      const confirmValue = name === "confirmPassword" ? value : formData.confirmPassword;
      setPasswordMismatch(
        confirmValue.length > 0 && !passwordsMatch(passwordValue, confirmValue)
      );
    }
  };

  const handleGeneratePassword = () => {
    const generated = generateSecurePassword();
    setFormData((prev) => ({
      ...prev,
      password: generated,
      confirmPassword: generated,
    }));
    const validation = validatePassword(generated);
    setPasswordValidation(validation);
    setPasswordMismatch(false);
    toast.success('Secure password generated!', { duration: 2000 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validate password if provided (required for create, optional for edit)
      if (isCreateMode || formData.password) {
        const validation = validatePassword(formData.password);
        if (!validation.isValid) {
          Swal.fire({
            icon: "error",
            title: "Invalid Password",
            text: "Password does not meet the required criteria.",
          });
          setIsSaving(false);
          return;
        }

        if (!passwordsMatch(formData.password, formData.confirmPassword)) {
          Swal.fire({
            icon: "error",
            title: "Passwords Don't Match",
            text: "Password and confirm password must match.",
          });
          setIsSaving(false);
          return;
        }
      }

      const payload: any = {
        name: formData.name,
        email: formData.email.toLowerCase(),
        role: formData.role,
      };

      // Only include password if provided
      if (formData.password) {
        payload.password = formData.password;
      }

      if (isCreateMode) {
        // Create new user
        const response = await usersAPI.create(payload);
        toast.success('User created successfully!');
        
        // Redirect to user detail page
        setTimeout(() => {
          navigate(`/admin/users/${response.data.user._id}`);
        }, 1500);
      } else {
        // Update existing user
        await usersAPI.update(id!, payload);
        toast.success('User updated successfully!');
        
        // Redirect back to user detail page
        setTimeout(() => {
          navigate(`/admin/users/${id}`);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      const message = error.message || 'Failed to save user. Please try again.';
      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading user data..." />
        </div>
      </AdminLayout>
    );
  }

  if (!isCreateMode && notFound) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <DashboardNotFound
            title="User Not Found"
            message="The user you're trying to edit doesn't exist or may have been removed."
            backButtonText="Back to Users"
            backButtonPath="/admin/users"
            icon="👤"
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(isCreateMode ? "/admin/users" : `/admin/users/${id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-royal-gold transition-colors font-semibold"
            title={isCreateMode ? "Back to Users" : "Back to User Details"}
          >
            ← {isCreateMode ? "Back to Users" : `Back to ${user?.name}`}
          </button>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-4xl font-bold text-royal-black mb-2">
            {isCreateMode ? "Create New User" : "Edit User"}
          </h1>
          <p className="text-gray-600">
            {isCreateMode ? "Add a new user to the system" : "Update user information and permissions"}
          </p>
        </div>

        {/* Form Container */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-royal-black">
                    Basic Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-royal-black mb-2">
                        Full Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-royal-black mb-2">
                        Email <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                        placeholder="john@royaldansity.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-royal-black mb-6">
                    {isCreateMode ? "Set Password" : "Update Password"}
                  </h3>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-royal-black mb-2">
                          Password {isCreateMode ? <span className="text-red-600">*</span> : <span className="text-gray-500">(Optional)</span>}
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required={isCreateMode}
                            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                            placeholder={isCreateMode ? "Enter a secure password" : "Leave blank to keep existing password"}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            title={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? "👁️‍🗨️" : "👁️"}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-royal-black mb-2">
                          Confirm Password{" "}
                          {isCreateMode ? <span className="text-red-600">*</span> : <span className="text-gray-500">(Optional)</span>}
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required={isCreateMode}
                            className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none ${
                              passwordMismatch
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-200 focus:border-royal-gold"
                            }`}
                            placeholder="Confirm password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            title={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                          </button>
                        </div>
                        {passwordMismatch && (
                          <p className="text-xs text-red-600 mt-2">
                            Passwords do not match
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Generate Password Button */}
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                    >
                      🔐 Generate Secure Password
                    </button>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <PasswordStrengthIndicator
                        validation={passwordValidation}
                        showErrors={true}
                      />
                    )}
                  </div>
                </div>

                {/* Role Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-royal-black mb-6">
                    Role & Permissions
                  </h3>

                  <div>
                    <label htmlFor="userRole" className="block text-sm font-semibold text-royal-black mb-2">
                      Role <span className="text-red-600">*</span>
                    </label>
                    {loadingRoles ? (
                      <div className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg">
                        <div className="animate-spin h-4 w-4 border-2 border-royal-gold border-t-transparent rounded-full"></div>
                        <span className="text-gray-500 text-sm">Loading roles...</span>
                      </div>
                    ) : (
                      <>
                        <select
                          id="userRole"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                          aria-label="User role"
                        >
                          {roles.length === 0 ? (
                            <option value="">No roles available</option>
                          ) : (
                            roles.map((role) => (
                              <option key={role._id} value={role.slug}>
                                {role.name} {role.description && `- ${role.description}`}
                              </option>
                            ))
                          )}
                        </select>
                        {formData.role && roles.find(r => r.slug === formData.role)?.description && (
                          <p className="text-xs text-gray-500 mt-2">
                            {roles.find(r => r.slug === formData.role)?.description}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="border-t border-gray-200 pt-6 flex gap-4">
                  <button
                    type="submit"
                    disabled={
                      isSaving ||
                      ((isCreateMode || formData.password) &&
                        (passwordMismatch || !passwordValidation?.isValid))
                    }
                    className="bg-royal-gold hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
                  >
                    {isSaving ? "Saving..." : isCreateMode ? "Create User" : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(isCreateMode ? "/admin/users" : `/admin/users/${id}`)}
                    className="bg-gray-300 hover:bg-gray-400 text-royal-black font-bold py-3 px-8 rounded-lg transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Side Panel - Info */}
          <div>
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-royal-black mb-4">
                {isCreateMode ? "New User Info" : "User Info"}
              </h3>
              {!isCreateMode && user && (
                <div className="space-y-4 text-sm mb-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Current Role
                    </p>
                    <p className="text-royal-black font-semibold capitalize">
                      {user.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Account Status
                    </p>
                    <p className="text-royal-black font-semibold capitalize">
                      {user.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Join Date
                    </p>
                    <p className="text-royal-black font-semibold">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <span className="font-semibold">💡 Tip:</span>{" "}
                  {isCreateMode
                    ? "Use the generate button to create a strong, secure password automatically."
                    : "Leave the password fields blank if you don't want to change the password."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
