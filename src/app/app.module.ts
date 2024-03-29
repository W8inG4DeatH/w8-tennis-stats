import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

/* Angular material */
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './angular-material.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppService } from './app.service';

import { DashboardModule } from './dashboard/dashboard.module';
import { TennisStatsModule } from './tennis-stats/tennis-stats.module';

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        AngularMaterialModule,
        FlexLayoutModule,
        FormsModule,
        BrowserAnimationsModule,
        DashboardModule,
        TennisStatsModule
    ],
    declarations: [
        AppComponent
    ],
    providers: [
        AppService
    ],
    bootstrap: [
        AppComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class AppModule { }
