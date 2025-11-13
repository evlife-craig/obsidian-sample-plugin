/**
 * Test Magazine Table - Example from Mythic Magazine
 * This is a sample table to demonstrate magazine table functionality
 */

import { OracleTable, OracleType, DiceType } from '../../types';

/**
 * Sample Location Descriptor from Magazine
 */
export const magazineLocationTable: OracleTable = {
  id: 'magazine-location-descriptor',
  name: 'Location Descriptor',
  category: 'Descriptors',
  type: OracleType.DESCRIPTOR,
  diceType: DiceType.D20,
  description: 'Generate descriptive traits for locations and places',
  magazineVolume: 'Vol 1 #2',
  entries: [
    { range: [1, 1], result: 'Abandoned' },
    { range: [2, 2], result: 'Bustling' },
    { range: [3, 3], result: 'Cramped' },
    { range: [4, 4], result: 'Dangerous' },
    { range: [5, 5], result: 'Elegant' },
    { range: [6, 6], result: 'Foreboding' },
    { range: [7, 7], result: 'Gloomy' },
    { range: [8, 8], result: 'Hidden' },
    { range: [9, 9], result: 'Isolated' },
    { range: [10, 10], result: 'Luxurious' },
    { range: [11, 11], result: 'Mysterious' },
    { range: [12, 12], result: 'Noisy' },
    { range: [13, 13], result: 'Peaceful' },
    { range: [14, 14], result: 'Ruined' },
    { range: [15, 15], result: 'Sacred' },
    { range: [16, 16], result: 'Spacious' },
    { range: [17, 17], result: 'Treacherous' },
    { range: [18, 18], result: 'Unwelcoming' },
    { range: [19, 19], result: 'Vibrant' },
    { range: [20, 20], result: 'Weathered' }
  ]
};

/**
 * Sample NPC Motivation from Magazine
 */
export const magazineNPCMotivationTable: OracleTable = {
  id: 'magazine-npc-motivation',
  name: 'NPC Motivation',
  category: 'NPCs',
  type: OracleType.STANDARD,
  diceType: DiceType.D20,
  description: 'Determine what drives an NPC',
  magazineVolume: 'Vol 2 #1',
  entries: [
    { range: [1, 1], result: 'Seeking revenge' },
    { range: [2, 2], result: 'Protecting loved ones' },
    { range: [3, 3], result: 'Pursuing wealth' },
    { range: [4, 4], result: 'Gaining power' },
    { range: [5, 5], result: 'Finding redemption' },
    { range: [6, 6], result: 'Uncovering truth' },
    { range: [7, 7], result: 'Escaping danger' },
    { range: [8, 8], result: 'Fulfilling duty' },
    { range: [9, 9], result: 'Seeking knowledge' },
    { range: [10, 10], result: 'Proving worth' },
    { range: [11, 11], result: 'Maintaining order' },
    { range: [12, 12], result: 'Causing chaos' },
    { range: [13, 13], result: 'Helping others' },
    { range: [14, 14], result: 'Achieving fame' },
    { range: [15, 15], result: 'Preserving tradition' },
    { range: [16, 16], result: 'Breaking free' },
    { range: [17, 17], result: 'Finding belonging' },
    { range: [18, 18], result: 'Satisfying curiosity' },
    { range: [19, 19], result: 'Avoiding responsibility' },
    { range: [20, 20], result: 'Embracing destiny' }
  ]
};
