/**
 * Email validation
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation
 * Security: Requires at least 8 characters, one uppercase, one lowercase, one number, one special char
 * @param {string} password - Password to validate
 * @returns {boolean} - True if password is valid
 */
const isValidPassword = (password) => {
  // Minimum 8 chars, at least: 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Phone number validation
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if phone number is valid
 */
const isValidPhone = (phone) => {
  // Basic phone validation (can be adjusted based on requirements)
  const phoneRegex = /^\+?[0-9]{8,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Role validation
 * @param {string} role - Role to validate
 * @returns {boolean} - True if role is valid
 */
const isValidRole = (role) => {
  const validRoles = ["customer", "restaurant", "delivery", "admin"];
  return validRoles.includes(role);
};

/**
 * Validate registration input
 * @param {Object} userData - User data to validate
 * @returns {Object} - Result with isValid and errors
 */
const validateRegistration = (userData) => {
  const errors = {};

  // Required fields
  if (!userData.name) errors.name = "Name is required";
  if (!userData.email) errors.email = "Email is required";
  if (!userData.password) errors.password = "Password is required";
  if (!userData.phone) errors.phone = "Phone number is required";

  // Email validation
  if (userData.email && !isValidEmail(userData.email)) {
    errors.email = "Please provide a valid email address";
  }

  // Password validation
  if (userData.password && !isValidPassword(userData.password)) {
    errors.password =
      "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)";
  }

  // Phone validation
  if (userData.phone && !isValidPhone(userData.phone)) {
    errors.phone = "Please provide a valid phone number";
  }

  // Role validation
  if (userData.role && !isValidRole(userData.role)) {
    errors.role = "Invalid role selected";
  }

  // Business fields validation for restaurant role
  if (userData.role === "restaurant") {
    if (!userData.businessName) {
      errors.businessName = "Business name is required for restaurants";
    }
    if (!userData.businessAddress) {
      errors.businessAddress = "Business address is required for restaurants";
    }
  }

  // Vehicle fields validation for delivery role
  if (userData.role === "delivery" && userData.vehicleType) {
    const validVehicleTypes = [
      "car",
      "motorcycle",
      "bicycle",
      "scooter",
      "on_foot",
    ];
    if (!validVehicleTypes.includes(userData.vehicleType)) {
      errors.vehicleType = "Invalid vehicle type";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidRole,
  validateRegistration,
};
