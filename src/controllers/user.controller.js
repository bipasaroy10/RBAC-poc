import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import transporter from "../config/nodemailer.js";


// Create new user
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            otp,
            expiresAt: otpExpiresAt,
            isVerified: false
        });

        await user.save();

        // Send Email
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Verify Your Email",
            text: `Hello ${name},

Your OTP is: ${otp}

This OTP is valid for 10 minutes.

Thank you.`
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully. OTP has been sent to your email."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", user, token });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//verify OTP
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (Date.now() > user.expiresAt) {
            return res.status(400).json({ message: "OTP has expired" });
        }
        user.otpVerified = true;
        await user.save();
        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



//logout user
export const logoutUser = (req, res) => {
    try {
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};




// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: "superadmin" } }); 
        res.status(200).json(users);

        if (!req.user || req.user.role !== "superadmin" && req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Update User
export const updateUser = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 1. Nobody can change any user's role
    if (req.body.role) {
      return res.status(403).json({
        success: false,
        message: "Role cannot be changed.",
      });
    }

    // 2. Email must be unique
    
    if (
      req.body.email &&
      req.body.email.toLowerCase() !== targetUser.email.toLowerCase()
    ) {
      const emailExists = await User.findOne({
        email: req.body.email.toLowerCase(),
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists.",
        });
      }
    }

    
    // SUPER ADMIN
    
    if (loggedInUser.role === "superadmin") {
      // Superadmin can update everyone
      // (role change already blocked above)

      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      return res.status(200).json({
        success: true,
        message: "User updated successfully.",
        user: updatedUser,
      });
    }

    // ADMIN
    
    if (loggedInUser.role === "admin") {

      // Cannot update Super Admin
      if (targetUser.role === "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Admin cannot update Super Admin.",
        });
      }

      // Cannot update another Admin
      if (
        targetUser.role === "admin" &&
        targetUser._id.toString() !== loggedInUser._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Admin cannot update another Admin.",
        });
      }

      // Admin updating own profile
      if (targetUser._id.toString() === loggedInUser._id.toString()) {

        if (req.body.password) {
          req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

        return res.status(200).json({
          success: true,
          message: "Profile updated successfully.",
          user: updatedUser,
        });
      }

      // Admin updating a normal user

      // Cannot change user's password
      if (req.body.password) {
        return res.status(403).json({
          success: false,
          message: "Admin cannot change another user's password.",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      return res.status(200).json({
        success: true,
        message: "User updated successfully.",
        user: updatedUser,
      });
    }

    
    // NORMAL USER
    
    if (loggedInUser.role === "user") {

      // Can only update own profile
      if (targetUser._id.toString() !== loggedInUser._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own profile.",
        });
      }

      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        user: updatedUser,
      });
    }

    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const loggedInUser = req.user;
        const targetUser = await User.findById(req.params.id);

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // Nobody can delete Super Admin
        if (targetUser.role === "superadmin") {
            return res.status(403).json({
                success: false,
                message: "Super Admin cannot be deleted."
            });
        }

        
        // SUPER ADMIN
        // Can delete Admin & User
        if (loggedInUser.role === "superadmin") {

            await User.findByIdAndDelete(targetUser._id);

            return res.status(200).json({
                success: true,
                message: "User deleted successfully."
            });
        }


        // ADMIN
        // Can delete only Users
          if (loggedInUser.role === "admin") {

        // Admin deleting themselves
        if (loggedInUser._id.toString() === targetUser._id.toString()) {
            await User.findByIdAndDelete(targetUser._id);

            return res.status(200).json({
                success: true,
                message: "Your account has been deleted successfully."
            });
        }

        // Admin cannot delete another Admin
        if (targetUser.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin cannot delete another Admin."
            });
        }

        // Admin can delete normal users
        await User.findByIdAndDelete(targetUser._id);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully."
        });
    }

        // USER
        // Can delete only themselves
        if (loggedInUser.role === "user") {

    // Support both `id` and `_id` from JWT/auth middleware
    const loggedInUserId = loggedInUser._id || loggedInUser.id;

    if (!loggedInUserId) {
        return res.status(401).json({
            success: false,
            message: "Invalid authentication token."
        });
    }

    if (loggedInUserId.toString() !== targetUser._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "You can only delete your own account."
        });
    }

    await User.findByIdAndDelete(targetUser._id);

    return res.status(200).json({
        success: true,
        message: "Your account has been deleted successfully."
    });
}

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



