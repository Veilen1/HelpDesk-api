import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Estado y bienvenida de la API' })
  @ApiResponse({
    status: 200,
    description: 'Información general del estado de la API',
  })
  getHello() {
    return this.appService.getHello();
  }
}
