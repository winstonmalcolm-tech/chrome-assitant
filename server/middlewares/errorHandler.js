const errorHandler = (err, req, res, next) => {
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
}

export default errorHandler;