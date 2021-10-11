const { SlowBuffer } = require("buffer");
const readline = require("readline");
const readlineInterface = readline.createInterface(
  process.stdin,
  process.stdout
);

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
}

/* Each room Object has:
  roomName: name of the room,
  roomIntro: the room's script,
  roomActions: what verbs that can be used in the room,
  roomConnections: what rooms you can travel to,
  roomInventory: what objects you can interact with,
  roomDescriptions: what combinations of roomActions and rommInventory/playerInventory is available in this room
*/
let outside = {
  roomName: "Outside",
  roomIntro:
    "\nYou've returned home after a night on the town. You get to the door to enter the foyer but there is a keypad that needs a code and a sign right above it\n",
  roomActions: ["enter", "help", "type", "read", "eat", "room", "i"],
  roomConnections: ["foyer"],
  roomInventory: ["sign", "8675309"],
  roomDescriptions: {
    help: function () {
      help(outside);
    },
    room: function () {
      displayRoom(outside);
    },
    i: function () {
      inventory();
    },
    "read sign": async function () {
      inputAnswer = await ask(
        "\nThe code to this door is 7-digits and based off a record by Tommy Tutone in 1981\n"
      );
      inputFormatter(inputAnswer, currentRoom);
    },
    "enter foyer": async function () {
      if (doorBool) {
        enterRoom(foyer);
      } else {
        inputAnswer = await ask("\nThe door appears to be locked...\n");
        inputFormatter(inputAnswer, currentRoom);
      }
    },
    "type 8675309": async function () {
      doorBool = true;
      inputAnswer = await ask("\nThe door was unlocked!\n");
      inputFormatter(inputAnswer, currentRoom);
    },
    "eat sandwich": function () {
      if (playerInventory.includes("sandwich")) {
        eatSandwich();
      } else {
        console.log(
          "You had no sandwich to eat and grew irritable...\nYou Lose!"
        );
        process.exit();
      }
    },
  },
};

let foyer = {
  roomName: "foyer",
  roomIntro:
    "\nYou've stepped foot in to the foyer, empty outside of a newspaper atop a table. You see a door to the bathroom and a door to the kitchen\n",
  roomActions: ["enter", "help", "take", "eat", "room", "i"],
  roomConnections: ["outside", "bathroom", "kitchen"],
  roomInventory: ["newspaper"],
  roomDescriptions: {
    help: function () {
      help(foyer);
    },
    room: function () {
      displayRoom(foyer);
    },
    i: function () {
      inventory();
    },
    "take newspaper": async function () {
      playerInventory.push("newspaper");
      foyer.roomInventory = [];
      foyer.roomIntro =
        "\nYou've stepped foot in to the foyer. You see a door to the bathroom and a door to the kitchen\n";
      inputAnswer = await ask("\nYou now have a paper in your inventory!\n");
      inputFormatter(inputAnswer, currentRoom);
    },
    "enter outside": function () {
      doorBool = false;
      outside.roomIntro =
        "\nYou're back outside and the door has locked behind you...\n";
      enterRoom(outside);
    },
    "enter bathroom": function () {
      enterRoom(bathroom);
    },
    "enter kitchen": function () {
      enterRoom(kitchen);
    },
    "eat sandwich": function () {
      if (playerInventory.includes("sandwich")) {
        eatSandwich();
      } else {
        console.log(
          "You had no sandwich to eat and grew irritable...\nYou Lose!"
        );
        process.exit();
      }
    },
  },
};

let kitchen = {
  roomName: "Kitchen",
  roomIntro:
    "\nYou have entered the Kitchen, you notice all of the elements to make a prime sandwich on the cutting board and two doors: one leading to the backyard and one to the foyer\n",
  roomActions: ["enter", "help", "make", "eat", "room", "i"],
  roomConnections: ["foyer", "backyard"],
  roomInventory: ["sandwich"],
  roomDescriptions: {
    help: function () {
      help(kitchen);
    },
    room: function () {
      displayRoom(kitchen);
    },
    i: function () {
      inventory();
    },
    "make sandwich": async function () {
      if (kitchen.roomInventory.includes("sandwich")) {
        playerInventory.push("sandwich");
        kitchen.roomInventory = [];
        kitchen.roomIntro =
          "\nYou have entered the Kitchen, you notice two doors: one leading to the backyard and one to the foyer\n";
        inputAnswer = await ask(
          "\nYou now have a sandwich in your inventory!\n"
        );
        inputFormatter(inputAnswer, currentRoom);
      } else {
        inputAnswer = await ask(
          "\nYou cannot do that anymore, you already have the sandwich...\n"
        );
        inputFormatter(inputAnswer, currentRoom);
      }
    },
    "enter foyer": function () {
      enterRoom(foyer);
    },
    "enter backyard": function () {
      enterRoom(backyard);
    },
    "eat sandwich": function () {
      if (playerInventory.includes("sandwich")) {
        eatSandwich();
      } else {
        console.log(
          "You had no sandwich to eat and grew irritable...\nYou Lose!"
        );
        process.exit();
      }
    },
  },
};

let bathroom = {
  roomName: "Bathroom",
  roomIntro:
    "\nYou have entered a Bathroom with just a toilet in it... As well as two doors, one to the bedroom and one to the foyer\n",
  roomActions: ["enter", "help", "use", "read", "eat", "room", "i"],
  roomConnections: ["foyer", "bedroom"],
  roomInventory: ["toilet"],
  roomDescriptions: {
    help: function () {
      help(bathroom);
    },
    room: function () {
      displayRoom(bathroom);
    },
    i: function () {
      inventory();
    },
    "enter foyer": function () {
      enterRoom(foyer);
    },
    "enter bedroom": function () {
      enterRoom(bedRoom);
    },
    "use toilet": async function () {
      if (morning && playerInventory.includes("newspaper")) {
        usedToilet = true;
        inputAnswer = await ask(
          "\nYou started using toilet, but are concerned with what may be happening in the news...\n"
        );
        if (inputAnswer === "read newspaper") {
          inputFormatter(inputAnswer, currentRoom);
        } else {
          console.log("\nYou Lose!\n");
          process.exit();
        }
      } else if (morning) {
        console.log(
          "\nYou used the toilet but had nothing to do and got bored to death...\nGame over!\n"
        );
        process.exit();
      } else {
        inputAnswer = await ask("\nYou don't have to go right now...\n");
        inputFormatter(inputAnswer, currentRoom);
      }
    },
    "read newspaper": async function () {
      if (morning && usedToilet) {
        inputAnswer = await ask("\nYou successfully went to the bathroom\n");
        inputFormatter(inputAnswer, currentRoom);
      } else {
        inputAnswer = await ask("\nThere's no use for that right now...\n");
        inputFormatter(inputAnswer, currentRoom);
      }
    },
    "eat sandwich": function () {
      if (playerInventory.includes("sandwich")) {
        eatSandwich();
      } else {
        console.log(
          "You had no sandwich to eat and grew irritable...\nYou Lose!\n"
        );
        process.exit();
      }
    },
  },
};

let bedRoom = {
  roomName: "Bed Room",
  roomIntro:
    "\nYou have entered your bedroom, pretty empty outside of a bed and two doors: one to the livingroom and one to the bathroom\n",
  roomActions: ["enter", "help", "use", "eat", "room", "i"],
  roomConnections: ["bathroom", "livingroom"],
  roomInventory: ["bed"],
  roomDescriptions: {
    help: function () {
      help(bedRoom);
    },
    room: function () {
      displayRoom(bedRoom);
    },
    i: function () {
      inventory();
    },
    "enter bathroom": function () {
      enterRoom(bathroom);
    },
    "enter livingroom": function () {
      enterRoom(livingRoom);
    },
    "use bed": async function () {
      if (morning) {
        inputAnswer = await ask("\nIt's the morning you dingus...\n");
        inputFormatter(inputAnswer, currentRoom);
      } else {
        morning = true;
        inputAnswer = await ask(
          "\nThe character has went to bed and woken up in the morning, time to get ready for class!\n"
        );
        inputFormatter(inputAnswer, currentRoom);
      }
    },
    "eat sandwich": function () {
      if (playerInventory.includes("sandwich")) {
        eatSandwich();
      } else {
        console.log(
          "You had no sandwich to eat and grew irritable...\nYou Lose!"
        );
        process.exit();
      }
    },
  },
};

let backyard = {
  roomName: "Backyard",
  roomIntro:
    "\nYou have entered the backyard where you hear your dog barking for attention. As well as two doors: one to the kitchen and one to the living room\n",
  roomActions: ["enter", "help", "pet", "eat", "room", "i"],
  roomConnections: ["kitchen", "livingroom"],
  roomInventory: ["dog"],
  roomDescriptions: {
    help: function () {
      help(backyard);
    },
    room: function () {
      displayRoom(backyard);
    },
    i: function () {
      inventory();
    },
    "enter livingroom": function () {
      enterRoom(livingRoom);
    },
    "enter kitchen": function () {
      enterRoom(kitchen);
    },
    "pet dog": async function () {
      dogPet = true;
      inputAnswer = await ask("\nGood boyyyyyyyy\n");
      inputFormatter(inputAnswer, currentRoom);
    },
    "eat sandwich": function () {
      if (playerInventory.includes("sandwich")) {
        eatSandwich();
      } else {
        console.log(
          "You had no sandwich to eat and grew irritable...\nYou Lose!"
        );
        process.exit();
      }
    },
  },
};

let livingRoom = {
  roomName: "Living Room",
  roomIntro:
    "\nYou have entered the Living room, where you see your computer you use for class, Also two doors: one to the bedroom and one to the backyard\n",
  roomActions: ["enter", "help", "use", "eat", "room", "i"],
  roomConnections: ["bedroom", "backyard"],
  roomInventory: ["computer"],
  roomDescriptions: {
    help: function () {
      help(livingRoom);
    },
    room: function () {
      displayRoom(livingRoom);
    },
    i: function () {
      inventory();
    },
    "enter backyard": function () {
      enterRoom(backyard);
    },
    "enter bedroom": function () {
      enterRoom(bedRoom);
    },
    "eat sandwich": function () {
      if (playerInventory.includes("sandwich")) {
        eatSandwich();
      } else {
        console.log(
          "You had no sandwich to eat and grew irritable...\nYou Lose!\n"
        );
        process.exit();
      }
    },
    "use computer": function () {
      if (morning && usedToilet && dogPet && sandwichEaten) {
        console.log(
          "\nYou went to class, coded really hard, got all of Bob's movie references, and became a professional Web Developer!!!!!\nWahoooooooo!!!\nYou Win!\n"
        );
        process.exit();
      } else if (!morning) {
        console.log(
          "\nYou were on the internet for too long before bed, too much blue light!\nConcentrating in class the next day proved too dificult\nYou Lose!\n"
        );
        process.exit();
      } else if (!usedToilet) {
        console.log(
          "\nYou got to class on time but were unable to concentrate as you didn't use the bathroom beforehand...\nGame over!\n"
        );
        process.exit();
      } else if (!dogPet) {
        console.log(
          "\nYou got to class on time but were unable to concentrate as your dog in the backyard wouldn't shut up...\nShucks!\n"
        );
        process.exit();
      } else if (!sandwichEaten) {
        console.log(
          "\nYou got to class on time but were unable to concentrate as you forgot to eat a sandwich beforehand...\nNoooooooo!\n"
        );
        process.exit();
      }
    },
  },
};

// string entered by the user on the terminal
let inputAnswer = "";
// whatever room the the player is in
let currentRoom = outside;

// array for items held by player
let playerInventory = [];

// whether or not the door is unlocked
let doorBool = false;
// whether or not it is in the morning
let morning = false;
// whether or not you've used the toilet
let usedToilet = false;
// whether or not you pet the dog
let dogPet = false;
// whether or not you ate the sandwich
let sandwichEaten = false;

// Formats users string
async function inputFormatter(str, room) {
  // split string into array
  str = str.split(" ");
  // takes each room's roomDescriptions and puts them in an array
  roomDescArray = Object.keys(room.roomDescriptions);

  // removes any indexes past 1
  while (str.length > 2) {
    str.pop();
  }

  // formats input
  str[0] = str[0].toLowerCase();
  if (str.length === 2) {
    str[1] = str[1].toLowerCase();
  }

  // checks if actions suit room, and objects are in the room or player inventory. As well as the keyword roomDescriptions
  if (
    (room.roomActions.includes(str[0]) &&
      (room.roomInventory.includes(str[1]) ||
        playerInventory.includes(str[1]) ||
        room.roomConnections.includes(str[1])) &&
      roomDescArray.includes(`${str[0]} ${str[1]}`)) ||
    str[0] === "help" ||
    str[0] === "room" ||
    str[0] === "i"
  ) {
    // runs correct roomDescription function
    for (roomDesc of roomDescArray) {
      if (str.join(" ") === roomDesc.toLowerCase()) {
        room.roomDescriptions[roomDesc]();
      }
    }
  } else {
    inputAnswer = await ask("\nNope, that doesn't work...\n");
    inputFormatter(inputAnswer, room);
  }
}

// displays what roomActions are available
async function help(room) {
  inputAnswer = await ask(displayActions(room));
  inputFormatter(inputAnswer, room);
}

// displays what is in the player inventory
async function inventory() {
  inputAnswer = await ask(displayInventory());
  inputFormatter(inputAnswer, currentRoom);
}

// displays the roomIntro again
async function displayRoom(room) {
  inputAnswer = await ask(room.roomIntro);
  inputFormatter(inputAnswer, room);
}

// works in conjunction with help()
function displayActions(roomClass) {
  console.log(`\nYour options in this room are to:`);
  for (item of roomClass.roomActions) {
    console.log(`\n- ${item}`);
  }
  return "\n";
}

// works in conjunction with inventory()
function displayInventory() {
  console.log(`\nIn your inventory you have:`);
  if (playerInventory > 0) {
    for (item of playerInventory) {
      console.log(`\n- ${item}`);
    }
  } else {
    console.log(`\n- nothing`);
  }
  return "\n";
}

// enters new room when available
async function enterRoom(newRoom) {
  currentRoom = newRoom;
  inputAnswer = await ask(newRoom.roomIntro);
  inputFormatter(inputAnswer, newRoom);
}

// eats sandwich when in player inventory
async function eatSandwich() {
  if (morning) {
    sandwichEaten = true;
    inputAnswer = await ask(
      "\nGreat that was the sustinence you needed, your energy is maxed out!\n"
    );
    inputFormatter(inputAnswer, currentRoom);
  } else {
    console.log(
      "\nYou ate the sandwich right before bed and were unable to wake up in time for class.\nOopsie Poopsie!\n"
    );
    process.exit();
  }
}

// starts game at specific room
async function roomStart(room) {
  let answer = await ask(room.roomIntro);
  inputFormatter(answer, room);
}

// starts game
roomStart(currentRoom);