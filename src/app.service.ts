import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      status: 'online',
      name: 'HelpDesk API',
      description: 'API REST para gestión de tickets de soporte',
      docs: '/docs',
      version: '1.0.0',
    };
  }
}
