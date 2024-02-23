import { Component, ViewChild, HostListener, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { IMenuTab } from './app.interfaces';

import { AppService } from './app.service';

@Component( {
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: [ './app.component.scss' ]
} )

export class AppComponent implements OnInit
{
    public iMenuTab = IMenuTab;
    public menuTab: IMenuTab = IMenuTab.dashboard;
    opened = true;

    constructor(
        public appService: AppService
    )
    {
        // Initialization inside the constructor
        this.sidenav = {} as MatSidenav;
    }

    @ViewChild( 'sidenav', { static: true } ) sidenav: MatSidenav;

    ngOnInit(): void
    {
        console.log( window.innerWidth );
        if ( window.innerWidth < 768 )
        {
            this.sidenav.fixedTopGap = 55;
            this.opened = false;
        } else
        {
            this.sidenav.fixedTopGap = 55;
            this.opened = true;
        }
    }

    OnMenuClick( menuTab: IMenuTab ): void
    {
        this.menuTab = menuTab;
    }

    @HostListener( 'window:resize', [ '$event' ] )
    onResize( event: any ): void
    {
        if ( event.target.innerWidth < 768 )
        {
            this.sidenav.fixedTopGap = 55;
            this.opened = false;
        } else
        {
            this.sidenav.fixedTopGap = 55;
            this.opened = true;
        }
    }

    isBiggerScreen(): boolean
    {
        const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        return ( width < 768 );
    }
}
