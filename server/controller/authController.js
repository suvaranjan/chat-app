const User = require("../models/User");
const UserStatus = require("../models/UserStatus");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const register = async (req, res) => {
    const { username, email, password, avatar } = req.body;

    try {

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            name: username,
            email,
            password: hashedPassword,
            avatar,
        });

        await newUser.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });

        // Check if the user exists
        if (!user) {
            return res.status(401).json({ msg: "Invalid email or password" });
        }

        // Check if the password matches
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ msg: "Wrong password" });
        }

        // Find or create a UserStatus document
        let userStatus = await UserStatus.findOne({ user: user._id });

        if (!userStatus) {
            userStatus = new UserStatus({
                user: user._id,
                status: 'offline',
                lastSeen: new Date(),
            });
            await userStatus.save();
        }

        // Update user status to 'online' and set lastSeen to current date and time
        user.status = userStatus._id;
        await user.save();

        // Generate JWT token
        const payload = {
            _id: user._id,
            email: user.email
        };

        const options = {
            expiresIn: '24h'
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY, options);

        // Send token and success message
        return res.status(200).json({ token, msg: "Login successful" });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ msg: "Server Error" });
    }
};


const logout = (req, res) => {
    res.status(200).json({ msg: "Logout User" })
};


module.exports = {
    register,
    login,
    logout,
};