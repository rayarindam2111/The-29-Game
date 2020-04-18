var express = require('express'), app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
const colors = require('colors');

class rooms {
	constructor() {
		this.room_count = 0;
		this.room_names = [];
		this.room_passwords = [];
		this.room_timestamps = [];
		this.room_ids = [];
		this.room_teampurple = [];
		this.room_teamgreen = [];
		this.room_game = [];
	}

	addRoom(name,pass,timestamp) {
		this.room_names.push(name);
		this.room_passwords.push(pass);
		this.room_timestamps.push(timestamp);
		this.room_ids.push(name+timestamp);
		this.room_teampurple.push([]);
		this.room_teamgreen.push([]);
		this.room_game.push([]);
		this.room_count += 1;
		console.log(colors.bgBlue.green('Room added: ' + name + timestamp));
	}

	removeRoom(id) {
		var index  = this.room_ids.indexOf(id);
		if (index > -1) {
			this.room_ids.splice(index, 1);
			this.room_names.splice(index, 1);
			this.room_passwords.splice(index, 1);
			this.room_timestamps.splice(index, 1);
			this.room_teampurple.splice(index, 1);
			this.room_teamgreen.splice(index, 1);
			this.room_game.splice(index, 1);
			this.room_count -= 1;
			console.log(colors.bgBlue.red('Room deleted: ' + id));
			return {'success':true};
		}
		else {
			console.log(colors.bgRed.black('Room deletion failed: ' + id));
			return {'success':false,'wrongpass':false};
		}
		  
	}

	getRooms() {
		var users = [];
		for(var i=0;i<this.room_count;i++)
			users.push(this.room_teampurple[i].length + this.room_teamgreen[i].length);

		return {'number':this.room_count,
				'names':this.room_names,
				'timestamps':this.room_timestamps,
				'ids':this.room_ids,
				'users':users
			   };
	}
	
	checkLogin(ID,pass) {
		var index  = this.room_ids.indexOf(ID);
		if(index == -1 || this.room_passwords[index]!==pass)
			return {'success':false};
		else
			return {'success':true,'roomID':this.room_ids[index],'teampurple':this.room_teampurple[index],'teamgreen':this.room_teamgreen[index]};
	}
	
	addPlayer(ID,name,team) {
		var index  = this.room_ids.indexOf(ID);
		if (index > -1) {
			if(team=='purple' && this.room_teampurple[index].length<2){
				var x = this.room_teampurple[index].push(name);
				console.log(colors.bgBlue.green('Player added to team in room: ' + name + '->' + team + '->' + ID));
				return {'success':true,'playerid':(x-1),'teampurple':this.room_teampurple[index],'teamgreen':this.room_teamgreen[index]};
			}
			else if(team=='green' && this.room_teamgreen[index].length<2){
				var x = this.room_teamgreen[index].push(name);
				console.log(colors.bgBlue.green('Player added to team in room: ' + name + '->' + team + '->' + ID));
				return {'success':true,'playerid':(x-1),'teampurple':this.room_teampurple[index],'teamgreen':this.room_teamgreen[index]};
			}
			else {
				console.log(colors.bgRed.black('Player added to team in room failed: ' + name + '->' + team + '->' + ID));
				return {'success':false};
			}
		}
		else {
			console.log(colors.bgRed.black('Player added to team in room failed: ' + name + '->' + team + '->' + ID));
			return {'success':false};
		}
	}
	
	getTeams(ID) {
		var index  = this.room_ids.indexOf(ID);
		if (index > -1) {
			return {'success':true,'teampurple':this.room_teampurple[index],'teamgreen':this.room_teamgreen[index]};
		}
		else
			return {'success':false};
	}
	
	startGamePlay(ID) {
		var index  = this.room_ids.indexOf(ID);
		if (index > -1) {
			this.room_game[index] = new Game(ID);
			console.log(colors.bgBlue.green('Game started for room: ' + ID));
		}
		else
			console.log(colors.bgRed.black('Game start failed for room: ' + ID));
	}
	
	sendBidtoRoom(msg){
		var index  = this.room_ids.indexOf(msg.id);
		if (index > -1) {
			this.room_game[index].bidReceive(msg.passed,msg.amount,msg.player,msg.log,msg.over);
		}
		else
			console.log(colors.bgRed.black('Bid receive error: ' + msg.id));
	}
	
	sendPlaytoRoom(msg) {
		var index  = this.room_ids.indexOf(msg.id);
		if (index > -1) {
			this.room_game[index].nextPlayReceive(msg.player,msg.card,msg.firstplay);
		}
		else
			console.log(colors.bgRed.black('Play receive error: ' + msg.id));
	}
	
	sendTrumptoRoom(msg) {
		var index  = this.room_ids.indexOf(msg.id);
		if (index > -1) {
			if(msg.operation=='open')
				this.room_game[index].trumpOpenReceive(msg.player);
			else if(msg.operation=='set')
				this.room_game[index].trumpSetReceive(msg.player,msg.suit,msg.log);
		}
		else
			console.log(colors.bgRed.black('Trump receive error: ' + msg.id));
	}
	
	sendChat(msg){
		var index  = this.room_ids.indexOf(msg.id);
		if (index > -1) {
			io.in(msg.id).emit('chat', {'msg':msg.msg});	
		}
		else
			console.log(colors.bgRed.black('Chat receive error: ' + msg.id));
	}
};

class Cards {
	constructor() {
		this.values = ['J','9','A','10','K','Q','8','7']; //6 not considered
		this.suits = ['S', 'D', 'C', 'H'];
		this.playable_deck = new Array();
		for(var i = 0; i < this.suits.length; i++)
			for(var x = 0; x < this.values.length; x++)
				this.playable_deck.push(this.values[x]+this.suits[i]);
		this.randomizeCards();
	}
	
	randomizeCards(){
		//randomize playable cards
		for (var i = 0; i < 1000; i++)
		{
			var location1 = Math.floor((Math.random() * this.playable_deck.length));
			var location2 = Math.floor((Math.random() * this.playable_deck.length));
			if(location1!=location2) {
				var tmp = this.playable_deck[location1];
				this.playable_deck[location1] = this.playable_deck[location2];
				this.playable_deck[location2] = tmp;
			}
		}
		
		//check if one person gets all zero points cards
		for(var playernum=0;playernum<4;playernum++){
			var okay = false;
			for(var i=playernum*4;i<playernum*4 + 4;i++)
				if(Cards.cardDetail(this.playable_deck[i]).point!=0)
					{okay=true;break;}
			if(!okay){
				for(var i=playernum*4 + 16;i<playernum*4 + 20;i++)
					if(Cards.cardDetail(this.playable_deck[i]).point!=0)
						{okay=true;break;}
			}
			if(!okay) break;	
		}
		
		if(!okay)
			randomizeCards();
	}
	
	getPlayableCardsRandomized() {
		return this.playable_deck;
	}
	
	static cardDetail(card){
		var suit = card.slice(card.length - 1, card.length);
		var val = card.slice(0, card.length - 1);
		var point = (val=='J'?3:(val=='9'?2:(val=='A'||val=='10'?1:0)));
		var rank;
		switch(val){
			case '7': rank = 1;break;
			case '8': rank = 2;break;
			case 'Q': rank = 3;break;
			case 'K': rank = 4;break;
			case '10': rank = 5;break;
			case 'A': rank = 6;break;
			case '9': rank = 7;break;
			case 'J': rank = 8;break;
			default: rank = -1;
		}
		return {'card':card,'suit':suit,'point':point,'rank':rank};
	}
	
};

class Game {
	constructor(roomID) {
		this.roomID = roomID;
		this.rounds_won = [0,0,0,0]; //total rounds won
		this.delayed_distribute = false;
		this.playerStart = Math.floor((Math.random() * 4));
		this.resetRound();
	}
	
	resetRound() {
		var cardpack = new Cards();
		this.play_deck = cardpack.getPlayableCardsRandomized();
		this.trump_card = '';
		this.trump_open = false;
		this.trump_opener = '';
		this.trump_setter = '';
		
		this.bid_winner = -100;   //final
		this.bid_winner_round = -100;
		this.bid_value = 16;    //final
		this.bid_current_player = [];
		this.bid_next_player = -200;
		this.bid_chances = [0,0,0,0];
		this.bid_list = [0,1,2,3];
		
		this.biddouble = 1; //multiplier //final
		this.biddoubleteam = 'green';    //final
		this.biddoublehits = {'val':0,'log':''};
		this.bidredoublehits = {'val':0,'log':''};
		
		this.current_player = [];
		
		this.lastplayer = '';
		this.lastplayercard = '';
		this.firstcard = [];
		
		this.points = [0,0,0,0];
		this.cards = new Array();
		this.cards_on_table = new Array(); //4 cards on table at any time
		this.winlog = new Array();
		
		for(var i=0;i<4;i++)
			this.cards[i] = new Array();
		this.playerStart = this.nextPlayer(this.playerStart,'clock');
		this.startGame(); //start bidding
	}
	
	nextPlayer(currentPlayer,direction) {
		return (direction=='clock')?((currentPlayer + 1)%4):(((currentPlayer - 1)%4)+4)%4;
	}
	
	nextTeamPlayer(currentPlayer){
		return this.nextPlayer(this.nextPlayer(currentPlayer,'anti'),'anti');
	}
	
	playerFromNumber(number) {
		//0->green0
		//1->purple0
		//2->green1
		//3->purple1
		switch(number)
		{
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
		return player=='green0'?0:(player=='green1'?2:(player=='purple0'?1:(player=='purple1'?3:-1)));
	}

	teamFromNumber(number) {
		return (number%2)?'purple':'green'; 
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

	distributeCards(noOfMembers,cardsPerMember,delay) {
		var cardString = '';
		for(var i=0;i<noOfMembers;i++)
			for(var j=0;j<cardsPerMember;j++)
				this.cards[i].push(this.play_deck.pop());
			
		for(var i=0;i<this.cards.length;i++)
			for(var j=0;j<this.cards[i].length;j++)
				cardString += this.cards[i][j];
			
		io.in(this.roomID).emit('cardstack',{'cards':cardString,'members':noOfMembers,'delay':delay});
	}
	
	bidListRemove(player){
		var index = this.bid_list.indexOf(player);
		if (index > -1)
			this.bid_list.splice(index,1);
		return this.bid_list.length;
	}
		
	nextBidder(player){
		var index = this.bid_list.indexOf(player);
		if (index > -1)
			return this.bid_list[((index+1)%this.bid_list.length)];
		else 
			return -1;
	}
	
	startBid() {
		var playerteam = this.teamFromNumber(this.playerStart);
		this.bid_current_player = this.playerStart;
		var log = 'Bidding started by Team&nbsp;<span class="' + playerteam + '-text">' + playerteam.toUpperCase() + '</span>';
		this.nextBidEmit(this.bid_current_player,this.bid_winner,this.bid_value,true,log,false,this.delayed_distribute);
	}
	
	//external receive link
	bidReceive(passed,amount,player,log,over) {
		if(over.isOver=='doubleend') {
			if(parseInt(over.multiplier)>=this.biddouble){
				this.biddouble = parseInt(over.multiplier);
				this.biddoubleteam = over.team;
			}
			this.biddoublehits.log += (log+'.&nbsp;');
			this.biddoublehits.val += 1;
			if(this.biddoublehits.val == 2){
				if(this.biddouble == 1)
					this.bidOver(this.bid_winner,this.biddoublehits.log);
				else
					this.nextBidEmit('',this.bid_winner,'',false,this.biddoublehits.log,'redouble',0);
				
			}
			return;
		}		
		else if(over.isOver=='redoubleend')
		{
			if(parseInt(over.multiplier)>this.biddouble){
				this.biddouble = parseInt(over.multiplier);
				this.biddoubleteam = over.team;
			}
			
			this.bidredoublehits.log += (log+'.&nbsp;');
			this.bidredoublehits.val += 1;
			
			if(this.bidredoublehits.val == 2){
				this.bidOver(this.bid_winner,this.bidredoublehits.log);
			}

			return;
		}
		
		this.bid_chances[this.numberFromPlayer(player)] = 1;
		if(passed){
			this.bid_winner_round = this.bid_winner;
			if((this.bid_chances.reduce((a, b) => a + b, 0))==4){
				if(this.bid_winner==-100)
					this.bid_winner = this.playerStart;
				this.nextBidEmit(this.bid_current_player,this.bid_winner,this.bid_value,false,log,'settrump',0);
				return;
			}
			this.bid_current_player = this.nextBidder(this.bid_current_player);
			if(this.bid_current_player==this.bid_next_player)
				this.bid_current_player = this.nextBidder(this.bid_current_player);
			this.bidListRemove(this.numberFromPlayer(player));
		}
		else{
			if(this.bid_winner==-100)
				this.bid_winner_round = this.numberFromPlayer(player);
			this.bid_winner = this.numberFromPlayer(player);
			this.bid_value = amount;
			if(this.bid_next_player==-200){
				this.bid_next_player = this.numberFromPlayer(player);
				this.bid_current_player = this.nextBidder(this.bid_current_player);
			}
			else{
				this.bid_current_player = this.bid_next_player;
				this.bid_next_player = this.numberFromPlayer(player);
			}
			if(amount==28 || this.bid_next_player==this.bid_current_player){
				this.nextBidEmit(this.bid_current_player,this.bid_winner,this.bid_value,false,log,'settrump',0);
				return;
			}
		}
		this.nextBidEmit(this.bid_current_player,this.bid_winner_round,this.bid_value,false,log,'none',0);	
	}
	
	nextBidEmit(player,bidwinner,currentbid,firstbid,log,biddouble,delay){
		io.in(this.roomID).emit('bid', {'player':this.playerFromNumber(player),
								'bidwinner':this.playerFromNumber(bidwinner),
								'currentbid':currentbid,
								'firstbid':firstbid,
								'log':log,
								'biddouble':biddouble,
								'delay':delay
		});	
	}
	
	bidOver(player,log) {
		var x = 29 - this.bid_value;
		var teambids = [x,x,x,x];
		teambids[player] = parseInt(this.bid_value);
		teambids[this.nextTeamPlayer(player)] = parseInt(this.bid_value);
		io.in(this.roomID).emit('bidover', {'winner':player,'bidvalues':teambids,'biddouble':this.biddouble,'biddoubleteam':this.biddoubleteam,'log':log});	
		this.distributeCards(4,4,false);
		this.nextPlayEmit(true,this.playerStart,'nl');
	}
	
	nextPlayEmit(firstplay,curPlayer,roundend) {
		this.current_player = curPlayer;
		io.in(this.roomID).emit('play', {'pl':this.playerFromNumber(curPlayer),
								   		 'lp':this.playerFromNumber(this.lastplayer),
								   		 'lpc':this.lastplayercard,
										 'lpac':this.cards[this.lastplayer],
										 'op':{ //options
											 'fp':firstplay,
											 'fc':this.firstcard,
											 'pt':this.points,
											 're':roundend, //'normal','roundover','gameover'
											 'rs':this.rounds_won
										 }
		});
	}
	
	checkM(stack,trump){
		var trumpsuit = Cards.cardDetail(trump).suit;
		var count = 0;
		for(var i=0;i<stack.length;i++)
			if(Cards.cardDetail(stack[i]).suit==trumpsuit)
				if(Cards.cardDetail(stack[i]).val=='K'||Cards.cardDetail(stack[i]).val=='Q')
					count++;
		if(count==2)
			return true;
		else
			return false;
	}
	
	checkMarriage(delay){
		if(this.trump_open)
			for(var i=0;i<4;i++)
				if(this.checkM(this.cards[i],this.trump_card)){
					if(this.teamFromNumber(this.bid_winner)==this.teamFromNumber(i))
						this.bid_value = Math.max(16,this.bid_value-4);
					else
						this.bid_value = Math.min(28,this.bid_value+4);
					
					var x = 29 - this.bid_value;
					var teambids = [x,x,x,x];
					teambids[this.bid_winner] = parseInt(this.bid_value);
					teambids[this.nextTeamPlayer(this.bid_winner)] = parseInt(this.bid_value);
					
					
					io.in(this.roomID).emit('marriage', {'player':this.playerFromNumber(i),'bidvalues':teambids,'biddouble':this.biddouble,'biddoubleteam':this.biddoubleteam,'delay':delay});
					return true;
				}
		return false;
	}	
	
	//external receive link
	nextPlayReceive(player,card,firstplay) {
		if(this.current_player==this.numberFromPlayer(player)){
			this.cards_on_table.push({'player':this.current_player,'card':card});
			this.lastplayer = this.numberFromPlayer(player);
			this.lastplayercard = card;
			var index = this.cards[this.current_player].indexOf(card);
			if (index > -1) 
				this.cards[this.current_player].splice(index,1);
			else
				console.log(colors.bgRed.black('Error removing card from player: ' + card + '->' + player));
	
			if(firstplay)
				this.firstcard = card;
			
			if(this.cards_on_table.length==4){
				var fCard = Cards.cardDetail(this.firstcard);
				var tCard = Cards.cardDetail(this.trump_card);
				var tArr = new Array();
				var tPoints = 0;
				for(var i=0;i<this.cards_on_table.length;i++){
					var card = Cards.cardDetail(this.cards_on_table[i].card);
					if (this.trump_open && card.suit==tCard.suit)
						tArr.push(500+card.rank+card.point);
					else if (card.suit==fCard.suit)
						tArr.push(400+card.rank+card.point);
					else
						tArr.push(300+card.rank+card.point);
					
					tPoints += card.point;
				}

				var winner = this.cards_on_table[this.indexOfMax(tArr)].player; //winner
				
				this.winlog.push(winner);
				
				this.points[winner] += tPoints;
				this.points[this.nextTeamPlayer(winner)] += tPoints;
				
				this.cards_on_table = new Array();
				
				this.checkWin(winner,true);
			}
			else {
				var nextPlayer = this.nextPlayer(this.current_player,'anti');
				this.nextPlayEmit(false,nextPlayer,'nl');
			}
		}
	}
	
	checkWin(winner,fromPlay){
		var round_state = 'nl';//normal
		
		if(this.points[this.bid_winner]>=this.bid_value)
			round_state = this.teamwin(this.bid_winner);
		else if (this.points[this.nextPlayer(this.bid_winner,'anti')] > 28-this.bid_value)
			round_state = this.teamwin(this.nextPlayer(this.bid_winner,'anti'));
		
		if(fromPlay)
			this.nextPlayEmit(true,winner,round_state);
		
		if(round_state == 'ro'){//roundover
			this.resetRound();
		}
		else if(round_state == 'go'){//gameover
			try {
				//delete current room
				io.in(this.roomID).emit('deleteroom',Rooms.removeRoom(this.roomID));
			}
			catch(err) {
				console.log(colors.bgRed.black('Room deletion failed: ' + this.roomID + '\nError: ' + err.message));
			}
		}
		else
			if(fromPlay)
				this.checkMarriage('play');
	}
	
	teamwin(player) {
		this.delayed_distribute = true;
		
		//no pith won
		var rWon = 0;
		for(var i=0;i<this.winlog.length;i++)
			rWon += (this.teamFromNumber(this.winlog[i])==this.teamFromNumber(this.bid_winner));
		var allwin = (rWon==0||rWon==this.winlog.length)?2:1;
		
		
		var inc = (this.teamFromNumber(player)==this.teamFromNumber(this.bid_winner))?1:-1;
		this.rounds_won[this.bid_winner] += (inc*this.biddouble*allwin);
		this.rounds_won[this.nextTeamPlayer(this.bid_winner)] += (inc*this.biddouble*allwin);
				
		var gameEnd = false;
		for(var i=0;i<this.rounds_won.length;i++)
			if(this.rounds_won[i]>=6 || this.rounds_won[i]<=-6){
				gameEnd = true;
				break;
			}
		if(gameEnd)
			return 'go';
		else
			return 'ro';
	}
	
	trumpOpenReceive(player){
		this.trump_open = true;
		this.trump_opener = this.numberFromPlayer(player);
		io.in(this.roomID).emit('trump', {'player':this.playerFromNumber(this.trump_opener),'card':this.trump_card,'operation':'open'});
		var wincheck = this.checkMarriage('trump');
		if(wincheck)
			this.checkWin('',false);
	}
	
	trumpSetReceive(player,suit,log){
		this.trump_setter = this.numberFromPlayer(player);
		var val = Math.floor(Math.random() * (5 - 2 + 1)) + 2; // 2 to 5
		this.trump_card = val + suit;
		io.in(this.roomID).emit('trump', {'player':this.playerFromNumber(this.trump_setter),'card':this.trump_card,'operation':'set'});
		this.nextBidEmit(this.bid_player,this.bid_winner,this.bid_value,false,log,'double',0);
	}

	//external emit link
	startGame() {
		this.distributeCards(4,4,this.delayed_distribute);  //give 4 cards to each of the 4 players
		this.startBid();
	}
	
};

var Rooms = new rooms();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(__dirname + '/public'));

http.listen(port, function(){
	console.log(colors.bgYellow.black('The 29 Game.\nCopyright Arindam Ray, 2020.\nListening on port ' + port));
});

io.on('connection', function(socket){
  
  socket.on('disconnect', function(){

  });
  
  socket.on('roomlist', function(){
    socket.emit('roomlist',Rooms.getRooms());
  });
  
  socket.on('addroom', function(msg){
	Rooms.addRoom(msg.name,msg.pass,msg.timestamp);
	socket.emit('roomlist',Rooms.getRooms());
  });
  
  socket.on('login', function(msg){
	socket.emit('login',Rooms.checkLogin(msg.id,msg.passw));
  });
  
  socket.on('addplayer', function(msg){
	var reply = Rooms.addPlayer(msg.id,msg.playername,msg.team);
	socket.emit('addplayer',reply);
	if(reply.success==true){
		socket.join(msg.id);
		var r = Rooms.getTeams(msg.id);
		if(r.success){
			socket.to(msg.id).emit('playerrefresh', r );
			if(r.teampurple.length+r.teamgreen.length==4)
			{
				Rooms.startGamePlay(msg.id);
			}
		}
	}
  });
  
  socket.on('deleteroom', function(msg){
	var check = Rooms.checkLogin(msg.id,msg.passw);
	if(check.success == true)
		socket.emit('deleteroom',Rooms.removeRoom(msg.id));
	else
		socket.emit('deleteroom',{'success':false,'wrongpass':true});
  });
  
  socket.on('bid', function(msg){
	Rooms.sendBidtoRoom(msg);
  });
  
  socket.on('play', function(msg){
	Rooms.sendPlaytoRoom(msg);
  });
  socket.on('trump', function(msg){
		Rooms.sendTrumptoRoom(msg);
  });
  socket.on('chat', function(msg){
		Rooms.sendChat(msg);
  });
  
});