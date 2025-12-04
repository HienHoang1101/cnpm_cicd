import { validateRegistration } from "../utils/validators.js";

/**
 * Middleware to validate registration data
 */
const validateRegisterInput = (req, res, next) => {
  const validationResult = validateRegistration(req.body);

  if (!validationResult.isValid) {
    return res.status(400).json({
      success: false,
      errors: validationResult.errors,
    });
  }

  next();
};

/**
 * Middleware to validate login data
 */
const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email) {
    errors.email = "Email is required";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

/**
 * Middleware to validate password reset request
 */
const validatePasswordResetInput = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      errors: {
        email: "Email is required",
      },
    });
  }

  next();
};

/**
 * Middleware to validate new password
 */
const validateNewPasswordInput = (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const errors = {};

  if (!password) {
    errors.password = "New password is required";
  }

  // Security: Strong password policy
  if (password && password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }
  
  if (password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
    errors.password = "Password must include uppercase, lowercase, number, and special character";
  }

  if (confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

export {
  validateRegisterInput,
  validateLoginInput,
  validatePasswordResetInput,
  validateNewPasswordInput,
};
