export type ProblemCategory = 'pest' | 'disease' | 'nutrient-deficiency' | 'environmental' | 'cultural'

export interface PlantProblem {
  id: string
  title: string
  category: ProblemCategory
  affectedPlants: string[]
  symptoms: string[]
  keywords: string[]
  likelyCauses: string[]
  treatment: string[]
  prevention: string[]
  severity: 'low' | 'medium' | 'high'
  urgencyNote?: string
}

export interface CareGuide {
  plant: string
  category: 'vegetable' | 'fruit' | 'flower' | 'herb' | 'indoor' | 'lawn' | 'general'
  watering: string
  sunlight: string
  soil: string
  fertilizing: string
  commonMistakes: string[]
}

export interface SeasonalTask {
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  region: 'tropical' | 'temperate' | 'arid' | 'general'
  tasks: string[]
}

export const plantProblems: PlantProblem[] = [
  {
    id: 'powdery-mildew',
    title: 'Powdery Mildew',
    category: 'disease',
    affectedPlants: ['cucumber', 'squash', 'zucchini', 'pea', 'grape', 'rose', 'pumpkin', 'courgette'],
    symptoms: [
      'White or gray powdery spots on leaves',
      'Powdery coating on stems and buds',
      'Yellowing leaves',
      'Leaf curling and distortion',
      'Stunted new growth',
    ],
    keywords: ['powdery', 'mildew', 'white powder', 'white spots', 'dusty leaves'],
    likelyCauses: [
      'High humidity with moderate temperatures',
      'Poor air circulation around plants',
      'Overhead watering keeping foliage wet',
      'Dense planting reducing airflow',
    ],
    treatment: [
      'Remove and destroy affected leaves (do not compost)',
      'Apply neem oil or a potassium bicarbonate spray every 7-14 days',
      'Improve air circulation by thinning crowded plants',
      'Switch to drip irrigation or water at the base of plants',
      'Apply sulfur-based fungicide in severe cases',
    ],
    prevention: [
      'Choose resistant varieties',
      'Space plants properly for airflow',
      'Water at soil level in the morning',
      'Sanitize tools between plants',
    ],
    severity: 'medium',
  },
  {
    id: 'late-blight',
    title: 'Late Blight (Phytophthora infestans)',
    category: 'disease',
    affectedPlants: ['tomato', 'potato'],
    symptoms: [
      'Water-soaked dark green or black spots on leaves',
      'Brown lesions on stems and leaf edges',
      'White fuzzy mold on leaf undersides in humid weather',
      'Rapid plant collapse',
      'Brown corky patches on tubers (potato)',
    ],
    keywords: ['blight', 'late blight', 'black spots', 'rotting tomato', 'brown lesions', 'fuzzy mold'],
    likelyCauses: [
      'Cool, wet weather with high humidity',
      'Infected seed tubers or transplants',
      'Splashing water spreading spores',
    ],
    treatment: [
      'Remove and destroy infected plant material immediately',
      'Apply a copper-based or chlorothalonil fungicide on schedule',
      'Do not compost infected material',
      'Harvest potatoes before tubers are affected',
    ],
    prevention: [
      'Use certified disease-free seed',
      'Rotate crops on a 3-4 year cycle',
      'Mulch to prevent soil splash',
      'Water at the base, not overhead',
      'Destroy crop residues at season end',
    ],
    severity: 'high',
    urgencyNote: 'Late blight spreads within days in humid weather — act immediately.',
  },
  {
    id: 'aphids',
    title: 'Aphids',
    category: 'pest',
    affectedPlants: ['tomato', 'pepper', 'cabbage', 'rose', 'bean', 'lettuce', 'fruit trees', 'most vegetables'],
    symptoms: [
      'Clusters of small green, black, or white insects on new growth',
      'Curled, crinkled, or distorted leaves',
      'Sticky honeydew on leaves',
      'Sooty mold growing on honeydew',
      'Stunted or distorted new growth',
      'Yellow spotted leaves',
    ],
    keywords: ['aphid', 'aphids', 'greenflies', 'blackflies', 'sticky leaves', 'curled leaves', 'bugs on stems'],
    likelyCauses: [
      'Rapid reproduction in warm weather',
      'Over-fertilization with nitrogen producing soft new growth',
      'Lack of natural predators',
    ],
    treatment: [
      'Spray plants with a strong jet of water to dislodge aphids',
      'Apply insecticidal soap or neem oil, targeting leaf undersides',
      'Introduce or encourage ladybirds and lacewings',
      'Remove heavily infested shoots',
      'Use yellow sticky traps for monitoring',
    ],
    prevention: [
      'Avoid excess nitrogen fertilizer',
      'Encourage beneficial insects with flowering companion plants',
      'Inspect new transplants before planting',
    ],
    severity: 'low',
  },
  {
    id: 'root-rot',
    title: 'Root Rot (overwatering / fungal)',
    category: 'disease',
    affectedPlants: ['most plants', 'indoor plants', 'tomato', 'pepper', 'herbs', 'houseplants'],
    symptoms: [
      'Wilting despite wet soil',
      'Yellowing lower leaves',
      'Mushy, brown, or black roots',
      'Foul smell from the soil',
      'Slow growth and leaf drop',
    ],
    keywords: ['root rot', 'wilting', 'wet soil', 'mushy roots', 'dying after watering', 'overwatering'],
    likelyCauses: [
      'Overwatering or poor drainage',
      'Dense compacted soil',
      'Contaminated soil or pots without drainage holes',
      'Fungal pathogens such as Pythium and Phytophthora',
    ],
    treatment: [
      'Stop watering immediately',
      'Remove the plant, trim all rotten roots with clean scissors',
      'Repot into fresh, well-draining soil in a pot with drainage holes',
      'Treat remaining roots with a diluted hydrogen peroxide solution (3% at 1:10)',
      'Hold off fertilizing for 2-3 weeks',
    ],
    prevention: [
      'Water only when the top 2-5 cm of soil is dry',
      'Use pots with drainage holes',
      'Amend heavy soil with compost and perlite',
      'Avoid leaving saucers full of water',
    ],
    severity: 'high',
    urgencyNote: 'Root rot kills quickly — transplant into dry, well-draining soil as soon as possible.',
  },
  {
    id: 'nitrogen-deficiency',
    title: 'Nitrogen Deficiency',
    category: 'nutrient-deficiency',
    affectedPlants: ['tomato', 'corn', 'leafy greens', 'lawn', 'most vegetables', 'houseplants'],
    symptoms: [
      'Overall pale green or yellowing leaves',
      'Yellowing starting from older, lower leaves',
      'Small leaves and slow growth',
      'Weak, spindly stems',
      'Reduced yield',
    ],
    keywords: ['yellow leaves', 'nitrogen', 'pale leaves', 'chlorosis', 'yellowing', 'slow growth'],
    likelyCauses: [
      'Nitrogen-poor or exhausted soil',
      'Leaching after heavy rain or overwatering',
      'High-carbon mulch (straw, wood chips) tying up nitrogen at soil surface',
      'Waterlogged roots unable to absorb nutrients',
    ],
    treatment: [
      'Side-dress with compost or a balanced nitrogen fertilizer (e.g. 10-10-10 or blood meal)',
      'Water with diluted compost tea or fish emulsion',
      'For lawns, apply a slow-release nitrogen fertilizer at the labeled rate',
      'Correct drainage issues if soil is waterlogged',
    ],
    prevention: [
      'Add compost at the start of each season',
      'Practice crop rotation with legumes',
      'Mulch with composted material, not fresh high-carbon mulch near stems',
      'Test soil annually',
    ],
    severity: 'medium',
  },
  {
    id: 'blossom-end-rot',
    title: 'Blossom End Rot',
    category: 'nutrient-deficiency',
    affectedPlants: ['tomato', 'pepper', 'eggplant', 'zucchini', 'watermelon'],
    symptoms: [
      'Dark, sunken, leathery patch on the bottom of the fruit',
      'Patch starts pale then turns brown or black',
      'Fruit misshapen',
    ],
    keywords: ['blossom end rot', 'black bottom', 'rotting fruit bottom', 'black spot on tomato'],
    likelyCauses: [
      'Calcium uptake problems caused by irregular watering',
      'Not an actual soil calcium deficiency in most cases',
      'Overwatering or underwatering stress',
      'Excess nitrogen or potassium',
    ],
    treatment: [
      'Harvest affected fruit to redirect the plant’s energy',
      'Water consistently — deep watering 2-3 times a week rather than daily sips',
      'Mulch to keep soil moisture even',
      'If soil is genuinely calcium-poor, add gypsum or garden lime per soil test',
    ],
    prevention: [
      'Keep soil evenly moist, never soggy or bone dry',
      'Avoid excess nitrogen fertilizer',
      'Mulch around plants',
      'Test soil before adding calcium',
    ],
    severity: 'medium',
  },
  {
    id: 'spider-mites',
    title: 'Spider Mites',
    category: 'pest',
    affectedPlants: ['houseplants', 'tomato', 'pepper', 'rose', 'fruit trees', 'beans'],
    symptoms: [
      'Fine webbing on leaf undersides and between stems',
      'Tiny yellow or bronze speckles on leaves',
      'Leaves turning bronze and dropping',
      'Stippled or dusty appearance',
    ],
    keywords: ['spider mite', 'webbing', 'mites', 'speckled leaves', 'bronze leaves', 'fine web'],
    likelyCauses: [
      'Hot, dry conditions',
      'Dusty foliage',
      'Overhead chemical sprays killing natural predators',
    ],
    treatment: [
      'Hose down foliage thoroughly to knock mites off',
      'Apply insecticidal soap or neem oil, coating leaf undersides',
      'Repeat every 5-7 days for 3 rounds (eggs hatch in cycles)',
      'Increase humidity around indoor plants',
    ],
    prevention: [
      'Regularly wipe or rinse indoor plant leaves',
      'Keep plants well-watered and healthy',
      'Isolate new plants and inspect them',
    ],
    severity: 'medium',
  },
  {
    id: 'fusarium-wilt',
    title: 'Fusarium / Verticillium Wilt',
    category: 'disease',
    affectedPlants: ['tomato', 'eggplant', 'pepper', 'watermelon', 'strawberry', 'potato'],
    symptoms: [
      'One-sided wilting or yellowing of leaves and branches',
      'V-shaped yellow lesions on leaves',
      'Vascular tissue turns brown when stem is cut',
      'Plant wilts in heat but recovers at night, then worsens',
    ],
    keywords: ['wilt', 'wilting one side', 'fusarium', 'verticillium', 'brown stem'],
    likelyCauses: [
      'Soil-borne fungal pathogens',
      'Warm soil temperatures',
      'Contaminated tools, soil, or transplants',
    ],
    treatment: [
      'No cure — remove and bag infected plants',
      'Do not replant susceptible crops in that spot',
      'Solarize soil by covering with clear plastic for 4-6 weeks in summer',
    ],
    prevention: [
      'Rotate crops on a 4-5 year cycle',
      'Choose resistant varieties (look for VFN labels on tomatoes)',
      'Sterilize tools with 10% bleach between plants',
      'Raise beds and improve drainage',
    ],
    severity: 'high',
    urgencyNote: 'Wilt diseases are soil-borne and incurable — remove infected plants to protect the rest.',
  },
  {
    id: 'damping-off',
    title: 'Damping Off (seedlings)',
    category: 'disease',
    affectedPlants: ['seedlings', 'herbs', 'vegetable starts', 'flowers'],
    symptoms: [
      'Seedling stem collapses at soil line',
      'Stem looks water-soaked and thin',
      'Seedlings topple over and die',
      'Failure to emerge',
    ],
    keywords: ['seedling', 'damping off', 'seedlings dying', 'stem collapsing', 'baby plants dying'],
    likelyCauses: [
      'Overwatering and waterlogged seed-starting mix',
      'Poor air circulation',
      'Non-sterile soil or re-used containers',
      'Cold, damp conditions',
    ],
    treatment: [
      'Remove affected seedlings immediately to stop spread',
      'Stop misting; let the surface dry between waterings',
      'Improve airflow with a small fan',
      'Apply cinnamon as a mild antifungal dust on the soil surface',
    ],
    prevention: [
      'Use sterile seed-starting mix and clean trays',
      'Water from below with a tray of water',
      'Provide warmth (21-27°C) and light',
      'Thin seedlings for airflow',
    ],
    severity: 'high',
  },
  {
    id: 'sunscald',
    title: 'Sunscald / Heat Stress',
    category: 'environmental',
    affectedPlants: ['tomato', 'pepper', 'lettuce', 'cabbage', 'houseplants', 'fruit'],
    symptoms: [
      'Papery, bleached, or white patches on exposed fruit or leaves',
      'Wilting in midday heat that recovers at night',
      'Leaf burn at edges and tips',
      'Bolting in leafy crops',
    ],
    keywords: ['sunburn', 'sunscald', 'heat stress', 'white patches', 'wilting heat', 'scorched'],
    likelyCauses: [
      'Sudden exposure to intense sun (especially after indoor hardening-off)',
      'Midday heat waves',
      'Water stress during hot weather',
      'Pruning that suddenly exposes shaded fruit',
    ],
    treatment: [
      'Shade affected plants with shade cloth during peak heat',
      'Water deeply in the early morning',
      'Harvest ripe fruit promptly',
      'Do not prune heavily during heat waves',
    ],
    prevention: [
      'Harden off transplants gradually over 7-10 days',
      'Mulch to keep roots cool',
      'Provide afternoon shade in extreme climates',
      'Avoid midday transplanting',
    ],
    severity: 'low',
  },
  {
    id: 'bacterial-leaf-spot',
    title: 'Bacterial Leaf Spot',
    category: 'disease',
    affectedPlants: ['lettuce', 'spinach', 'tomato', 'pepper', 'cabbage', 'cucumber'],
    symptoms: [
      'Small dark, water-soaked spots on leaves',
      'Spots with a yellow halo',
      'Leaves tearing or shot-hole appearance',
      'Spots merge and leaves die back',
    ],
    keywords: ['leaf spot', 'black spots leaves', 'yellow halo', 'bacterial'],
    likelyCauses: [
      'Splashing water spreading bacteria',
      'Warm, wet weather',
      'Infected seed or transplants',
    ],
    treatment: [
      'Remove infected leaves',
      'Avoid overhead watering',
      'Apply copper-based bactericide labeled for the crop, following label rates',
      'Do not work with wet foliage',
    ],
    prevention: [
      'Use certified disease-free seed',
      'Rotate crops for 2-3 years',
      'Sanitize tools and stakes',
      'Mulch to reduce splash',
    ],
    severity: 'medium',
  },
  {
    id: 'slugs',
    title: 'Slugs and Snails',
    category: 'pest',
    affectedPlants: ['lettuce', 'hosta', 'seedlings', 'strawberry', 'cabbage', 'hostas', 'marigold'],
    symptoms: [
      'Irregular holes chewed in leaves',
      'Silvery slime trails on leaves and soil',
      'Seedlings cut off at soil level',
      'Damage worse after rain or in damp shade',
    ],
    keywords: ['slug', 'snail', 'slime trails', 'holes in leaves', 'eaten leaves overnight'],
    likelyCauses: [
      'Damp, shady conditions',
      'Mulch and debris providing daytime hiding spots',
      'Evening and night feeding',
    ],
    treatment: [
      'Set beer traps (sunk to soil level)',
      'Apply iron phosphate slug bait (safe for pets and wildlife)',
      'Hand-pick at dusk with a flashlight',
      'Sprinkle crushed eggshells or coarse diatomaceous earth as a barrier',
    ],
    prevention: [
      'Water in the morning so the surface dries by evening',
      'Remove debris and dense ground cover near seedlings',
      'Raise seedlings in trays until they are larger',
      'Encourage hedgebirds, frogs, and ground beetles',
    ],
    severity: 'low',
  },
  {
    id: 'leggy-seedlings',
    title: 'Leggy Seedlings',
    category: 'cultural',
    affectedPlants: ['seedlings', 'tomato', 'herbs', 'flowers', 'vegetable starts'],
    symptoms: [
      'Long, thin, stretched stems',
      'Few leaves spaced far apart',
      'Seedlings leaning or falling over',
      'Pale, weak growth',
    ],
    keywords: ['leggy', 'stretching', 'long stems', 'seedlings leaning', 'not enough light'],
    likelyCauses: [
      'Insufficient light intensity',
      'Light source too far away',
      'Sowing too densely',
      'Overwatering combined with low light',
      'Too much heat',
    ],
    treatment: [
      'Move lights to 5-8 cm above seedlings and keep them on 14-16 hours a day',
      'Lower temperature slightly',
      'Gently brush seedlings daily to strengthen stems',
      'Transplant deeper — in tomatoes, bury stems up to the first leaves',
      'Reduce watering slightly',
    ],
    prevention: [
      'Use full-spectrum grow lights at the correct height',
      'Sow at the recommended depth and thin early',
      'Keep lights on a timer',
    ],
    severity: 'low',
  },
  {
    id: 'blossom-drop',
    title: 'Flower Drop (Blossom Drop)',
    category: 'environmental',
    affectedPlants: ['tomato', 'pepper', 'bean', 'cucumber', 'fruit trees'],
    symptoms: [
      'Flowers forming then falling off without setting fruit',
      'Few or no fruits developing',
      'Healthy-looking plant with no yield',
    ],
    keywords: ['flowers falling off', 'no fruit', 'blossom drop', 'not fruiting', 'flowers dropping'],
    likelyCauses: [
      'Temperatures above 32°C or below 13°C during flowering',
      'Low humidity or very high humidity',
      'Irregular watering',
      'Over-fertilization with nitrogen (lots of leaves, no fruit)',
      'Lack of pollinators (in beans, cucumbers, squash)',
    ],
    treatment: [
      'Water consistently and mulch to buffer soil temperature',
      'Stop nitrogen fertilizer; switch to a phosphorus-rich bloom fertilizer if needed',
      'Hand-pollinate squash, cucumber, and tomato in a greenhouse',
      'Provide temporary shade during heat waves',
    ],
    prevention: [
      'Plant at the right time for your climate',
      'Attract pollinators with flowering herbs',
      'Avoid over-fertilizing with nitrogen',
    ],
    severity: 'medium',
  },
  {
    id: 'cat-facing-tomato',
    title: 'Cat-facing and Deformed Fruit',
    category: 'environmental',
    affectedPlants: ['tomato', 'pepper', 'eggplant'],
    symptoms: [
      'Ridged, scarred, or misshapen fruit',
      'Sunken corky rings on the blossom end',
      'Flower parts stuck to developing fruit',
    ],
    keywords: ['deformed', 'misshapen', 'scarred', 'cat-facing', 'ugly fruit', 'bumpy tomato'],
    likelyCauses: [
      'Cold nights during flowering',
      'Insect damage to young fruit',
      'Irregular watering',
    ],
    treatment: [
      'Remove badly deformed fruit so the plant focuses on healthy fruit',
      'Maintain consistent watering',
      'Wait for warmer night temperatures for new fruit to develop normally',
    ],
    prevention: [
      'Transplant after the last frost and when nights are consistently above 13°C',
      'Mulch to keep soil temperature stable',
      'Avoid broad-spectrum insecticides that kill pollinators',
    ],
    severity: 'low',
  },
  {
    id: 'whitefly',
    title: 'Whiteflies',
    category: 'pest',
    affectedPlants: ['tomato', 'cabbage', 'houseplants', 'citrus', 'eggplant', 'pepper'],
    symptoms: [
      'Tiny white moth-like insects that fly up when the plant is disturbed',
      'Yellowing, wilting leaves',
      'Sticky honeydew and sooty mold',
      'Weak, stunted growth',
    ],
    keywords: ['whitefly', 'white flies', 'tiny white insects', 'flies when touched'],
    likelyCauses: [
      'Warm conditions and rapid breeding',
      'Greenhouse or indoor environments without predators',
      'Weed hosts nearby',
    ],
    treatment: [
      'Use yellow sticky traps to reduce adults',
      'Apply insecticidal soap or neem oil to leaf undersides every 5-7 days',
      'Vacuum adults lightly for heavy indoor infestations',
      'Introduce Encarsia formosa predators in greenhouses',
    ],
    prevention: [
      'Screen greenhouses',
      'Remove weeds near growing areas',
      'Inspect new plants before introducing them',
    ],
    severity: 'medium',
  },
  {
    id: 'edema',
    title: 'Edema (Oedema)',
    category: 'environmental',
    affectedPlants: ['houseplants', 'tomato', 'pepper', 'cabbage', 'begonia', 'ivy'],
    symptoms: [
      'Raised corky bumps or blisters on leaf undersides',
      'Rust-colored spots on leaves',
      'Leaf curling',
      'Browning of leaf veins',
    ],
    keywords: ['bumps on leaves', 'blisters', 'edema', 'corky spots', 'rust spots leaves'],
    likelyCauses: [
      'Overwatering combined with low light',
      'High humidity blocking transpiration',
      'Uneven watering cycles',
    ],
    treatment: [
      'Let the soil dry out more between waterings',
      'Improve air circulation (a gentle fan helps)',
      'Increase light levels',
      'Remove badly affected leaves',
    ],
    prevention: [
      'Water on a consistent schedule',
      'Ensure pots drain freely',
      'Avoid saturating soil in low-light conditions',
    ],
    severity: 'low',
  },
  {
    id: 'chlorosis-iron',
    title: 'Iron / Micronutrient Chlorosis',
    category: 'nutrient-deficiency',
    affectedPlants: ['fruit trees', 'blueberry', 'rose', 'spinach', 'grape', 'houseplants'],
    symptoms: [
      'Yellow leaves with green veins (interveinal chlorosis)',
      'New growth affected first',
      'Leaves eventually turn crisp and brown at edges',
    ],
    keywords: ['green veins', 'yellow veins', 'iron', 'chlorosis', 'interveinal'],
    likelyCauses: [
      'Soil pH too high (alkaline) locking out iron',
      'Waterlogged roots',
      'Root damage',
      'Genuinely iron-poor soil',
    ],
    treatment: [
      'Test soil pH — most plants prefer 6.0-7.0; blueberries need 4.5-5.5',
      'Apply chelated iron as a foliar spray or soil drench for quick recovery',
      'Lower pH with sulfur or acidic mulch for acid-loving plants',
      'Fix drainage issues',
    ],
    prevention: [
      'Test soil annually and amend based on results',
      'Mulch with compost',
      'Avoid over-liming',
    ],
    severity: 'medium',
  },
  {
    id: 'mealybugs',
    title: 'Mealybugs',
    category: 'pest',
    affectedPlants: ['houseplants', 'citrus', 'cactus', 'succulent', 'indoor plants'],
    symptoms: [
      'White cottony clumps in leaf joints and on stems',
      'Sticky honeydew on leaves',
      'Yellowing and premature leaf drop',
      'Weak, slow growth',
    ],
    keywords: ['mealybug', 'mealybugs', 'white cotton', 'white fluffy bugs', 'cottony'],
    likelyCauses: [
      'Brought in on new plants',
      'Warm indoor conditions with no predators',
      'Over-fertilization producing soft growth',
    ],
    treatment: [
      'Dab individual bugs with a cotton swab dipped in rubbing alcohol',
      'Spray with insecticidal soap or 1:1 isopropyl alcohol:water solution',
      'Repeat weekly for 3-4 weeks',
      'Isolate infested plants',
    ],
    prevention: [
      'Quarantine new plants for 2 weeks',
      'Inspect plants regularly',
      'Avoid over-fertilizing',
    ],
    severity: 'medium',
  },
]

export const careGuides: CareGuide[] = [
  {
    plant: 'tomato',
    category: 'vegetable',
    watering: 'Deep watering 2-3 times per week at the base; keep soil evenly moist, about 2.5-5 cm per week. Reduce in fruiting to prevent split fruit.',
    sunlight: '6-8 hours of full sun daily.',
    soil: 'Well-draining loamy soil enriched with compost, pH 6.0-6.8.',
    fertilizing: 'Side-dress with balanced fertilizer at planting, switch to phosphorus-rich (5-10-10) at flowering. Avoid excess nitrogen.',
    commonMistakes: ['Overhead watering causing blight', 'Planting too deeply without removing lower leaves correctly', 'Skipping staking/pruning', 'Irregular watering causing blossom end rot'],
  },
  {
    plant: 'basil',
    category: 'herb',
    watering: 'Keep soil consistently moist but not waterlogged; water when the top 2 cm is dry.',
    sunlight: '6+ hours of sun; tolerates partial afternoon shade in hot climates.',
    soil: 'Rich, well-draining soil, pH 6.0-7.0.',
    fertilizing: 'Light feeding every 4-6 weeks with balanced liquid fertilizer or compost tea.',
    commonMistakes: ['Letting it flower and turn bitter — pinch flower spikes', 'Overwatering causing root rot', 'Cold drafts below 10°C'],
  },
  {
    plant: 'lettuce',
    category: 'vegetable',
    watering: 'Frequent, light watering to keep soil evenly moist; about 2.5 cm per week. Drip or morning watering is best.',
    sunlight: 'Full sun in cool weather; afternoon shade in heat to prevent bolting.',
    soil: 'Moist, nitrogen-rich soil, pH 6.0-7.0.',
    fertilizing: 'Side-dress with compost or nitrogen-rich fertilizer every 2-3 weeks for leaf varieties.',
    commonMistakes: ['Letting soil dry out causing bitter, bolted leaves', 'Planting in midsummer heat', 'Overcrowding rows'],
  },
  {
    plant: 'rose',
    category: 'flower',
    watering: 'Deep watering at the base 1-2 times per week; avoid wetting foliage.',
    sunlight: 'At least 6 hours of direct sun.',
    soil: 'Loamy, well-draining, pH 6.0-6.5, rich in organic matter.',
    fertilizing: 'Feed with rose fertilizer in spring as growth starts, repeat after each major bloom flush.',
    commonMistakes: ['Overhead watering promoting black spot', 'Deadheading not done', 'Pruning at wrong time of year'],
  },
  {
    plant: 'indoor plant',
    category: 'indoor',
    watering: 'Check first — most houseplants prefer to dry out partially between waterings. Empty saucers after watering.',
    sunlight: 'Bright indirect light suits most common houseplants; avoid harsh midday sun on thin leaves.',
    soil: 'Chunky, well-aerated potting mix; pots must have drainage holes.',
    fertilizing: 'Diluted liquid fertilizer every 4-6 weeks in the growing season only; none in winter.',
    commonMistakes: ['Watering on a fixed schedule instead of checking soil', 'No drainage holes', 'Dusting neglected — wipe leaves so they can breathe'],
  },
  {
    plant: 'potato',
    category: 'vegetable',
    watering: 'Consistent 2.5-5 cm per week; uneven moisture causes scab and cracking.',
    sunlight: '6+ hours of sun.',
    soil: 'Loose, sandy loam, pH 5.0-6.0 (acidic reduces scab).',
    fertilizing: 'Balanced fertilizer at planting and hilling; high potassium at tuber formation.',
    commonMistakes: ['Exposing tubers to light (green potatoes are toxic)', 'Inconsistent watering', 'Planting in soil that stays waterlogged'],
  },
  {
    plant: 'pepper',
    category: 'vegetable',
    watering: 'Regular, even watering; about 2.5 cm per week. Mulch helps maintain consistency.',
    sunlight: '7-8 hours of full sun.',
    soil: 'Well-draining, warm soil, pH 6.0-6.8.',
    fertilizing: 'Balanced fertilizer at planting; phosphorus-rich at flowering. Avoid nitrogen overload.',
    commonMistakes: ['Planting out before nights stay above 13°C', 'Overwatering causing blossom end rot', 'Picking too late — pick early and often to encourage more'],
  },
]

export const seasonalTasks: SeasonalTask[] = [
  {
    season: 'spring',
    region: 'temperate',
    tasks: [
      'Start seedlings indoors 6-8 weeks before last frost',
      'Harden off transplants gradually over 7-10 days',
      'Test soil and amend based on results',
      'Add 2-5 cm of compost to beds',
      'Prune roses and fruit trees before bud break',
      'Calibrate and sharpen tools',
      'Plan crop rotation to avoid last year’s problem areas',
    ],
  },
  {
    season: 'summer',
    region: 'temperate',
    tasks: [
      'Water deeply in the early morning',
      'Mulch 5-8 cm to retain moisture and suppress weeds',
      'Scout weekly for pests and disease — act at first sign',
      'Succession-sow lettuce and beans every 2-3 weeks',
      'Deadhead flowers to extend blooming',
      'Provide shade cloth during heat waves',
      'Harvest regularly to encourage production',
    ],
  },
  {
    season: 'autumn',
    region: 'temperate',
    tasks: [
      'Plant garlic and cover crops',
      'Remove and destroy diseased plant material — do not compost it',
      'Save seeds from your best plants',
      'Rake leaves and add healthy ones to compost',
      'Protect late crops with row covers',
      'Clean, sharpen, and oil tools',
    ],
  },
  {
    season: 'winter',
    region: 'temperate',
    tasks: [
      'Plan next season’s layout and order seeds',
      'Maintain tools and repair raised beds',
      'Mulch perennial beds with a light layer',
      'Overwinter tender plants indoors',
      'Review the season’s notes: what thrived, what failed, what pests appeared',
    ],
  },
  {
    season: 'spring',
    region: 'tropical',
    tasks: [
      'Plant heat-loving crops before the monsoon arrives',
      'Improve drainage beds ahead of heavy rains',
      'Apply mulch early to regulate soil temperature',
      'Watch for early aphid and whitefly build-up',
    ],
  },
  {
    season: 'summer',
    region: 'arid',
    tasks: [
      'Water deeply 2-3 times per week at dawn',
      'Use shade cloth (30-50%) for leafy crops',
      'Mulch heavily to reduce evaporation',
      'Grow heat-tolerant varieties (okra, amaranth, cowpea)',
      'Check irrigation emitters for clogs weekly',
    ],
  },
]

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2)
}

export function searchProblems(query: string, limit = 3): PlantProblem[] {
  const terms = tokenize(query)
  if (terms.length === 0) return []

  const scored = plantProblems.map(problem => {
    let score = 0
    const haystacks: string[] = [
      problem.title,
      ...problem.symptoms,
      ...problem.keywords,
      ...problem.affectedPlants,
      problem.category,
    ]
    const haystackTokens = new Set(haystacks.flatMap(tokenize))

    for (const term of terms) {
      if (haystackTokens.has(term)) score += 3
      else if ([...haystackTokens].some(t => t.startsWith(term) || term.startsWith(t))) score += 2
    }
    if (problem.category === 'disease' && terms.some(t => ['mold', 'fungus', 'rot', 'blight', 'wilting', 'wilt'].includes(t))) score += 2
    if (problem.category === 'pest' && terms.some(t => ['bug', 'insect', 'mites', 'eaten', 'holes'].includes(t))) score += 2
    return { problem, score }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.problem)
}

export function getCareGuide(plant: string): CareGuide | undefined {
  const p = plant.toLowerCase()
  return (
    careGuides.find(g => g.plant === p) ??
    careGuides.find(g => p.includes(g.plant) || g.plant.includes(p)) ??
    careGuides.find(g => g.plant === 'indoor plant' && ['houseplant', 'plant'].includes(p))
  )
}

export function getSeasonalTasks(season: string, region = 'general'): SeasonalTask[] {
  const s = season.toLowerCase()
  const r = region.toLowerCase() as SeasonalTask['region']
  const exact = seasonalTasks.filter(t => t.season === s && t.region === r)
  const bySeason = seasonalTasks.filter(t => t.season === s)
  return exact.length > 0 ? exact : bySeason
}
