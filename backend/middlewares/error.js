class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error.";

  if (err.name === "CastError") {
    const message = `Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered.`;
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, Try again.`;
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is expired, Try again.`;
    err = new ErrorHandler(message, 400);
  }
   // Chat-specific error handlers
  if (err.name === "ChatConnectionError") {
    const message = "Failed to establish chat connection";
    err = new ErrorHandler(message, 500);
  }
  if (err.name === "MessageDeliveryError") {
    const message = "Failed to deliver chat message";
    err = new ErrorHandler(message, 500);
  }
  if (err.name === "ChatRoomError") {
    const message = "Error managing chat room";
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "ChatAuthenticationError") {
    const message = "Chat authentication failed";
    err = new ErrorHandler(message, 401);
  }
  if (err.name === "ChatRateLimitError") {
    const message = "Message rate limit exceeded";
    err = new ErrorHandler(message, 429);
  }
  if (err.name === "ChatValidationError") {
    const message = "Invalid chat message format";
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "ChatParticipantError") {
    const message = "Invalid chat participant";
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "WebSocketError") {
    const message = "WebSocket connection error";
    err = new ErrorHandler(message, 500);
  }


  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};


export default ErrorHandler
