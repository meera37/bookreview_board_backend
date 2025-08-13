const users = require("../models/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Controller
exports.registerController = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        // Check if already exists
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User Already Exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const newUser = await users.create({ name, email, password: hashedPassword });

        // Remove password before sending
        const { password: pwd, ...userWithoutPassword } = newUser.toObject();

        res.status(201).json({ message: 'User registered successfully', user: userWithoutPassword });
    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login Controller
exports.loginController = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const existingUser = await users.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: 'Account does not exist' });
        }

        const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Incorrect email or password' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: existingUser._id, name: existingUser.name, email: existingUser.email },
            process.env.SECRETKEY,
            { expiresIn: '1d' }
        );

        const { password: pwd, ...userWithoutPassword } = existingUser.toObject();

        return res.status(200).json({ user: userWithoutPassword, token });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

