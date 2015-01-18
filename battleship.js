/*
//randomly generate a location
var randomloc = Math.floor(Math.random() * 5);

//to hold the location of the ships
var location1 = randomloc;
var location2 = randomloc + 1;
var location3 = randomloc + 2;

//basic gameplay
var guess;
var hits = 0;
var guesses = 0;
var numberOfHits = 0;

//over?
var isSunk = false;


while(!isSunk) {

	guess = prompt("Ready, aim, fire! (enter a number 0-6):");

	if (guess < 0 || guess > 6) {
		alert("Please enter a number between 0 - 6.")
	} else {
		guesses += 1;

		if (guess == location1 || guess == location2 || guess == location3) {
		hits += 1;
		alert("HIT!");
		if (hits == 3) {
			isSunk = true;
			alert("AHHHHHH. We are sinking! Mayday!");
			}
		}
		else {
			alert("MISS!");
		}
	}

	
}


var stats = "You took " + guesses + " guesses to sink the battleship, " +  "which means your shooting accuracy was " + (3/guesses);
alert(stats);
*/


//now we implement the view-model-controller

//View: visual representation
var view = {
	displayMessage: function(msg) {
		var messageArea = document.getElementById("messageArea");
		messageArea.innerHTML = msg;
	},

	displayHit: function(location) {
		var box = document.getElementById(location);
		box.setAttribute("class", "hit");
	},

	displayMiss: function(location) {
		var box = document.getElementById(location);
		box.setAttribute("class", "miss");

	}
 }

//Model: keeping the game's state
var model = {
	boardSize: 7,
	numsShips: 3,
	shipLength: 3,
	shipsSunk: 0,

	ships: [{ locations: [0, 0, 0], hits: ["", "", ""] }, 
			{ locations: [0, 0, 0], hits: ["", "", ""] }, 
			{ locations: [0, 0, 0], hits: ["", "", ""] }],

	fire: function(guess) {
		for (var i = 0; i < this.numsShips; i++) { 
			var ship = this.ships[i];
			var index = ship.locations.indexOf(guess);
			if (index >= 0) {
				ship.hits[index] = "hit";
				view.displayHit(guess);
				view.displayMessage("HIT!");
				if (this.isSunk(ship)) {
					view.displayMessage("You sank a ship!");
					this.shipsSunk++;
				}
				return true;
			}
		}
		view.displayMiss(guess);
		view.displayMessage("You missed!");
		return false;
	},

	isSunk: function(ship) {
		for (var i = 0; i < this.shipLength; i++) {
			if (ship.hits[i] !== "hit") {
				return false;
			}
		}
		return true;
	},

	generateShipLocations: function() {
		var locations;
		for (var i = 0; i < this.numsShips; i++) { 
			do {
				locations = this.generateShip(); 
				console.log(locations);
			} while (this.collision(locations));
			this.ships[i].locations = locations;
		}
	},

	generateShip: function() {
		var direction = Math.floor(Math.random() * 2);
		var row, col;

		if (direction === 1) {
			//horizontal
			row = Math.floor(Math.random() * this.boardSize);
			col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
		}
		else {
			//vertical
			row = Math.floor(Math.random() * (this.boardSize - this.shipLength)); 
			col = Math.floor(Math.random() * this.boardSize);
		}

		var newShipLocations = [];
		for (var i = 0; i< this.shipLength; i++) {
			if (direction === 1) {
				newShipLocations.push(row + "" + (col + 1));
			}
			else {
				newShipLocations.push((row + i) + "" + col);
			}
		}
		return newShipLocations;
	},

	collision: function(locations) {
		for (var i = 0; i < this.numShips; i++) {
			var ship = model.ships[i];
			for (var j = 0; j < locations.length; j++) {
				if (ship.locations.indexOf(locations[j]) >= 0) { 
					return true;
				} 
			}
		}
		return false;
	}
}

//Controller: Glues everything together
var controller = {
	guesses: 0,

	parseGuess: function(guess) {
		var alphabet = ["A", "B", "C", "D", "E", "F", "G"];
		if (guess == null || guess.length != 2) {
			alert("Oops, please enter a letter and number on the board!");
		} 
		else {
			firstChar = guess.charAt(0);
			var row = alphabet.indexOf(firstChar);
			var column = guess.charAt(1);
			if (isNaN(row) || isNaN(column)) { 
				alert("Oops, that isn't on the board.");
			} 
			else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
				alert("Oops, that's off the board!"); 
			}
			else {
				return row + column;
			}
		}
		return null;
	},

	processGuess: function(guess) {
		var location = this.parseGuess(guess);
		if (location) {
			this.guesses++;
			console.log("hit: " + this.guesses);
			console.log("sunk: " + model.shipsSunk);
			var hit = model.fire(location);
			if (hit && model.shipsSunk == model.numsShips) {
				
				view.displayMessage("You sank all the battleships!");
				console.log("DONE");
				console.log(this.guesses);
				console.log(model.shipsSunk);
				}
		}
	}
}


//event handler
function init() {
	var firebButton = document.getElementById("fireButton");
	fireButton.onclick = handleFireButton;
	var guessInput = document.getElementById("guessInput");
	guessInput.onkeypress = handleKeyPress;

	model.generateShipLocations();
}

function handleFireButton() {
	var guessInput = document.getElementById("guessInput");
	var guess = guessInput.value;
	controller.processGuess(guess);
	guessInput.value = "";
}

function handleKeyPress(e) {
	var fireButton = document.getElementById("fireButton");
	if (e.keyCode === 13) {
		fireButton.click();
		return false;
	}
}

window.onload = init;









