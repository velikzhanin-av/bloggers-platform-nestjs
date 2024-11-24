import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('testing')
export class TestingController {
  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {}
}
