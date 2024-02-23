import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';

/* Angular material */
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './../angular-material.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
    imports: [
        AngularMaterialModule,
        BrowserAnimationsModule
    ],
    declarations: [
        DashboardComponent
    ],
    providers: [
        DashboardService
    ],
    exports: [
        DashboardComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})

export class DashboardModule { }