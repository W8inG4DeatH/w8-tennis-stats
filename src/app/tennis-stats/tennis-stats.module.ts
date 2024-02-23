import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { TennisStatsComponent } from './tennis-stats.component';
import { TennisStatsService } from './tennis-stats.service';

/* Angular material */
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './../angular-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AngularMaterialModule,
        FlexLayoutModule,
        FormsModule,
        OrderModule
    ],
    declarations: [
        TennisStatsComponent
    ],
    providers: [
        TennisStatsService
    ],
    exports: [
        TennisStatsComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})

export class TennisStatsModule { }
