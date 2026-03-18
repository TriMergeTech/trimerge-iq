import { Request, Response } from 'express';
import logger from '../utils/logger';
import * as aiService from '../services/ai.service';

export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    logger.info(`Search request received: ${query}`);
    
    const data = await aiService.searchKnowledgeBase(query as string);
    res.status(200).json(data);
  } catch (error) {
    logger.error(`Search error: ${error instanceof Error ? error.message : error}`);
    res.status(502).json({ error: 'Bad Gateway: Failed to reach AI Engine' });
  }
};

export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    logger.info(`Chat request received. Prompt length: ${prompt?.length || 0}`);
    
    const data = await aiService.sendChatPrompt(prompt);
    res.status(200).json(data);
  } catch (error) {
    logger.error(`Chat error: ${error instanceof Error ? error.message : error}`);
    res.status(502).json({ error: 'Bad Gateway: Failed to reach AI Engine' });
  }
};

export const upload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded or invalid file type' });
      return;
    }
    logger.info(`File upload received: ${req.file.originalname} (${req.file.size} bytes)`);
    
    const data = await aiService.forwardDocument(req.file);
    res.status(200).json(data);
  } catch (error) {
    logger.error(`Upload error: ${error instanceof Error ? error.message : error}`);
    res.status(502).json({ error: 'Bad Gateway: Failed to reach AI Engine' });
  }
};