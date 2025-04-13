import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import notesRoutes from './routes/notes.routes';
import flashcardRoutes from './routes/flashcard.routes';
import exportRoutes from './routes/export.routes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Smart Notes API is running!'
  });
});

// API Routes
app.use('/api/notes', notesRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/export', exportRoutes);

// MongoDB Connection
const connectDB = async () => {
  const connectionOptions = [
    // Option 1: Default connection string with no auth required
    'mongodb://mongodb:27017/studysmartbuddy?directConnection=true',
    // Option 2: Using host.docker.internal for Docker-to-Docker communication
    'mongodb://host.docker.internal:27017/studysmartbuddy?directConnection=true',
    // Option 3: Local connection as fallback
    'mongodb://127.0.0.1:27017/studysmartbuddy?directConnection=true'
  ];
  
  for (const connectionString of connectionOptions) {
    try {
      console.log(`Attempting to connect to MongoDB with: ${connectionString}`);
      await mongoose.connect(connectionString, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        // Set these options to make connections more resilient
        connectTimeoutMS: 10000,
        maxPoolSize: 10
      });
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      
      // Add connection error handler
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        // Don't exit process, just log the error
      });
      
      // Add reconnection handler
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected, attempting to reconnect...');
        setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
      });
      
      return;
    } catch (error) {
      console.error(`Connection attempt failed for ${connectionString}:`, error);
    }
  }
  
  // If we reach here, all connection attempts failed
  console.error("All MongoDB connection attempts failed. Server cannot start without database.");
  process.exit(1);
};

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB - server won't start if connection fails
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server:`, error);
    process.exit(1);
  }
};

startServer();