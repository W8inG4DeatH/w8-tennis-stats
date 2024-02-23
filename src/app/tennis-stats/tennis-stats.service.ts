import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TennisStatsService
{
    constructor(
        private $http: HttpClient
    )
    {
    }

    LoadAllTennisPlayers(): any
    {
        return this.$http.get( './assets/php/tennis-players-get.php' );
    }

    SaveTennisPlayer( newPlayerName: string ): any
    {
        return this.$http.post<string>( './assets/php/tennis-players-set.php', newPlayerName );
    }

    DeleteTennisPlayer( playerId: number ): any
    {
        return this.$http.post<string>( './assets/php/tennis-players-del.php', playerId );
    }

    LoadTennisPlayerStats( playerId: number ): any
    {
        return this.$http.get( './assets/php/tennis-players-stats-get.php?Id=' + playerId );
    }

    SaveTennisPlayerStats( playerStats = {} ): any
    {
        return this.$http.post<string>( './assets/php/tennis-players-stats-set.php', playerStats );
    }

    UpdateTennisPlayerStats( playerId: number, playerStats: string ): any
    {
        return this.$http.post<string>( './assets/php/tennis-players-stats-edit.php', { id: playerId, stats: playerStats } );
    }

    DeleteTennisPlayerStats( playerId: number ): any
    {
        return this.$http.post<string>( './assets/php/tennis-players-stats-del.php', playerId );
    }

    GetAllEnumsNameEnumValue( myEnum: any ): Array<any>
    {
        const allEnums: Array<any> = [];
        let enumsLength = 0;
        _.forEach( myEnum, ( value ) =>
        {
            enumsLength++;
        } );
        for ( let index = 0; index < ( enumsLength / 2 ); index++ )
        {
            allEnums.push(
                {
                    value: index,
                    name: myEnum[ index ]
                }
            );
        }
        return allEnums;
    }

    GetAverageOfElements( values: Array<number> ): number
    {
        let averageValue = 0;
        for ( const value of values )
        {
            averageValue += value;
        }
        averageValue = averageValue / values.length;
        return averageValue;
    }

    GetMatchStatsMock(): any
    {
        return 'Point by point - Set 1\n0\n-\n1\n0:15, 15:15, 15:30, 15:40, 30:40, 40:40, 40:A\nLOST SERVE\n0\n-\n2\n0:15, 15:15, 15:30, 15:40BP, 30:40BP\n0\n-\n3\n0:15, 15:15, 15:30, 15:40\nLOST SERVE\n0\n-\n4\n0:15, 0:30, 0:40BP, 15:40BP, 30:40BP\n0\n-\n5\n0:15, 0:30, 15:30, 15:40\n1\n-\n5\n0:15, 15:15, 30:15, 40:15, 40:30, 40:40, 40:ABPSP, 40:40, 40:ABPSP, 40:40, A:40\n1\n-\n6\n15:0, 30:0, 30:15, 30:30, 30:40SP\nPoint by point - Set 2\n1\n-\n0\n0:15, 15:15, 15:30, 30:30, 30:40BP, 40:40, A:40, 40:40, A:40\n1\n-\n1\n15:0, 15:15, 30:15, 30:30, 30:40, 40:40, 40:A\n2\n-\n1\n15:0, 30:0, 40:0\n2\n-\n2\n0:15, 0:30, 0:40, 15:40, 30:40\nLOST SERVE\n2\n-\n3\n0:15, 0:30, 0:40BP, 15:40BP\n3\n-\n3\nLOST SERVE\n15:0, 30:0, 30:15, 30:30, 40:30BP\n4\n-\n3\n15:0, 30:0, 40:0, 40:15\n4\n-\n4\n15:0, 15:15, 30:15, 30:30, 30:40\n5\n-\n4\n0:15, 15:15, 30:15, 30:30, 40:30\n5\n-\n5\n15:0, 15:15, 15:30, 15:40\n6\n-\n5\n15:0, 30:0, 30:15, 40:15, 40:30, 40:40, A:40, 40:40, A:40\n6\n-\n6\n15:0, 15:15, 30:15, 30:30, 30:40\n8\n7\n-\n66\nTiebreak - Set 2\nLOST SERVE\n0\n-\n1\n1\n-\n1\nLOST SERVE\n2\n-\n1\nLOST SERVE\n3\n-\n1\n4\n-\n1\n4\n-\n2\n4\n-\n3\nLOST SERVE\n4\n-\n4\n5\n-\n4\n5\n-\n5\nSP\n6\n-\n5\nLOST SERVE\nLOST SERVE\n6\n-\n6\nSP\n7\n-\n6\n8\n-\n6\nLOST SERVE\nPoint by point - Set 3\n1\n-\n0\nLOST SERVE\n15:0, 30:0, 40:0BP, 40:15BP, 40:30BP, 40:40, A:40BP\n2\n-\n0\n15:0, 30:0, 40:0, 40:15, 40:30, 40:40, A:40, 40:40, A:40\n3\n-\n0\nLOST SERVE\n15:0, 30:0, 40:0BP\n4\n-\n0\n0:15, 15:15, 30:15, 30:30, 40:30, 40:40, 40:ABP, 40:40, 40:ABP, 40:40, A:40, 40:40, 40:ABP, 40:40, 40:ABP, 40:40, A:40\n5\n-\n0\nLOST SERVE\n15:0, 30:0, 40:0BP, 40:15BP, 40:30BP\n6\n-\n0\n15:0, 30:0, 40:0MP';
    }
}
