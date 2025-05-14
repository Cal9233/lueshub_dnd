<?php
/***************************************************
 * 1) Original server-side logic for login/DB
 ***************************************************/
session_start();

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Ensure user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: /not_authorized.php');
    exit();
}

// Connect to DB
$db_host = 'localhost';
$db_user = 'dnd_user';
$db_pass = 'LETme1n2dnd11!!';
$db_name = 'dnd_campaigns';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

// Check if user is admin
$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare('
    SELECT r.name
    FROM user_groups ug
    JOIN roles r ON ug.role_id = r.id
    WHERE ug.user_id = ?
');
$stmt->bind_param('i', $user_id);
$stmt->execute();
$res = $stmt->get_result();
$is_admin = false;
while ($row = $res->fetch_assoc()) {
    if ($row['name'] === 'admin') {
        $is_admin = true;
        break;
    }
}
$stmt->close();

// Validate character ID
$char_id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($char_id <= 0) {
    die('Invalid character ID.');
}

// Fetch character from DB
if ($is_admin) {
    $sql = "SELECT c.*, u.username
            FROM characters c
            JOIN users u ON c.user_id = u.id
            WHERE c.id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $char_id);
} else {
    $sql = "SELECT c.*, u.username
            FROM characters c
            JOIN users u ON c.user_id = u.id
            WHERE c.id=? AND c.user_id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $char_id, $user_id);
}
$stmt->execute();
$char_res = $stmt->get_result();
$character = $char_res->fetch_assoc();
$stmt->close();

if (!$character) {
    die('Character not found or no permission.');
}

// For error messages
$error = null;

// Helper function for ability modifiers
function ability_mod($score) {
    return floor(($score - 10) / 2);
}

// The list of abilities used
$abilities = ['strength','dexterity','constitution','intelligence','wisdom','charisma'];

/***************************************************
 * 2) Handle dice rolling
 ***************************************************/
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['roll_action'])) {
    $formula = $_POST['formula'] ?? '';
    $action_name = $_POST['action_name'] ?? '';

    // Basic validation "1d20+3"
    if (preg_match('/^(\d*)d(\d+)([+\-]\d+)?$/i', $formula, $matches)) {
        $num_dice = $matches[1] ?: 1;
        $num_dice = (int)$num_dice;
        $dice_size = (int)$matches[2];
        $modifier = 0;
        if (!empty($matches[3])) {
            $modifier = (int)$matches[3];
        }

        $rolls = [];
        $total = 0;
        for ($i = 0; $i < $num_dice; $i++) {
            $val = random_int(1, $dice_size);
            $rolls[] = $val;
            $total += $val;
        }
        $total += $modifier;
        $rolls_json = json_encode($rolls);

        $stmt = $conn->prepare("
            INSERT INTO rolls (user_id, action, roll, total, rolls_json, modifier)
            VALUES (?,?,?,?,?,?)
        ");
        $stmt->bind_param('issisi', $user_id, $action_name, $formula, $total, $rolls_json, $modifier);
        if (!$stmt->execute()) {
            $error = "Error saving roll: " . $stmt->error;
        }
        $stmt->close();
    } else {
        $error = "Invalid dice formula. Use something like '1d20+3'.";
    }
}

/***************************************************
 * 3) Handle saving character (including spells/notes)
 ***************************************************/
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'save_character') {
    // Gather posted fields
    $name = $_POST['name'] ?? '';
    $race = $_POST['race'] ?? '';
    $class = $_POST['class'] ?? '';
    $level = (int)($_POST['level'] ?? 1);
    $armor_class = (int)($_POST['armor_class'] ?? 10);

    $hit_points = (int)($_POST['hit_points'] ?? 10);
    $max_hit_points = (int)($_POST['max_hit_points'] ?? 10);
    $temp_hit_points = (int)($_POST['temp_hit_points'] ?? 0);
    // Extra: handle temp_max_hit_points if your DB has it
    $temp_max_hit_points = isset($_POST['temp_max_hit_points'])
        ? (int)$_POST['temp_max_hit_points']
        : 0; // Remove or keep if you have that column

    // Abilities
    $strength = (int)($_POST['strength'] ?? 10);
    $dexterity = (int)($_POST['dexterity'] ?? 10);
    $constitution = (int)($_POST['constitution'] ?? 10);
    $intelligence = (int)($_POST['intelligence'] ?? 10);
    $wisdom = (int)($_POST['wisdom'] ?? 10);
    $charisma = (int)($_POST['charisma'] ?? 10);

    // Currency
    $gold = (int)($_POST['gold'] ?? 0);
    $silver = (int)($_POST['silver'] ?? 0);
    $copper = (int)($_POST['copper'] ?? 0);

    // Spellcasting
    $spell_save_dc = (int)($_POST['spell_save_dc'] ?? 10);
    $spell_attack_bonus = (int)($_POST['spell_attack_bonus'] ?? 0);
    $spell_slots_json = $_POST['spell_slots_json'] ?? '{}';
    if (trim($spell_slots_json) === '') {
        $spell_slots_json = '{}';
    }
    $known_spells = $_POST['known_spells'] ?? '';

    // Equipment & notes
    $weapons = $_POST['weapons'] ?? '';
    $gear = $_POST['gear'] ?? '';
    $background = $_POST['background'] ?? '';
    $notes = $_POST['notes'] ?? '';
    // If you also want to store a full “spellbook” JSON, you could do that. Right now, 
    // the code just uses `spell_slots_json` + `known_spells`.

    $equipment = ''; // leftover from original code if needed
    $char_user_id = $character['user_id'];

    // Non-admins can’t save others’ chars
    if (!$is_admin && ($char_user_id != $_SESSION['user_id'])) {
        header('Location: /not_authorized.php');
        exit();
    }

    // Build the SQL for updating
    // NOTE: If your DB does NOT have `temp_max_hit_points`, remove that part or add it.
    $stmt = $conn->prepare("
        UPDATE characters
        SET user_id=?,
            name=?,
            race=?,
            class=?,
            level=?,
            armor_class=?,
            hit_points=?,
            max_hit_points=?,
            temp_hit_points=?,

            strength=?,
            dexterity=?,
            constitution=?,
            intelligence=?,
            wisdom=?,
            charisma=?,

            gold=?,
            silver=?,
            copper=?,

            spell_save_dc=?,
            spell_attack_bonus=?,
            spell_slots_json=?,
            known_spells=?,
            weapons=?,
            gear=?,
            equipment=?,
            background=?,
            notes=?,

            -- example: if you do have temp_max_hit_points
            temp_max_hit_points = ?,

            short_rest_count=short_rest_count,
            long_rest_count=long_rest_count
        WHERE id=?
    ");

    $stmt->bind_param(
       'isssiiiiiiiiiiiiiiissssssssii',
        $char_user_id,
        $name, $race, $class,
        $level, $armor_class, $hit_points, $max_hit_points, $temp_hit_points,
        $strength, $dexterity, $constitution, $intelligence, $wisdom, $charisma,
        $gold, $silver, $copper,
        $spell_save_dc, $spell_attack_bonus,
        $spell_slots_json, $known_spells, $weapons, $gear, $equipment, $background, $notes,
        $temp_max_hit_points,  // remove if not in DB
        $char_id
    );

    if (!$stmt->execute()) {
        $error = "Error saving character: " . $stmt->error;
    } else {
        header("Location: character_play.php?id=$char_id&saved=1");
        exit();
    }
    $stmt->close();
}

/***************************************************
 * 4) Handle short/long rest
 ***************************************************/
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['rest_action'])) {
    if ($_POST['rest_action'] === 'short_rest') {
        // Example short rest logic from your React code
        // e.g. gain some HP (level*2)
        $hp_gain = $character['level'] * 2;
        $new_hp = min($character['max_hit_points'], $character['hit_points'] + $hp_gain);

        $stmt = $conn->prepare("UPDATE characters SET hit_points=? WHERE id=?");
        $stmt->bind_param('ii', $new_hp, $char_id);
        $stmt->execute();
        $stmt->close();

        header("Location: character_play.php?id=$char_id&rest=short");
        exit();
    } elseif ($_POST['rest_action'] === 'long_rest') {
        // Example long rest logic: restore full HP
        $new_hp = $character['max_hit_points'];

        $stmt = $conn->prepare("UPDATE characters SET hit_points=? WHERE id=?");
        $stmt->bind_param('ii', $new_hp, $char_id);
        $stmt->execute();
        $stmt->close();

        header("Location: character_play.php?id=$char_id&rest=long");
        exit();
    }
}

/***************************************************
 * 5) Fetch recent rolls for display
 ***************************************************/
if ($is_admin) {
    $sql = "
        SELECT r.*, u.username
        FROM rolls r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.id DESC
        LIMIT 10
    ";
    $res = $conn->query($sql);
} else {
    $stmt = $conn->prepare("
        SELECT r.*, u.username
        FROM rolls r
        JOIN users u ON r.user_id = u.id
        WHERE r.user_id=?
        ORDER BY r.id DESC
        LIMIT 10
    ");
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
}

$roll_history = [];
if ($res) {
    $roll_history = $res->fetch_all(MYSQLI_ASSOC);
}

$conn->close();

/***************************************************
 * 6) Prepare data for front-end
 ***************************************************/
// Convert stored JSON to strings for Alpine
$fixed_notes = !empty($character['notes']) ? $character['notes'] : '[]';
$fixed_spellslots = !empty($character['spell_slots_json']) ? $character['spell_slots_json'] : '{}';

// We’ll also define the skill data from your React code:
$skillData = [
    [
        "ability" => "strength",
        "label"   => "Strength",
        "skills"  => [
            ["name" => "(No Skill)", "skillName" => "Strength Check"],
            ["name" => "Athletics", "skillName" => "Athletics"],
        ],
    ],
    [
        "ability" => "dexterity",
        "label"   => "Dexterity",
        "skills"  => [
            ["name" => "(No Skill)", "skillName" => "Dexterity Check"],
            ["name" => "Acrobatics", "skillName" => "Acrobatics"],
            ["name" => "Sleight of Hand", "skillName" => "Sleight of Hand"],
            ["name" => "Stealth", "skillName" => "Stealth"],
        ],
    ],
    [
        "ability" => "constitution",
        "label"   => "Constitution",
        "skills"  => [
            ["name" => "(No Skill)", "skillName" => "Constitution Check"],
        ],
    ],
    [
        "ability" => "intelligence",
        "label"   => "Intelligence",
        "skills"  => [
            ["name" => "(No Skill)", "skillName" => "Intelligence Check"],
            ["name" => "Arcana", "skillName" => "Arcana"],
            ["name" => "History", "skillName" => "History"],
            ["name" => "Investigation", "skillName" => "Investigation"],
            ["name" => "Nature", "skillName" => "Nature"],
            ["name" => "Religion", "skillName" => "Religion"],
        ],
    ],
    [
        "ability" => "wisdom",
        "label"   => "Wisdom",
        "skills"  => [
            ["name" => "(No Skill)", "skillName" => "Wisdom Check"],
            ["name" => "Animal Handling", "skillName" => "Animal Handling"],
            ["name" => "Insight", "skillName" => "Insight"],
            ["name" => "Medicine", "skillName" => "Medicine"],
            ["name" => "Perception", "skillName" => "Perception"],
            ["name" => "Survival", "skillName" => "Survival"],
        ],
    ],
    [
        "ability" => "charisma",
        "label"   => "Charisma",
        "skills"  => [
            ["name" => "(No Skill)", "skillName" => "Charisma Check"],
            ["name" => "Deception", "skillName" => "Deception"],
            ["name" => "Intimidation", "skillName" => "Intimidation"],
            ["name" => "Performance", "skillName" => "Performance"],
            ["name" => "Persuasion", "skillName" => "Persuasion"],
        ],
    ],
];

?>
<!DOCTYPE html>
<html lang="en"
      x-data="characterPlayData()"
      x-init="initData(
         <?php echo json_encode($character, JSON_HEX_APOS|JSON_HEX_QUOT); ?>,
         <?php echo json_encode($fixed_notes, JSON_HEX_APOS|JSON_HEX_QUOT); ?>,
         <?php echo json_encode($fixed_spellslots, JSON_HEX_APOS|JSON_HEX_QUOT); ?>,
         <?php echo json_encode($roll_history, JSON_HEX_APOS|JSON_HEX_QUOT); ?>,
         <?php echo json_encode($skillData, JSON_HEX_APOS|JSON_HEX_QUOT); ?>
      )">
<head>
    <meta charset="UTF-8" />
    <title>Character Play - <?php echo htmlspecialchars($character['name'] ?? ''); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Tailwind & Alpine -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet" />
    <script src="https://unpkg.com/alpinejs@3.10.2/dist/cdn.min.js" defer></script>

    <link rel="stylesheet" href="styles.css"><!-- If you have a custom stylesheet -->
    <style>
        [x-cloak] { display: none; }
        /* Minimal handle style for resizing, etc. */
    </style>
</head>
<body class="bg-gray-900 text-gray-100 font-sans">

<!-- NAV -->
<nav class="bg-gray-800 p-4 flex justify-between items-center">
    <div class="flex space-x-4">
        <a href="realm.php" class="hover:text-gray-300">Home</a>
        <a href="campaigns.php" class="hover:text-gray-300">Campaigns</a>
        <a href="characters.php" class="hover:text-gray-300">Characters</a>
        <a href="dice_roller.php" class="hover:text-gray-300">Dice Roller</a>
    </div>
    <div x-data="{open:false}" class="relative">
        <button @click="open=!open" class="flex items-center space-x-2 hover:text-gray-300">
            <span x-text="charData.username ?? 'Username'"></span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 9l-7 7-7-7"></path>
            </svg>
        </button>
        <div x-show="open" @click.away="open=false"
             class="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-xl z-10">
            <a href="logout.php" class="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">Logout</a>
        </div>
    </div>
</nav>

<!-- Flash messages if saved or rested -->
<?php if (isset($_GET['saved'])): ?>
<div class="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded"
     x-data="{show:true}" x-show="show" x-init="setTimeout(()=>show=false,3000)">
    Character saved successfully!
</div>
<?php endif; ?>
<?php if (isset($_GET['rest'])): ?>
<div class="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded"
     x-data="{show:true}" x-show="show" x-init="setTimeout(()=>show=false,3000)">
    <?php echo $_GET['rest'] === 'short' ? 'Short rest completed!' : 'Long rest completed!'; ?>
</div>
<?php endif; ?>

<!-- Show errors if any -->
<?php if (!empty($error)): ?>
<div class="p-4 bg-red-600 text-white">
    <?php echo htmlspecialchars($error); ?>
</div>
<?php endif; ?>

<!-- MAIN FORM (like original) -->
<form method="POST" action="character_play.php?id=<?php echo $char_id; ?>" class="h-screen flex flex-col">
<input type="hidden" name="action" value="save_character" />

<div class="flex-1 flex" style="min-height: 0;">
    <!-- LEFT NOTES PANEL -->
    <div class="relative bg-gray-800 border-r border-gray-700"
         :style="{ width: showLeftPanel ? leftPanelWidth + 'px' : '40px' }"
         style="transition:width 0.2s ease;">
        <!-- Toggle handle -->
        <div class="absolute top-1/2 right-0 -translate-y-1/2 w-6 cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-l text-center"
             @click="toggleLeftPanel">
            <span class="text-xs font-semibold" x-text="showLeftPanel ? '←' : '→'"></span>
        </div>
        <!-- Drag Resizer -->
        <template x-if="showLeftPanel">
            <div class="absolute top-0 right-0 h-full w-2 cursor-ew-resize z-10"
                 @mousedown="startLeftResize"
                 style="background:transparent"></div>
        </template>

        <!-- Actual note content -->
        <div class="h-full p-4 overflow-y-auto" x-show="showLeftPanel" x-transition>
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold">Notes</h2>
                <button type="button"
                        class="bg-blue-600 px-2 py-1 text-sm rounded hover:bg-blue-700"
                        @click="addCategory">
                    + Section
                </button>
            </div>

            <div class="space-y-4">
                <!-- Each category -->
                <template x-for="(category, cIdx) in notesData" :key="cIdx">
                    <div class="border border-gray-700 rounded-xl bg-gray-700">
                        <div class="flex items-center justify-between bg-gray-800 px-3 py-2 rounded-t-xl">
                            <input type="text"
                                   class="bg-transparent border-0 font-semibold text-white focus:outline-none"
                                   x-model="category.title" />
                            <div class="flex items-center gap-2">
                                <button type="button" class="border border-gray-600 px-2 py-1 text-xs rounded hover:bg-gray-600"
                                        @click="category.isOpen=!category.isOpen">
                                    <span x-text="category.isOpen?'Hide':'Show'"></span>
                                </button>
                                <button type="button" class="bg-red-600 px-2 py-1 text-xs rounded hover:bg-red-700"
                                        @click="removeCategory(cIdx)">
                                    X
                                </button>
                            </div>
                        </div>
                        <div x-show="category.isOpen" x-transition class="p-3 space-y-3">
                            <!-- Each note -->
                            <template x-for="(note,nIdx) in category.notes" :key="nIdx">
                                <div class="bg-gray-800 rounded-xl p-3">
                                    <div class="flex items-center justify-between">
                                        <input type="text"
                                               class="bg-transparent border-0 text-white font-semibold focus:outline-none"
                                               x-model="note.title" />
                                        <div class="flex items-center gap-2">
                                            <button type="button" class="hover:bg-gray-600 p-1 rounded"
                                                    @click="openNoteEditor(cIdx,nIdx,note.content)">
                                                ⋮
                                            </button>
                                            <button type="button" class="bg-red-600 px-2 py-1 text-xs rounded hover:bg-red-700"
                                                    @click="removeNote(cIdx,nIdx)">
                                                X
                                            </button>
                                        </div>
                                    </div>
                                    <div class="mt-2 bg-gray-900 p-2 rounded text-sm text-white"
                                         x-html="note.content"></div>
                                </div>
                            </template>
                            <!-- Add note button -->
                            <button type="button" class="bg-blue-600 px-2 py-1 text-xs rounded hover:bg-blue-700"
                                    @click="addNote(cIdx)">
                                + Note
                            </button>
                        </div>
                    </div>
                </template>
            </div>

            <!-- Hidden input for notes JSON -->
            <input type="hidden" name="notes" :value="JSON.stringify(notesData)" />
        </div>
    </div>

    <!-- CENTER: MAIN CHARACTER INFO -->
    <div class="flex-1 p-4 space-y-4 overflow-auto">
        <!-- Quick row with Short/Long rest + currency + "Save Changes" -->
        <div class="flex flex-wrap gap-2 mb-4 items-center">
            <!-- Short Rest -->
            <form method="POST" class="flex gap-2" action="character_play.php?id=<?php echo $char_id; ?>">
                <input type="hidden" name="rest_action" value="short_rest" />
                <button type="submit"
                        class="bg-yellow-500 text-gray-900 px-3 py-1 rounded hover:bg-yellow-600">
                    Short Rest
                </button>
            </form>
            <!-- Long Rest -->
            <form method="POST" class="flex gap-2" action="character_play.php?id=<?php echo $char_id; ?>">
                <input type="hidden" name="rest_action" value="long_rest" />
                <button type="submit"
                        class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    Long Rest
                </button>
            </form>

            <!-- Currency -->
            <div class="flex items-center space-x-2 flex-wrap text-gray-200">
                <span>Gold:</span>
                <input type="number" class="w-16 border border-gray-700 bg-gray-800 text-gray-100 rounded p-1"
                       name="gold"
                       x-model.number="charData.gold" />
                <span>Silver:</span>
                <input type="number" class="w-16 border border-gray-700 bg-gray-800 text-gray-100 rounded p-1"
                       name="silver"
                       x-model.number="charData.silver" />
                <span>Copper:</span>
                <input type="number" class="w-16 border border-gray-700 bg-gray-800 text-gray-100 rounded p-1"
                       name="copper"
                       x-model.number="charData.copper" />
            </div>

            <!-- Save Changes -->
            <button type="submit"
                    class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-auto">
                Save Changes
            </button>
        </div>

        <!-- Basic Info (Name, Race, Class, Level, AC) -->
        <div class="bg-gray-800 p-4 rounded shadow">
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                    <label class="font-bold block mb-1 text-gray-200">Name</label>
                    <input type="text"
                           class="border border-gray-700 bg-gray-900 text-gray-100 rounded w-full p-2"
                           name="name"
                           x-model="charData.name" />
                </div>
                <div>
                    <label class="font-bold block mb-1 text-gray-200">Race</label>
                    <input type="text"
                           class="border border-gray-700 bg-gray-900 text-gray-100 rounded w-full p-2"
                           name="race"
                           x-model="charData.race" />
                </div>
                <div>
                    <label class="font-bold block mb-1 text-gray-200">Class</label>
                    <input type="text"
                           class="border border-gray-700 bg-gray-900 text-gray-100 rounded w-full p-2"
                           name="class"
                           x-model="charData.class" />
                </div>
                <div>
                    <label class="font-bold block mb-1 text-gray-200">Level</label>
                    <input type="number"
                           class="border border-gray-700 bg-gray-900 text-gray-100 rounded w-full p-2"
                           name="level"
                           x-model.number="charData.level" />
                </div>
                <div>
                    <label class="font-bold block mb-1 text-gray-200">Armor Class</label>
                    <input type="number"
                           class="border border-gray-700 bg-gray-900 text-gray-100 rounded w-full p-2"
                           name="armor_class"
                           x-model.number="charData.armor_class" />
                </div>
            </div>
        </div>

        <!-- HP and Temp HP bar -->
        <div class="bg-gray-800 p-4 rounded shadow"
             x-data="{
                getHPpct(){
                    if(charData.max_hit_points<=0)return 0;
                    return (charData.hit_points/charData.max_hit_points)*100;
                },
                getTempPct(){
                    if(charData.max_hit_points<=0)return 0;
                    return (charData.temp_hit_points/charData.max_hit_points)*100;
                },
                getHPcolor(){
                    const pct=this.getHPpct();
                    if(pct<=25)return 'from-red-700 to-red-500';
                    if(pct<=50)return 'from-yellow-600 to-yellow-400';
                    return 'from-green-600 to-green-500';
                }
             }">
            <label class="text-lg font-bold text-gray-200 block mb-2">Hit Points</label>
            <div class="flex flex-wrap gap-4 mb-4">
                <div>
                    <label class="text-sm block text-gray-300">Current HP</label>
                    <input type="number"
                           name="hit_points"
                           x-model.number="charData.hit_points"
                           class="border border-gray-700 bg-gray-900 text-gray-100 rounded p-2 w-24" />
                </div>
                <div>
                    <label class="text-sm block text-gray-300">Max HP</label>
                    <input type="number"
                           name="max_hit_points"
                           x-model.number="charData.max_hit_points"
                           class="border border-gray-700 bg-gray-900 text-gray-100 rounded p-2 w-24" />
                </div>
                <div>
                    <label class="text-sm block text-gray-300">Temp HP</label>
                    <input type="number"
                           name="temp_hit_points"
                           x-model.number="charData.temp_hit_points"
                           class="border border-gray-700 bg-gray-900 text-gray-100 rounded p-2 w-24" />
                </div>
                <!-- If you want to also handle "temp_max_hit_points" -->
                <div>
                    <label class="text-sm block text-gray-300">Temp Max HP</label>
                    <input type="number"
                           name="temp_max_hit_points"
                           x-model.number="charData.temp_max_hit_points"
                           class="border border-gray-700 bg-gray-900 text-gray-100 rounded p-2 w-24" />
                </div>
            </div>
            <!-- Bar -->
            <div class="relative h-8 bg-gray-700 rounded overflow-hidden w-full max-w-sm">
                <div class="absolute inset-0 bg-gray-600"></div>
                <div class="absolute inset-y-0 left-0 bg-gradient-to-r transition-all duration-300"
                     :class="getHPcolor()"
                     :style="{ width: getHPpct()+'%' }">
                </div>
                <div class="absolute inset-y-0 bg-blue-500 transition-all duration-300"
                     x-show="charData.temp_hit_points>0"
                     :style="{ width: getTempPct()+'%', left:getHPpct()+'%' }">
                </div>
                <div class="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    <span x-text="charData.hit_points + ' / ' + charData.max_hit_points
                                  + (charData.temp_hit_points>0 ? ' (+'+charData.temp_hit_points+' temp)' : '')">
                    </span>
                </div>
            </div>
        </div>

        <!-- Ability Scores -->
        <div class="bg-gray-800 p-4 rounded shadow mb-4">
            <h2 class="text-xl font-bold mb-4 text-gray-200">Ability Scores</h2>
            <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
                <?php foreach($abilities as $ab): ?>
                <div class="border border-gray-700 rounded p-4 text-center bg-gray-700 hover:bg-gray-600 transition-colors">
                    <div class="font-bold capitalize mb-2 text-gray-100">
                        <?php echo htmlspecialchars($ab); ?>
                    </div>
                    <input type="number"
                           class="border border-gray-600 bg-gray-900 text-gray-100 rounded w-full p-2 text-center mb-2"
                           name="<?php echo $ab; ?>"
                           x-model.number="charData['<?php echo $ab; ?>']" />
                    <div class="text-sm font-semibold"
                         :class="abilityMod(charData['<?php echo $ab; ?>'])>=0 ? 'text-green-400':'text-red-400' ">
                        Modifier:
                        <span x-text="(abilityMod(charData['<?php echo $ab; ?>'])>=0 ? '+' : '')
                                      + abilityMod(charData['<?php echo $ab; ?>'])">
                        </span>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Spellcasting (DC, Attack, plus optional slot editor) -->
        <div class="bg-gray-800 p-4 rounded shadow mb-4">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-200">Spellcasting</h2>
                <button type="button"
                        class="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                        @click="spellConfigOpen=!spellConfigOpen">
                    <span x-text="spellConfigOpen?'Hide Config':'Show Config'"></span>
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="font-bold block mb-1 text-gray-200">Spell Save DC</label>
                    <input type="number"
                           class="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded p-2"
                           name="spell_save_dc"
                           x-model.number="charData.spell_save_dc">
                </div>
                <div>
                    <label class="font-bold block mb-1 text-gray-200">Spell Attack Bonus</label>
                    <input type="number"
                           class="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded p-2"
                           name="spell_attack_bonus"
                           x-model.number="charData.spell_attack_bonus">
                </div>
            </div>
            <!-- Expandable Slots -->
            <div x-show="spellConfigOpen" x-transition class="border-t border-gray-700 pt-4">
                <h3 class="font-bold mb-2 text-gray-200">Spell Slots</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <template x-for="(slotInfo, lvl) in spellSlots" :key="lvl">
                        <div class="border border-gray-700 rounded p-3 bg-gray-700 text-gray-100">
                            <div class="font-bold mb-2">
                                Level <span x-text="lvl"></span>
                            </div>
                            <div class="flex space-x-2">
                                <div>
                                    <label class="text-sm block text-gray-300">Max</label>
                                    <input type="number"
                                           class="border border-gray-600 bg-gray-900 text-gray-100 rounded p-1 w-16 text-center"
                                           x-model.number="slotInfo.max">
                                </div>
                                <div>
                                    <label class="text-sm block text-gray-300">Current</label>
                                    <input type="number"
                                           class="border border-gray-600 bg-gray-900 text-gray-100 rounded p-1 w-16 text-center"
                                           x-model.number="slotInfo.current">
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
            <!-- Hidden input for slot JSON -->
            <input type="hidden" name="spell_slots_json" :value="JSON.stringify(spellSlots)">
        </div>

        <!-- Known Spells -->
        <div class="bg-gray-800 p-4 rounded shadow mb-4">
            <h2 class="text-xl font-bold mb-2 text-gray-200">Known Spells</h2>
            <textarea class="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded p-2 h-32"
                      name="known_spells"
                      x-model="charData.known_spells"
                      placeholder="List your known spells here..."></textarea>

            <!-- Optionally: a button to open an advanced "spell editor" modal, 
                 if you want to replicate the React Spell Editor UI. -->
            <button type="button" class="mt-2 bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                    @click="openSpellEditor">
                Advanced Spell Editor
            </button>
        </div>

        <!-- Equipment (weapons/gear) -->
        <div class="bg-gray-800 p-4 rounded shadow mb-4">
            <h2 class="text-xl font-bold mb-4 text-gray-200">Equipment</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 class="font-bold mb-2 text-gray-200">Weapons</h3>
                    <textarea class="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded p-2 h-32"
                              name="weapons"
                              x-model="charData.weapons"></textarea>
                </div>
                <div>
                    <h3 class="font-bold mb-2 text-gray-200">Gear</h3>
                    <textarea class="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded p-2 h-32"
                              name="gear"
                              x-model="charData.gear"></textarea>
                </div>
            </div>
        </div>

        <!-- Background -->
        <div class="bg-gray-800 p-4 rounded shadow mb-4">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-200">Background</h2>
                <button type="button"
                        class="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                        @click="showBackground=!showBackground">
                    <span x-text="showBackground?'Hide':'Show'"></span>
                </button>
            </div>
            <div x-show="showBackground" x-transition class="border-t border-gray-700 pt-2">
                <textarea class="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded p-2 h-64"
                          name="background"
                          x-model="charData.background"
                          placeholder="Write your character's background here..."></textarea>
            </div>
        </div>

        <!-- Final Save at bottom -->
        <div class="flex justify-end">
            <button type="submit" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                Save All Changes
            </button>
        </div>
    </div>

    <!-- RIGHT: DICE ROLLER/HISTORY PANEL -->
    <div class="relative bg-gray-800 border-l border-gray-700"
         :style="{ width: showRightPanel ? rightPanelWidth + 'px' : '40px' }"
         style="transition:width 0.2s ease;">
        <!-- Toggle handle -->
        <div class="absolute top-1/2 left-0 -translate-y-1/2 w-6 cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-r text-center"
             @click="toggleRightPanel">
            <span class="text-xs font-semibold" x-text="showRightPanel?'→':'←'"></span>
        </div>
        <!-- Drag Resizer -->
        <template x-if="showRightPanel">
            <div class="absolute top-0 left-0 h-full w-2 cursor-ew-resize z-10"
                 @mousedown="startRightResize"
                 style="background:transparent"></div>
        </template>

        <!-- Dice content -->
        <div class="h-full p-4 overflow-y-auto" x-show="showRightPanel" x-transition>
            <h2 class="text-2xl font-bold text-white mb-4 text-center">Dice Roller</h2>
            <!-- Skill Check dropdown -->
            <div class="relative inline-block mb-4">
                <button type="button"
                        class="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                        @click="skillMenuOpen=!skillMenuOpen">
                    Skill Check
                </button>
                <div class="absolute left-1/2 -translate-x-1/2 mt-2 bg-gray-800 border border-gray-700 rounded shadow-lg p-2 z-50"
                     style="width:300px;"
                     x-show="skillMenuOpen" @click.away="skillMenuOpen=false" x-transition>
                    <div class="flex">
                        <!-- Abilities -->
                        <div class="w-1/3 border-r border-gray-600 pr-2">
                            <template x-for="abilityItem in skillData" :key="abilityItem.ability">
                                <div class="py-1 px-2 hover:bg-gray-700 cursor-pointer text-white"
                                     @click="selectedAbility=abilityItem.ability">
                                    <span x-text="abilityItem.label"></span>
                                </div>
                            </template>
                        </div>
                        <!-- Skills -->
                        <div class="w-2/3 pl-2">
                            <template x-if="selectedAbility">
                                <template x-for="skillItem in skillData.find(a=>a.ability===selectedAbility).skills" :key="skillItem.name">
                                    <div class="py-1 px-2 hover:bg-gray-700 cursor-pointer text-white"
                                         @click="handleSkillSelect(selectedAbility, skillItem.skillName)">
                                        <span x-text="skillItem.name"></span>
                                    </div>
                                </template>
                            </template>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Basic fields for dice roll -->
            <div class="space-y-4 text-center mb-4">
                <!-- Number of Dice -->
                <div>
                    <label class="block font-bold mb-1 text-gray-200">Number of Dice</label>
                    <select class="bg-gray-900 rounded-2xl p-2 text-white"
                            x-model.number="numDice">
                        <template x-for="n in 10" :key="n">
                            <option :value="n" x-text="n"></option>
                        </template>
                    </select>
                </div>
                <!-- Dice Type -->
                <div>
                    <label class="block font-bold mb-1 text-gray-200">Dice Type</label>
                    <select class="bg-gray-900 rounded-2xl p-2 text-white"
                            x-model="diceType">
                        <template x-for="dt in ['d4','d6','d8','d10','d12','d20']" :key="dt">
                            <option :value="dt" x-text="dt"></option>
                        </template>
                    </select>
                </div>
                <!-- Modifier -->
                <div>
                    <label class="block font-bold mb-1 text-gray-200">Modifier</label>
                    <select class="bg-gray-900 rounded-2xl p-2 text-white"
                            x-model.number="modifier">
                        <template x-for="m in modifierOptions" :key="m">
                            <option :value="m" x-text="m>=0?('+'+m):m"></option>
                        </template>
                    </select>
                </div>
                <!-- Roll Description -->
                <div>
                    <label class="block font-bold mb-1 text-gray-200">Roll Description</label>
                    <input type="text"
                           class="bg-gray-900 text-white text-center p-2 rounded"
                           x-model="rollDescription" />
                </div>
                <!-- Form to actually POST the roll -->
                <form method="POST" @submit="updateDiceFormula" class="mt-2">
                    <input type="hidden" name="roll_action" value="roll" />
                    <input type="hidden" name="formula" x-model="diceFormula" />
                    <input type="hidden" name="action_name" x-model="rollDescription" />
                    <button type="submit"
                            class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Roll Dice
                    </button>
                </form>
            </div>

            <!-- Recent Rolls -->
            <div class="border-t border-gray-700 pt-4">
                <h3 class="font-bold text-xl text-white mb-4 text-center">Recent Rolls</h3>
                <div class="space-y-4">
                    <template x-if="rollHistory.length===0">
                        <p class="text-gray-400 italic">No rolls yet</p>
                    </template>
                    <template x-for="roll in rollHistory" :key="roll.id??roll.timestamp">
                        <div class="bg-gray-700 p-3 rounded-2xl shadow">
                            <div class="text-xs text-gray-300 mb-1">
                                <span x-text="roll.timestamp"></span>
                                <template x-if="isAdmin">
                                    <span> (<span x-text="roll.username"></span>)</span>
                                </template>
                            </div>
                            <div class="font-bold text-gray-100">
                                <span x-text="roll.action||'Roll'"></span>:
                                <span x-text="roll.total"></span>
                            </div>
                            <div class="text-sm text-gray-200" x-text="roll.roll"></div>
                            <div class="text-xs text-gray-300">
                                Rolls: <span x-text="roll.rolls_json"></span>
                                <template x-if="parseInt(roll.modifier)!==0">
                                    <span>(Modifier:
                                        <span x-text="roll.modifier>=0?('+'+roll.modifier):roll.modifier"></span>)</span>
                                </template>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</div>
</form>

<!-- The Note Editor Modal -->
<div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
     x-show="noteEditorShow" x-transition
     x-cloak>
    <div class="bg-gray-800 w-full max-w-4xl rounded-xl p-4 relative">
        <div class="flex justify-between items-center mb-3">
            <h2 class="text-2xl font-bold text-white">Rich Text Editor</h2>
            <button type="button" class="bg-gray-500 px-3 py-1 rounded"
                    @click="closeNoteEditor">X</button>
        </div>
        <textarea class="w-full bg-gray-900 text-white p-3 h-64 rounded"
                  x-model="noteEditorHtml"></textarea>
        <div class="mt-3 flex justify-end gap-2">
            <button type="button"
                    class="bg-gray-500 px-4 py-2 rounded"
                    @click="closeNoteEditor">
                Cancel
            </button>
            <button type="button"
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    @click="saveNoteEditor">
                Save
            </button>
        </div>
    </div>
</div>

<!-- The Advanced Spell Editor Modal (optional) -->
<div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
     x-show="showSpellEditor && tempSpellbook" x-transition
     x-cloak>
    <div class="bg-gray-800 w-full max-w-4xl rounded-xl p-4">
        <div class="flex justify-between items-center mb-3">
            <h2 class="text-2xl font-bold text-white">Spell Editor</h2>
            <button type="button" class="bg-gray-500 px-3 py-1 rounded"
                    @click="closeSpellEditor">X</button>
        </div>
        <!-- Slot editor -->
        <div class="mb-4">
            <h3 class="text-xl font-bold text-white mb-2">Spell Slots</h3>
            <div class="flex flex-wrap gap-3">
                <template x-for="(slotInfo,lvl) in tempSpellbook.slots" :key="lvl">
                    <div class="bg-gray-700 p-3 rounded">
                        <div class="flex items-center justify-between mb-1">
                            <div class="text-white font-bold">Level <span x-text="lvl"></span></div>
                            <button type="button"
                                    class="bg-red-600 px-2 py-1 text-xs rounded hover:bg-red-700"
                                    @click="removeSlotLevel(lvl)">
                                X
                            </button>
                        </div>
                        <div class="flex gap-2">
                            <div>
                                <label class="block text-sm text-gray-300">Max</label>
                                <input type="number"
                                       class="bg-gray-900 text-white w-16"
                                       x-model.number="slotInfo.max" />
                            </div>
                            <div>
                                <label class="block text-sm text-gray-300">Current</label>
                                <input type="number"
                                       class="bg-gray-900 text-white w-16"
                                       x-model.number="slotInfo.current" />
                            </div>
                        </div>
                    </div>
                </template>
                <button type="button" class="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                        @click="addSlotLevel">
                    + Slot Level
                </button>
            </div>
        </div>

        <!-- Known spells editor -->
        <div>
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-xl font-bold text-white">Known Spells</h3>
                <button type="button" class="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                        @click="addSpell">
                    + Spell
                </button>
            </div>
            <div class="space-y-2">
                <template x-for="sp in tempSpellbook.known" :key="sp.id">
                    <div class="bg-gray-700 rounded p-3">
                        <div class="flex items-center justify-between mb-2">
                            <div class="text-white font-bold">
                                <span x-text="sp.cantrip?'Cantrip':('Level '+sp.level)"></span>
                                -
                                <span x-text="sp.name"></span>
                            </div>
                            <button type="button" class="bg-red-600 px-2 py-1 text-xs rounded hover:bg-red-700"
                                    @click="removeSpell(sp.id)">
                                X
                            </button>
                        </div>
                        <div class="grid grid-cols-2 gap-2 mb-2">
                            <!-- Spell name -->
                            <div>
                                <label class="block text-sm text-gray-300">Spell Name</label>
                                <input type="text"
                                       class="bg-gray-900 text-white w-full"
                                       x-model="sp.name" />
                            </div>
                            <!-- Spell level (disabled if cantrip) -->
                            <div>
                                <label class="block text-sm text-gray-300">Spell Level</label>
                                <input type="number"
                                       class="bg-gray-900 text-white w-full"
                                       :disabled="sp.cantrip"
                                       x-model.number="sp.level" />
                            </div>
                            <!-- Cantrip? -->
                            <div class="col-span-2 flex items-center space-x-2">
                                <label class="inline-flex items-center text-sm text-gray-300">
                                    <input type="checkbox"
                                           class="bg-gray-900"
                                           x-model="sp.cantrip" />
                                    <span class="ml-1">Is Cantrip?</span>
                                </label>
                            </div>
                            <!-- Type (V,S,M?), distance, etc. -->
                            <div>
                                <label class="block text-sm text-gray-300">Components/Type</label>
                                <input type="text"
                                       class="bg-gray-900 text-white w-full"
                                       x-model="sp.type" />
                            </div>
                            <div>
                                <label class="block text-sm text-gray-300">Distance</label>
                                <input type="text"
                                       class="bg-gray-900 text-white w-full"
                                       x-model="sp.distance" />
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-300">Description</label>
                            <textarea class="bg-gray-900 text-white w-full h-24"
                                      x-model="sp.description"></textarea>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <!-- Save/cancel -->
        <div class="mt-4 flex justify-end gap-2">
            <button type="button"
                    class="bg-gray-500 px-4 py-2 rounded"
                    @click="closeSpellEditor">
                Cancel
            </button>
            <button type="button"
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    @click="saveSpellEditor">
                Save Spell Changes
            </button>
        </div>
    </div>
</div>

<script>
function characterPlayData(){
    return {
        /********************************************
         * ALPINE STATE
         ********************************************/
        charData: {},
        notesData: [],
        spellSlots: {},
        rollHistory: [],
        isAdmin: <?php echo $is_admin ? 'true':'false'; ?>,

        // Panels
        showLeftPanel: true,
        leftPanelWidth: 250,
        isLeftResizing: false,
        leftStartX: 0,
        leftStartWidth: 250,
        showRightPanel: true,
        rightPanelWidth: 250,
        isRightResizing: false,
        rightStartX: 0,
        rightStartWidth: 250,

        MIN_PANEL_WIDTH: 40,
        MAX_PANEL_WIDTH: 600,

        // Additional toggles
        spellConfigOpen: false,
        showBackground: false,

        // Dice roller
        skillData: [],
        skillMenuOpen: false,
        selectedAbility: null,
        numDice: 1,
        diceType: 'd20',
        modifier: 0,
        rollDescription: '',
        diceFormula: '1d20',
        modifierOptions: [],

        // Note editor modal
        noteEditorShow: false,
        noteEditorCatIdx: null,
        noteEditorNoteIdx: null,
        noteEditorHtml: '',

        // Spell Editor
        showSpellEditor: false,
        tempSpellbook: null,

        /********************************************
         * INIT
         ********************************************/
        initData(dbChar, dbNotes, dbSlots, dbRolls, skillData){
            // Convert strings to usable objects
            if(typeof dbChar==='string'){
                dbChar=JSON.parse(dbChar);
            }
            if(typeof dbNotes==='string'){
                try{ dbNotes=JSON.parse(dbNotes);}catch(e){ dbNotes=[]; }
            }
            if(typeof dbSlots==='string'){
                try{ dbSlots=JSON.parse(dbSlots);}catch(e){ dbSlots={};}
            }
            if(typeof dbRolls==='string'){
                try{ dbRolls=JSON.parse(dbRolls);}catch(e){ dbRolls=[]; }
            }

            this.charData = dbChar || {};
            this.notesData = Array.isArray(dbNotes)? dbNotes : [];
            this.spellSlots = (typeof dbSlots==='object')? dbSlots : {};
            this.rollHistory = Array.isArray(dbRolls)? dbRolls : [];
            this.skillData = skillData || [];

            // If your numeric fields come as strings, parse them:
            ['level','armor_class','hit_points','max_hit_points','temp_hit_points','temp_max_hit_points',
             'strength','dexterity','constitution','intelligence','wisdom','charisma',
             'gold','silver','copper','spell_save_dc','spell_attack_bonus'
            ].forEach(k=>{
                if(typeof this.charData[k] === 'string'){
                    this.charData[k] = parseInt(this.charData[k])||0;
                }
                if(this.charData[k]===null || this.charData[k]===undefined){
                    this.charData[k] = 0;
                }
            });

            // For dice roller modifier range
            this.modifierOptions = [];
            for(let i=-5; i<=10; i++){
                this.modifierOptions.push(i);
            }

            // Load panel widths from localStorage if desired
            let lsLeft = localStorage.getItem('leftPanelWidth');
            let lsRight = localStorage.getItem('rightPanelWidth');
            if(lsLeft) this.leftPanelWidth=parseInt(lsLeft,10);
            if(lsRight) this.rightPanelWidth=parseInt(lsRight,10);

            let lsShowLeft = localStorage.getItem('showLeftPanel');
            let lsShowRight = localStorage.getItem('showRightPanel');
            if(lsShowLeft==='false') this.showLeftPanel=false;
            if(lsShowRight==='false') this.showRightPanel=false;
        },

        /********************************************
         * ABILITY MOD
         ********************************************/
        abilityMod(score){
            return Math.floor((score-10)/2);
        },

        /********************************************
         * NOTES Logic
         ********************************************/
        addCategory(){
            this.notesData.push({ title:'New Section', isOpen:true, notes:[] });
        },
        removeCategory(idx){
            if(!confirm('Are you sure you want to delete this entire category?'))return;
            this.notesData.splice(idx,1);
        },
        addNote(catIdx){
            this.notesData[catIdx].notes.push({ title:'New Note', content:'' });
        },
        removeNote(catIdx,noteIdx){
            if(!confirm('Are you sure you want to delete this note?'))return;
            this.notesData[catIdx].notes.splice(noteIdx,1);
        },
        openNoteEditor(catIdx,noteIdx,html){
            this.noteEditorShow=true;
            this.noteEditorCatIdx=catIdx;
            this.noteEditorNoteIdx=noteIdx;
            this.noteEditorHtml=html;
        },
        closeNoteEditor(){
            this.noteEditorShow=false;
            this.noteEditorCatIdx=null;
            this.noteEditorNoteIdx=null;
            this.noteEditorHtml='';
        },
        saveNoteEditor(){
            if(this.noteEditorCatIdx!==null && this.noteEditorNoteIdx!==null){
                this.notesData[this.noteEditorCatIdx].notes[this.noteEditorNoteIdx].content=this.noteEditorHtml;
            }
            this.closeNoteEditor();
        },

        /********************************************
         * SPELL EDITOR Logic
         ********************************************/
        showSpellEditor:false,
        tempSpellbook:null,
        openSpellEditor(){
            // Build an object with {slots, known} from our existing data:
            // We only have 'spellSlots' in this.spellSlots
            // and 'knownSpells' in charData.known_spells is just text, 
            // so let’s store known spells in JSON if you like:
            let knownArr=[];
            // If you stored knownSpells as raw text, you can parse or keep it
            // For now, let's do a big guess parse:
            // Or you might do your own format. For demonstration:
            try{
                knownArr=JSON.parse(this.charData.known_spells);
                if(!Array.isArray(knownArr)) knownArr=[];
            }catch(e){ knownArr=[]; }

            this.tempSpellbook={
                slots: JSON.parse(JSON.stringify(this.spellSlots)),
                known: knownArr
            };
            this.showSpellEditor=true;
        },
        closeSpellEditor(){
            this.tempSpellbook=null;
            this.showSpellEditor=false;
        },
        saveSpellEditor(){
            // Put changes back into main Alpine state
            if(this.tempSpellbook){
                this.spellSlots= JSON.parse(JSON.stringify(this.tempSpellbook.slots));
                // Convert known spells array back to JSON string:
                let knownJson= JSON.stringify(this.tempSpellbook.known);
                this.charData.known_spells=knownJson;
            }
            this.closeSpellEditor();
        },
        addSlotLevel(){
            if(!this.tempSpellbook)return;
            // Find the first numeric level not used up to 9
            let newLvl=1;
            while(this.tempSpellbook.slots[newLvl]){
                newLvl++;
                if(newLvl>9) break;
            }
            if(newLvl<=9){
                this.tempSpellbook.slots[newLvl]={max:0,current:0};
            } else {
                alert('No more slot levels available up to 9');
            }
        },
        removeSlotLevel(lvl){
            if(!confirm(`Remove slot level ${lvl}?`)) return;
            delete this.tempSpellbook.slots[lvl];
        },
        addSpell(){
            if(!this.tempSpellbook)return;
            let newSpell={
                id:Date.now(),
                name:'New Spell',
                level:0,
                cantrip:false,
                type:'',
                distance:'',
                description:''
            };
            this.tempSpellbook.known.push(newSpell);
        },
        removeSpell(spellId){
            if(!confirm('Are you sure you want to delete this spell?'))return;
            if(!this.tempSpellbook)return;
            this.tempSpellbook.known=this.tempSpellbook.known.filter(sp=> sp.id!==spellId);
        },

        /********************************************
         * DICE ROLLER
         ********************************************/
        skillMenuOpen:false,
        selectedAbility:null,
        handleSkillSelect(ability, skillName){
            // e.g. set dice to 1d20 + mod(ability)
            let score=this.charData[ability] || 10;
            let modVal=this.abilityMod(score);
            this.numDice=1;
            this.diceType='d20';
            this.modifier=modVal;
            this.rollDescription=skillName;
            this.skillMenuOpen=false;
            this.selectedAbility=null;
        },
        updateDiceFormula(){
            let sign=(this.modifier>=0)?('+'+this.modifier):this.modifier;
            if(this.modifier===0) sign='';
            this.diceFormula=`${this.numDice}${this.diceType}${sign}`;
        },

        /********************************************
         * PANEL RESIZING
         ********************************************/
        toggleLeftPanel(){
            this.showLeftPanel=!this.showLeftPanel;
            localStorage.setItem('showLeftPanel', this.showLeftPanel);
        },
        toggleRightPanel(){
            this.showRightPanel=!this.showRightPanel;
            localStorage.setItem('showRightPanel', this.showRightPanel);
        },
        startLeftResize(e){
            this.isLeftResizing=true;
            this.leftStartX=e.clientX;
            this.leftStartWidth=this.leftPanelWidth;
        },
        startRightResize(e){
            this.isRightResizing=true;
            this.rightStartX=e.clientX;
            this.rightStartWidth=this.rightPanelWidth;
        },
        onMouseMove(e){
            if(this.isLeftResizing){
                let newW=this.leftStartWidth+(e.clientX-this.leftStartX);
                if(newW< this.MIN_PANEL_WIDTH) newW=this.MIN_PANEL_WIDTH;
                if(newW> this.MAX_PANEL_WIDTH) newW=this.MAX_PANEL_WIDTH;
                this.leftPanelWidth=newW;
            }
            if(this.isRightResizing){
                let newW=this.rightStartWidth+(this.rightStartX - e.clientX);
                if(newW< this.MIN_PANEL_WIDTH) newW=this.MIN_PANEL_WIDTH;
                if(newW> this.MAX_PANEL_WIDTH) newW=this.MAX_PANEL_WIDTH;
                this.rightPanelWidth=newW;
            }
        },
        onMouseUp(){
            if(this.isLeftResizing){
                localStorage.setItem('leftPanelWidth', this.leftPanelWidth);
            }
            if(this.isRightResizing){
                localStorage.setItem('rightPanelWidth', this.rightPanelWidth);
            }
            this.isLeftResizing=false;
            this.isRightResizing=false;
        }
    };
}

// Setup global mouse events for resizing
document.addEventListener('DOMContentLoaded', ()=>{
    window.addEventListener('mousemove', e=>{
        let root=document.querySelector('[x-data="characterPlayData()"]');
        // if it doesn't exist, we can find it by ALPINE internally:
        if(!root) root=document.querySelector('[x-data]');
        if(root && root.__x){
            root.__x.$data.onMouseMove(e);
        }
    });
    window.addEventListener('mouseup', e=>{
        let root=document.querySelector('[x-data="characterPlayData()"]');
        if(!root) root=document.querySelector('[x-data]');
        if(root && root.__x){
            root.__x.$data.onMouseUp();
        }
    });
});
</script>

</body>
</html>
