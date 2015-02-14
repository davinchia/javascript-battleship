//Ship class
function Ship (name, length) {
	this.name = name;
	this.shipLength = length;
	this.locations = [];
	this.hits = [];
}

Ship.prototype.toString = function() {
	return this.name;
}

Ship.prototype.clearLocations = function() {
	while(this.locations.length != 0) {
		this.locations.pop();
	}
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
	numsShips: 0,
	guesses: 0,

	fired: [],
	ships: [],

	//takes a String
	fire: function(guess) {
		if (this.fired.indexOf(guess) < 0) {
			this.fired.push(guess);
			model.guesses++;
			console.log("Fired at: " + guess);
			for (var i = 0; i < this.numsShips; i++) { 
				var ship = this.ships[i];
				var index = ship.locations.indexOf(guess);
				if (index >= 0) {
					ship.hits[index] = 1;
					view.displayHit(guess);
					if (this.isSunk(ship)) {
						Raymond.sunk.push(ship);
						console.log(ship.name + " has been sunk!");
					}
					console.log("Hit!");
					return true;
				}
			}
			view.displayMiss(guess);
			console.log("Miss!")
			return false;
		}
		else {
			console.log("We have already fired on " + guess + "!");
			return false;
		}
	},

	//clears ships
	resetShips: function() {
		for (var i = 0; i < this.numsShips; i++) {
			this.ships[i].clearLocations();
		}
		guesses = 0;
		while (this.fired.length != 0) {
			this.fired.pop();
		}
	},

	//check whether ship is sunk
	isSunk: function(ship) {
		for (var i = 0; i < ship.shipLength; i++) {
			if (ship.hits[i] == 0) {
				return false;
			}
		}
		return true;
	},

	allSunk: function() {
		for (var i = 0; i < this.numsShips; i++) {
			if (!this.isSunk(this.ships[i])) {
				return false;
			}
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
			for (var j = 0; j < ship.shipLength; j++) {
				ship.hits.push(0);
			}
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
			var ship = this.ships[i];
			//goes through array and checks
			for (var j = 0; j < locations.length; j++) {
				if (ship.locations.indexOf(locations[j]) >= 0) { 
					return true;
				} 
			}
		}
		return false;
	},

	isOver: function() {
		for (var i = 0; i < this.ships.length; i++) {
			if (!this.isSunk(this.ships[i])) {
				return false;
			}
		}
		return true;
	},

	numberTries: function() {
		//to account for boxes that already contain ships
		var tries = 0;
		var current;
		for (var i = 0; i < model.boardSize; i++) {
			for (var j = 0; j < model.boardSize; j++) {
				current = i + "" + j;
				if (document.getElementById(current).classList.contains("hit") || document.getElementById(current).classList.contains("miss")) {
					tries++;
				}
			}
		}
		return tries;
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
	},

	clearScreen: function() {
		var boxt;
		for (var i = 0; i < model.boardSize; i++) {
			for (var j = 0; j < model.boardSize; j++) {
				box = document.getElementById(i + "" + j);
				box.setAttribute("class","");
			}
		}
	}
};

//Controller: Glues everything together
var controller = {

	Raymond: function() {
		Raymond.initialSetUp();
		while (!model.isOver()) {
			Raymond.play();
		}
		console.log("Raymond made " + model.guesses);
	},

	getShips: function() {
		//generate the ships and add them to ships
		for (var i = 0; i < shipDetails.length; i++) {
			var current = shipDetails[i];
			var ship = new Ship(current.name, current.shipLength);
			model.ships.push(ship);
			model.numsShips++;
		}
	}
};

//Artificial Intelligence
var Raymond = {
	Row: 10,
	Col: 10,
	probabilities: new Array(this.Row),
	fired: [],
	sunk: [],

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

	//sets everything to zero
	resetProbabilities: function() {
		for (var i = 0; i < this.Row; i++) {
			for (var j = 0; j < this.Col; j++) {
				this.probabilities[i][j] = 0;
			}
		}
	},

	//recalculates according to ships left
	recalculateProbabilities: function() {
		var currentLength;
		// recalculate probabilities based on ships left and squares not hit
		for (var i = 0; i < this.Row; i++) {
			for (var j = 0; j < this.Col; j++) {
				if (this.fired.indexOf(i + "" + j) >= 0) {
						this.probabilities[i][j] = Number.MIN_SAFE_INTEGER;
						continue;
					}
				for (var k = 0; k < model.ships.length; k++) {
					if (this.sunk.indexOf(model.ships[k])) {
						continue;
					}
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

	//reset Raymond
	reset: function() {
		this.fired = [];
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
		console.log("Current max: " + maxValue);
		return maxLocation;
	},
	
	//update probabilities array after each shot
	//remove even if hit because hunt mode will sink ship
	updateProbabilities: function(location) {
		console.log(location);
		console.log("We update probabilities!");
		var location = parseInt(location);
		var currentLength;
		var row = Math.floor(location / 10);
		var col = location % 10;
		var start;

		console.log(row);
		console.log(col);

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
		this.probabilities[row][col] = Number.MIN_SAFE_INTEGER;
	},

	/*
	//hunt mode: need to randomise guesses/need to stop when ship is Sunk/even parity
	huntMode: function(location) {
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
	*/

	//used in conjunction with huntMode2
	isShip: function(location) {
		var ship;
		for (var i = 0; i < model.numsShips; i++) {
			if (model.ships[i].locations.indexOf(location) >= 0) {
				ship = model.ships[i];
			}
		}
		return ship;
	},

	//targets and hits all adjacent squares till the ship is sunk
	huntMode2: function(location) {
		var row;
		var col;
		var location;

		var targets = [];
		var locations = [];
		var toBeUpdated = [];

		toBeUpdated.push(location);
		locations.push(location);
		var ship = this.isShip(location);

		while (!model.isSunk(ship)) {
			location = locations.pop();
			row = Math.floor(location/10);
			col = location % 10;

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

			var current;
			innerLoop: {
				for (;targets.length != 0;) {
					current = targets.pop();
					if (this.fired.indexOf(current) < 0) {
						toBeUpdated.push(current);
						this.fired.push(current);
						if (model.fire(current)) {
							console.log("NEW TARGET!");
							locations.push(current);
							break innerLoop;
						}
					}
				}
			}
		}
		while (toBeUpdated.length !== 0) {
				this.updateProbabilities(toBeUpdated.pop());
		}

		this.resetProbabilities();
		this.recalculateProbabilities();
	},

	//uses probability to target till the ship is sunk
	huntMode3: function(location) {
		var row; 
		var col;
		var current;
		var ship;
		var length;
		var currentSunk = this.sunk.length;

		var probabilities = [];
		var toBeUpdated = [];
		var locations = [];
		var firedToBeUpdated = [];

		locations.push(location);
		toBeUpdated.push(location);
		//initialise the probabilities; set all to zero
		for (var i = 0; i < this.Row; i++) {
			//declare cols for each row
			probabilities[i] = new Array(this.Col);
			for (var j = 0; j < this.Col; j++) {
				probabilities[i][j] = 0;
			}
		}
		//continue until we sink one ship
		while (this.sunk.length === currentSunk) {
			console.log("hello");
			//update if there is a need to; after a hit
			if (locations.length != 0) {
				current = locations.pop();
				row = Math.floor(current/10);
				col = current % 10;
				//check if location can support a ship, and update if it can
				for (var i = 0; i < model.numsShips; i++) {
					ship = model.ships[i];
					//if ship has been sunk, we ignore its possibility
					if (this.sunk.indexOf(ship) >= 0) {
						continue;
					}
					length = ship.shipLength;
					//check if location has already been hit
					//vertical
					for (var j = 0; j < length; j++) {
						//check if it is within the square
						if (((row + j) < this.Row) && ((row + j - length + 1) >= 0)) {
							//check and update if possible
							if (this.huntCheckPossibleVertical((row + j), col, length)) {
								this.huntUpdatePossibilitiesVertical(row + j, col, probabilities, current,length);
							}
						}
					}
					//horizontal
					for (var j = 0; j < length; j++) {
						//check if it is within the square
						if (((col + j) < this.Col) && ((col + j - length + 1) >= 0)) {
							//check and update if possible
							if (this.huntCheckPossibleHorizontal(row, (col + j), length)) {
								this.huntUpdatePossibilitiesHorizontal(row, (col + j), probabilities, current, length);
							}
						}
					}
				}
				//set hit to minimum
				probabilities[row][col] = Number.MIN_SAFE_INTEGER;
			}

			//choose probability to fire
			current = this.guessHunt(probabilities);
			console.log(current);
			toBeUpdated.push(current);
			//if hit we update the probabilities
			if (model.fire(current)) {
				locations.push(current);
				firedToBeUpdated.push(current);
			}	
			else {
				//update for misses
				this.fired.push(current);
				this.huntUpdateMisses(probabilities, current);
			}
		}
		//update hit locations in global fired
		while (firedToBeUpdated.length !== 0) {
			this.fired.push(firedToBeUpdated.pop());
		} 
		//update all shots in global probabilities
		while (toBeUpdated.length !== 0) {
			this.updateProbabilities(toBeUpdated.pop());
		}
	},

	//guess: for hunt mode
	guessHunt: function(probabilities) {
		var maxValue = Number.MIN_SAFE_INTEGER;
		var maxLocation = 0;
		for (var i = 0; i < this.Row; i++) {
			for (var j = 0; j < this.Col; j++) {
				if (probabilities[i][j] > maxValue) {
					//this currently chooses the first max tile
					maxValue = probabilities[i][j];
					maxLocation = i + "" + j;
				}
			}
		}
		//returns string
		console.log("Hunt - current max: " + maxValue);
		return maxLocation;
	},

	//update misses
	huntUpdateMisses: function(probabilities, location) {
		var col = Math.floor(location / this.Col);
		var row = location % this.Row;
		var length;
		var start;

		for (var i = 0; i < model.numsShips; i++) {
			ship = model.ships[i];
			//if ship has been sunk, we ignore its possibility
			if (this.sunk.indexOf(ship) >= 0) {
				continue;
			}
			length = ship.shipLength;
			//horizontal
			for (var j = 0; j < length; j++) {
				start = col - j;
				if ((start >= 0) && ((start + length - 1) <= (this.Col - 1))) {
					for (var k = 0; k < length; k++) {
						probabilities[row][start + k]--;
					}	
				}
			}
			//vertical
			for (var j = 0; j < length; j++) {
				start = row - j;
				if ((start >= 0) && ((start + length - 1) <= (this.Row - 1))) {
					for (var k = 0; k < length; k++) {
						probabilities[start + k][col]--;
					}	
				}
			}
		}
		probabilities[col][row] = Number.MIN_SAFE_INTEGER;
	},

	//check if location can accomodate ship, takes a location, and an int
	//these take increasing locations
	huntCheckPossibleVertical: function(row, col, length) {
		//go through probability array and check if there is a spot already fired on 
		//note we skip the original location as it has already been fired upon
		//vertical
		for (var i = 1; i < length; i++) {
			//console.log((row - i) + "" + col);
			//check if already hit
			if (this.fired.indexOf((row - i) + "" + col) >= 0) {
				return false;
			}
		}
		return true;
	},

	//these take increasing locations
	huntCheckPossibleHorizontal: function(row, col, length) {
		//go through probability array and check if there is a spot already fired on 
		//note we skip the original location as we first check
		//horizontal
		for (var i = 1; i < length; i++) {
			//console.log(row + "" + (col - i));
			//check if already hit
			if (this.fired.indexOf(row + "" +  (col - i)) >= 0) {
				return false;
			}
		}
		return true;
	},

	//takes increasing locations
	huntUpdatePossibilitiesVertical: function(row, col, probabilities, location, length) {
		for (var i = 0; i < length; i++) {
			//console.log("Update" + (row - i) + "" + col);
			if (((row - i) + "" + col) === location) {
				continue;
			}
			probabilities[row - i][col]++;
			//console.log("Update probability " + probabilities[row - i][col]);
		}
	},

	//takes increasing locations
	huntUpdatePossibilitiesHorizontal: function(row, col, probabilities, location, length) {
		for (var i = 0; i < length; i++) {
			//console.log(row + "" + (col - i));
			if ((row + "" + (col - i)) === location) {
				continue;
			}
			probabilities[row][col - i]++;
		}
	},

	/*
	for (var i = 0; i < length; i++) {
			x = row + i;
			y = col;
			console.log("base: " + x + "" + y);
			for (var j = 0; j < length; j++) {
				console.log("checking: " + (x - j) + "" + y);
				//note we skip the original location because it is already a hit
				if (x === row && y === col) {
					continue;
				}
				if (this.fired.indexOf((x - j) + "" + y) >= 0) {
					return false;
				}
			}
		}
		//horizontal
		for (var i = 0; i < length; i++) {
			x = row;
			y = col + i;
			console.log("base: " + x + "" + y);
			for (var j = 0; j < length; j++) {
				console.log("checking: " + x + "" + (y - j));
				//note we skip the original location because it is already a hit
				if (x === row && y === col) {
					continue;
				}
				if (this.fired.indexOf(x + "" +  (y - j)) >= 0) {
					return false;
				}
			}
		}
		return true;
		*/

	//play the Game: Raymond calculate the probabilities and takes a guess, updating if he misses
	play: function() {
		var hit;
		var location;
		location = this.guess();
		hit = model.fire(location);
		this.fired.push(location);
		if (hit) {
			this.huntMode3(location);
		}
		else {
			this.updateProbabilities(location);
		}
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
	},

	printProbabilities1: function(probabilities) {
		for (var i = 0; i < probabilities.length; i++) {
			var current = "";
			for (var j = 0; j < probabilities[i].length; j++) {
				//current = current + this.probabilities[i][j] + " ";
				console.log((i * 10 + j) + " "+ probabilities[i][j]);
			}
			console.log(current);
		}
	},

	lookUp: function(location) {
		var row = Math.floor(location / 10);
		var col = location % 10;
		return this.probabilities[row][col];
	}
};

//event handlers
function init() {
	controller.getShips();
	model.generateShipLocations();
	view.displayShips();
	//controller.Raymond();
	//tester();
}

window.onload = init;