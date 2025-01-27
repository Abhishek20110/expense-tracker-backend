import JWT from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if authorization header exists and starts with "Bearer"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new Error('Auth failed: No token provided or token format is incorrect'));
    }

    // Extract the token
    const token = authHeader.split(' ')[1];



    try {
        // Verify the token
        const payload = JWT.verify(token, process.env.JWT_SECRET);

        // Attach user information to the request
        req.user = { userId: payload.userId };
        req.userId = payload.userId;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(406).json({ success: false, message: 'Token has expired' });
        }
        // Handle token verification errors

        next(new Error('Auth failed: Invalid token'));
    }
};

export default userAuth;
