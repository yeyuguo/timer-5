import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AsyncPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TrackByFunction,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatToolbar } from '@angular/material/toolbar';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonTaskActionsComponent } from '@app/button-task-actions/button-task-actions.component';
import { KEYS_ADD, KEYS_NEXT, KEYS_PREV, KEYS_SEARCH, hotkey } from '@app/domain/hotkeys';
import { SessionDragEvent, Task, TaskState, isTaskRunning } from '@app/domain/task';
import { FormatDurationPipe } from '@app/pipes/format-duration.pipe';
import { MapPipe } from '@app/pipes/map.pipe';
import { TaskDurationPipe } from '@app/pipes/task-duration.pipe';
import { TaskStateIconPipe } from '@app/pipes/task-state-icon.pipe';
import { TaskStatePipe } from '@app/pipes/task-state.pipe';
import { TasksDurationPipe } from '@app/pipes/tasks-duration.pipe';
import { AppStore } from '@app/services/state';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { CheckViewportSizeWhenValueChangesDirective } from './checkViewportSizeWhenValueChanges.directive';
import { EmptyStateComponent } from './empty-state/empty-state.component';
import { ScrollToIndexDirective } from './scrollToIndex.directive';
import { TasksFilterComponent } from './tasks-filter/tasks-filter.component';

@Component({
  selector: 'screen-tasks',
  templateUrl: './screen-tasks.component.html',
  styleUrls: ['./screen-tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    EmptyStateComponent,
    TasksFilterComponent,
    TaskStatePipe,
    FormatDurationPipe,
    TaskDurationPipe,
    TasksDurationPipe,
    TaskStateIconPipe,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    ScrollingModule,
    MatToolbar,
    MatIcon,
    MatButton,
    MatIconButton,
    MatFabButton,
    MatNavList,
    MatListItem,
    MatTooltip,
    ButtonTaskActionsComponent,
    MapPipe,
    DragDropModule,
    CheckViewportSizeWhenValueChangesDirective,
    ScrollToIndexDirective,
    AsyncPipe,
    NgClass,
  ],
})
export default class ScreenTasksComponent {
  public store = inject(AppStore);
  private keys = inject(HotkeysService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private filterPresent = computed(() => !!Object.keys(this.store.decodedFilterParams()).length);
  private filterToggles = signal<boolean | undefined>(undefined);
  public searchOpened = computed(() => {
    const filterPresent = this.filterPresent();
    const filterToggles = this.filterToggles();
    return filterToggles !== undefined ? filterToggles : filterPresent;
  });

  constructor() {
    afterNextRender(() => {
      this.keys.add(this.hotkeys);
    });
    this.destroyRef.onDestroy(() => {
      this.keys.remove(this.hotkeys);
    });
  }

  taskState = TaskState;
  isTaskRunning = isTaskRunning;
  taskId: TrackByFunction<Task> = (_, task) => task.id;

  hotkeys = [
    hotkey(KEYS_ADD, 'Add task', () => this.store.createTask()),
    hotkey([...KEYS_NEXT, ...KEYS_PREV], 'Next/prev task', (e) => {
      const state = this.store.currentTaskState();
      const taskId = KEYS_NEXT.includes(e.key)
        ? this.store.nextTaskId()
        : KEYS_PREV.includes(e.key)
          ? this.store.prevTaskId()
          : null;
      if (state && taskId) this.router.navigate([state, taskId], { queryParamsHandling: 'merge' });
    }),
    new Hotkey(
      KEYS_SEARCH,
      (e) => {
        e.preventDefault();
        this.toggleFilter();
        return true;
      },
      ['INPUT'],
      'Toggle search',
    ),
  ];

  toggleFilter(opened?: boolean) {
    this.filterToggles.update(() => opened ?? !this.searchOpened());
  }
  onDrop(
    {
      item: {
        data: [session, fromTaskid],
      },
    }: SessionDragEvent,
    item: Task,
  ) {
    if (session && fromTaskid) this.store.moveSessionToTask(fromTaskid, item.id, session);
  }
}
