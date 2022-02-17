import { PokemonStatNames } from '@showdex/consts';
import { logger } from '@showdex/utils/debug';
import type { Generation } from '@pkmn/data';
import type { CalcdexPokemon } from './CalcdexReducer';
// import { detectPokemonIdent } from './detectPokemonIdent';
import { detectSpeciesForme } from './detectSpeciesForme';

const l = logger('Calcdex/calcPokemonStats');

const initialStats: CalcdexPokemon['calculatedStats'] = {
  hp: 0,
  atk: 0,
  def: 0,
  spa: 0,
  spd: 0,
  spe: 0,
};

export const calcPokemonStats = (
  dex: Generation,
  pokemon: Partial<CalcdexPokemon>,
): CalcdexPokemon['calculatedStats'] => {
  if (typeof dex?.stats?.calc !== 'function' || typeof dex?.species?.get !== 'function') {
    l.warn(
      'cannot calculate stats since dex.stats.calc() and/or dex.species.get() are not available',
      '\n', 'dex', dex,
      '\n', 'pokemon', pokemon,
    );

    return initialStats;
  }

  const speciesForme = detectSpeciesForme(pokemon);

  if (!speciesForme) {
    l.warn(
      'cannot calculate stats since the Pokemon\'s detected speciesForme is falsy',
      // '\n', 'pokemon.ident', pokemon?.ident,
      '\n', 'speciesForme', speciesForme,
      '\n', 'pokemon', pokemon,
    );

    return initialStats;
  }

  const species = dex.species.get(speciesForme);

  const nature = pokemon?.nature && typeof dex.natures?.get === 'function' ?
    dex.natures.get(pokemon.nature) :
    undefined;

  // rebuild the Pokemon's base stats to make sure all values are available
  const baseStats: CalcdexPokemon['baseStats'] = {
    hp: pokemon?.baseStats?.hp ?? species?.baseStats?.hp ?? 0,
    atk: pokemon?.baseStats?.atk ?? species?.baseStats?.atk ?? 0,
    def: pokemon?.baseStats?.def ?? species?.baseStats?.def ?? 0,
    spa: pokemon?.baseStats?.spa ?? species?.baseStats?.spa ?? 0,
    spd: pokemon?.baseStats?.spd ?? species?.baseStats?.spd ?? 0,
    spe: pokemon?.baseStats?.spe ?? species?.baseStats?.spe ?? 0,
  };

  // do the same thing for the Pokemon's IVs and EVs
  const ivs: CalcdexPokemon['ivs'] = {
    hp: pokemon?.ivs?.hp ?? 31,
    atk: pokemon?.ivs?.atk ?? 31,
    def: pokemon?.ivs?.def ?? 31,
    spa: pokemon?.ivs?.spa ?? 31,
    spd: pokemon?.ivs?.spd ?? 31,
    spe: pokemon?.ivs?.spe ?? 31,
  };

  const evs: CalcdexPokemon['evs'] = {
    hp: pokemon?.evs?.hp ?? 0,
    atk: pokemon?.evs?.atk ?? 0,
    def: pokemon?.evs?.def ?? 0,
    spa: pokemon?.evs?.spa ?? 0,
    spd: pokemon?.evs?.spd ?? 0,
    spe: pokemon?.evs?.spe ?? 0,
  };

  // for `dirtyBoosts`, remove any stats w/ falsy values (e.g., 0, null, undefined).
  // `dirtyBoosts` stats w/ falsy values should fallback to their corresponding stats' values in `boosts`.
  // const dirtyBoosts: CalcdexPokemon['dirtyBoosts'] = {
  //   ...pokemon?.dirtyBoosts,
  // };

  // Object.entries(dirtyBoosts).filter(([, value]) => !value).forEach(([key]) => {
  //   delete dirtyBoosts[key];
  // });

  // rebuild the Pokemon's boosts that incorporates values from both their actual `boosts` and
  // `dirtyBoosts` (boost values set by the user and not by the game)
  const boosts: CalcdexPokemon['boosts'] = {
    atk: (pokemon?.dirtyBoosts?.atk ?? pokemon?.boosts?.atk) || 0,
    def: (pokemon?.dirtyBoosts?.def ?? pokemon?.boosts?.def) || 0,
    spa: (pokemon?.dirtyBoosts?.spa ?? pokemon?.boosts?.spa) || 0,
    spd: (pokemon?.dirtyBoosts?.spd ?? pokemon?.boosts?.spd) || 0,
    spe: (pokemon?.dirtyBoosts?.spe ?? pokemon?.boosts?.spe) || 0,
    // ...pokemon?.boosts,
    // ...dirtyBoosts,
  };

  const calculatedStats: CalcdexPokemon['calculatedStats'] = PokemonStatNames.reduce((prev, stat) => {
    prev[stat] = dex.stats.calc(
      stat,
      baseStats[stat],
      ivs[stat],
      evs[stat],
      pokemon?.level || 100,
      nature,
    );

    // re-calculate any boosted stat (except for HP, obviously)
    if (stat !== 'hp' && stat in boosts) {
      const stage = boosts[stat];

      if (stage) {
        const clampedStage = Math.min(Math.max(stage, -6), 6); // -6 <= stage <= 6
        const multiplier = ((Math.abs(clampedStage) + 2) / 2) ** (clampedStage < 0 ? -1 : 1);

        prev[stat] *= multiplier;
      }
    }

    return prev;
  }, { ...initialStats });

  l.debug(
    'calcPokemonStats() -> return calculatedStats',
    '\n', 'stats calculated for Pokemon', pokemon.ident || pokemon.speciesForme,
    '\n', 'calculatedStats', calculatedStats,
    '\n', 'pokemon', pokemon,
    '\n', 'speciesForme', speciesForme,
  );

  return calculatedStats;
};