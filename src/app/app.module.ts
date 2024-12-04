import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
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
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FocuserComponent } from 'src/standalone/focuser/focuser.component';
import { ConnectComponent } from 'src/modules/game/activities/connect/connect.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThreePortalService } from 'src/modules/game/activities/connect/service/three-portal.service';
import { StackPipe } from 'src/modules/core/pipes/stack.pipe';
import { RedirectPageComponent } from 'src/modules/core/components/redirect-page/redirect-page.component';
import * as echarts from 'echarts'; // Importa ECharts
import { NgxEchartsModule } from 'ngx-echarts';
import { TimeAgoPipe } from './time-ago.pipe';

@NgModule({
  declarations: [
    AppComponent,
    TemplatePage,
    ConnectComponent,
    RedirectPageComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    TabsModule.forRoot(),
    NgxsModule.forRoot([MainState]),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    ToastrModule.forRoot(),
    NgxSpinnerModule,
    ModalModule.forRoot(),
    ContextMenuComponent,
    FocuserComponent,
    FormsModule,
    ReactiveFormsModule,
    NgxEchartsModule.forRoot({ echarts }), // Configuración predeterminada
  ],
  providers: [
    ThreePortalService,
    StackPipe,
    TimeAgoPipe,
    { provide: HTTP_INTERCEPTORS, useClass: HttpUrukInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

