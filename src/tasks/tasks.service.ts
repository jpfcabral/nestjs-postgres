import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { v4 as uuid } from 'uuid'
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>
    ){}
    // getAllTasks(): Task[] {
    //     return this.tasks;
    // }

    // getTaskWithFilters(filterDto: GetTasksFilterDto): Task[] {
    //     const { status, search } = filterDto;
    //     let tasks = this.getAllTasks();

    //     if (status) {
    //         tasks = tasks.filter(task => task.status === status);
    //     }

    //     if (search) {
    //         tasks = tasks.filter(task => task.title.includes(search) || task.description.includes(search));
    //     }

    //     return tasks;
    // }
    
    async getTaskById(id: string): Promise<Task> {
        const found = await this.tasksRepository.findOne({where: {id: id}});
        if (!found) {
            throw new NotFoundException(`Task with id ${id} not found`);
        }
        return found;
    }
    async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
        const { title, description } = createTaskDto;

        const task = this.tasksRepository.create({
            title,
            description,
            status: TaskStatus.OPEN,
        });

        await this.tasksRepository.save(task);
        return task;
    }

    async deleteTask(id: string): Promise<void> {
        const result = await this.tasksRepository.delete({id: id});
        if (result.affected === 0) {
            throw new NotFoundException(`Task with id ${id} not found`);
        }
    }

    async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
        const task = await this.getTaskById(id);
        task.status = status;
        await this.tasksRepository.save(task);
        return task;
    }
}
