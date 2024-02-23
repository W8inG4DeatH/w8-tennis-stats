import * as _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { AppService } from './../app.service';
import { TennisStatsService } from './tennis-stats.service';
import { EDecidedSet, EMatchDuration, EOnServe, ESurface, IPointEvent } from './tennis-stats.interfaces';
import { IDecidedSet, IMatchDuration, IMatchScore, ISurface, ITennisPlayer, IStatsPointEvent, ITennisPlayerStats } from './tennis-stats.interfaces';

@Component( {
    selector: 'app-tennis-stats',
    templateUrl: './tennis-stats.component.html',
    styleUrls: [ './tennis-stats.component.scss' ]
} )

export class TennisStatsComponent implements OnInit
{
    public DEBUGGER = false;

    public allTennisPlayers: Array<ITennisPlayer> = [];
    public allSurfaces: Array<ISurface> = [];
    public allMatchDurations: Array<IMatchDuration> = [];
    public allDecidedSetOptions: Array<IDecidedSet> = [];
    public newPlayerName = '';
    public deletePlayerId = 0;

    public surface: ISurface = {} as ISurface;
    public matchDuration: IMatchDuration = {} as IMatchDuration;
    public decidedSet: IDecidedSet = {} as IDecidedSet;
    public player1: ITennisPlayer = {} as ITennisPlayer;
    public player2: ITennisPlayer = {} as ITennisPlayer;
    public isPlayer1OnServeNow: EOnServe = EOnServe.serve;

    public matchScore: Array<IMatchScore> = [];
    public isMatchEnded = false;
    public player1StatsOverall: any = {};
    public player2StatsOverall: any = {};
    public player1StatsOverallDisplay: ITennisPlayerStats = {} as ITennisPlayerStats;
    public player2StatsOverallDisplay: ITennisPlayerStats = {} as ITennisPlayerStats;
    public player1StatsNow: Array<any> = [];
    public player2StatsNow: Array<any> = [];
    public player1StatsNowDisplay: ITennisPlayerStats = {} as ITennisPlayerStats;
    public player2StatsNowDisplay: ITennisPlayerStats = {} as ITennisPlayerStats;

    public matchStats = '';
    // public matchStats = this.tennisStatsService.GetMatchStatsMock();
    public sets: Array<string> = [];
    public isServerChoosed: boolean = false;

    constructor(
        public appService: AppService,
        public tennisStatsService: TennisStatsService
    )
    {
    }

    ngOnInit(): void
    {
        this.tennisStatsService.LoadAllTennisPlayers().subscribe( ( response: Array<ITennisPlayer> ) =>
        {
            this.allTennisPlayers = response;
        } );

        this.InitSelectors();
        this.ClearMatchScore();
        this.ClearPlayerStatsDisplay();
    }

    InitSelectors(): void
    {
        this.allSurfaces = this.tennisStatsService.GetAllEnumsNameEnumValue( ESurface );
        this.allMatchDurations = this.tennisStatsService.GetAllEnumsNameEnumValue( EMatchDuration );
        this.allDecidedSetOptions = this.tennisStatsService.GetAllEnumsNameEnumValue( EDecidedSet );
        this.surface = this.allSurfaces[ 2 ];
        this.matchDuration = this.allMatchDurations[ 0 ];
        this.decidedSet = this.allDecidedSetOptions[ 0 ];
    }

    ClearMatchScore(): void
    {
        this.matchScore = [ {
            sets: { win: 0, lose: 0 },
            games: { win: 0, lose: 0 },
            points: { win: 0, lose: 0, p1OnServe: EOnServe.serve, winAdvs: 0, loseAdvs: 0, winDisplay: '0', loseDisplay: '0' }
        } ];
        this.isMatchEnded = false;
        this.sets = [];
    }

    ClearPlayerStatsDisplay(): void
    {
        this.player1StatsNowDisplay = {} as ITennisPlayerStats;
        this.player1StatsOverallDisplay = {} as ITennisPlayerStats;
        this.player2StatsNowDisplay = {} as ITennisPlayerStats;
        this.player2StatsOverallDisplay = {} as ITennisPlayerStats;

        _.forEach(
            [ this.player1StatsNowDisplay, this.player2StatsNowDisplay, this.player1StatsOverallDisplay, this.player2StatsOverallDisplay ],
            ( playerStatsDisplay ) =>
            {
                playerStatsDisplay.byAll = this.GetNewStatsPointEventObject();
                playerStatsDisplay.byServe = this.GetNewStatsPointEventObject();
                playerStatsDisplay.bySurface = this.GetNewStatsPointEventObject();
                playerStatsDisplay.byPoints = this.GetNewStatsPointEventObject();
                playerStatsDisplay.byPointsGames = this.GetNewStatsPointEventObject();
                playerStatsDisplay.byPointsGamesSets = this.GetNewStatsPointEventObject();
                playerStatsDisplay.predictionSUMOwn = this.GetNewStatsPointEventObject();
                playerStatsDisplay.predictionSUMOpp = this.GetNewStatsPointEventObject();
                playerStatsDisplay.predictionSUM = this.GetNewStatsPointEventObject();
                playerStatsDisplay.predictionAVGOwn = this.GetNewStatsPointEventObject();
                playerStatsDisplay.predictionAVGOpp = this.GetNewStatsPointEventObject();
                playerStatsDisplay.predictionAVG = this.GetNewStatsPointEventObject();
            } );
    }

    OnPlayerPoint( player1Point: boolean, withDisplay = true ): void
    {
        // console.log( 'OnPlayerPoint:', player1Point );
        const newMatchScore: IMatchScore = _.cloneDeep( this.matchScore[ this.matchScore.length - 1 ] );

        const isDecidedSet = (
            ( ( this.matchDuration.value === EMatchDuration.BestOf3 )
                && ( newMatchScore.sets.win === 1 ) && ( newMatchScore.sets.lose === 1 ) )
            || ( ( this.matchDuration.value === EMatchDuration.BestOf5 )
                && ( newMatchScore.sets.win === 2 ) && ( newMatchScore.sets.lose === 2 ) )
        );
        const isTieBreak = (
            ( newMatchScore.games.win === 6 ) && ( newMatchScore.games.lose === 6 )
            && !( isDecidedSet && ( this.decidedSet.value === EDecidedSet.DecidedSetNoTieBreak ) )
        );

        if ( player1Point )
        {
            newMatchScore.points.win++;
            if ( !isTieBreak && ( newMatchScore.points.win > 3 ) && ( newMatchScore.points.win === ( newMatchScore.points.lose + 1 ) ) )
            {
                newMatchScore.points.winAdvs++;
            }
        }
        else
        {
            newMatchScore.points.lose++;
            if ( !isTieBreak && ( newMatchScore.points.lose > 3 ) && ( newMatchScore.points.lose === ( newMatchScore.points.win + 1 ) ) )
            {
                newMatchScore.points.loseAdvs++;
            }
        }
        newMatchScore.points.p1OnServe = this.isPlayer1OnServeNow;

        // serve change
        const changeServer = ( () =>
        {
            this.isPlayer1OnServeNow = ( this.isPlayer1OnServeNow === EOnServe.serve ) ? EOnServe.receive : EOnServe.serve;
        } );
        // CheckAnyPlayerWinsGame
        const gameWinningPoints = ( isTieBreak ? 7 : 4 );
        const gameCompleted = ( () =>
        {
            if ( isTieBreak )
            {
                if ( Math.floor( ( newMatchScore.points.win + newMatchScore.points.lose ) / 2 ) % 2 === 0 )
                {
                    changeServer();
                }
            }
            else
            {
                changeServer();
            }
            newMatchScore.points.win = 0;
            newMatchScore.points.lose = 0;
            newMatchScore.points.winAdvs = 0;
            newMatchScore.points.loseAdvs = 0;
        } );
        if ( ( newMatchScore.points.win >= gameWinningPoints ) && ( newMatchScore.points.lose < ( newMatchScore.points.win - 1 ) ) )
        {
            newMatchScore.games.win++;
            gameCompleted();
        }
        else if ( ( newMatchScore.points.lose >= gameWinningPoints ) && ( newMatchScore.points.win < ( newMatchScore.points.lose - 1 ) ) )
        {
            newMatchScore.games.lose++;
            gameCompleted();
        }
        else if ( isTieBreak && ( ( newMatchScore.points.win + newMatchScore.points.lose ) % 2 === 1 ) )
        {
            changeServer();
        }    

        // CheckAnyPlayerWinsSet
        if (
            ( isTieBreak && ( newMatchScore.games.win > 6 ) )
            || ( ( newMatchScore.games.win >= 6 )
                && ( newMatchScore.games.lose < ( newMatchScore.games.win - 1 ) ) )
        )
        {
            this.sets[ newMatchScore.sets.win + newMatchScore.sets.lose ] = newMatchScore.games.win.toString() + ':' + newMatchScore.games.lose.toString();
            newMatchScore.sets.win++;
            newMatchScore.games.win = 0;
            newMatchScore.games.lose = 0;
        }
        else if (
            ( isTieBreak && ( newMatchScore.games.lose > 6 ) )
            || ( ( newMatchScore.games.lose >= 6 )
                && ( newMatchScore.games.win < ( newMatchScore.games.lose - 1 ) ) )
        )
        {
            this.sets[ newMatchScore.sets.win + newMatchScore.sets.lose ] = newMatchScore.games.win.toString() + ':' + newMatchScore.games.lose.toString();
            newMatchScore.sets.lose++;
            newMatchScore.games.win = 0;
            newMatchScore.games.lose = 0;
        }

        // CheckIfMatchEnded
        const maxSets = Math.max( newMatchScore.sets.win, newMatchScore.sets.lose );
        this.isMatchEnded = (
            ( ( this.matchDuration.value === EMatchDuration.BestOf3 ) && ( maxSets > 1 ) )
            || ( ( this.matchDuration.value === EMatchDuration.BestOf5 ) && ( maxSets > 2 ) )
        );

        // PointsDisplays
        if ( isTieBreak )
        {
            newMatchScore.points.winDisplay = newMatchScore.points.win.toString();
            newMatchScore.points.loseDisplay = newMatchScore.points.lose.toString();
        }
        else
        {
            if ( ( newMatchScore.points.win > 2 ) && ( newMatchScore.points.lose > 2 ) )
            {
                if ( newMatchScore.points.win > newMatchScore.points.lose )
                {
                    newMatchScore.points.winDisplay = 'AD #' + newMatchScore.points.winAdvs.toString();
                    newMatchScore.points.loseDisplay = '40';
                }
                else if ( newMatchScore.points.lose > newMatchScore.points.win )
                {
                    newMatchScore.points.loseDisplay = 'AD #' + newMatchScore.points.loseAdvs.toString();
                    newMatchScore.points.winDisplay = '40';
                }
                else
                {
                    newMatchScore.points.winDisplay = '40 #' + ( newMatchScore.points.winAdvs + newMatchScore.points.loseAdvs + 1 );
                    newMatchScore.points.loseDisplay = '40 #' + ( newMatchScore.points.winAdvs + newMatchScore.points.loseAdvs + 1 );
                }
            }
            else
            {
                newMatchScore.points.winDisplay = ( Math.min( ( newMatchScore.points.win * 15 ), 40 ) ).toString();
                newMatchScore.points.loseDisplay = ( Math.min( ( newMatchScore.points.lose * 15 ), 40 ) ).toString();
            }
        }

        this.matchScore.push( newMatchScore );

        this.UpdatePlayersStats( player1Point );

        if ( withDisplay )
        {
            this.DisplayPlayersStats();
        }
    }

    UpdatePlayersStats( player1Point: boolean ): void
    {
        const baseScoreState: IMatchScore = this.matchScore[ this.matchScore.length - 2 ];
        const isPlayer1OnServeNow: EOnServe
            = ( this.matchScore[ this.matchScore.length - 1 ].points.p1OnServe === EOnServe.serve ) ? EOnServe.serve : EOnServe.receive;
        const isPlayer2OnServeNow: EOnServe
            = ( this.matchScore[ this.matchScore.length - 1 ].points.p1OnServe === EOnServe.receive ) ? EOnServe.serve : EOnServe.receive;
        const newPlayer1Stats: any = _.cloneDeep( this.player1StatsNow[ this.player1StatsNow.length - 1 ] ) || {};
        const newPlayer2Stats: any = _.cloneDeep( this.player2StatsNow[ this.player2StatsNow.length - 1 ] ) || {};

        const player1PointsKey = baseScoreState.points.win + '-' + baseScoreState.points.winAdvs
            + ':' + baseScoreState.points.lose + '-' + baseScoreState.points.loseAdvs;
        const player2PointsKey = baseScoreState.points.lose + '-' + baseScoreState.points.loseAdvs
            + ':' + baseScoreState.points.win + '-' + baseScoreState.points.winAdvs;
        const player1GamesKey = baseScoreState.games.win + ':' + baseScoreState.games.lose;
        const player2GamesKey = baseScoreState.games.lose + ':' + baseScoreState.games.win;
        const player1SetsKey = baseScoreState.sets.win + ':' + baseScoreState.sets.lose;
        const player2SetsKey = baseScoreState.sets.lose + ':' + baseScoreState.sets.win;

        // serve
        if ( !newPlayer1Stats[ isPlayer1OnServeNow ] ) { newPlayer1Stats[ isPlayer1OnServeNow ] = {}; }
        if ( !newPlayer2Stats[ isPlayer2OnServeNow ] ) { newPlayer2Stats[ isPlayer2OnServeNow ] = {}; }

        // surface
        if ( !newPlayer1Stats[ isPlayer1OnServeNow ][ this.surface.name ] )
        {
            newPlayer1Stats[ isPlayer1OnServeNow ][ this.surface.name ] = {};
        }
        if ( !newPlayer2Stats[ isPlayer2OnServeNow ][ this.surface.name ] )
        {
            newPlayer2Stats[ isPlayer2OnServeNow ][ this.surface.name ] = {};
        }

        // points
        if ( !newPlayer1Stats[ isPlayer1OnServeNow ][ this.surface.name ][ player1PointsKey ] )
        {
            newPlayer1Stats[ isPlayer1OnServeNow ][ this.surface.name ][ player1PointsKey ] = {};
        }
        if ( !newPlayer2Stats[ isPlayer2OnServeNow ][ this.surface.name ][ player2PointsKey ] )
        {
            newPlayer2Stats[ isPlayer2OnServeNow ][ this.surface.name ][ player2PointsKey ] = {};
        }

        // games
        if ( !newPlayer1Stats[ isPlayer1OnServeNow ][ this.surface.name ][ player1PointsKey ][ player1GamesKey ] )
        {
            newPlayer1Stats[ isPlayer1OnServeNow ][ this.surface.name ][ player1PointsKey ][ player1GamesKey ] = {};
        }
        if ( !newPlayer2Stats[ isPlayer2OnServeNow ][ this.surface.name ][ player2PointsKey ][ player2GamesKey ] )
        {
            newPlayer2Stats[ isPlayer2OnServeNow ][ this.surface.name ][ player2PointsKey ][ player2GamesKey ] = {};
        }

        // sets
        if ( !newPlayer1Stats[ isPlayer1OnServeNow ][ this.surface.name ][ player1PointsKey ][ player1GamesKey ][ player1SetsKey ] )
        {
            newPlayer1Stats[ isPlayer1OnServeNow ][ this.surface.name ][ player1PointsKey ][ player1GamesKey ][ player1SetsKey ]
                = {} as IMatchScore;
            newPlayer1Stats[ isPlayer1OnServeNow ][ this.surface.name ][ player1PointsKey ][ player1GamesKey ][ player1SetsKey ] = {
                win: 0, lose: 0
            };
        }
        player1Point ?
            newPlayer1Stats[ isPlayer1OnServeNow ][ this.surface.name ][ player1PointsKey ][ player1GamesKey ][ player1SetsKey ].win++
            : newPlayer1Stats[ isPlayer1OnServeNow ][ this.surface.name ][ player1PointsKey ][ player1GamesKey ][ player1SetsKey ].lose++;
        const player1Wins
            = newPlayer1Stats[ isPlayer1OnServeNow ][ this.surface.name ][ player1PointsKey ][ player1GamesKey ][ player1SetsKey ].win;
        const player1Loses
            = newPlayer1Stats[ isPlayer1OnServeNow ][ this.surface.name ][ player1PointsKey ][ player1GamesKey ][ player1SetsKey ].lose;

        if ( !newPlayer2Stats[ isPlayer2OnServeNow ][ this.surface.name ][ player2PointsKey ][ player2GamesKey ][ player2SetsKey ] )
        {
            newPlayer2Stats[ isPlayer2OnServeNow ][ this.surface.name ][ player2PointsKey ][ player2GamesKey ][ player2SetsKey ]
                = {} as IMatchScore;
            newPlayer2Stats[ isPlayer2OnServeNow ][ this.surface.name ][ player2PointsKey ][ player2GamesKey ][ player2SetsKey ] = {
                win: 0, lose: 0
            };
        }
        player1Point ?
            newPlayer2Stats[ isPlayer2OnServeNow ][ this.surface.name ][ player2PointsKey ][ player2GamesKey ][ player2SetsKey ].lose++
            : newPlayer2Stats[ isPlayer2OnServeNow ][ this.surface.name ][ player2PointsKey ][ player2GamesKey ][ player2SetsKey ].win++;
        const player2Wins
            = newPlayer2Stats[ isPlayer2OnServeNow ][ this.surface.name ][ player2PointsKey ][ player2GamesKey ][ player2SetsKey ].win;
        const player2Loses
            = newPlayer2Stats[ isPlayer2OnServeNow ][ this.surface.name ][ player2PointsKey ][ player2GamesKey ][ player2SetsKey ].lose;

        this.player1StatsNow.push( newPlayer1Stats );
        this.player2StatsNow.push( newPlayer2Stats );
    }

    DisplayPlayersStats(): void
    {
        this.player1StatsNowDisplay = this.GetPlayerStatsToDisplay( this.player1StatsNow[ this.player1StatsNow.length - 1 ] );
        this.player1StatsOverallDisplay = this.GetPlayerStatsToDisplay( this.player1StatsOverall );
        this.player2StatsNowDisplay = this.GetPlayerStatsToDisplay( this.player2StatsNow[ this.player2StatsNow.length - 1 ], true );
        this.player2StatsOverallDisplay = this.GetPlayerStatsToDisplay( this.player2StatsOverall, true );
        this.CalculatePredictions();
    }

    GetPlayerStatsToDisplay( playerStats: any, isSecondPlayer = false ): ITennisPlayerStats
    {
        const playerStatsToDisplay: ITennisPlayerStats = {} as ITennisPlayerStats;
        const currentMatchScore = this.matchScore[ this.matchScore.length - 1 ];
        const currentServeKey = ( !isSecondPlayer ) ? this.isPlayer1OnServeNow
            : ( ( this.isPlayer1OnServeNow === EOnServe.serve ) ? EOnServe.receive : EOnServe.serve );
        const currentPointsKey = ( !isSecondPlayer )
            ? ( currentMatchScore.points.win + '-' + currentMatchScore.points.winAdvs
                + ':' + currentMatchScore.points.lose + '-' + currentMatchScore.points.loseAdvs )
            : ( currentMatchScore.points.lose + '-' + currentMatchScore.points.loseAdvs
                + ':' + currentMatchScore.points.win + '-' + currentMatchScore.points.winAdvs );
        const currentGamesKey = ( !isSecondPlayer )
            ? ( currentMatchScore.games.win + ':' + currentMatchScore.games.lose )
            : ( currentMatchScore.games.lose + ':' + currentMatchScore.games.win );
        const currentSetsKey = ( !isSecondPlayer )
            ? ( currentMatchScore.sets.win + ':' + currentMatchScore.sets.lose )
            : ( currentMatchScore.sets.lose + ':' + currentMatchScore.sets.win );

        playerStatsToDisplay.byAll = this.GetNewStatsPointEventObject();
        playerStatsToDisplay.byServe = this.GetNewStatsPointEventObject();
        playerStatsToDisplay.bySurface = this.GetNewStatsPointEventObject();
        playerStatsToDisplay.byPoints = this.GetNewStatsPointEventObject();
        playerStatsToDisplay.byPointsGames = this.GetNewStatsPointEventObject();
        playerStatsToDisplay.byPointsGamesSets = this.GetNewStatsPointEventObject();
        playerStatsToDisplay.predictionSUMOwn = this.GetNewStatsPointEventObject();
        playerStatsToDisplay.predictionSUMOpp = this.GetNewStatsPointEventObject();
        playerStatsToDisplay.predictionSUM = this.GetNewStatsPointEventObject();
        playerStatsToDisplay.predictionAVGOwn = this.GetNewStatsPointEventObject();
        playerStatsToDisplay.predictionAVGOpp = this.GetNewStatsPointEventObject();
        playerStatsToDisplay.predictionAVG = this.GetNewStatsPointEventObject();

        if ( playerStats )
        {
            // byAll:
            _.forEach( playerStats, ( serveStats ) =>
            {
                _.forEach( serveStats, ( surfaceStats ) =>
                {
                    _.forEach( surfaceStats, ( pointsStats ) =>
                    {
                        _.forEach( pointsStats, ( gamesStats ) =>
                        {
                            _.forEach( gamesStats, ( setsStats ) =>
                            {
                                playerStatsToDisplay.byAll
                                    = this.GetSumStatsPointEventObjects( playerStatsToDisplay.byAll, setsStats );
                            } );
                        } );
                    } );
                } );
            } );
            playerStatsToDisplay.byAll = this.CalculateStatsPointEventObject( playerStatsToDisplay.byAll );


            if ( playerStats[ currentServeKey ] )
            {
                // byServe:
                _.forEach( playerStats[ currentServeKey ], ( surfaceStats ) =>
                {
                    _.forEach( surfaceStats, ( pointsStats ) =>
                    {
                        _.forEach( pointsStats, ( gamesStats ) =>
                        {
                            _.forEach( gamesStats, ( setsStats ) =>
                            {
                                playerStatsToDisplay.byServe
                                    = this.GetSumStatsPointEventObjects( playerStatsToDisplay.byServe, setsStats );
                            } );
                        } );
                    } );
                } );
                playerStatsToDisplay.byServe = this.CalculateStatsPointEventObject( playerStatsToDisplay.byServe );

                if ( playerStats[ currentServeKey ][ this.surface.name ] )
                {
                    // bySurface:
                    _.forEach( playerStats[ currentServeKey ][ this.surface.name ], ( pointsStats ) =>
                    {
                        _.forEach( pointsStats, ( gamesStats ) =>
                        {
                            _.forEach( gamesStats, ( setsStats ) =>
                            {
                                playerStatsToDisplay.bySurface
                                    = this.GetSumStatsPointEventObjects( playerStatsToDisplay.bySurface, setsStats );
                            } );
                        } );
                    } );
                    playerStatsToDisplay.bySurface = this.CalculateStatsPointEventObject( playerStatsToDisplay.bySurface );

                    if ( playerStats[ currentServeKey ][ this.surface.name ][ currentPointsKey ] )
                    {
                        // byPoints:
                        _.forEach( playerStats[ currentServeKey ][ this.surface.name ][ currentPointsKey ], ( gamesStats ) =>
                        {
                            _.forEach( gamesStats, ( setsStats ) =>
                            {
                                playerStatsToDisplay.byPoints
                                    = this.GetSumStatsPointEventObjects( playerStatsToDisplay.byPoints, setsStats );
                            } );
                        } );
                        playerStatsToDisplay.byPoints = this.CalculateStatsPointEventObject( playerStatsToDisplay.byPoints );

                        if ( playerStats[ currentServeKey ][ this.surface.name ][ currentPointsKey ][ currentGamesKey ] )
                        {
                            // byPointsGames:
                            _.forEach( playerStats[ currentServeKey ][ this.surface.name ][ currentPointsKey ][ currentGamesKey ],
                                ( setsStats ) =>
                                {
                                    playerStatsToDisplay.byPointsGames
                                        = this.GetSumStatsPointEventObjects( playerStatsToDisplay.byPointsGames, setsStats );
                                } );
                            playerStatsToDisplay.byPointsGames = this.CalculateStatsPointEventObject( playerStatsToDisplay.byPointsGames );

                            if ( playerStats[ currentServeKey ][ this.surface.name ]
                            [ currentPointsKey ][ currentGamesKey ][ currentSetsKey ] )
                            {
                                // byPointsGamesSets:
                                playerStatsToDisplay.byPointsGamesSets
                                    = playerStats[ currentServeKey ][ this.surface.name ]
                                    [ currentPointsKey ][ currentGamesKey ][ currentSetsKey ];
                                playerStatsToDisplay.byPointsGamesSets
                                    = this.CalculateStatsPointEventObject( playerStatsToDisplay.byPointsGamesSets );
                            }
                        }
                    }
                }
            }
        }

        return playerStatsToDisplay;
    }

    CalculatePredictions()
    {
        if ( ( this.player1.Id > 0 ) && ( this.player2.Id > 0 ) )
        {
            _.forEach( [ this.player1StatsNowDisplay, this.player2StatsNowDisplay, this.player1StatsOverallDisplay, this.player2StatsOverallDisplay ], ( playerStatsToDisplay ) =>
            {
                /////////////
                // SUM OWN //
                playerStatsToDisplay.predictionSUMOwn.win =
                    playerStatsToDisplay.byServe.win + playerStatsToDisplay.bySurface.win + playerStatsToDisplay.byPoints.win
                    + playerStatsToDisplay.byPointsGames.win + playerStatsToDisplay.byPointsGamesSets.win;
                playerStatsToDisplay.predictionSUMOwn.lose =
                    playerStatsToDisplay.byServe.lose + playerStatsToDisplay.bySurface.lose + playerStatsToDisplay.byPoints.lose
                    + playerStatsToDisplay.byPointsGames.lose + playerStatsToDisplay.byPointsGamesSets.lose;
                playerStatsToDisplay.predictionSUMOwn = this.CalculateStatsPointEventObject( playerStatsToDisplay.predictionSUMOwn );

                /////////////
                // AVG OWN //
                playerStatsToDisplay.predictionAVGOwn.win = 0;
                playerStatsToDisplay.predictionAVGOwn.lose = 0;
                playerStatsToDisplay.predictionAVGOwn.probability = this.tennisStatsService.GetAverageOfElements( [
                    playerStatsToDisplay.byServe.probability, playerStatsToDisplay.bySurface.probability, playerStatsToDisplay.byPoints.probability,
                    playerStatsToDisplay.byPointsGames.probability, playerStatsToDisplay.byPointsGamesSets.probability
                ] );
                playerStatsToDisplay.predictionAVGOwn = this.CalculateStatsPointEventObject( playerStatsToDisplay.predictionAVGOwn, playerStatsToDisplay.predictionAVGOwn.probability );
            } );

            this.player1StatsNowDisplay.predictionSUMOpp.probability = ( 1 - this.player2StatsNowDisplay.predictionSUMOwn.probability );
            this.player1StatsNowDisplay.predictionSUMOpp = this.CalculateStatsPointEventObject( this.player1StatsNowDisplay.predictionSUMOpp, this.player1StatsNowDisplay.predictionSUMOpp.probability );
            this.player1StatsNowDisplay.predictionSUM.probability = ( this.player1StatsNowDisplay.predictionSUMOwn.probability + this.player1StatsNowDisplay.predictionSUMOpp.probability ) / 2;
            this.player1StatsNowDisplay.predictionSUM = this.CalculateStatsPointEventObject( this.player1StatsNowDisplay.predictionSUM, this.player1StatsNowDisplay.predictionSUM.probability );
            this.player1StatsNowDisplay.predictionAVGOpp.probability = ( 1 - this.player2StatsNowDisplay.predictionAVGOwn.probability );
            this.player1StatsNowDisplay.predictionAVGOpp = this.CalculateStatsPointEventObject( this.player1StatsNowDisplay.predictionAVGOpp, this.player1StatsNowDisplay.predictionAVGOpp.probability );
            this.player1StatsNowDisplay.predictionAVG.probability = ( this.player1StatsNowDisplay.predictionAVGOwn.probability + this.player1StatsNowDisplay.predictionAVGOpp.probability ) / 2;
            this.player1StatsNowDisplay.predictionAVG = this.CalculateStatsPointEventObject( this.player1StatsNowDisplay.predictionAVG, this.player1StatsNowDisplay.predictionAVG.probability );

            this.player2StatsNowDisplay.predictionSUMOpp.probability = ( 1 - this.player1StatsNowDisplay.predictionSUMOwn.probability );
            this.player2StatsNowDisplay.predictionSUMOpp = this.CalculateStatsPointEventObject( this.player2StatsNowDisplay.predictionSUMOpp, this.player2StatsNowDisplay.predictionSUMOpp.probability );
            this.player2StatsNowDisplay.predictionSUM.probability = ( this.player2StatsNowDisplay.predictionSUMOwn.probability + this.player2StatsNowDisplay.predictionSUMOpp.probability ) / 2;
            this.player2StatsNowDisplay.predictionSUM = this.CalculateStatsPointEventObject( this.player2StatsNowDisplay.predictionSUM, this.player2StatsNowDisplay.predictionSUM.probability );
            this.player2StatsNowDisplay.predictionAVGOpp.probability = ( 1 - this.player1StatsNowDisplay.predictionAVGOwn.probability );
            this.player2StatsNowDisplay.predictionAVGOpp = this.CalculateStatsPointEventObject( this.player2StatsNowDisplay.predictionAVGOpp, this.player2StatsNowDisplay.predictionAVGOpp.probability );
            this.player2StatsNowDisplay.predictionAVG.probability = ( this.player2StatsNowDisplay.predictionAVGOwn.probability + this.player2StatsNowDisplay.predictionAVGOpp.probability ) / 2;
            this.player2StatsNowDisplay.predictionAVG = this.CalculateStatsPointEventObject( this.player2StatsNowDisplay.predictionAVG, this.player2StatsNowDisplay.predictionAVG.probability );

            this.player1StatsOverallDisplay.predictionSUMOpp.probability = ( 1 - this.player2StatsOverallDisplay.predictionSUMOwn.probability );
            this.player1StatsOverallDisplay.predictionSUMOpp = this.CalculateStatsPointEventObject( this.player1StatsOverallDisplay.predictionSUMOpp, this.player1StatsOverallDisplay.predictionSUMOpp.probability );
            this.player1StatsOverallDisplay.predictionSUM.probability = ( this.player1StatsOverallDisplay.predictionSUMOwn.probability + this.player1StatsOverallDisplay.predictionSUMOpp.probability ) / 2;
            this.player1StatsOverallDisplay.predictionSUM = this.CalculateStatsPointEventObject( this.player1StatsOverallDisplay.predictionSUM, this.player1StatsOverallDisplay.predictionSUM.probability );
            this.player1StatsOverallDisplay.predictionAVGOpp.probability = ( 1 - this.player2StatsOverallDisplay.predictionAVGOwn.probability );
            this.player1StatsOverallDisplay.predictionAVGOpp = this.CalculateStatsPointEventObject( this.player1StatsOverallDisplay.predictionAVGOpp, this.player1StatsOverallDisplay.predictionAVGOpp.probability );
            this.player1StatsOverallDisplay.predictionAVG.probability = ( this.player1StatsOverallDisplay.predictionAVGOwn.probability + this.player1StatsOverallDisplay.predictionAVGOpp.probability ) / 2;
            this.player1StatsOverallDisplay.predictionAVG = this.CalculateStatsPointEventObject( this.player1StatsOverallDisplay.predictionAVG, this.player1StatsOverallDisplay.predictionAVG.probability );

            this.player2StatsOverallDisplay.predictionSUMOpp.probability = ( 1 - this.player1StatsOverallDisplay.predictionSUMOwn.probability );
            this.player2StatsOverallDisplay.predictionSUMOpp = this.CalculateStatsPointEventObject( this.player2StatsOverallDisplay.predictionSUMOpp, this.player2StatsOverallDisplay.predictionSUMOpp.probability );
            this.player2StatsOverallDisplay.predictionSUM.probability = ( this.player2StatsOverallDisplay.predictionSUMOwn.probability + this.player2StatsOverallDisplay.predictionSUMOpp.probability ) / 2;
            this.player2StatsOverallDisplay.predictionSUM = this.CalculateStatsPointEventObject( this.player2StatsOverallDisplay.predictionSUM, this.player2StatsOverallDisplay.predictionSUM.probability );
            this.player2StatsOverallDisplay.predictionAVGOpp.probability = ( 1 - this.player1StatsOverallDisplay.predictionAVGOwn.probability );
            this.player2StatsOverallDisplay.predictionAVGOpp = this.CalculateStatsPointEventObject( this.player2StatsOverallDisplay.predictionAVGOpp, this.player2StatsOverallDisplay.predictionAVGOpp.probability );
            this.player2StatsOverallDisplay.predictionAVG.probability = ( this.player2StatsOverallDisplay.predictionAVGOwn.probability + this.player2StatsOverallDisplay.predictionAVGOpp.probability ) / 2;
            this.player2StatsOverallDisplay.predictionAVG = this.CalculateStatsPointEventObject( this.player2StatsOverallDisplay.predictionAVG, this.player2StatsOverallDisplay.predictionAVG.probability );
        }
    }

    OnSimulateMatch(): void
    {
        while (this.isMatchEnded !== true)
        {
            this.OnPlayerPoint(this.player1StatsOverallDisplay.predictionAVG.probability > this.player2StatsOverallDisplay.predictionAVG.probability);
        }
        this.DisplayPlayersStats();
    }

    GetNewStatsPointEventObject(): IStatsPointEvent
    {
        return {
            win: 0,
            lose: 0,
            probability: 0,
            percent: 0,
            odd: 0,
            oddDisplay: '0.00'
        };
    }

    GetSumStatsPointEventObjects( statsPoint1: IStatsPointEvent, statsPoint2: IStatsPointEvent ): IStatsPointEvent
    {
        const statsPointsSum: IStatsPointEvent = this.GetNewStatsPointEventObject();
        statsPointsSum.win = statsPoint1.win + statsPoint2.win;
        statsPointsSum.lose = statsPoint1.lose + statsPoint2.lose;
        return statsPointsSum;
    }

    CalculateStatsPointEventObject( statsPoint: IStatsPointEvent, probability: number = 0 ): IStatsPointEvent
    {
        if ( probability === 0 )
        {
            if ( ( statsPoint.win + statsPoint.lose ) === 0 )
            {
                statsPoint.probability = 0;
            }
            else
            {
                statsPoint.probability = statsPoint.win / ( statsPoint.win + statsPoint.lose );
            }
        }
        else
        {
            statsPoint.probability = probability;
        }
        statsPoint.percent = Math.round( 100 * statsPoint.probability );
        statsPoint.odd = this.GetOddByProbability( statsPoint.probability );
        statsPoint.oddDisplay = statsPoint.odd.toFixed( 2 );
        return statsPoint;
    }

    GetOddByProbability( probability: number ): number
    {
        let odd = 0;
        if ( probability > 0 )
        {
            odd = Number( ( 1 / probability ).toFixed( 2 ) );
        }
        return odd;
    }

    OnScorePointBack(): void
    {
        if ( this.matchScore.length > 1 )
        {
            this.isPlayer1OnServeNow = this.matchScore[ this.matchScore.length - 1 ].points.p1OnServe;
            this.matchScore.pop();
            this.player1StatsNow.pop();
            this.player2StatsNow.pop();
            this.DisplayPlayersStats();
            this.isMatchEnded = false;
        }
    }

    OnPlayer1Change(): void
    {
        this.tennisStatsService.LoadTennisPlayerStats( this.player1.Id ).subscribe( ( response: any ) =>
        {
            console.log( 'Player 1: ', response );
            this.player1StatsOverall = JSON.parse( response[ 0 ].PlayerStats );
            this.player1StatsOverallDisplay = this.GetPlayerStatsToDisplay( this.player1StatsOverall );
            this.CalculatePredictions();
            this.isServerChoosed = false;
        } );
    }
    OnPlayer2Change(): void
    {
        this.tennisStatsService.LoadTennisPlayerStats( this.player2.Id ).subscribe( ( response: any ) =>
        {
            console.log( 'Player 2: ', response );
            this.player2StatsOverall = JSON.parse( response[ 0 ].PlayerStats );
            this.player2StatsOverallDisplay = this.GetPlayerStatsToDisplay( this.player2StatsOverall, true );
            this.CalculatePredictions();
            this.isServerChoosed = false;
        } );
    }

    OnServerClick( p1OnServe: EOnServe ): void
    {
        this.isPlayer1OnServeNow = p1OnServe;
        this.isServerChoosed = true;
        this.DisplayPlayersStats();
    }

    OnAddPlayerClick(): void
    {
        this.tennisStatsService.SaveTennisPlayer( this.newPlayerName ).subscribe( ( result: any ) =>
        {
            this.tennisStatsService.SaveTennisPlayerStats().subscribe( ( statsResult: any ) =>
            {
                this.tennisStatsService.LoadAllTennisPlayers().subscribe( ( response: Array<ITennisPlayer> ) =>
                {
                    this.allTennisPlayers = response;
                } );
            } );
        } );
        this.newPlayerName = '';
    }

    OnRemovePlayerClick(): void
    {
        if ( ( this.deletePlayerId > 0 ) && ( this.deletePlayerId !== this.player1.Id ) && ( this.deletePlayerId !== this.player2.Id ) )
        {
            this.tennisStatsService.DeleteTennisPlayer( this.deletePlayerId ).subscribe( ( result: any ) =>
            {
                this.tennisStatsService.DeleteTennisPlayerStats( this.deletePlayerId ).subscribe( ( statsResult: any ) =>
                {
                    this.tennisStatsService.LoadAllTennisPlayers().subscribe( ( response: Array<ITennisPlayer> ) =>
                    {
                        this.allTennisPlayers = response;
                    } );
                } );
            } );
        }
    }

    ///////////
    // STATS //
    ///////////
    OnAddMatchStatsClick(): void
    {
        if ( ( this.player1.Id > 0 ) && ( this.player2.Id > 0 ) )
        {
            let isTiebreak = false;
            const tieBreakScore: IPointEvent = {} as IPointEvent;

            const matchStatsTable: Array<string> = this.matchStats.split( '\n' );

            const ProcessGame = ( ( gameRow: string ) =>
            {
                const gameScores = gameRow.split( ', ' );
                let beforeP1Point = 0;
                let beforeP2Point = 0;
                // console.log( 'GAME:' );
                for ( const gameScore of gameScores )
                {
                    const points: Array<string> = gameScore.split( ':' );
                    points[ 0 ] = points[ 0 ].replace( 'BP', '' );
                    points[ 0 ] = points[ 0 ].replace( 'SP', '' );
                    points[ 0 ] = points[ 0 ].replace( 'PS', '' );
                    points[ 0 ] = points[ 0 ].replace( 'MP', '' );
                    points[ 0 ] = points[ 0 ].replace( 'PM', '' );
                    points[ 1 ] = points[ 1 ].replace( 'BP', '' );
                    points[ 1 ] = points[ 1 ].replace( 'SP', '' );
                    points[ 1 ] = points[ 1 ].replace( 'PS', '' );
                    points[ 1 ] = points[ 1 ].replace( 'PM', '' );
                    const p1Point = ( isNaN( Number( points[ 0 ] ) ) ? 50 : Number( points[ 0 ] ) );
                    const p2Point = ( isNaN( Number( points[ 1 ] ) ) ? 50 : Number( points[ 1 ] ) );
                    const p1Score: boolean = ( ( p1Point > beforeP1Point )
                        || ( p2Point < beforeP2Point ) );

                    this.OnPlayerPoint( p1Score, false );

                    beforeP1Point = p1Point;
                    beforeP2Point = p2Point;
                }
                const p1LastScore = ( beforeP1Point > beforeP2Point );

                this.OnPlayerPoint( p1LastScore, false );
            } );

            for ( const [ rowIndex, statsRow ] of matchStatsTable.entries() )
            {
                if ( !this.isMatchEnded )
                {
                    if ( !isTiebreak && ( ( statsRow.indexOf( '0:' ) === 0 ) || ( statsRow.indexOf( '15:' ) === 0 ) ) )
                    {
                        ProcessGame( statsRow );
                    }
                    else if ( statsRow.indexOf( 'Tiebreak' ) > -1 )
                    {
                        // console.log( 'TIEBREAK:' );
                        isTiebreak = true;
                        tieBreakScore.win = 0;
                        tieBreakScore.lose = 0;
                    }
                    else if ( statsRow.indexOf( 'Point by point - Set' ) > -1 )
                    {
                        isTiebreak = false;
                    }
                    else if ( isTiebreak && ( statsRow.indexOf( '-' ) > -1 ) )
                    {
                        const p1TBPoints = Number( matchStatsTable[ +rowIndex - 1 ] );
                        const p2TBPoints = Number( matchStatsTable[ +rowIndex + 1 ] );
                        const p1Score: boolean = ( p1TBPoints > tieBreakScore.win );

                        this.OnPlayerPoint( p1Score, false );

                        tieBreakScore.win = p1TBPoints;
                        tieBreakScore.lose = p2TBPoints;
                    }
                }
            }

            this.DisplayPlayersStats();

            this.matchStats = '';
        }
    }

    GetSumOfPlayerStats( playerStatsOverall: any, playerStatsNow: any ): void
    {
        _.forEach( playerStatsNow, ( serveStats, serveKey ) =>
        {
            if ( !playerStatsOverall[ serveKey ] )
            { playerStatsOverall[ serveKey ] = {}; }
            _.forEach( serveStats, ( surfaceStats, surfaceKey ) =>
            {
                if ( !playerStatsOverall[ serveKey ][ surfaceKey ] )
                { playerStatsOverall[ serveKey ][ surfaceKey ] = {}; }
                _.forEach( surfaceStats, ( pointsStats, pointsKey ) =>
                {
                    if ( !playerStatsOverall[ serveKey ][ surfaceKey ][ pointsKey ] )
                    { playerStatsOverall[ serveKey ][ surfaceKey ][ pointsKey ] = {}; }
                    _.forEach( pointsStats, ( gamesStats, gamesKey ) =>
                    {
                        if ( !playerStatsOverall[ serveKey ][ surfaceKey ][ pointsKey ][ gamesKey ] )
                        { playerStatsOverall[ serveKey ][ surfaceKey ][ pointsKey ][ gamesKey ] = {}; }
                        _.forEach( gamesStats, ( setsStats, setsKey ) =>
                        {
                            if ( !playerStatsOverall[ serveKey ][ surfaceKey ][ pointsKey ][ gamesKey ][ setsKey ] )
                            {
                                playerStatsOverall[ serveKey ][ surfaceKey ][ pointsKey ][ gamesKey ][ setsKey ] = {
                                    win: 0, lose: 0
                                };
                            }

                            playerStatsOverall[ serveKey ][ surfaceKey ][ pointsKey ][ gamesKey ][ setsKey ].win
                                = playerStatsOverall[ serveKey ][ surfaceKey ][ pointsKey ][ gamesKey ][ setsKey ].win
                                + setsStats.win;

                            playerStatsOverall[ serveKey ][ surfaceKey ][ pointsKey ][ gamesKey ][ setsKey ].lose
                                = playerStatsOverall[ serveKey ][ surfaceKey ][ pointsKey ][ gamesKey ][ setsKey ].lose
                                + setsStats.lose;
                        } );
                    } );
                } );
            } );
        } );

        return playerStatsOverall;
    }

    OnSaveMatchStatsClick(): void
    {
        if ( ( this.player1.Id > 0 ) && ( this.player2.Id > 0 ) && this.isMatchEnded )
        {
            this.ClearPlayerStatsDisplay();
            this.ClearMatchScore();

            this.player1StatsOverall = this.GetSumOfPlayerStats(
                this.player1StatsOverall,
                this.player1StatsNow[ this.player1StatsNow.length - 1 ]
            );
            this.tennisStatsService.UpdateTennisPlayerStats(
                this.player1.Id,
                JSON.stringify( this.player1StatsOverall )
            ).subscribe( ( result: any ) =>
            {
                this.player1StatsNow = [];
                this.player1StatsOverallDisplay = this.GetPlayerStatsToDisplay( this.player1StatsOverall );
                this.CalculatePredictions();
            } );

            this.player2StatsOverall = this.GetSumOfPlayerStats(
                this.player2StatsOverall,
                this.player2StatsNow[ this.player2StatsNow.length - 1 ]
            );
            this.tennisStatsService.UpdateTennisPlayerStats(
                this.player2.Id,
                JSON.stringify( this.player2StatsOverall )
            ).subscribe( ( result: any ) =>
            {
                this.player2StatsNow = [];
                this.player2StatsOverallDisplay = this.GetPlayerStatsToDisplay( this.player2StatsOverall );
                this.CalculatePredictions();
            } );
        }
    }

}
