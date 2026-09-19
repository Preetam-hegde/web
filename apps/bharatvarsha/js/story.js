export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

// goal.type is resolved by BharatGame.chapterProgress: building | worker | resource | upgrades | era
// reward is an effects bundle: resource keys plus morale
export const CHAPTERS = [
	{
		title: 'The Banks of the Ganga',
		story: 'The rivers of the west have grown thin, and the cattle with them. For forty days your clan followed the elders\' tale of a river that fell from heaven itself. Now, at dawn, the Ganga lies before you: wide, slow and silver. The grain sacks are nearly empty, but the soil is dark and the water sweet.\n\nHere, Gramani, headman of the clan, your people will stay. Raise huts before the rains come.',
		goal: { type: 'building', key: 'hut', target: 3, text: 'Raise 3 Mud Huts to shelter your growing clan.' },
		reward: { food: 30 }
	},
	{
		title: 'The First Harvest',
		story: 'Smoke rises from three hearths and children chase one another along the bank. But hearths must be fed. The elders scatter barley in the river silt and chant to Parjanya for rain.\n\nPut your people to the plough. A clan that can feed itself need never wander again.',
		goal: { type: 'worker', key: 'farmer', target: 3, text: 'Put 3 farmers to the plough.' },
		reward: { wood: 25 }
	},
	{
		title: 'Timber and Stone',
		story: 'The barley greens, and suddenly everything asks for wood: rafters, fences, granary posts, boundary markers. The sal forest stands dark and generous beyond the fields.\n\nSend axes into the trees and stack fifty logs against the season of building.',
		goal: { type: 'resource', key: 'wood', target: 50, text: 'Stockpile 50 wood.' },
		reward: { stone: 15 }
	},
	{
		title: 'Grain Against the Lean Years',
		story: 'A caravan from the Sindhu passes through, and rats follow it into your stores. Half a season\'s barley is gone before anyone notices. The elders speak plainly: a clan that stores nothing prays for every harvest.\n\nRaise a granary of baked clay and stone, and let the pests find it sealed.',
		goal: { type: 'building', key: 'granary', target: 1, text: 'Build a Granary.' },
		reward: { food: 60, morale: 5 }
	},
	{
		title: 'The Seat of Learning',
		story: 'By the evening fire an old sage recites hymns older than the river\'s memory, and the children listen wide-eyed. If these words are lost, so is your people\'s past.\n\nBuild a Gurukul, where teacher and student share one roof and one fire.',
		goal: { type: 'building', key: 'school', target: 1, text: 'Build a Gurukul.' },
		reward: { vidya: 15 }
	},
	{
		title: 'Wisdom of the Rishis',
		story: 'The first students have become scholars, and they ask questions no one has answered: why the river floods, how stone might be cut cleaner, how a village might be governed justly.\n\nGive them vidya and materials to answer one.',
		goal: { type: 'upgrades', target: 1, text: 'Complete a research.' },
		reward: { wood: 40, stone: 20 }
	},
	{
		title: 'The Sacred Fire',
		story: 'A rite is remembered only if it has a place. Your priests mark a square of earth to the east and lay the kunda stone by stone, the altar where the offering fire will burn.\n\nWhen it is lit, every clan for a hundred kos will see the smoke.',
		goal: { type: 'building', key: 'altar', target: 1, text: 'Build a Yajna Altar.' },
		reward: { vidya: 25, food: 100 }
	},
	{
		title: 'The Horse Is Loosed',
		story: 'The white horse is consecrated and set free to wander. Wherever it roams unchallenged, your influence follows; every neighbour who lets it pass acknowledges your rule.\n\nGather the grain and the learning the rite demands, then perform the Ashwamedha.',
		goal: { type: 'era', target: 1, text: 'Perform the Ashwamedha Yajna.' },
		reward: { food: 150, morale: 10 }
	},
	{
		title: 'Crown of the Mahajanapada',
		story: 'The horse returns, and the kingdoms of the Ganga bow their heads. Markets, guilds and assemblies now crowd your gates. A village has become a janapada; a janapada must become a great realm.\n\nLoose the horse once more, and let the world watch Bharatvarsha rise.',
		goal: { type: 'era', target: 2, text: 'Perform the Ashwamedha again to become a Mahajanapada.' },
		reward: { food: 200, vidya: 50, morale: 15 }
	}
];

export const ENDING = {
	eyebrow: 'Epilogue',
	title: 'Bharatvarsha Unfurled',
	body: 'Sixteen great realms will one day rise along the Ganga, and yours is among the first. Traders speak your name in distant ports, and scholars carry your hymns beyond the mountains.\n\nYou began with two people, a river and a promise. Your chronicle continues: rule wisely, Chakravartin. A realm is remembered for the fires it keeps lit.'
};

// Random rulings. Each choice is an effects bundle (negative = pay, positive = gain).
// Every ruling must keep one free choice: the modal locks the game until a choice is made (see check.mjs).
export const DECISIONS = [
	{
		title: 'A Merchant from the Sindhu',
		body: 'A trader with a string of pack-oxen waits at your boundary stone. He offers cut stone from the western quarries in exchange for grain.',
		choices: [
			{ label: 'Trade grain for stone', effects: { food: -40, stone: 20 }, log: 'The trader departs, leaving crates of cut stone.' },
			{ label: 'Send him on his way', effects: {}, log: 'The merchant shrugs and moves on.' }
		]
	},
	{
		title: 'A Rishi at the Gate',
		body: 'A weary hermit asks for shelter and a fire. He carries no wealth, only verses learned from a hundred teachers.',
		choices: [
			{ label: 'Give him shelter', effects: { food: -15, vidya: 15, morale: 3 }, log: 'The rishi stays three nights and leaves you his verses.' },
			{ label: 'Turn him away', effects: { morale: -3 }, log: 'The rishi departs into the dusk. The village is uneasy.' }
		]
	},
	{
		title: 'Cattle on the Boundary',
		body: 'Herders from a neighbouring clan have driven their cattle across your boundary stones. Tempers are rising on both sides.',
		choices: [
			{ label: 'Share the pasture', effects: { food: -25, morale: 5 }, log: 'The herders feast with you and a lasting peace is sworn.' },
			{ label: 'Post spearmen at the stones', effects: { wood: -10, morale: 3 }, log: 'Spearmen hold the boundary and the herders withdraw.' },
			{ label: 'Look the other way', effects: { morale: -2 }, log: 'The cattle graze your fields and the villagers mutter.' }
		]
	},
	{
		title: 'The River Rises',
		body: 'The Ganga swells beyond her banks overnight. Silt-rich water spreads across the lower fields.',
		choices: [
			{ label: 'Dig channels to catch the silt', effects: { wood: -15, food: 40 }, log: 'The silt-fed barley grows thick and green.' },
			{ label: 'Move the stores uphill', effects: { morale: 2 }, log: 'Nothing is lost, and the elders praise your caution.' }
		]
	}
];
