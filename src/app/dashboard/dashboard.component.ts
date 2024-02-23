import * as _ from 'lodash';
import { Component } from '@angular/core';
import { DashboardService } from './dashboard.service';

@Component( {
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: [ './dashboard.component.scss' ]
} )

export class DashboardComponent
{
    public score: any;

    constructor(
        public dashboardService: DashboardService
    )
    {
        this.score = ':)';
    }

}
