import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


// Create new user
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = new User({
            name,
            email,
            password,
            role
        });

       
        await user.save();
        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }


        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", user, token });

    } catch (error) {
        res.status(500).json({ message: error.message });
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
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};