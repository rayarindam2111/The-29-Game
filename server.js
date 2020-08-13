const express = require('express'), app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { pingInterval: 6000, pingTimeout: 8000 });
const mongoClient = require('mongodb').MongoClient;
const compression = require('compression');
const helmet = require('helmet');
const crypto = require('crypto');
const colors = require('colors');
const port = process.env.PORT || 3000;
const mURI = process.env.DB_URL;
var collection, maxElems = 10, aggFunc;

const LOG_ENABLE = false;

console.log(colors.bgYellow.black('The 29 Game.\nCopyright Arindam Ray, 2020.'));

mongoClient.connect(mURI, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
	if (err)
		console.log(colors.bgRed.black('Database connection error'));
	else {
		collection = client.db('sins29').collection('games');
		console.log(colors.bgBlue.green('Connected to database'));
		aggFunc = [
			//History
			[{ '$sort': { 'rt': -1 } },
			{ '$limit': maxElems },
			{ '$project': { '_id': 0 } }],
			//Most points
			[{ '$match': { 'gm': 0 } },
			{ '$project': { 'pn': 1, 'gp': 1, 'rt': 1, '_id': 0 } },
			{ '$unwind': { 'path': '$gp', 'includeArrayIndex': 'mi' } },
			{ '$addFields': { 'pn': { '$arrayElemAt': ['$pn', '$mi'] } } },
			{ '$project': { 'mi': 0 } },
			{ '$sort': { 'gp': -1 } },
			{ '$limit': maxElems }
			],
			//Most hands
			[{ '$match': { 'gm': 0 } },
			{ '$project': { 'pn': 1, 'gh': 1, 'rt': 1, '_id': 0 } },
			{ '$unwind': { 'path': '$gh', 'includeArrayIndex': 'mi' } },
			{ '$addFields': { 'pn': { '$arrayElemAt': ['$pn', '$mi'] } } },
			{ '$project': { 'mi': 0 } },
			{ '$sort': { 'gh': -1 } },
			{ '$limit': maxElems }
			],
			//Least Time
			[{ '$sort': { 'wt': 1 } },
			{ '$limit': maxElems },
			{ '$project': { '_id': 0 } }]
		];
	}
});

function storeDB(dataPack, ID) {
	collection.insertOne(dataPack, (err, result) => {
		if (err)
			console.log(colors.bgRed.black('Database write error'));
		else
			console.log(colors.bgBlue.green('Game saved: ' + ID));
	});
}

class rooms {
	constructor() {
		this.room_count = 0;
		this.room_names = [];
		this.room_passwords = [];
		this.room_timestamps = [];
		this.room_ids = [];
		this.room_teampurple = [];
		this.room_teamgreen = [];
		this.room_modes = [];
		this.room_games = [];
		/* start VoiceServer */
		this.room_voice = [];
		/* end VoiceServer */
	}

	checkLogin(ID, pass, internal) {
		var index = this.room_ids.indexOf(ID);
		if (index == -1)
			return { 'success': false, 'wrongpass': false };
		else if (this.room_passwords[index] !== pass)
			return { 'success': false, 'wrongpass': true };
		else
			return internal ? { 'success': true, 'index': index } : { 'success': true, 'roomID': this.room_ids[index], 'roomN': this.room_names[index], 'tp': this.room_teampurple[index], 'tg': this.room_teamgreen[index] };
	}

	addRoom(name, pass, timestamp, mode) {
		if (this.room_ids.length >= maxElems) { //lim to ten. rooms.
			console.log(colors.bgRed.black('Max. room limit reached'));
			return false;
		}
		var index = this.room_ids.indexOf(name + timestamp);
		if (index == -1) {
			this.room_names.push(name);
			this.room_passwords.push(pass);
			this.room_timestamps.push(timestamp);
			this.room_ids.push(name + timestamp);
			this.room_teampurple.push([]);
			this.room_teamgreen.push([]);
			this.room_games.push('');
			this.room_modes.push(parseInt(mode));
			/* start VoiceServer */
			this.room_voice.push([]);
			/* end VoiceServer */
			this.room_count += 1;
			console.log(colors.bgBlue.green('Room added: ' + name + timestamp));
			return true;
		}
		else {
			console.log(colors.bgRed.black('Room already exists: ' + name + timestamp));
			return false;
		}
	}

	removeRoom(ID) {
		var index = this.room_ids.indexOf(ID);
		if (index > -1) {
			try {
				this.room_games[index].endGameTimer();
			} catch (e) { };
			this.room_ids.splice(index, 1);
			this.room_names.splice(index, 1);
			this.room_passwords.splice(index, 1);
			this.room_timestamps.splice(index, 1);
			this.room_teampurple.splice(index, 1);
			this.room_teamgreen.splice(index, 1);
			/* start VoiceServer */
			this.room_voice.splice(index, 1);
			/* end VoiceServer */
			this.room_games.splice(index, 1);
			this.room_modes.splice(index, 1);
			this.room_count -= 1;
			console.log(colors.bgBlue.red('Room deleted: ' + ID));
			return { 'success': true };
		}
		else {
			console.log(colors.bgRed.black('Room deletion failed: ' + ID));
			return { 'success': false, 'wrongpass': false };
		}

	}

	getRooms() {
		var users = [];
		for (var i = 0; i < this.room_count; i++)
			users.push(this.room_teampurple[i].length + this.room_teamgreen[i].length);

		return {
			'number': this.room_count,
			'names': this.room_names,
			'timestamps': this.room_timestamps,
			'ids': this.room_ids,
			'users': users,
			'modes': this.room_modes
		};
	}

	addPlayer(ID, pass, name, team) {
		var login = this.checkLogin(ID, pass, true);
		if (login.success) {
			if (team == 'purple' && this.room_teampurple[login.index].length < 2) {
				var x = this.room_teampurple[login.index].push(name);
				console.log(colors.bgBlue.green('Player added to team in room: ' + name + '->' + team + '->' + ID));
				return { 'success': true, 'playerid': (x - 1), 'teampurple': this.room_teampurple[login.index], 'teamgreen': this.room_teamgreen[login.index], 'mode': this.room_modes[login.index] };
			}
			else if (team == 'green' && this.room_teamgreen[login.index].length < 2) {
				var x = this.room_teamgreen[login.index].push(name);
				console.log(colors.bgBlue.green('Player added to team in room: ' + name + '->' + team + '->' + ID));
				return { 'success': true, 'playerid': (x - 1), 'teampurple': this.room_teampurple[login.index], 'teamgreen': this.room_teamgreen[login.index], 'mode': this.room_modes[login.index] };
			}
			else {
				console.log(colors.bgRed.black('Player added to team in room failed: ' + name + '->' + team + '->' + ID));
				return { 'success': false };
			}
		}
		else {
			console.log(colors.bgRed.black('Player added to team in room failed: ' + name + '->' + team + '->' + ID));
			return { 'success': false };
		}
	}

	getTeams(ID, pass) {
		var login = this.checkLogin(ID, pass, true);
		if (login.success) {
			return { 's': true, 'tp': this.room_teampurple[login.index], 'tg': this.room_teamgreen[login.index] };
		}
		else
			return { 's': false };
	}

	startGamePlay(ID, pass) {
		var login = this.checkLogin(ID, pass, true);
		if (login.success) {
			this.room_games[login.index] = new Game(ID, this.room_modes[login.index]);
			console.log(colors.bgBlue.green('Game started for room: ' + ID));
		}
		else
			console.log(colors.bgRed.black('Game start failed for room: ' + ID));
	}

	sendBidtoRoom(ID, pass, ps, am, pl, l, o) {
		var login = this.checkLogin(ID, pass, true);
		if (login.success) {
			this.room_games[login.index].bidReceive(ps, am, pl, l, o);
		}
		else
			console.log(colors.bgRed.black('Bid receive error: ' + ID));
	}

	sendPlaytoRoom(ID, pass, pl, c, fp) {
		var login = this.checkLogin(ID, pass, true);
		if (login.success) {
			this.room_games[login.index].nextPlayReceive(pl, c, fp);
		}
		else
			console.log(colors.bgRed.black('Play receive error: ' + ID));
	}

	sendTrumptoRoom(ID, pass, op, pl, s, l) {
		var login = this.checkLogin(ID, pass, true);
		if (login.success) {
			if (op == 'open')
				this.room_games[login.index].trumpOpenReceive(pl);
			else if (op == 'set')
				this.room_games[login.index].trumpSetReceive(pl, s, l);
		}
		else
			console.log(colors.bgRed.black('Trump receive error: ' + ID));
	}

	getRoomEmitLog(ID, pass) {
		var login = this.checkLogin(ID, pass, true);
		if (login.success) {
			return this.room_games[login.index] != '' ? this.room_games[login.index].getEmitLog() : -2;
		}
		else {
			console.log(colors.bgRed.black('Room does not exist: ' + ID));
			return -1;
		}
	}

	sendChat(ID, pass, msg) {
		var login = this.checkLogin(ID, pass, true);
		if (login.success) {
			io.in(ID).emit('chat', { 'msg': msg });
		}
		else
			console.log(colors.bgRed.black('Chat receive error: ' + ID));
	}

	sendColor(ID, pass, val, player) {
		var login = this.checkLogin(ID, pass, true);
		if (login.success) {
			io.in(ID).emit('color', { 'val': val, 'pl': player });
		}
		else
			console.log(colors.bgRed.black('Color receive error: ' + ID));
	}

	/* start VoiceServer */
	sendVoice(ID, pass, cid, op) {
		var login = this.checkLogin(ID, pass, true);
		if (login.success) {
			var uID = ID + cid;
			if (op == 'conn') {
				io.in(ID).emit('adc', { cid: uID, calls: this.room_voice[login.index] });
				if (!(this.room_voice[login.index].indexOf(uID) > -1))
					this.room_voice[login.index].push(uID);
			}
			else if (op == 'del') {
				var ri = this.room_voice[login.index].indexOf(uID);
				if (ri > -1) {
					this.room_voice[login.index].splice(ri, 1);
				}
			}
		}
		else
			console.log(colors.bgRed.black('Voice receive error: ' + ID));
	}
	/* end VoiceServer */

	logRoom(ID, time, rounds, points, hands, mode) {
		var index = this.room_ids.indexOf(ID);
		try {
			const pName = [
				this.room_teamgreen[index][0],
				this.room_teampurple[index][0],
				this.room_teamgreen[index][1],
				this.room_teampurple[index][1]
			];
			const dataPack = {
				rn: this.room_names[index],       // room name
				rt: this.room_timestamps[index],  // room timestamp
				pn: pName,                        // player names
				wt: time,                         // win time
				gr: rounds,                       // game rounds
				gp: points,                       // game points
				gh: hands,                        // game hands
				gm: mode                          // game mode
			};
			storeDB(dataPack, ID);
		}
		catch (e) {
			console.log(colors.bgRed.black('Could not save game: ' + ID + '\nError: ' + e.message));
		}
	}

	getHistory(socket, aggNo) {
		try {
			//collection.find().toArray()
			collection.aggregate(aggFunc[aggNo]).toArray((err, items) => {
				if (err)
					console.log(colors.bgRed.black('Database read error'));
				else {
					if (aggNo == 0)
						collection.estimatedDocumentCount({}, function (err, count) {
							if (err)
								console.log(colors.bgRed.black('Database read error'));
							else
								socket.emit('hst', { idx: aggNo, c: count, data: items });
						});
					else
						socket.emit('hst', { idx: aggNo, data: items });
				}
			});
		}
		catch (e) {
			console.log(colors.bgRed.black('Could not access saved games\nError: ' + e.message));
		}
	}

};

class Cards {
	constructor(startingPlayer) {
		this.startingPlayer = startingPlayer;
		this.values = ['10', '9', '8', 'K', 'Q', 'J', '7', 'A']; //6 not considered
		this.suits = ['S', 'D', 'C', 'H'];
		this.playable_deck = new Array();
		for (var i = 0; i < this.suits.length; i++)
			for (var x = 0; x < this.values.length; x++)
				this.playable_deck.push(this.values[x] + this.suits[i]);
		this.randomizeCards();
	}

	arrayRotate(count) {
		count -= this.playable_deck.length * Math.floor(count / this.playable_deck.length);
		this.playable_deck.push.apply(this.playable_deck, this.playable_deck.splice(0, count));
	}

	randomInt(min, max) {
		var randbytes = parseInt(crypto.randomBytes(1).toString('hex'), 16);
		var result = Math.floor(randbytes / 256 * (max - min + 1) + min);

		// fallback
		if (result > max)
			result = Math.floor(Math.random() * (max - min + 1)) + min;

		return result;
	}

	randomizeCards() {
		/*randomize playable cards*/
		//this.arrayRotate(Math.floor((Math.random() * this.playable_deck.length)));
		this.arrayRotate(this.randomInt(0, this.playable_deck.length - 1));
		/* Fisher Yates shuffle */
		var m = this.playable_deck.length, i, t;
		while (m) {
			//i = Math.floor(Math.random() * m--);
			i = this.randomInt(0, --m);
			t = this.playable_deck[m];
			this.playable_deck[m] = this.playable_deck[i];
			this.playable_deck[i] = t;
		}
		//this.arrayRotate(-Math.floor((Math.random() * this.playable_deck.length)));
		this.arrayRotate(-this.randomInt(0, this.playable_deck.length - 1));

		for (var i = 0; i < 100; i++) {
			var location1 = Math.floor((Math.random() * this.playable_deck.length));
			var location2 = Math.floor((Math.random() * this.playable_deck.length));
			if (location1 != location2) {
				var tmp = this.playable_deck[location1];
				this.playable_deck[location1] = this.playable_deck[location2];
				this.playable_deck[location2] = tmp;
			}
		}

		//check if one person gets all zero points cards or all Jacks or starting player gets zeros in 1st 4 cards
		var playernum;
		for (playernum = 0; playernum < 4; playernum++) {
			var count = [0, 0]; //no. of [non zero point cards, jacks]
			for (var i = playernum * 4 + 16; i < playernum * 4 + 20; i++) {
				var t = Cards.cardDetail(this.playable_deck[i]);
				if (t.point != 0) count[0]++;
				if (t.val == 'J') count[1]++;
			}
			if (this.startingPlayer == (3 - playernum) && count[0] == 0) break; //cards taken out in reverse later
			for (var i = playernum * 4; i < playernum * 4 + 4; i++) {
				var t = Cards.cardDetail(this.playable_deck[i]);
				if (t.point != 0) count[0]++;
				if (t.val == 'J') count[1]++;
			}
			if (count[0] == 0 || count[1] == 4) break;
		}

		if (playernum < 4)
			this.randomizeCards();
	}

	getPlayableCardsRandomized() {
		return this.playable_deck;
	}

	static cardDetail(card) {
		var suit = card.slice(card.length - 1, card.length);
		var val = card.slice(0, card.length - 1);
		var point = (val == 'J' ? 3 : (val == '9' ? 2 : (val == 'A' || val == '10' ? 1 : 0)));
		var rank;
		switch (val) {
			case '7': rank = 1; break;
			case '8': rank = 2; break;
			case 'Q': rank = 3; break;
			case 'K': rank = 4; break;
			case '10': rank = 5; break;
			case 'A': rank = 6; break;
			case '9': rank = 7; break;
			case 'J': rank = 8; break;
			default: rank = -1;
		}
		return { 'card': card, 'val': val, 'suit': suit, 'point': point, 'rank': rank };
	}

};

class Game {
	constructor(roomID, gameMode) {
		this.roomID = roomID;
		this.gameMode = gameMode;
		this.gameTimer = '';

		this.delayed_distribute = false;
		this.playerStart = Math.floor((Math.random() * 4));

		this.emitlog = new Array();
		this.emitlog[0] = new Array();
		this.emitlog[1] = new Array();

		this.rounds_won = [0, 0, 0, 0]; //total rounds won
		this.handsWon = [0, 0, 0, 0];
		this.pointsWon = [0, 0, 0, 0];

		this.startTime = Date.now();
		this.resetRound();
	}

	getEmitLog() {
		return this.emitlog;
	}

	resetRound() {
		this.playerStart = this.nextPlayer(this.playerStart, 'clock');
		this.play_deck = new Cards(this.playerStart).getPlayableCardsRandomized();
		this.trump_card = '';
		this.trump_open = false;
		this.trump_opener = '';
		this.trump_setter = '';

		this.bid_winner = -100;   //final
		this.bid_winner_round = -100;
		this.bid_value = 16;    //final
		this.bid_current_player = [];
		this.bid_next_player = -200;
		this.bid_chances = [0, 0, 0, 0];
		this.bid_list = [0, 1, 2, 3];

		this.biddouble = 1; //multiplier //final
		this.biddoubleteam = 'green';    //final
		this.biddoublehits = { 'val': 0, 'log': '' };
		this.bidredoublehits = { 'val': 0, 'log': '' };

		this.current_player = [];

		this.lastplayer = '';
		this.lastplayercard = '';
		this.firstcard = [];

		this.marriage_not_d = true;

		this.points = [0, 0, 0, 0];
		this.cards = new Array();
		this.cards_on_table = new Array(); //4 cards on table at any time
		this.winlog = new Array();
		this.winpoints = new Array();

		for (var i = 0; i < 4; i++)
			this.cards[i] = new Array();

		this.startGame(); //start bidding
	}

	nextPlayer(currentPlayer, direction) {
		return (direction == 'clock') ? ((currentPlayer + 1) % 4) : (((currentPlayer - 1) % 4) + 4) % 4;
	}

	nextTeamPlayer(currentPlayer) {
		return this.nextPlayer(this.nextPlayer(currentPlayer, 'anti'), 'anti');
	}

	playerFromNumber(number) {
		//0->green0
		//1->purple0
		//2->green1
		//3->purple1
		switch (number) {
			case 0: return 'green0';
			case 1: return 'purple0';
			case 2: return 'green1';
			case 3: return 'purple1';
			case -100: return '-100'; // for no bid set
			default: return '';
		}
	}

	numberFromPlayer(player) {
		//green0->0
		//purple0->1
		//green1->2
		//purple1->3
		return player == 'green0' ? 0 : (player == 'green1' ? 2 : (player == 'purple0' ? 1 : (player == 'purple1' ? 3 : -1)));
	}

	teamFromNumber(number) {
		return (number % 2) ? 'purple' : 'green';
	}

	indexOfMax(arr) {
		if (arr.length === 0) {
			return -1;
		}

		var max = arr[0];
		var maxIndex = 0;

		for (var i = 1; i < arr.length; i++) {
			if (arr[i] > max) {
				maxIndex = i;
				max = arr[i];
			}
		}

		return maxIndex;
	}

	distributeCards(noOfMembers, cardsPerMember, delay) {
		var cardString = '';
		for (var i = 0; i < noOfMembers; i++)
			for (var j = 0; j < cardsPerMember; j++)
				this.cards[i].push(this.play_deck.pop());

		for (var i = 0; i < this.cards.length; i++)
			for (var j = 0; j < this.cards[i].length; j++)
				cardString += this.cards[i][j];
		var d = { 'c': cardString, 'm': noOfMembers, 'd': delay };
		this.emitlog[0].push('cst');
		this.emitlog[1].push(d);
		io.in(this.roomID).emit('cst', d);
		if (LOG_ENABLE) {
			console.log('----------------------------------------------');
			console.log(colors.bgYellow.black(this.emitlog[0].slice(-1)));
			console.log(colors.bgYellow.black(this.emitlog[1].slice(-1)));
		}
	}

	bidListRemove(player) {
		var index = this.bid_list.indexOf(player);
		if (index > -1)
			this.bid_list.splice(index, 1);
		return this.bid_list.length;
	}

	nextBidder(player) {
		var index = this.bid_list.indexOf(player);
		if (index > -1)
			return this.bid_list[((index + 1) % this.bid_list.length)];
		else
			return -1;
	}

	startBid() {
		var playerteam = this.teamFromNumber(this.playerStart);
		this.bid_current_player = this.playerStart;
		var log = 'Bidding started by Team&nbsp;<' + playerteam + '>' + playerteam.toUpperCase() + '</' + playerteam + '>';
		this.nextBidEmit(this.bid_current_player, this.bid_winner, this.bid_value, true, log, '', this.delayed_distribute);
	}

	//external receive link
	bidReceive(passed, amount, player, log, over) {
		if (over.iO == 'D') {
			if (parseInt(over.m) >= this.biddouble) {
				this.biddouble = parseInt(over.m);
				this.biddoubleteam = over.t;
			}
			this.biddoublehits.log += (log + '.&nbsp;');
			this.biddoublehits.val += 1;
			if (this.biddoublehits.val == 2) {
				if (this.biddouble == 1)
					this.bidOver(this.bid_winner, this.biddoublehits.log);
				else
					this.nextBidEmit('', this.bid_winner, '', false, this.biddoublehits.log, 'RD', 0);

			}
			return;
		}
		else if (over.iO == 'R') {
			if (parseInt(over.m) > this.biddouble) {
				this.biddouble = parseInt(over.m);
				this.biddoubleteam = over.t;
			}

			this.bidredoublehits.log += (log + '.&nbsp;');
			this.bidredoublehits.val += 1;

			if (this.bidredoublehits.val == 2) {
				this.bidOver(this.bid_winner, this.bidredoublehits.log);
			}

			return;
		}

		this.bid_chances[this.numberFromPlayer(player)] = 1;
		if (passed) {
			this.bid_winner_round = this.bid_winner;
			if ((this.bid_chances.reduce((a, b) => a + b, 0)) == 4) {
				if (this.bid_winner == -100)
					this.bid_winner = this.playerStart;
				this.nextBidEmit(this.bid_current_player, this.bid_winner, this.bid_value, false, log, 'ST', 0);
				return;
			}
			this.bid_current_player = this.nextBidder(this.bid_current_player);
			if (this.bid_current_player == this.bid_next_player)
				this.bid_current_player = this.nextBidder(this.bid_current_player);
			this.bidListRemove(this.numberFromPlayer(player));
		}
		else {
			if (this.bid_winner == -100)
				this.bid_winner_round = this.numberFromPlayer(player);
			this.bid_winner = this.numberFromPlayer(player);
			this.bid_value = amount;
			if (this.bid_next_player == -200) {
				this.bid_next_player = this.numberFromPlayer(player);
				this.bid_current_player = this.nextBidder(this.bid_current_player);
			}
			else {
				this.bid_current_player = this.bid_next_player;
				this.bid_next_player = this.numberFromPlayer(player);
			}
			if (amount == 28 || this.bid_next_player == this.bid_current_player) {
				this.nextBidEmit(this.bid_current_player, this.bid_winner, this.bid_value, false, log, 'ST', 0);
				return;
			}
		}
		this.nextBidEmit(this.bid_current_player, this.bid_winner_round, this.bid_value, false, log, '', 0);
	}

	nextBidEmit(player, bidwinner, currentbid, firstbid, log, biddouble, delay) {
		var d = {
			'pl': this.playerFromNumber(player),
			'bw': this.playerFromNumber(bidwinner),
			'cb': currentbid,
			'fb': firstbid,
			'l': log,
			'bd': biddouble,
			'd': delay
		};

		this.emitlog[0].push('bid');
		this.emitlog[1].push(d);
		io.in(this.roomID).emit('bid', d);
		if (LOG_ENABLE) {
			console.log('----------------------------------------------');
			console.log(colors.bgYellow.black(this.emitlog[0].slice(-1)));
			console.log(colors.bgYellow.black(this.emitlog[1].slice(-1)));
		}
	}

	bidOver(player, log) {
		var x = 29 - this.bid_value;
		var teambids = [x, x, x, x];
		teambids[player] = parseInt(this.bid_value);
		teambids[this.nextTeamPlayer(player)] = parseInt(this.bid_value);
		var d = { 'w': player, 'b': teambids, 'bd': this.biddouble, 'bdt': this.biddoubleteam, 'l': log };
		this.emitlog[0].push('bidover');
		this.emitlog[1].push(d);
		io.in(this.roomID).emit('bidover', d);
		if (LOG_ENABLE) {
			console.log('----------------------------------------------');
			console.log(colors.bgYellow.black(this.emitlog[0].slice(-1)));
			console.log(colors.bgYellow.black(this.emitlog[1].slice(-1)));
		}
		this.distributeCards(4, 4, false);
		if (this.trump_card == '') { //7th card chosen
			var val = Math.floor(Math.random() * (5 - 2 + 1)) + 2; // 2 to 5
			this.trump_card = val + Cards.cardDetail(this.cards[this.trump_setter][6]).suit;
			var d = { 'pl': this.playerFromNumber(this.trump_setter), 'c': this.trump_card, 'op': 'set', 'c7': this.cards[this.trump_setter][6] };
			this.emitlog[0].push('trump');
			this.emitlog[1].push(d);
			io.in(this.roomID).emit('trump', d);
			if (LOG_ENABLE) {
				console.log('----------------------------------------------');
				console.log(colors.bgYellow.black(this.emitlog[0].slice(-1)));
				console.log(colors.bgYellow.black(this.emitlog[1].slice(-1)));
			}
		}
		this.nextPlayEmit(true, this.playerStart, 'nl');
	}

	nextPlayEmit(firstplay, curPlayer, roundend) {
		this.current_player = curPlayer;
		var d = {
			'pl': this.playerFromNumber(curPlayer),
			'lp': this.playerFromNumber(this.lastplayer),
			'lpc': this.lastplayercard,
			'lpac': this.cards[this.lastplayer],
			'op': { //options
				'fp': firstplay,
				'fc': this.firstcard,
				're': roundend //'normal','roundover','gameover'
			}
		};
		if (roundend == 'go') {
			d.op.hw = this.handsWon;
			d.op.pw = this.pointsWon;
		}
		if (firstplay) {
			d.op.pt = this.points;
			d.op.rs = this.rounds_won;
		}

		this.emitlog[0].push('play');
		this.emitlog[1].push(d);
		io.in(this.roomID).emit('play', d);
		if (LOG_ENABLE) {
			console.log('----------------------------------------------');
			console.log(colors.bgYellow.black(this.emitlog[0].slice(-1)));
			console.log(colors.bgYellow.black(this.emitlog[1].slice(-1)));
		}
	}

	checkM(stack, trump) {
		var trumpsuit = Cards.cardDetail(trump).suit;
		var count = 0;
		for (var i = 0; i < stack.length; i++)
			if (Cards.cardDetail(stack[i]).suit == trumpsuit)
				if (Cards.cardDetail(stack[i]).val == 'K' || Cards.cardDetail(stack[i]).val == 'Q')
					count++;
		if (count == 2)
			return true;
		else
			return false;
	}

	checkMarriage(delay) {
		if (this.trump_open && this.marriage_not_d) {
			for (var i = 0; i < 4; i++) {
				var rWon = false;
				for (var wc = 0; wc < this.winlog.length; wc++) {
					if (this.teamFromNumber(this.winlog[wc]) == this.teamFromNumber(i)) {
						rWon = true;
						break;
					}
				}
				if (!rWon)
					continue;
				if (this.checkM(this.cards[i], this.trump_card)) {
					if (this.teamFromNumber(this.bid_winner) == this.teamFromNumber(i))
						this.bid_value = Math.max(16, parseInt(this.bid_value) - 4);
					else
						this.bid_value = Math.min(28, parseInt(this.bid_value) + 4);

					var x = 29 - this.bid_value;
					var teambids = [x, x, x, x];
					teambids[this.bid_winner] = parseInt(this.bid_value);
					teambids[this.nextTeamPlayer(this.bid_winner)] = parseInt(this.bid_value);
					this.marriage_not_d = false;

					var d = { 'pl': this.playerFromNumber(i), 'b': teambids, 'bd': this.biddouble, 'bdt': this.biddoubleteam, 'd': delay };
					this.emitlog[0].push('marriage');
					this.emitlog[1].push(d);
					io.in(this.roomID).emit('marriage', d);
					if (LOG_ENABLE) {
						console.log('----------------------------------------------');
						console.log(colors.bgYellow.black(this.emitlog[0].slice(-1)));
						console.log(colors.bgYellow.black(this.emitlog[1].slice(-1)));
					}
					return true;
				}
			}
		}
		return false;
	}

	//external receive link
	nextPlayReceive(player, card, firstplay) {
		if (this.current_player == this.numberFromPlayer(player)) {
			this.cards_on_table.push({ 'player': this.current_player, 'card': card });
			this.lastplayer = this.numberFromPlayer(player);
			this.lastplayercard = card;
			var index;
			if (this.cards[this.current_player])
				index = this.cards[this.current_player].indexOf(card);
			else {
				console.log(colors.bgRed.black('Error removing card from player: ' + card + '->' + player));
				return;
			}
			if (index > -1)
				this.cards[this.current_player].splice(index, 1);
			else {
				console.log(colors.bgRed.black('Error removing card from player: ' + card + '->' + player));
				return;
			}

			if (firstplay)
				this.firstcard = card;

			if (this.cards_on_table.length == 4) {
				var fCard = Cards.cardDetail(this.firstcard);
				var tCard = Cards.cardDetail(this.trump_card);
				var tArr = new Array();
				var tPoints = 0;
				for (var i = 0; i < this.cards_on_table.length; i++) {
					var card = Cards.cardDetail(this.cards_on_table[i].card);
					if (this.trump_open && card.suit == tCard.suit)
						tArr.push(500 + card.rank + card.point);
					else if (card.suit == fCard.suit)
						tArr.push(400 + card.rank + card.point);
					else
						tArr.push(300 + card.rank + card.point);

					tPoints += card.point;
				}

				var winner = this.cards_on_table[this.indexOfMax(tArr)].player; //winner

				this.winlog.push(winner);
				this.winpoints.push(tPoints);

				this.points[winner] += tPoints;
				this.points[this.nextTeamPlayer(winner)] += tPoints;

				this.cards_on_table = new Array();

				this.checkWin(winner, true);
			}
			else {
				var nextPlayer = this.nextPlayer(this.current_player, 'anti');
				this.nextPlayEmit(false, nextPlayer, 'nl');
			}
		}
	}

	checkWin(winner, fromPlay) {
		if (fromPlay)
			this.checkMarriage('play');

		var round_state = 'nl';//normal

		if (this.points[this.bid_winner] >= this.bid_value)
			round_state = this.teamwin(this.bid_winner);
		else if (this.points[this.nextPlayer(this.bid_winner, 'anti')] > 28 - this.bid_value)
			round_state = this.teamwin(this.nextPlayer(this.bid_winner, 'anti'));

		//if (fromPlay || (!fromPlay && (round_state == 'go' || round_state == 'ro')))
		if (fromPlay || round_state == 'go' || round_state == 'ro')
			this.nextPlayEmit(true, winner, round_state);

		if (round_state == 'ro') {//roundover
			this.resetRound();
		}
		else if (round_state == 'go') {//gameover
			try {
				this.endGameTimer();
				var gameTime = Date.now() - this.startTime;
				Rooms.logRoom(this.roomID, gameTime, this.rounds_won, this.pointsWon, this.handsWon, this.gameMode);
				io.in(this.roomID).emit('deleteroom', Rooms.removeRoom(this.roomID));
			}
			catch (err) {
				console.log(colors.bgRed.black('Ending game failed: ' + this.roomID + '\nError: ' + err.message));
			}
		}
	}

	teamwin(player) {
		this.delayed_distribute = true;

		//no pith won
		var rWon = 0;
		for (var i = 0; i < this.winlog.length; i++) {
			rWon += (this.teamFromNumber(this.winlog[i]) == this.teamFromNumber(this.bid_winner));
			this.handsWon[this.winlog[i]]++;
			this.pointsWon[this.winlog[i]] += this.winpoints[i];
		}
		var allwin = (rWon == 0 || rWon == this.winlog.length) ? 2 : 1;

		var inc = (this.teamFromNumber(player) == this.teamFromNumber(this.bid_winner)) ? 1 : -1;
		this.rounds_won[this.bid_winner] += (inc * this.biddouble * allwin);
		this.rounds_won[this.nextTeamPlayer(this.bid_winner)] += (inc * this.biddouble * allwin);

		var gameEnd = false;
		for (var i = 0; i < this.rounds_won.length; i++)
			if (this.rounds_won[i] >= 6 || this.rounds_won[i] <= -6) {
				gameEnd = true;
				break;
			}
		if (gameEnd)
			return 'go';
		else
			return 'ro';
	}

	trumpOpenReceive(player) {
		this.trump_open = true;
		this.trump_opener = this.numberFromPlayer(player);
		var d = { 'pl': this.playerFromNumber(this.trump_opener), 'c': this.trump_card, 'op': 'open' };
		this.emitlog[0].push('trump');
		this.emitlog[1].push(d);
		io.in(this.roomID).emit('trump', d);
		if (LOG_ENABLE) {
			console.log('----------------------------------------------');
			console.log(colors.bgYellow.black(this.emitlog[0].slice(-1)));
			console.log(colors.bgYellow.black(this.emitlog[1].slice(-1)));
		}
		var wincheck = this.checkMarriage('trump');
		if (wincheck)
			this.checkWin('', false);
	}

	trumpSetReceive(player, suit, log) {
		this.trump_setter = this.numberFromPlayer(player);
		if (suit != '7') {
			var val = Math.floor(Math.random() * (5 - 2 + 1)) + 2; // 2 to 5
			this.trump_card = val + suit;
			var d = { 'pl': this.playerFromNumber(this.trump_setter), 'c': this.trump_card, 'op': 'set', 'c7': 'f' };
			this.emitlog[0].push('trump');
			this.emitlog[1].push(d);
			io.in(this.roomID).emit('trump', d);
			if (LOG_ENABLE) {
				console.log('----------------------------------------------');
				console.log(colors.bgYellow.black(this.emitlog[0].slice(-1)));
				console.log(colors.bgYellow.black(this.emitlog[1].slice(-1)));
			}
		}
		this.nextBidEmit(this.bid_player, this.bid_winner, this.bid_value, false, log, 'D', 0);
	}

	startGameTimer() {
		this.gameTimer = setTimeout(() => {
			this.endGameTimer();
			const round_state = 'go';
			this.nextPlayEmit(true, '', round_state);
			var gameTime = Date.now() - this.startTime;
			Rooms.logRoom(this.roomID, gameTime, this.rounds_won, this.pointsWon, this.handsWon, this.gameMode);
			io.in(this.roomID).emit('deleteroom', Rooms.removeRoom(this.roomID));
		}, this.gameMode * 60 * 1000);
	}

	endGameTimer() {
		try {
			clearTimeout(this.gameTimer);
		} catch (e) { };
	}

	//external emit link
	startGame() {
		this.distributeCards(4, 4, this.delayed_distribute);  //give 4 cards to each of the 4 players
		this.startBid();
		if (this.gameMode != 0) {
			this.startGameTimer();
		}
	}

};

var Rooms = new rooms();

app.use(function (req, res, next) {
	if (req.get('X-Forwarded-Proto') == 'https' || req.hostname == 'localhost') {
		next();
	} else if (req.get('X-Forwarded-Proto') != 'https' && req.get('X-Forwarded-Port') != '443') {
		res.redirect('https://' + req.hostname + req.url);
	}
});
app.use(compression());
app.use(helmet());

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(__dirname + '/public', { maxAge: 3600000 }));//, { maxAge: 1800000 }

http.listen(port, function () {
	console.log(colors.bgBlue.green('Listening on port ' + port));
});

io.on('connection', function (socket) {

	socket.on('disconnect', function () {
	});

	socket.on('roomlist', function () {
		socket.emit('roomlist', Rooms.getRooms());
	});

	socket.on('addroom', function (msg) {
		if (Rooms.addRoom(msg.name, msg.pass, msg.timestamp, msg.mode))
			socket.emit('roomlist', Rooms.getRooms());
	});

	socket.on('login', function (msg) {
		socket.emit('login', Rooms.checkLogin(msg.id, msg.passw, false));
	});

	socket.on('addplayer', function (msg) {
		var reply = Rooms.addPlayer(msg.id, msg.passw, msg.playername, msg.team);
		socket.emit('addplayer', reply);
		if (reply.success == true) {
			socket.join(msg.id);
			var r = Rooms.getTeams(msg.id, msg.passw);
			if (r.s) {
				socket.to(msg.id).emit('prf', r);
				if (r.tp.length + r.tg.length == 4) {
					Rooms.startGamePlay(msg.id, msg.passw);
				}
			}
		}
	});

	socket.on('recon', async function (msg) {
		var emitLog = Rooms.getRoomEmitLog(msg.id, msg.passw);
		if (emitLog == -1)
			return;
		socket.join(msg.id);
		console.log(colors.bgBlue.red(msg.pl + ' reconnected in room ' + msg.id));
		if (parseInt(msg.LM) == 0) {
			var r = Rooms.getTeams(msg.id, msg.passw);
			if (r.s)
				socket.emit('prf', r);
		}
		if (emitLog == -2)
			return;
		console.log(colors.bgBlue.red('Messages to retransmit: ' + (emitLog[0].length - parseInt(msg.LM))));
		for (var i = parseInt(msg.LM) + 1; i <= emitLog[0].length; i++) {
			var xEmit = emitLog[1][i - 1];
			xEmit.recon = true;
			socket.emit(emitLog[0][i - 1], xEmit);
			/*await new Promise(r => setTimeout(r, 150));*/
		}
	});

	socket.on('deleteroom', function (msg) {
		var login = Rooms.checkLogin(msg.id, msg.passw, true);
		if (login.success)
			socket.emit('deleteroom', Rooms.removeRoom(msg.id));
		else if (!login.wrongpass)
			socket.emit('deleteroom', { 'success': false, 'wrongpass': false });
		else
			socket.emit('deleteroom', { 'success': false, 'wrongpass': true });
	});

	socket.on('bid', function (msg) {
		Rooms.sendBidtoRoom(msg.id, msg.passw, msg.ps, msg.am, msg.pl, msg.l, msg.o);
	});

	socket.on('play', function (msg) {
		Rooms.sendPlaytoRoom(msg.id, msg.passw, msg.pl, msg.c, msg.fp);
	});

	socket.on('trump', function (msg) {
		Rooms.sendTrumptoRoom(msg.id, msg.passw, msg.op, msg.pl, msg.s, msg.l);
	});

	socket.on('chat', function (msg) {
		Rooms.sendChat(msg.id, msg.passw, msg.msg);
	});

	socket.on('color', function (msg) {
		Rooms.sendColor(msg.id, msg.passw, msg.val, msg.pl);
	});

	socket.on('hst', function (msg) {
		Rooms.getHistory(socket, msg.idx);
	});

	/* start VoiceServer */
	socket.on('adc', function (msg) {
		Rooms.sendVoice(msg.id, msg.passw, msg.cid, msg.op);
	});
	/* end VoiceServer */

});