import app from "./app.js";
import cloudinary from "cloudinary";
import jobsRouter from "./routes/jobRouter.js";
import usersRouter from "./routes/userRouter.js";

// Cloudinary configuration
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Example root route
app.get('/', (req, res) => {
    res.send('Yay!! Backend of job-portal app is now accessible');
});

// Define other routes
app.use('/api/jobs', jobsRouter);
app.use('/api/users', usersRouter);

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server listening at port ${process.env.PORT}`);
});
