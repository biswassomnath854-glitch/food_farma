import app from './app';
import { connectDatabase, sequelize } from './config/database';
import { env } from './config/env';

const startServer = async () => {
  try {
    console.log('🚀 Starting Eat N Bite / Food Farma Backend Service...');
    
    // Connect to database (MySQL or SQLite fallback)
    await connectDatabase();

    // Synchronize models with DB schema
    await sequelize.sync();
    console.log('✅ Database models synchronized successfully.');

    const PORT = parseInt(env.PORT, 10) || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🌟 Server is running live on http://localhost:${PORT}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await sequelize.close();
        console.log('👋 Database connection closed. Server stopped.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
