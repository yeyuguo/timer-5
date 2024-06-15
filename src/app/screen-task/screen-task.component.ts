import { CdkDrag, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AsyncPipe, DatePipe, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, inject } from '@angular/core';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ButtonTaskActionsComponent } from '@app/button-task-actions/button-task-actions.component';
import {
  KEYS_DELETE_TASK,
  KEYS_MARK_ACTIVE,
  KEYS_MARK_FINISHED,
  KEYS_RENAME,
  KEYS_START_STOP,
  hotkey,
} from '@app/domain/hotkeys';
import { StoreState } from '@app/domain/storage';
import { Task, TaskState, isTaskRunning, sessionDuration } from '@app/domain/task';
import { deleteTask, renameTaskIntent, startTask, stopTask, updateTaskState } from '@app/ngrx/actions';
import { selectCurrentTask } from '@app/ngrx/selectors';
import { FormatDurationPipe } from '@app/pipes/format-duration.pipe';
import { MapPipe } from '@app/pipes/map.pipe';
import { TaskDurationPipe } from '@app/pipes/task-duration.pipe';
import { TaskStateIconPipe } from '@app/pipes/task-state-icon.pipe';
import { Store } from '@ngrx/store';
import { HotkeysService } from 'angular2-hotkeys';
import { ButtonSessionActionsComponent } from './button-session-actions/button-session-actions.component';

@Component({
  selector: 'screen-task',
  templateUrl: './screen-task.component.html',
  styleUrls: ['./screen-task.component.scss', './mat-table.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TaskStateIconPipe,
    MatToolbarModule,
    MatIcon,
    MatTooltip,
    FormatDurationPipe,
    TaskDurationPipe,
    ButtonTaskActionsComponent,
    ButtonSessionActionsComponent,
    MapPipe,
    CdkDrag,
    CdkDragPlaceholder,
    CdkDropList,
    AsyncPipe,
    DatePipe,
    RouterLink,
    MatIconButton,
    MatFabButton,
    ScrollingModule,
    NgStyle,
  ],
})
export class ScreenTaskComponent {
  private store = inject<Store<StoreState>>(Store);
  private keys = inject<HotkeysService>(HotkeysService);
  private destroyRef = inject(DestroyRef);

  task = this.store.selectSignal(selectCurrentTask);
  taskIsInProgress = computed(() => isTaskRunning(this.task()));

  sessionDuration = sessionDuration;
  hotkeys = [
    hotkey(KEYS_START_STOP, 'Start/stop task', (e) => {
      const task = this.task();
      const inProgress = this.taskIsInProgress();
      if (!task) {
        return;
      }
      if (inProgress) {
        this.stop(task.id);
      } else {
        this.start(task.id);
      }
    }),
    hotkey(KEYS_MARK_FINISHED, `Mark as finished`, (e) => {
      const task = this.task();
      if (task) {
        this.store.dispatch(updateTaskState({ taskId: task.id, state: TaskState.finished }));
      }
    }),
    hotkey(KEYS_MARK_ACTIVE, `Mark as active`, (e) => {
      const task = this.task();
      if (task) {
        this.store.dispatch(updateTaskState({ taskId: task.id, state: TaskState.active }));
      }
    }),
    hotkey(KEYS_RENAME, 'Rename task', () => {
      const task = this.task();
      if (task) {
        this.store.dispatch(renameTaskIntent({ taskId: task.id }));
      }
    }),
    hotkey(KEYS_DELETE_TASK, 'Delete task', () => {
      const task = this.task();
      if (task) {
        this.store.dispatch(deleteTask({ taskId: task.id }));
      }
    }),
  ];
  displayedColumns = ['start', 'end', 'duration', 'action'];

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.keys.remove(this.hotkeys);
    });
    afterNextRender(() => {
      this.keys.add(this.hotkeys);
    });
  }
  start(taskId?: string) {
    if (taskId) this.store.dispatch(startTask({ taskId, timestamp: Date.now() }));
  }
  stop(taskId?: string) {
    if (taskId) this.store.dispatch(stopTask({ taskId, timestamp: Date.now() }));
  }
  deleteTask(task?: Task) {
    if (task) this.store.dispatch(deleteTask({ taskId: task.id }));
  }
}
