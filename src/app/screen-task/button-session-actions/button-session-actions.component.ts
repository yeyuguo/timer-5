import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { encodeFilterParams } from '@app/domain/router';
import { StoreState } from '@app/domain/storage';
import { Session, Task } from '@app/domain/task';
import * as actions from '@app/ngrx/actions';
import { Store } from '@ngrx/store';

@Component({
  templateUrl: './button-session-actions.component.html',
  styleUrls: ['./button-session-actions.component.scss'],
  selector: 'button-session-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonSessionActionsComponent {
  constructor(private store: Store<StoreState>) {}
  @Input() task?: Task;
  @Input() session?: Session;
  edit() {
    if (this.task && this.session)
      this.store.dispatch(
        actions.updateSessionIntent({
          taskId: this.task.id,
          sessionIndex: this.task.sessions.indexOf(this.session),
        })
      );
  }
  remove() {
    if (this.task && this.session)
      this.store.dispatch(
        actions.deleteSession({ taskId: this.task.id, sessionIndex: this.task.sessions.indexOf(this.session) })
      );
  }
  get skipBeforeParams() {
    return this.session ? encodeFilterParams({ from: new Date(this.session.start) }) : {};
  }
  get skipAfterParams() {
    return encodeFilterParams({ to: new Date(this.session?.end ?? new Date()) });
  }
}
