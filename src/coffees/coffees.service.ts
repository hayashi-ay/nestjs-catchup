import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Coffee } from './entities/coffee.entity';

@Injectable()
export class CoffeesService {
	constructor(
		@InjectModel(Coffee.name) private readonly coffeeModel: Model<Coffee>,
		@InjectModel(Event.name) private readonly eventModel: Model<Event>,
		@InjectConnection() private readonly connection: Connection,
	) {}

	findAll(paginationQuery: PaginationQueryDto) {
		const { limit, offset } = paginationQuery;
		return this.coffeeModel.find().skip(offset).limit(limit).exec();
	}

	async findOne(id: string) {
		const coffee = await this.coffeeModel.findOne({ _id: id}).exec();
		if (!coffee) {
			throw new NotFoundException(`Coffee #${id} not found.`);
		}
		return coffee;
	}

	create(createCoffeeDto: any) {
		const coffee = new this.coffeeModel(createCoffeeDto);
		return coffee.save();
	}

	async update(id: string, updateCoffeeDto: any) {
		const existingCoffee = this.coffeeModel
			.findOneAndUpdate({ _id: id }, { $set: updateCoffeeDto }, { new: true})
			.exec();
		
		if (!existingCoffee) {
			throw new NotFoundException(`Coffee #${id} not found.`);
		}
		return existingCoffee;
	}

	async remove(id: string) {
		const coffee = await this.findOne(id);
		return coffee.remove();
	}

	async recommendCoffee(coffee: Coffee) {
		const session = await this.connection.startSession();
		session.startTransaction();

		try {
			coffee.recommendations++;

			const recommendEvent = new this.eventModel({
				name: 'recommend_coffee',
				type: 'coffee',
			});
			await recommendEvent.save({ session });
			await coffee.save({ session });

			await session.commitTransaction();
		} catch (err) {
			await session.abortTransaction();
		} finally {
			session.endSession();
		}
	}
}
