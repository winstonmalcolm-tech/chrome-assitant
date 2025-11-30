const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    
    // Extract the HTTP method (GET, POST, etc.) and the full path
    const method = req.method;
    const path = req.originalUrl;
    
    // Log the accessed endpoint details
    console.log(`[${timestamp}] ACCESS: ${method} ${path}`);
    
    // Move to the next middleware or route handler
    next();
};

export default logger