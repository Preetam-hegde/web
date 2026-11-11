'use strict';

/* Common and fun words, Indian and from around the world, for Hangman Duel. Only a-z words of 4 to 10 letters are kept.
   They are accepted as secret words even if the big dictionary lacks them, and feed the random-word button and solo Hangman. */
const FUN_INDIA =
	`samosa biryani chapati paratha pakora jalebi laddoo masala mango lassi kulfi rasgulla chutney tandoori paneer pulao kebab tikka bhaji halwa kheer barfi
sitar tabla bangle saree kurta dhoti turban henna bindi diwali holi rangoli bollywood cricket kabaddi carrom ludo chai chaiwala tiffin rickshaw monsoon bazaar guru yoga karma mantra
avatar jungle bungalow pyjamas shampoo veranda khaki jodhpur cashmere pundit nirvana ashram namaste chakra tiger peacock elephant cobra mongoose banyan lotus jasmine saffron turmeric
cardamom cumin ginger tamarind coconut curry naan roti kheer lassi mumbai delhi kolkata chennai punjab kerala goa himalaya ganges taj mahal temple festival wedding baraat mehendi
sangeet dandiya garba bhangra kathak dosa idli vada sambar rasam pickle papad thali dhaba auto scooter gully nukkad jugaad timepass tamasha masti dhamaka chakka sixer wicket
bowler batsman stumps yorker googly doosra innings`.split(/\s+/);
const FUN_WORLD =
	`pizza sushi taco burrito pasta noodle waffle pancake donut pretzel croissant baguette falafel hummus ramen dumpling paella tapas gelato popcorn banana pineapple avocado
kiwi lemon giggle wobble bamboozle kerfuffle hullabaloo flabbergast pajamas penguin kangaroo llama platypus narwhal unicorn dragon wizard pirate ninja robot rocket galaxy asteroid
volcano tornado rainbow jellyfish octopus flamingo gorilla cheetah koala panda sloth hamster tsunami safari carnival circus balloon trampoline skateboard bubble jigsaw whistle trumpet
guitar piano drums ukulele mystery treasure pyramid castle igloo lighthouse windmill passport backpack umbrella sandwich chocolate cupcake pancakes marshmallow spaghetti lasagna
nachos churros paprika pepper tulip daisy meadow canyon glacier island desert jungle waterfall cactus coconut pumpkin snowman scarecrow goblin phantom vampire zombie mermaid
fairy rocketship astronaut telescope compass anchor submarine parachute helicopter bicycle tractor skyscraper bridge fountain statue museum theatre festival costume confetti`.split(
		/\s+/,
	);

const FUN_LIST = [
	...new Set(
		[...FUN_INDIA, ...FUN_WORLD].filter((w) => /^[a-z]{4,10}$/.test(w)),
	),
];
const FUN = new Set(FUN_LIST);
