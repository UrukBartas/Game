import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';
import { ToastrModule } from 'ngx-toastr';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { MainState } from 'src/store/main.store';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HttpUrukInterceptor } from 'src/services/http-uruk.interceptor';
import { ContextMenuComponent } from 'src/standalone/context-menu/context-menu.component';

@NgModule({
  declarations: [AppComponent, TemplatePage],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    NgxsModule.forRoot([MainState]),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsStoragePluginModule.forRoot({
      key: ['main'],
    }),
    ToastrModule.forRoot(),
    NgxSpinnerModule,
    ModalModule.forRoot(),
    ContextMenuComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpUrukInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
