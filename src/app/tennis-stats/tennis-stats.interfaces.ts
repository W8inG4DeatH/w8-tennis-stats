export interface ITennisPlayer
{
    Id: number;
    PlayerName: string;
}

export interface ISurface
{
    value: ESurface;
    name: string;
}

export interface IMatchDuration
{
    value: EMatchDuration;
    name: string;
}

export interface IDecidedSet
{
    value: EDecidedSet;
    name: string;
}

export interface ITennisPlayerStats
{
    byAll: IStatsPointEvent;
    byServe: IStatsPointEvent;
    bySurface: IStatsPointEvent;
    byPoints: IStatsPointEvent;
    byPointsGames: IStatsPointEvent;
    byPointsGamesSets: IStatsPointEvent;
    predictionSUMOwn: IStatsPointEvent;
    predictionSUMOpp: IStatsPointEvent;
    predictionSUM: IStatsPointEvent;
    predictionAVGOwn: IStatsPointEvent;
    predictionAVGOpp: IStatsPointEvent;
    predictionAVG: IStatsPointEvent;
}

export interface IMatchScore
{
    sets: IGameSetEvent;
    games: IGameSetEvent;
    points: IPointEvent;
}

export interface IGameSetEvent
{
    win: number;
    lose: number;
    winDisplay?: string;
    loseDisplay?: string;
}

export interface IPointEvent
{
    win: number;
    lose: number;
    p1OnServe: EOnServe;
    winAdvs: number;
    loseAdvs: number;
    winDisplay?: string;
    loseDisplay?: string;
}

export interface IStatsPointEvent
{
    win: number;
    lose: number;
    probability: number;
    percent: number;
    odd: number;
    oddDisplay: string;
}

export enum ESurface
{
    Hard,
    iHard,
    Clay,
    Grass
}

export enum EMatchDuration
{
    BestOf3,
    BestOf5
}

export enum EDecidedSet
{
    DecidedSetTieBreak,
    DecidedSetNoTieBreak
}

export enum EOnServe
{
    serve,
    receive
}
