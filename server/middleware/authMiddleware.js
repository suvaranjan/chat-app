const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // console.log(process.env.SECRET_KEY);

    const accessTokenHeader = req.header('Authorization');
    if (!accessTokenHeader) {
        return res.status(401).json({ msg: 'Access token missing' });
    }

    // Remove the "Bearer " prefix from the access token
    const accessToken = accessTokenHeader.replace('Bearer ', '');

    // Verify the access token
    jwt.verify(accessToken, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(403).json({ msg: 'Invalid access token' });
        }

        // Store the decoded payload in the request for future use
        req.user = decoded;

        // Continue to the next middleware or route handler
        next();
    });
};

module.exports = authMiddleware;