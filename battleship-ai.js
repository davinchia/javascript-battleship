//Ship class
function Ship (name, length) {
	this.name = name;
	this.shipLength = length;
	this.locations = [];
	this.hits = 0;

}

Ship.prototype.toString = function() {
	return this.name;
}

var shipDetails = [
				{name: "Carrier", shipLength: 5},
				{name: "Battleship", shipLength: 4},
				{name: "Submarine", shipLength: 3},
				{name: "Cruiser", shipLength: 2},
				{name: "cruiser", shipLength: 2}
				]


//Model: keeping the game's state
var model = {
	boardSize: 10,
	shipsSunk: 0,
	numsShips: 0,
	guesses: 0,

	ships: [],

	//takes a String
	fire: function(guess) {
		model.guesses++;
		for (var i = 0; i < this.numsShips; i++) { 
			var ship = this.ships[i];
			var index = ship.locations.indexOf(guess);
			if (index >= 0) {
				ship.hits++;
				view.displayHit(guess);
				if (this.isSunk(ship)) {
					this.shipsSunk++;
					console.log(ship.name + " has been sunk!");
				}
				console.log("Hit!");
				return true;
			}
		}
		view.displayMiss(guess);
		console.log("Miss!")
		return false;
	},

	//check whether ship is sunk
	isSunk: function(ship) {
		if (ship.hits !== ship.shipLength) {
			return false;
		}
		return true;
	},

	//calls generateShip
	generateShipLocations: function() {
		var locations;
		var ship;
		for (var i = 0; i < this.numsShips; i++) {
			ship = this.ships[i]; 
			do {
				locations = this.generateShip(ship); 
			} while (this.collision(locations));
			ship.locations = locations;
			console.log(ship + ": " + locations);
		}
	},

	//generates a ship and tests whether it collides with another
	generateShip: function(ship) {
		var direction = Math.floor(Math.random() * 2);
		var row, col;
		//to keep this in bounds
		if (direction === 1) {
			//horizontal
			row = Math.floor(Math.random() * this.boardSize);
			col = Math.floor(Math.random() * (this.boardSize - ship.shipLength));
		}
		else {
			//vertical
			row = Math.floor(Math.random() * (this.boardSize - ship.shipLength)); 
			col = Math.floor(Math.random() * this.boardSize);
		}
		var newShipLocations = [];
		for (var i = 0; i< ship.shipLength; i++) {
			if (direction === 1) {
				newShipLocations.push(row + "" + (col + i));
			}
			else {
				newShipLocations.push((row + i) + "" + col);
			}
		}
		return newShipLocations;
	},

	//checks whether the locations generated collide with
	//coordinates of another ship
	collision: function(locations) {
		for (var i = 0; i < this.ships.length; i++) {
			var ship = model.ships[i];
			//goes through array and checks
			for (var j = 0; j < locations.length; j++) {
				if (ship.locations.indexOf(locations[j]) >= 0) { 
					return true;
				} 
			}
		}
		return false;
	}
};

//View: visual representation
var view = {
	displayShips: function() {
		var ship;
		var box;
		for (var i = 0; i < model.numsShips; i++) {
			ship = model.ships[i];
			for (var j = 0; j < ship.shipLength; j++) {
				box = document.getElementById(ship.locations[j]);
				box.setAttribute("class","ship");
			}
		}
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

//Controller: Glues everything together


//Artificial Intelligence
var Raymond = {
	Row: 10,
	Col: 10,
	probabilities: new Array(this.Row),

	//create the initial array; set everything to zero
	//go through and calculate initial probabilities
	initialSetUp: function () {
		for (var i = 0; i < this.Row; i++) {
			//declare cols for each row
			this.probabilities[i] = new Array(this.Col);
			for (var j = 0; j < this.Col; j++) {
				this.probabilities[i][j] = 0;
			}
		}
		var currentLength;
		//calculating initial probabilities
		for (var i = 0; i < this.Row; i++) {
			for (var j = 0; j < this.Col; j++) {
				for (var k = 0; k < model.ships.length; k++) {
					currentLength = model.ships[k].shipLength;
					//horizontal
					if ((j + currentLength - 1) <= (this.Col - 1)) {
						for (var l = 0; l < currentLength; l++) {
							this.probabilities[i][j + l]++;
						}
					}
					//vertical
					if ((i + currentLength - 1) <= (this.Row - 1)) {
						for (var l = 0; l < currentLength; l++) {
							this.probabilities[i + l][j]++;
						}
					}
				}
			}
		}
	},

	//guess: need to randomise ties
	guess: function() {
		var maxValue = Number.MIN_SAFE_INTEGER;
		var maxLocation = 0;
		for (var i = 0; i < this.Row; i++) {
			for (var j = 0; j < this.Col; j++) {
				if (this.probabilities[i][j] > maxValue) {
					//this currently chooses the first max tile
					maxValue = this.probabilities[i][j];
					maxLocation = i + "" + j;
				}
			}
		}
		//returns string
		return maxLocation;
	},
	
	//update probabilities array after each shot
	//remove even if hit because hunt mode will sink ship
	updateProbabilities: function(location) {
		console.log("We update probabilities!");
		var location = parseInt(location);
		var currentLength;
		var row = Math.floor(location / 10);
		var col = location % 10;
		var start;
		for (var i = 0; i < model.ships.length; i++) {
			currentLength = model.ships[i].shipLength;
			//horizontal
			for (var j = 0; j < currentLength; j++) {
				start = col - j;
				if ((start >= 0) && ((start + currentLength - 1) <= (this.Col - 1))) {
					for (var k = 0; k < currentLength; k++) {
						this.probabilities[row][start + k]--;
						//console.log("updating!");
					}	
				}
			}
			// vertical
			for (var j = 0; j < currentLength; j++) {
				start = row - j;
				if ((start >= 0) && ((start + currentLength - 1) <= (this.Row - 1))) {
					for (var k = 0; k < currentLength; k++) {
						this.probabilities[start + k][col]--;
						//console.log("updating!");
					}	
				}
			}
		}
	},

	//hunt mode: need to randomise guesses/need to stop when ship is Sunk/even parity
	huntMode: function(location) {
		//console.log("I am in Hunt Mode");
		var row;
		var col;

		var targets = [];
		var locations = [];
		var toBeUpdated = [];

		var target;
		var current;
		locations.push(location);

		while (locations.length != 0) {
			current = locations.pop();
			row = Math.floor(current / 10);
			col = current % 10;

			if ((row - 1) >= 0) {
				targets.push((row - 1) + "" + col);
			}
			if ((row + 1) <= (this.Row - 1)) {
				targets.push((row + 1) + "" + col);
			}
			if ((col - 1) >= 0) {
				targets.push(row + "" + (col - 1));
			}
			if ((col + 1) <= (this.Col - 1)) {
				targets.push(row + "" + (col + 1));
			}
			
			//fire 
			while (targets.length != 0) {
				target = targets.pop();
				toBeUpdated.push(target);
				if (model.fire(target)) {
					//locations.push(target);
					//this.huntMode(target);
				}
			}
		}
		//update all probability after
		while (toBeUpdated.length != 0) {
			this.updateProbabilities(toBeUpdated.pop());
		}
		
	},

	//play the Game!
	play: function() {
		//this.initialSetUp();
		//this.printProbabilities();
		var hit;
		var location;
		//while (model.shipsSunk != model.numsShips) {
			location = this.guess();
			hit = model.fire(location);
			console.log("Fired at " + location);
			if (hit) {
				this.huntMode(location);
			}
			else {
				console.log("location: " + location);
				this.updateProbabilities(location);
			}
		//}
	},

	//check the probabilities array
	printProbabilities: function() {
		for (var i = 0; i < this.probabilities.length; i++) {
			var current = "";
			for (var j = 0; j < this.probabilities[i].length; j++) {
				//current = current + this.probabilities[i][j] + " ";
				console.log((i * 10 + j) + " "+ this.probabilities[i][j]);
			}
			console.log(current);
		}
	}
}

//generate the ships and add them to ships
for (var i = 0; i < shipDetails.length; i++) {
	var current = shipDetails[i];
	var ship = new Ship(current.name, current.shipLength);
	model.ships.push(ship);
	model.numsShips++;
};

//event handlers
function init() {
	model.generateShipLocations();
	view.displayShips();
	Raymond.initialSetUp();
	//var guess = Raymond.guess();
	//model.fire((Raymond.guess()).toString());
	while (model.shipsSunk != model.numsShips) {
		Raymond.play();
	}
	console.log("guesses: " + model.guesses);
	//Raymond.play();
}

window.onload = init;