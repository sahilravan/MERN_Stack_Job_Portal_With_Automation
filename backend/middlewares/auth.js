import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("User is not authenticated.", 400));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await User.findById(decoded.id);

  next();
});

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user.role} not allowed to access this resource.`
        )
      );
    }
    next();
  };
};

// Chat-specific middleware
export const isChatParticipant = catchAsyncErrors(async (req, res, next) => {
  const chatId = req.params.chatId || req.body.chatId;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new ErrorHandler("Chat not found", 404));
  }

  const isParticipant = chat.participants.includes(userId);
  if (!isParticipant) {
    return next(new ErrorHandler("Not authorized to access this chat", 403));
  }

  req.chat = chat;
  next();
});

export const canInitiateChat = catchAsyncErrors(async (req, res, next) => {
  const { recipientId } = req.body;
  const senderId = req.user._id;

  // Check if users exist
  const [sender, recipient] = await Promise.all([
    User.findById(senderId),
    User.findById(recipientId)
  ]);

  if (!recipient) {
    return next(new ErrorHandler("Recipient user not found", 404));
  }

  // Check if chat already exists between users
  const existingChat = await Chat.findOne({
    participants: { $all: [senderId, recipientId] }
  });

  if (existingChat) {
    return next(new ErrorHandler("Chat already exists between users", 400));
  }

  next();
});

export const validateChatAccess = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const { jobId } = req.body;

  // Verify if the user has permission to chat about this job
  // This could be based on whether they're the employer who posted the job
  // or a job seeker who has applied to it
  const hasAccess = await validateJobChatAccess(userId, jobId);
  if (!hasAccess) {
    return next(
      new ErrorHandler(
        "You don't have permission to initiate chat for this job",
        403
      )
    );
  }

  next();
});

// Helper function to validate job-related chat access
const validateJobChatAccess = async (userId, jobId) => {
  // Implementation would depend on your job application model structure
  // This is a placeholder that should be implemented based on your specific requirements
  const isEmployer = await User.findOne({
    _id: userId,
    role: "employer",
    "postedJobs": jobId
  });

  const isApplicant = await User.findOne({
    _id: userId,
    "jobApplications.job": jobId
  });

  return Boolean(isEmployer || isApplicant);
};
