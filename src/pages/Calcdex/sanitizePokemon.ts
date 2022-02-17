// import { v4 as uuidv4 } from 'uuid';
// import { upsizeArray } from '@showdex/utils/core';
// import { logger } from '@showdex/utils/debug';
// import type { AbilityName, ItemName } from '@pkmn/dex';
import type { CalcdexPokemon } from './CalcdexReducer';
import { calcPokemonCalcdexId } from './calcCalcdexId';
import { calcPokemonCalcdexNonce } from './calcCalcdexNonce';
import { detectPokemonIdent } from './detectPokemonIdent';
import { sanitizeSpeciesForme } from './sanitizeSpeciesForme';

// const l = logger('Calcdex/sanitizePokemon');

export const sanitizePokemon = (pokemon: Partial<Showdown.Pokemon & CalcdexPokemon>): CalcdexPokemon => {
  const sanitizedPokemon: CalcdexPokemon = {
    calcdexId: pokemon?.calcdexId,
    // calcdexId: uuidv4(),
    calcdexNonce: pokemon?.calcdexNonce,

    // slot: pokemon?.slot || -1,
    ident: detectPokemonIdent(pokemon),
    searchid: pokemon?.searchid,
    speciesForme: sanitizeSpeciesForme(pokemon?.volatiles?.formechange?.[1] ?? pokemon?.speciesForme),

    name: pokemon?.name,
    details: pokemon?.details,
    level: pokemon?.level || 0,
    gender: pokemon?.gender,

    types: pokemon?.types ?? [],

    ability: pokemon?.ability,
    dirtyAbility: pokemon?.dirtyAbility ?? null,
    baseAbility: pokemon?.baseAbility,
    abilities: pokemon?.abilities ?? [],
    altAbilities: pokemon?.altAbilities ?? [],

    item: pokemon?.item,
    // dirtyItem: pokemon?.dirtyItem ?? false,
    // dirtyItem: false,
    dirtyItem: pokemon?.dirtyItem ?? null,
    altItems: pokemon?.altItems ?? [],
    itemEffect: pokemon?.itemEffect,
    prevItem: pokemon?.prevItem,
    prevItemEffect: pokemon?.prevItemEffect,

    nature: pokemon?.nature,
    // natures: pokemon?.natures ?? [], // now using `PokemonNatures` from `@showdex/consts`

    ivs: {
      hp: pokemon?.ivs?.hp ?? 31,
      atk: pokemon?.ivs?.atk ?? 31,
      def: pokemon?.ivs?.def ?? 31,
      spa: pokemon?.ivs?.spa ?? 31,
      spd: pokemon?.ivs?.spd ?? 31,
      spe: pokemon?.ivs?.spe ?? 31,
    },

    evs: {
      hp: pokemon?.evs?.hp ?? 0,
      atk: pokemon?.evs?.atk ?? 0,
      def: pokemon?.evs?.def ?? 0,
      spa: pokemon?.evs?.spa ?? 0,
      spd: pokemon?.evs?.spd ?? 0,
      spe: pokemon?.evs?.spe ?? 0,
    },

    boosts: {
      atk: typeof pokemon?.boosts?.atk === 'number' ? pokemon.boosts.atk : 0,
      def: typeof pokemon?.boosts?.def === 'number' ? pokemon.boosts.def : 0,
      spa: typeof pokemon?.boosts?.spa === 'number' ? pokemon.boosts.spa : 0,
      spd: typeof pokemon?.boosts?.spd === 'number' ? pokemon.boosts.spd : 0,
      spe: typeof pokemon?.boosts?.spe === 'number' ? pokemon.boosts.spe : 0,
    },

    dirtyBoosts: {
      atk: pokemon?.dirtyBoosts?.atk,
      def: pokemon?.dirtyBoosts?.def,
      spa: pokemon?.dirtyBoosts?.spa,
      spd: pokemon?.dirtyBoosts?.spd,
      spe: pokemon?.dirtyBoosts?.spe,
    },

    status: pokemon?.status,
    statusData: {
      sleepTurns: pokemon?.statusData?.sleepTurns || 0,
      toxicTurns: pokemon?.statusData?.toxicTurns || 0,
    },

    volatiles: pokemon?.volatiles,
    turnstatuses: pokemon?.turnstatuses,
    toxicCounter: pokemon?.statusData?.toxicTurns,

    hp: pokemon?.hp || 0,
    maxhp: pokemon?.maxhp || 1,
    fainted: pokemon?.fainted || !pokemon?.hp,

    // moves: upsizeArray(pokemon?.moves, 4, null, true),
    moves: pokemon?.moves || [],
    altMoves: pokemon?.altMoves || [],
    lastMove: pokemon?.lastMove,
    // moveTrack: [...(pokemon?.moveTrack || [] as [moveName: MoveName, ppUsed: number][])],
    moveTrack: pokemon?.moveTrack || [],
    moveState: {
      revealed: pokemon?.moveState?.revealed ?? [],
      learnset: pokemon?.moveState?.learnset ?? [],
      other: pokemon?.moveState?.other ?? [],
    },

    calculatedStats: {
      hp: pokemon?.calculatedStats?.hp ?? 0,
      atk: pokemon?.calculatedStats?.atk ?? 0,
      def: pokemon?.calculatedStats?.def ?? 0,
      spa: pokemon?.calculatedStats?.spa ?? 0,
      spd: pokemon?.calculatedStats?.spd ?? 0,
      spe: pokemon?.calculatedStats?.spe ?? 0,
    },

    criticalHit: pokemon?.criticalHit ?? false,

    preset: pokemon?.preset,
    presets: pokemon?.presets ?? [],
    autoPreset: pokemon?.autoPreset ?? true,
  };

  const calcdexId = calcPokemonCalcdexId(sanitizedPokemon);

  if (!sanitizedPokemon?.calcdexId || sanitizedPokemon.calcdexId !== calcdexId) {
    sanitizedPokemon.calcdexId = calcdexId;
  }

  sanitizedPokemon.calcdexNonce = calcPokemonCalcdexNonce(sanitizedPokemon);

  return sanitizedPokemon;
};