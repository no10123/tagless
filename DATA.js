// will eventually have all data so no need to have big {} lists
// shopPool, monsters, varriants, locked_achivements, Classes


class DATA {
    constructor () {
        this.shopPool = [
            // + attack
            {"item":"+1 attack",  "cost":5, "func":  () => {p.attack = p.attack + 1;}, "rarity":"common"},
            {"item":"+3 attack",  "cost":13, "func": () => {p.attack = p.attack + 3;}, "rarity":"uncommon"},
            {"item":"+5 attack",  "cost":21, "func": () => {p.attack = p.attack + 5;}, "rarity":"rare"},
            {"item":"+7 attack",  "cost":30, "func": () => {p.attack = p.attack + 7;}, "rarity":"mythic"},
            {"item":"+10 attack", "cost":40, "func": () => {p.attack = p.attack + 10;},"rarity":"legendary"},
            {"item":"+20 attack", "cost":75, "func": () => {p.attack = p.attack + 20;},"rarity":"accended"},
            // + hp
            {"item":"+10 hp",     "cost":5,  "func": () => {p.hp = p.hp + 10;}, "rarity":"common"},
            {"item":"+25 hp",     "cost":13, "func": () => {p.hp = p.hp + 25;}, "rarity":"uncommon"},
            {"item":"+50 hp",     "cost":21, "func": () => {p.hp = p.hp + 50;}, "rarity":"rare"},
            {"item":"+75 hp",     "cost":30, "func": () => {p.hp = p.hp + 75;}, "rarity":"mythic"},
            {"item":"+100 hp",    "cost":40, "func": () => {p.hp = p.hp + 100;},"rarity":"legendary"},
            {"item":"+200 hp",    "cost":75, "func": () => {p.hp = p.hp + 200;},"rarity":"accended"},
            // + luck
            {"item":"+1 luck",    "cost":5,  "func": () => {p.luck = p.luck + 1;}, "rarity":"common"},
            {"item":"+2 luck",    "cost":13, "func": () => {p.luck = p.luck + 2;}, "rarity":"uncommon"},
            {"item":"+3 luck",    "cost":21, "func": () => {p.luck = p.luck + 3;}, "rarity":"rare"},
            {"item":"+4 luck",    "cost":30, "func": () => {p.luck = p.luck + 4;}, "rarity":"mythic"},
            {"item":"+5 luck",    "cost":40, "func": () => {p.luck = p.luck + 5;},"rarity":"legendary"},
            {"item":"+10 luck",   "cost":75, "func": () => {p.luck = p.luck + 10;},"rarity":"accended"},
            // xp
            {"item":"+3 xp",      "cost":5,  "func": () => {p.xp += 3;}, "rarity":"common"},
            {"item":"+6 xp",      "cost":13, "func": () => {p.xp += 6;}, "rarity":"uncommon"},
            {"item":"+9 xp",      "cost":21, "func": () => {p.xp += 9;}, "rarity":"rare"},
            {"item":"+12 xp",     "cost":30, "func": () => {p.xp += 12;}, "rarity":"mythic"},
            {"item":"+15 xp",     "cost":40, "func": () => {p.xp += 15;},"rarity":"legendary"},
            {"item":"+20 xp",     "cost":75, "func": () => {p.xp += 20;},"rarity":"accended"},
            // lvl's
            {"item":"+1 lvl",     "cost":27, "func": () => {p.xp += p.xpForLevels(1);}, "rarity":"rare"},
            {"item":"+2 lvl",     "cost":50, "func": () => {p.xp += p.xpForLevels(2);}, "rarity":"mythic"},
            {"item":"+3 lvl",     "cost":100,"func": () => {p.xp += p.xpForLevels(3);}, "rarity":"legendary"},
            {"item":"+5 lvl",     "cost":200,"func": () => {p.xp += p.xpForLevels(5);}, "rarity":"accended"},
             // misc
            {"item":"+1 sprint",  "cost":20, "func": () => {p.sprint = p.sprint + 1;}, "rarity":"rare","unique":true},
            {"item":"vision +1",  "cost":30, "func": () => {fogMap.adjustRange(1);}, "rarity":"mythic"},
            {"item":"vision +2",  "cost":50, "func": () => {fogMap.adjustRange(2);}, "rarity":"legendary"},
            {"item":"vision +3",  "cost":100,"func": () => {fogMap.adjustRange(3);}, "rarity":"accended"},
            {"item":"lucky coin", "cost":100, "func": () => {p.luck = p.luck + Math.ceil(seedRand("misc") * 20); p.money = p.money + Math.ceil(seedRand("misc") * 20);}, "rarity":"accended","unique":true},
            // reroll tokens
            {"item":"1 reroll token",  "cost":8,   "func": () => {reroll_tokens += 1;}, "rarity":"common","unique":true},
            {"item":"1 reroll token", "cost":18,  "func": () => {reroll_tokens += 1;}, "rarity":"uncommon","unique":true},
            {"item":"2 reroll tokens", "cost":30,  "func": () => {reroll_tokens += 2;}, "rarity":"rare","unique":true},
            {"item":"2 reroll tokens", "cost":50,  "func": () => {reroll_tokens += 2;}, "rarity":"mythic","unique":true},
            {"item":"3 reroll tokens", "cost":100, "func": () => {reroll_tokens += 3;}, "rarity":"legendary","unique":true},
            {"item":"4 reroll tokens", "cost":150, "func": () => {reroll_tokens += 4;}, "rarity":"accended","unique":true},            
        ]
        this.monsters = [
            // generic monsters
            {"name":"goblin",        "hp":12,           "dmg":[1,4],        "ac":1,       "gold":[2,5],        "xp":[1,6],     "lvl":0},
            {"name":"ghost",         "hp":6,            "dmg":[1,12],       "ac":3,       "gold":[1,3],        "xp":[3,12],    "lvl":0},
            {"name":"zombie",        "hp":30,           "dmg":[1,6],        "ac":10,      "gold":[1,3],        "xp":[3,12],    "lvl":1},
            {"name":"skeleton",      "hp":20,           "dmg":[1,8],        "ac":5,       "gold":[2,6],        "xp":[4,15],    "lvl":1},
            {"name":"orc",           "hp":40,           "dmg":[1,10],       "ac":15,      "gold":[3,8],        "xp":[5,20],    "lvl":2},
            {"name":"troll",         "hp":60,           "dmg":[1,12],       "ac":20,      "gold":[4,10],       "xp":[6,25],    "lvl":2},
            {"name":"ogre",          "hp":80,           "dmg":[1,14],       "ac":25,      "gold":[5,12],       "xp":[7,30],    "lvl":3},
            {"name":"dragon",        "hp":100,          "dmg":[1,16],       "ac":30,      "gold":[6,15],       "xp":[8,35],    "lvl":3},
            {"name":"drake",         "hp":[50,200],     "dmg":[10,20],      "ac":[1,20],  "gold":[1,20],       "xp":[1,40],    "lvl":4},
            // weak stuff
            {"name":"slime",         "hp":15,           "dmg":[1,3],        "ac":0,       "gold":[1,2],        "xp":[2,5],     "lvl":0},
            {"name":"giant rat",     "hp":8,            "dmg":[1,4],        "ac":2,       "gold":[0,1],        "xp":[1,4],     "lvl":0},
            {"name":"kobold",        "hp":10,           "dmg":[1,5],        "ac":4,       "gold":[2,4],        "xp":[2,7],     "lvl":0},
            {"name":"bandit",        "hp":25,           "dmg":[1,6],        "ac":8,       "gold":[5,15],       "xp":[4,14],    "lvl":1},
            {"name":"cultist",       "hp":18,           "dmg":[1,8],        "ac":4,       "gold":[3,10],       "xp":[5,15],    "lvl":1},
            {"name":"ghoul",         "hp":35,           "dmg":[1,8],        "ac":12,      "gold":[2,5],        "xp":[6,18],    "lvl":1},
            {"name":"hobgoblin",     "hp":45,           "dmg":[1,10],       "ac":18,      "gold":[4,10],       "xp":[8,22],    "lvl":2},
            {"name":"harpy",         "hp":50,           "dmg":[1,10],       "ac":14,      "gold":[5,12],       "xp":[10,25],   "lvl":2},
            {"name":"lizardfolk",    "hp":55,           "dmg":[1,12],       "ac":22,      "gold":[3,9],        "xp":[9,24],    "lvl":2},
            // stuff
            {"name":"minotaur",      "hp":95,           "dmg":[2,12],       "ac":28,      "gold":[8,20],       "xp":[15,35],   "lvl":3},
            {"name":"manticore",     "hp":110,          "dmg":[2,14],       "ac":26,      "gold":[10,25],      "xp":[18,40],   "lvl":3},
            {"name":"chimera",       "hp":130,          "dmg":[2,15],       "ac":32,      "gold":[12,30],      "xp":[20,45],   "lvl":3},
            {"name":"lich",          "hp":150,          "dmg":[3,16],       "ac":35,      "gold":[20,50],      "xp":[30,60],   "lvl":4},
            {"name":"kraken",        "hp":250,          "dmg":[4,20],       "ac":40,      "gold":[25,60],      "xp":[40,80],   "lvl":4},
            {"name":"behemoth",      "hp":300,          "dmg":[5,25],       "ac":45,      "gold":[30,75],      "xp":[50,100],  "lvl":4},            
            {"name":"wyvern",        "hp":[180,260],    "dmg":[12,24],      "ac":[15,30], "gold":[15,40],      "xp":[45,90],   "lvl":4},
            // strong stuff
            {"name":"death knight",  "hp":350,          "dmg":[15,30],      "ac":50,      "gold":[40,90],      "xp":[75,150],  "lvl":5},
            {"name":"phoenix",       "hp":[300,450],    "dmg":[20,35],      "ac":[25,45], "gold":[50,120],     "xp":[90,180],  "lvl":5},
            {"name":"storm giant",   "hp":500,          "dmg":[25,45],      "ac":55,      "gold":[60,150],     "xp":[120,240], "lvl":6},
            {"name":"ancient wyrm",  "hp":[600,800],    "dmg":[30,60],      "ac":[35,60], "gold":[100,250],    "xp":[200,400], "lvl":6},
            {"name":"demon lord",    "hp":1200,         "dmg":[50,100],     "ac":70,      "gold":[250,500],    "xp":[300,600], "lvl":7},
            {"name":"archangel",     "hp":1500,         "dmg":[60,120],     "ac":75,      "gold":[300,600],    "xp":[400,800], "lvl":7},
            {"name":"titan",         "hp":2500,         "dmg":[80,150],     "ac":80,      "gold":[400,800],    "xp":[450,900], "lvl":8},
            {"name":"a chair",       "hp":3,            "dmg":[800,900],    "ac":99,      "gold":[100,1000],   "xp":[50,1000], "lvl":8},
            {"name":"god",           "hp":9999,         "dmg":[-99,99],     "ac":90,      "gold":[99,999],     "xp":[500,1000],"lvl":9},
            // really strong stuff
            {"name":"primal god",    "hp":7777,         "dmg":[500,2000],   "ac":20,      "gold":[0,10000],    "xp":[0,100000],     "lvl":9},
            {"name":"cosmic dragon", "hp":[3000,6000],  "dmg":[150,400],    "ac":[50,85], "gold":[500,2000],   "xp":[1000,5000],    "lvl":10},
            {"name":"cosmic titan",  "hp":[4500,8000],  "dmg":[200,600],    "ac":[30,90], "gold":[1000,5000],  "xp":[3000,10000],   "lvl":12},
            {"name":"void dragon",   "hp":12000,        "dmg":[-500,800],   "ac":95,      "gold":[2500,10000], "xp":[15000,30000],  "lvl":14},
            {"name":"time weaver",   "hp":[8000,15000], "dmg":[400,1200],   "ac":[70,110],"gold":[5000,25000], "xp":[25000,50000],  "lvl":16},
            {"name":"accended god",  "hp":20000,        "dmg":[1000,3000],  "ac":120,     "gold":[10000,50000],"xp":[60000,100000], "lvl":18},
            {"name":"master of all", "hp":[50000,99999],"dmg":[5000,15000], "ac":[1,200], "gold":[0,1000000],  "xp":[250000,500000],"lvl":20}
        ];
        this.varriants = [
            {"name":"large",             "hp":[1,12],       "dmg":[1,4],        "ac":[1,3],     "gold":[1,2],        "xp":[2,3],          "lvl":1},
            {"name":"strong",            "hp":0,            "dmg":[2,9],        "ac":0,         "gold":[5,9],        "xp":[4,9],          "lvl":1},
            {"name":"weak",              "hp":-2,           "dmg":-5,           "ac":-2,        "gold":1,            "xp":1,              "lvl":0},
            {"name":"giant",             "hp":12,           "dmg":[4,12],       "ac":[2,5],     "gold":[10,13],      "xp":[13,16],        "lvl":2},
            {"name":"silver",            "hp":-3,           "dmg":-1,           "ac":10,        "gold":[1,3],        "xp":[24,30],        "lvl":2},
            {"name":"gold",              "hp":30,           "dmg":[10,17],      "ac":1,         "gold":[30,32],      "xp":[3,7],          "lvl":2},
            {"name":"basic",             "hp":0,            "dmg":0,            "ac":0,         "gold":0,            "xp":0,              "lvl":3},
            {"name":"enourmess",         "hp":[50,70],      "dmg":[10,20],      "ac":[8,10],    "gold":[20,27],      "xp":[24,29],        "lvl":3},
            {"name":"colossal",          "hp":[80,150],     "dmg":[12,22],      "ac":[1,15],    "gold":[5,90],       "xp":[4,90],         "lvl":4},
            {"name":"rabid",             "hp":-20,          "dmg":[10,30],      "ac":-1,        "gold":-5,           "xp":[10,20],        "lvl":5},
            {"name":"king",              "hp":[0,400],      "dmg":[0,40],       "ac":-2,        "gold":[100,120],    "xp":[40,90],        "lvl":6},
            {"name":"queen",             "hp":[0,600],      "dmg":[0,35],       "ac":-2,        "gold":[100,120],    "xp":[40,90],        "lvl":6},
            {"name":"corrupted",         "hp":[-100,300],   "dmg":[-100,150],   "ac":[-100,100],"gold":[-100,700],   "xp":[-100,900],     "lvl":7},
            {"name":"demon",             "hp":[10,350],     "dmg":[60,120],     "ac":-10,       "gold":[6,666],      "xp":[6,500],        "lvl":8},
            {"name":"pure",              "hp":[100,1000],   "dmg":[-10,300],    "ac":50,        "gold":800,          "xp":1000,           "lvl":9},
            {"name":"accended",          "hp":[1000,3000],  "dmg":[50,300],     "ac":60,        "gold":1000,         "xp":1000,           "lvl":10},
            {"name":"monstoress",        "hp":[2000,3500],  "dmg":[100,400],    "ac":70,        "gold":2000,         "xp":2000,           "lvl":11},
            {"name":"evil",              "hp":[3000,5500],  "dmg":[50,600],     "ac":30,        "gold":5000,         "xp":5000,           "lvl":12},
            {"name":"platnium",          "hp":[100,10000],  "dmg":[10,1000],    "ac":200,       "gold":[3,12],       "xp":[10000,30000],  "lvl":13},
            {"name":"greedy",            "hp":[50,5000],    "dmg":[50,5000],    "ac":90,        "gold":[10000,30000],"xp":[24,30],        "lvl":13},
            {"name":"definitly a normal","hp":[10000,10000],"dmg":[100,1000],   "ac":100,       "gold":10000,        "xp":10000,          "lvl":20},
        ]
        this.eventPool = [
            // this is an ex.
            {"name":"+1 coin","options":[{"name":"leave","action":()=>{p.money += 1}}]},
            // another simple ex.
            {"name":"wishing well","options":[{"name":"throw a coin in","action":()=>{p.luck += ((seedRand("misc") < 0.1) ? 1 : 0); p.money--;}}]},
            // idea is you would have challenges that you would need to complete by the next floor for a reward.
            {"name":"bounty board","options":[{"name":"placeholder (does nothing)","action":()=>{}}]},
            // you would be able to fish once for random loot, items, buffs, etc.
            {"name":"fishing pond","options":[{"name":"placeholder (does nothing)","action":()=>{}}]},
            // would be a grave of a player that deid on the next floor would have their name and stats.
            // would add really cool atmosphere to the worldbuilding and whatnot.
            {"name":"Grave of [username]","options":[{"name":"placeholder (does nothing)","action":()=>{}}]},
            // donation machine - the one from binding of isac, would go outside of rounds and could unlock classes.
            // could  also unlock achivements, (maybye stat value or other rewards but the machine would have to have
            // a running total and a total for the current run)
            {"name":"donation machine","options":[{"name":"placeholder (does nothing)","action":()=>{}}]},
        ]
        this.locked_achivements = [
            // floor based
            {"name":"The begining",     "desc":"get to floor 10","unlock":"gambler","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 10);}},
            {"name":"The Depths",       "desc":"get to floor 20","unlock":"runner","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 20);}},
            {"name":"Endless?",         "desc":"get to floor 30","unlock":"alchemist","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 30);}},
            {"name":"Beyond the end",   "desc":"get to floor 40","unlock":"forgotten","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 40);}},
            {"name":"How? just how",    "desc":"get to floor 50","unlock":"imortal","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 50);}},
            {"name":"Forever above",    "desc":"get to floor 100","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 100);}},
            // money
            {"name":"A doller!",        "desc":"obtain 100+ coins.","unlock":"rober","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= 100);}},
            {"name":"A band!",          "desc":"obtain 1000+ coins.","unlock":"rich","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= 1000);}},
            {"name":"money collector",  "desc":"obtain 5000+ coins.","unlock":"scavenger","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= 5000);}},
            {"name":"walking bank",     "desc":"obtain 10000+ coins.","unlock":"mimic","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= 10000);}},
            {"name":"50k warhamer",     "desc":"obtain 50000+ coins.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= 50000);}},
            {"name":"Gold certificate", "desc":"obtain 100000+ coins.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= 100000);}},
            {"name":"Broke explorer",   "desc":"have 0 coins on floor 20 or greater.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money == 0 && floor >= 20);}},
            // hp
            {"name":"keep on standing", "desc":"get 1 hp.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (hp == 1);}},
            {"name":"First Death",      "desc":"die.","unlock":"tank","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (hp == 0);}},
            {"name":"dual heart",       "desc":"have 200+ hp.","unlock":"vampire","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (hp >= 200);}},
            {"name":"Five of hearts",   "desc":"have 500+ hp.","unlock":"gaurdian","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (hp >= 500);}},
            {"name":"Imortality?",      "desc":"have 1000+ hp.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (hp >= 1000);}},
            // attack
            {"name":"pointless",        "desc":"get 0 attack. Somehow. ","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack == 0);}},
            {"name":"baisc sword",      "desc":"have 25+ attack.","unlock":"apprentice","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 25);}},
            {"name":"sharpened sword",  "desc":"have 50+ attack.","unlock":"executor","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 50);}},
            {"name":"shiny sword",      "desc":"have 75+ attack.","unlock":"barbarian","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 75);}},
            {"name":"legendary sword",  "desc":"have 100+ attack.","unlock":"merchant","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 100);}},
            {"name":"accended sword",   "desc":"have 150+ attack.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 150);}},
            {"name":"god killer",       "desc":"have 200+ attack.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 200);}},
            // luck
            {"name":"Pure skill",       "desc":"have 0 luck on floor 20+.","unlock":"monk","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck == 0 && floor >= 20);}},
            {"name":"dice collector",   "desc":"have 5+ luck.","unlock":"cat","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 5);}},
            {"name":"shiny penny",      "desc":"have 10+ luck.","unlock":"investor","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 10);}},
            {"name":"lucky cat",        "desc":"have 20+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 20);}},
            {"name":"4 leaf clover",    "desc":"have 40+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 40);}},
            {"name":"chosen fate",      "desc":"have 50+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 50);}},
            {"name":"lucky dime",       "desc":"have 75+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 75);}},
            {"name":"100 clovers",      "desc":"have 100+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 100);}},
            {"name":"lucky number 7.",  "desc":"have 117+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 117);}},
            // lvl
            {"name":"begginer adventurer",     "desc":"reach lvl 10+","unlock":"mystic","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 10);}},
            {"name":"intermidiete adventurer", "desc":"reach lvl 20+","unlock":"greed","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 20);}},
            {"name":"advanced adventurer",     "desc":"reach lvl 30+","unlock":"cyadian","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 30);}},
            {"name":"expert adventurer",       "desc":"reach lvl 40+","unlock":"Deserter","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 40);}},
            {"name":"master adventurer",       "desc":"reach lvl 50+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 50);}},
            {"name":"grand master adventurer", "desc":"reach lvl 60+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 60);}},
            {"name":"gm+1 adventurer",         "desc":"reach lvl 70+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 70);}},
            {"name":"gm+2 adventurer",         "desc":"reach lvl 80+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 80);}},
            {"name":"gm+3 adventurer",         "desc":"reach lvl 90+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 90);}},
            {"name":"gm+4 adventurer",         "desc":"reach lvl 100+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 100);}},
            // range
            {"name":"basic eye's",             "desc":"have 10+ vision","unlock":"batle mage","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (range >= 10);}},
            {"name":"platnium eye",            "desc":"have 20+ vision","unlock":"blind","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (range >= 20);}},
            {"name":"third eye",               "desc":"have 25+ vision","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (range >= 25);}},
            {"name":"Glasses!",                "desc":"have 30+ vision","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (range >= 30);}},
            // unique. 
            {"name":"speedrunner",             "desc":"reach floor 20+ in under 5min","unlock":"trickster","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 20 && trun < 300000);}},
            {"name":"GOD mode",                "desc":"have 30+ vision, 50+ luck, lvl 60+, 200+ attack, 750+ hp, and 10000+ money","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (range >= 30 && lvl >= 60 && luck >= 50 && attack >= 200 && hp >= 750 && money >= 10000);}},
            {"name":"SIX - SEVEN",             "desc":"have 67 attack, 67 hp, lvl 67, 67 coins","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl == 67 && attack == 67 && hp == 67 && money == 67);}},
            {"name":"blood money",             "desc":"have 100x as much money as hp.","unlock":"gladiator","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= hp * 100 && hp > 0);}},
            // lvl 30 themed achivements. 
            {"name":"three sword master",      "desc":"get sharpen sword++","unlock":"bladesmith","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl % 10 == 0 && lvl % 3 == 0 && chosenSkills.length > 0 && chosenSkills[chosenSkills.length - 1].name == "sharpen sword");}},   
            {"name":"three of hearts",         "desc":"get health boost++","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl % 10 == 0 && lvl % 3 == 0 && chosenSkills.length > 0 && chosenSkills[chosenSkills.length - 1].name == "health boost");}},
            {"name":"lottery tiket",           "desc":"get quick buck++","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl % 10 == 0 && lvl % 3 == 0 && chosenSkills.length > 0 && chosenSkills[chosenSkills.length - 1].name == "quick buck");}},
            {"name":"3 leaf clover",           "desc":"get luck bonus++","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl % 10 == 0 && lvl % 3 == 0 && chosenSkills.length > 0 && chosenSkills[chosenSkills.length - 1].name == "luck bonus");}},
            {"name":"fortune finder",          "desc":"get coin collector++","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl % 10 == 0 && lvl % 3 == 0 && chosenSkills.length > 0 && chosenSkills[chosenSkills.length - 1].name == "coin collector");}},
            // shop based
            {"name":"avrage customer",         "desc":"buy 20+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 20)}},
            {"name":"super customer",          "desc":"buy 50+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 50)}},
            {"name":"ultra customer",          "desc":"buy 60+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 60)}},
            {"name":"legendary customer",      "desc":"buy 70+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 70)}},
            {"name":"accended customer",       "desc":"buy 80+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 80)}},
            {"name":"exotic customer",         "desc":"buy 90+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 90)}},
            {"name":"customer+",               "desc":"buy 100+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 100)}},
            {"name":"customer of the year",    "desc":"buy 120+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 120)}},
            // battles won
            {"name":"first kill",              "desc":"kill a monster","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 1)}},
            {"name":"set of dozen",            "desc":"kill 12+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 12)}},
            {"name":"month of destruction",    "desc":"kill 30+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 30)}},
            {"name":"50% off of deaths",       "desc":"kill 50+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 50)}},
            {"name":"decade of deaths",        "desc":"kill 100+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 100)}},
            {"name":"murderer!",               "desc":"kill 150+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 150)}},
            {"name":"gladiator",               "desc":"kill 200+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 200)}},    
            {"name":"destoyer of all",         "desc":"kill 300+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 300)}},    
            {"name":"bringer of death",        "desc":"kill 500+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 500)}},    
            {"name":"passafist",               "desc":"kill 0 monsters on floor 3+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 3)}},   
            {"name":"passafist+",              "desc":"kill 0 monsters on floor 5+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 5)}},    
            {"name":"passafist++",             "desc":"kill 0 monsters on floor 7+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 7)}},    
            {"name":"passafist+++",            "desc":"kill 0 monsters on floor 10+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 10)}},    
            {"name":"passafist++++",           "desc":"kill 0 monsters on floor 15+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 15)}},    
            {"name":"passafist+++++",          "desc":"kill 0 monsters on floor 20+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 20)}},    
            {"name":"bringer of hope",         "desc":"kill 0 monsters on floor 25+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 25)}},    
            {"name":"peacefull victory",       "desc":"kill 0 monsters on floor 30+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 30)}},    
            {"name":"angel of life",           "desc":"kill 0 monsters on floor 35+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 35)}},    
            // curse 
            {"name":"first curse",             "desc":"buy a cursed item","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (curse > 0)}},
            {"name":"decade of curses",        "desc":"get 10+ curse","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (curse >= 10)}},
            {"name":"lucky number 13",         "desc":"get 13+ curse","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (curse >= 13)}},
            {"name":"collection of curses",    "desc":"get 21+ curse","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (curse >= 21)}},
            {"name":"hoard of curses",         "desc":"get 33+ curse","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (curse >= 33)}},
        ]
        const BASE = {"GameStart":() => {},"LevelUp":() => {},"FloorStart":() => {},"BattleStart":() => {},
            "winBatle":() => {},"fleeBattle":() => {},"coinPickup":() => {},"potionPickup":() => {},
            "OnAttack":d => d,"OnDamage":d => d,"unlocked":false,"best_floor":0};

        this.Classes = [
            {...BASE, "name":"Dude", "unlocked":true, "desc":"no buff"},
            {...BASE, "name":"healer", "unlocked":true, "FloorStart":()=>{p.hp += 15;}, "desc":"+15 hp per floor"},
            {...BASE, "name":"theif", "unlocked":true, "winBatle":()=>{p.money += 2;}, "coinPickup":()=>{p.money += 2;}, "desc":"+2 gold to all incomes"},
            {...BASE, "name":"fighter", "unlocked":true, "GameStart":()=>{p.attack_mult = 1.25;}, "desc":"x1.25 damage"},
            {...BASE, "name":"cat", "LevelUp":()=>{p.luck += 2;}, "desc":"+2 luck per level"},
            {...BASE, "name":"gambler", "OnAttack":(d)=>{const r=seedRand("misc"); return r<0.35 ? d*2 : r<0.85 ? d : 0;}, "desc":"35% 2x dmg, 50% x1, 15% x0"},
            {...BASE, "name":"apprentice", "GameStart":()=>{skill_selection = p.rollSkillSelection();}, "desc":"start with skill of choice (will be tripled)"},
            {...BASE, "name":"alchemist", "GameStart":()=>{p.potion_affect = 1.5;}, "desc":"x1.5 potion effect"},
            {...BASE, "name":"forgotten", "noShop":true, "noCoins":true, "noPotions":true, "extraTriggers":5,
                "GameStart":()=>{p.attack_mult = 2;}, "desc":"+5 extra skill triggers and x2 dmg, no shop, no coins, no potions"},
            {...BASE, "name":"imortal", "OnDamage":(d)=>Math.max(0, d - p.floor), "desc":"blocks damage equal to the floor number"},
            {...BASE, "name":"merchant", "OnAttack":(d)=>d * (1 + Math.sqrt(p.money) / 10), "desc":"deal more damage with more money"},
            {...BASE, "name":"executor", "BattleStart":()=>{
                battle.enemy.hp = Math.max(0, battle.enemy.hp - Math.max(1, Math.round(p.attack * p.attack_mult)));
                if (battle.enemy.hp === 0) winBattle();
            }, "desc":"attacks once at start of combat"},
            {...BASE, "name":"tank", "BattleStart":()=>{battle.blockLeft = 5;},
                "OnDamage":(d)=>{const b = Math.min(d, battle.blockLeft || 0); battle.blockLeft -= b; return d - b;},
                "desc":"blocks 5 damage in each combat"},
            {...BASE, "name":"vampire", "winBatle":()=>{p.hp += Math.max(3, Math.floor(p.attack / 3));}, "desc":"heals after each combat"},
            {...BASE, "name":"rober", "FloorStart":()=>{
                if (!shopState) return;
                let best = -1;
                for (let i = 0; i < shopState.offers.length; i++) {
                    const o = shopState.offers[i];
                    if (!o.purchased && (best === -1 || o.cost < shopState.offers[best].cost)) best = i;
                }
                if (best !== -1) { shopState.offers[best].func(); shopState.offers[best].purchased = true; p.check_lvl(); }
            }, "desc":"steals the cheapest item in the shop"},
            {...BASE, "name":"rich", "GameStart":()=>{p.money += 13;
                const commons = shop.shopPool.filter(i=>i.rarity==="common");
                commons[Math.floor(seedRand("misc")*commons.length)].func(); p.check_lvl();
            }, "desc":"starts with a free common item and 13 gold"},
            {...BASE, "name":"runner", "FloorStart":()=>{fogMap.adjustRange(1);}, "desc":"+1 vision each floor"},
            {...BASE, "name":"gaurdian", "GameStart":()=>{p.hp += 20;}, "OnAttack":(d)=>d + Math.floor(p.hp / 30), "desc":"more damage with more hp"},
            {...BASE, "name":"batle mage", "potionPickup":()=>{if (seedRand("misc") < 0.1) p.attack += 1;}, "desc":"potions have a 10% chance to give +1 attack"},
            {...BASE, "name":"mystic", "LevelUp":(skill)=>{if (p.lvl % 7 === 0 && skill) skill.func();},
                "BattleStart":()=>{p.attack += p.luck;}, "winBatle":()=>{p.attack -= p.luck;}, "fleeBattle":()=>{p.attack -= p.luck;},
                "desc":"gains a bonus every 7 levels and attack is increased by luck"},
            {...BASE, "name":"barbarian", "GameStart":()=>{p.attack_mult = 1.5;}, "FloorStart":()=>{p.hp -= 5;}, "desc":"x1.5 damage, -5 hp at start of floor"},
            {...BASE, "name":"trickster", "FloorStart":()=>{reroll_tokens++;}, "OnDamage":(d)=>seedRand("misc") < 0.1 ? 0 : d, "desc":"+1 reroll token each floor, 10% to dodge attacks"},
            {...BASE, "name":"monk", "goldToXp":true, "desc":"all gold becomes xp, no shop"},
            {...BASE, "name":"greed", "xpToGold":true, "desc":"all xp becomes gold, no skills"},
            {...BASE, "name":"investor","FloorStart":()=>{p.money = p.money + Math.floor(p.money * 0.1)}, "desc":"gain 10% coins each floor."},
            {...BASE, "name":"Deserter","noShop":true, "noCoins":true,"GameStart":()=>{p.attack_mult = 0},"fleeBattle":() => {p.xp += 4 + p.floor; p.check_lvl();}, "desc":"deal no dmg, and gain xp from fleeing, no shop, no coins."},
            {...BASE, "name":"scavenger","coinPickup":()=>{p.hp += 3},"potionPickup":()=>{p.money += p.floor + 1}, "desc":"gain money with potions, and health with coins."},
            {...BASE, "name":"bladesmith","LevelUp":(skill)=>{p.attack += 1}, "desc":"gain 1 attack every levl."},
            {...BASE, "name":"cyadian","GameStart":()=>{p.sprint = Math.max(W,H); p.move_speed = Math.max(W,H)},"FloorStart":()=>{p.sprint = Math.max(0, p.sprint - 1); p.attack += (p.floor % 2 == 0) ? 1 : 0}, "desc":"start with max speed, and sprint, -1 sprint each floor, and gain 1 attack every seccond floor."},
            {...BASE, "name":"gladiator","GameStart":()=>{p.hp -= 50},"OnDamage":(d)=>{p.money += Math.floor(d/2); return d;}, "desc":"start with 50 less hp, gain money when you take damgege."},
            {...BASE, "name":"mimic", "mimicChance":0.15,"winBatle":()=>{ if (battle && battle.mimic) p.money += Math.ceil((m.mult + 0.1) * Math.sqrt(p.floor)) * 2; },"desc":"15% of coins are mimics, x2 coins from mimics"},
            {...BASE, "name":"blind", "GameStart":()=>{fogMap.adjustRange(-4)}, "FloorStart":()=>{p.attack += fogMap.range},"desc":"-4 vision, +1 attack each floor per vision.","unlocked":true},
        ]
        this.skillOptions = [
            {"name":"sharpen sword", "func": () => {p.attack += Class.goldToXp ? 3 : 1;}},
            {"name":"health boost",      "func": () => {p.hp += 8 + p.lvl * 2;}},
            {"name":"quick buck",      "func": () => {p.money = p.money + 3 * m.mult;}},
            {"name":"luck bonus",    "func": () => {p.luck++;}},
            {"name":"coin collector",  "func": () => {m.mult++;}},
            {"name":"cuppon collector",  "func": () => {shop.percent_discount = Math.min(0.5, shop.percent_discount + 0.05);}},
            {"name":"charisma",  "func": () => {shop.discount = Math.min(20, shop.discount + 1);}},
        ]
        this.u_skillOptions = [
            {"name":"bonus items", "func": () => {shop.avail = Math.min(10, shop.avail + 1);},"uses":7},
            {"name":"bonus skills", "func": () => {this.skill_choices = Math.min(10, this.skill_choices + 1);},"uses":5},
        ];
    }
}
const data = new DATA();