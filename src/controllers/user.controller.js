import User from "../models/user.model.js";
import jwt from "jsonwebtoken";


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


// Update user
export const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
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