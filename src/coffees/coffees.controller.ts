import { Body, Controller, Get, Param, Post } from '@nestjs/common';

@Controller('coffees')
export class CoffeesController {
	@Get()
	findAll() {
		return 'coffees get api';
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return `This action returns #${id} coffee.`
	}

	@Post()
	create(@Body() body) {
		return body;
	}
}
