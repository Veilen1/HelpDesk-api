import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API status object', () => {
      const response = appController.getHello();
      expect(response).toEqual({
        status: 'online',
        name: 'HelpDesk API',
        description: 'API REST para gestión de tickets de soporte',
        docs: '/docs',
        version: '1.0.0',
      });
    });
  });
});
