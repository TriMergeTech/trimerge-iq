import dotenv from 'dotenv';
dotenv.config(); // Load environment variables first

import app from './app';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default server;