import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { taskDuration } from '@app/domain/with-dom';

@Pipe({ name: 'taskDuration' })
export class TaskDurationPipe implements PipeTransform {
  transform = taskDuration;
}

@NgModule({ declarations: [TaskDurationPipe], exports: [TaskDurationPipe] })
export class TaskDurationPipeModule {}
