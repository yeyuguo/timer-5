import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatDialogConfig, MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TaskStateIconPipeModule } from '@app/pipes/task-state-icon.pipe';
import { ReactiveComponentModule } from '@ngrx/component';
import { EffectsModule } from '@ngrx/effects';
import { MinimalRouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { HotkeyModule } from 'angular2-hotkeys';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DialogEditSessionModule } from './dialog-edit-session/dialog-edit-session.module';
import { DialogHotkeysCheatsheetModule } from './dialog-hotkeys-cheatsheet/dialog-hotkeys-cheatsheet.module';
import { DialogPromptModule } from './dialog-prompt/dialog-prompt.module';
import { decodeFilterMatrixParams, encodeFilterParams, FilterMatrixParams } from './domain/router';
import { FilterFormModule } from './filter-form/filter-form.module';
import { Effects } from './ngrx/effects';
import { metaReducers } from './ngrx/metareducers';
import * as reducers from './ngrx/reducers';
import { ScreenTaskModule } from './screen-task/screen-task.module';
import { ScreenTasksModule } from './screen-tasks/screen-tasks.module';
import { TestComponent } from './test/test.component';

@NgModule({
  declarations: [AppComponent, TestComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    ReactiveComponentModule,
    AppRoutingModule,
    ScreenTasksModule,
    ScreenTaskModule,
    MatSidenavModule,
    MatMenuModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    TaskStateIconPipeModule,
    DialogPromptModule,
    DialogEditSessionModule,
    HttpClientModule,
    DialogHotkeysCheatsheetModule,
    HotkeyModule.forRoot({ cheatSheetCloseEsc: true }),
    StoreModule.forRoot(reducers.combinedReducers, {
      metaReducers,
      initialState: { router: null },
      runtimeChecks: {
        strictStateImmutability: true,
      },
    }),
    StoreRouterConnectingModule.forRoot({
      serializer: MinimalRouterStateSerializer,
    }),
    EffectsModule.forRoot([Effects]),
    FilterFormModule.forChild<FilterMatrixParams>({
      urlFragmentIndex: 2,
      encoder: encodeFilterParams,
      decoder: decodeFilterMatrixParams,
    }),
  ],
  providers: [
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useFactory(): MatDialogConfig<any> {
        return { width: '520px', autoFocus: true };
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
