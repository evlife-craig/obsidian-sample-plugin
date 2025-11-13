/**
 * Fate Chart - Core Mythic GME v2 Oracle
 * Used for answering yes/no questions with varying probabilities
 */

import {
	OracleTable,
	OracleType,
	DiceType,
	FateChartOdds,
	FateChartParams,
	RollResult,
} from "../../types";

/**
 * Fate Chart cell containing thresholds for different outcomes
 * Structure: Exceptional Yes ≤ Yes ≤ No ≤ Exceptional No
 * Lower rolls = Yes, Higher rolls = No
 */
interface FateChartCell {
	exceptionalYes: number; // Max roll for Exceptional Yes (0 if not possible)
	yes: number; // Max roll for Yes
	no: number; // Max roll for No
	exceptionalNo: number; // Min roll for Exceptional No (101 if not possible)
}

/**
 * Complete Fate Chart lookup table
 * Organized by Odds level, then Chaos Factor (1-9)
 *
 * Structure: Lower rolls = Yes outcomes, Higher rolls = No outcomes
 * Roll ranges: Exceptional Yes ≤ Yes ≤ No ≤ Exceptional No
 *
 * Example for 50/50, Chaos 1:
 * - Roll 1-2: Exceptional Yes
 * - Roll 3-10: Yes
 * - Roll 11-82: No
 * - Roll 83-100: Exceptional No
 *
 * Note: You'll need to fill in the correct values from the Mythic GME v2 book
 */
const FATE_CHART: Record<FateChartOdds, Record<number, FateChartCell>> = {
	[FateChartOdds.IMPOSSIBLE]: {
		1: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		2: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		3: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		4: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		5: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		6: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		7: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		8: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		9: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
	},
	[FateChartOdds.NEAR_IMPOSSIBLE]: {
		1: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		2: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		3: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		4: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		5: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		6: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		7: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		8: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		9: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
	},
	[FateChartOdds.VERY_UNLIKELY]: {
		1: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		2: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		3: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		4: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		5: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		6: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		7: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		8: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		9: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
	},
	[FateChartOdds.UNLIKELY]: {
		1: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		2: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		3: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		4: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		5: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		6: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		7: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		8: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		9: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
	},
	[FateChartOdds.FIFTY_FIFTY]: {
		1: { exceptionalYes: 2, yes: 10, no: 82, exceptionalNo: 83 },
		2: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		3: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		4: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		5: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		6: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		7: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		8: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		9: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
	},
	[FateChartOdds.LIKELY]: {
		1: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		2: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		3: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		4: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		5: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		6: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		7: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		8: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		9: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
	},
	[FateChartOdds.VERY_LIKELY]: {
		1: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		2: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		3: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		4: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		5: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		6: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		7: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		8: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		9: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
	},
	[FateChartOdds.NEAR_CERTAIN]: {
		1: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		2: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		3: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		4: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		5: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		6: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		7: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		8: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		9: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
	},
	[FateChartOdds.CERTAIN]: {
		1: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		2: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		3: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		4: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		5: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		6: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		7: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		8: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
		9: { exceptionalYes: 0, yes: 0, no: 0, exceptionalNo: 101 },
	},
};

/**
 * Roll on the Fate Chart with given parameters
 */
export function rollFateChart(params: FateChartParams): RollResult {
	// Validate parameters
	if (params.chaosFactor < 1 || params.chaosFactor > 9) {
		throw new Error("Chaos Factor must be between 1 and 9");
	}

	// Roll d100
	const roll = Math.floor(Math.random() * 100) + 1;

	// Get the appropriate cell from the chart
	const cell = FATE_CHART[params.odds][params.chaosFactor];

	// Determine result based on roll
	// Structure: Exceptional Yes ≤ Yes ≤ No ≤ Exceptional No
	// Lower rolls = Yes, Higher rolls = No
	// If exceptional results aren't possible (0 or 101), default to regular yes/no
	let result: string;

	if (cell.exceptionalYes > 0 && roll <= cell.exceptionalYes) {
		// Exceptional Yes is possible and roll qualifies
		result = "Exceptional Yes";
	} else if (roll <= cell.yes) {
		// Regular Yes (includes rolls that would be Exceptional Yes if it were possible)
		result = "Yes";
	} else if (cell.exceptionalNo <= 100 && roll >= cell.exceptionalNo) {
		// Exceptional No is possible and roll qualifies
		result = "Exceptional No";
	} else {
		// Regular No (includes rolls that would be Exceptional No if it were possible)
		result = "No";
	}

	return {
		tableName: "Fate Chart",
		tableId: "fate-chart",
		result,
		diceRoll: roll,
		timestamp: Date.now(),
		params,
	};
}

/**
 * Fate Chart as an OracleTable
 * Note: The Fate Chart uses custom logic via rollFateChart function
 * This table representation is for UI display purposes
 */
export const fateChartTable: OracleTable = {
	id: "fate-chart",
	name: "Fate Chart",
	category: "Core Mythic GME v2",
	type: OracleType.TOOL,
	diceType: DiceType.D100,
	description:
		"Answer yes/no questions with varying probabilities based on Chaos Factor and Odds",
	entries: [
		// Placeholder entries - actual rolling uses rollFateChart function
		{
			range: [1, 100],
			result: "Use rollFateChart function with parameters",
		},
	],
};
