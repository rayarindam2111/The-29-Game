//DOM interactions
function arrayRotate(arr, count) {
	count -= arr.length * Math.floor(count / arr.length);
	arr.push.apply(arr, arr.splice(0, count));
}

const encodeHTML = (input) => {
	return $('<div/>').text(input).html();
}
/*
function encodeHTML(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
*/

function checkSpChars(t) {
	return !(t.indexOf('&') == -1 && t.indexOf('<') == -1 && t.indexOf('>') == -1);
}

function playerFromNumber(number) {
	//0->green0
	//1->purple0
	//2->green1
	//3->purple1
	switch (parseInt(number)) {
		case 0: return { 'player': 'green0', 'id': 0, 'team': 'green' };
		case 1: return { 'player': 'purple0', 'id': 0, 'team': 'purple' };
		case 2: return { 'player': 'green1', 'id': 1, 'team': 'green' };
		case 3: return { 'player': 'purple1', 'id': 1, 'team': 'purple' };
	}
}

function numberFromPlayer(player) {
	//green0->0
	//purple0->1
	//green1->2
	//purple1->3
	return player == 'green0' ? 0 : (player == 'green1' ? 2 : (player == 'purple0' ? 1 : (player == 'purple1' ? 3 : -1)));
}

function indexOfMax(arr) {
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

function timeout(percent, elem, team, first) {
	var icircle = percent * 360 / 100;
	var c1 = (team == 'green') ? '#a0ce90' : '#c5c2cb';
	var c2 = (team == 'green') ? '#127513' : '#4d2c91';
	if (first)
		$(elem).css('background-color', c1);
	(icircle <= 180) ? $(elem).css('background-image', 'linear-gradient(' + (90 + icircle) + 'deg, transparent 50%, ' + c2 + ' 50%),linear-gradient(90deg, ' + c2 + ' 50%, transparent 50%)') : $(elem).css('background-image', 'linear-gradient(' + (icircle - 90) + 'deg, transparent 50%, ' + c1 + ' 50%),linear-gradient(90deg, ' + c2 + ' 50%, transparent 50%)');
}

function changeMode(mode) {
	var gap = 50;
	var sortingArray = gVars.allcards.slice();
	if (mode == 'sort')
		sortingArray.sort(function (a, b) {
			var aCard = cardDetail(a);
			var bCard = cardDetail(b);
			var aVal = aCard.rank + (aCard.suit == 'H' ? 500 : aCard.suit == 'S' ? 400 : aCard.suit == 'D' ? 300 : 200);
			var bVal = bCard.rank + (bCard.suit == 'H' ? 500 : bCard.suit == 'S' ? 400 : bCard.suit == 'D' ? 300 : 200);
			return bVal - aVal;
		});

	var result = $('#bottomcardbox>.playercards');
	var cs = [];
	for (var i = 0; i < result.length; i++)
		cs.push($(result[i]).attr('card'));

	for (var i = 0; i < sortingArray.length; i++) {
		var pos = cs.indexOf(sortingArray[i]);
		$(result[pos]).css('left', i * gap).css('z-index', i + 10);
	}
}

function generateStack(cards, box, color) {
	var gap = 50;
	var imagewidth = 118;
	var imageheight = 180;
	$(box).html('');
	if (color == 'nocolor') {
		gVars.allcards = cards.slice();
		if (gVars.showMode == 'sort')
			cards.sort(function (a, b) {
				var aCard = cardDetail(a);
				var bCard = cardDetail(b);
				var aVal = aCard.rank + (aCard.suit == 'H' ? 500 : aCard.suit == 'S' ? 400 : aCard.suit == 'D' ? 300 : 200);
				var bVal = bCard.rank + (bCard.suit == 'H' ? 500 : bCard.suit == 'S' ? 400 : bCard.suit == 'D' ? 300 : 200);
				return bVal - aVal;
			});
		try {
			$('.tooltipped').tooltip('destroy');
			$('.material-tooltip').remove();
		}
		catch (e) {
		}
		for (var i = 0; i < cards.length; i++)
			$(box).append('<div class="playercards tooltipped ' + (gVars.card7 == cards[i] ? 'card7' : '') + '" data-position="top" data-tooltip="P: ' + cardDetail(cards[i]).point + '" style="left:' + (i * gap) + 'px;background-image:url(img/cards/' + cards[i] + '.PNG);z-index:' + (i + 10) + ';" card="' + cards[i] + '"></div>');
		var elems = document.querySelectorAll('.tooltipped');
		M.Tooltip.init(elems, { enterDelay: 0, exitDelay: 0, inDuration: 150, outDuration: 150 });
	}
	else
		for (var i = 0; i < cards.length; i++)
			$(box).append('<div class="playercards" style="left:' + (i * gap) + 'px;background-image:url(img/cards/' + color.toUpperCase() + '_BACK.PNG);z-index:' + (i + 10) + ';"></div>');
	var totWidth = imagewidth + (cards.length - 1) * gap;
	$(box).css('width', (totWidth) + 'px');
	$(box).css('padding-left', '5px');
	$(box).css('padding-right', '5px');
	if (box == '#leftcardbox') $(box).css('margin-left', (imageheight / 2 - totWidth / 2) + 'px');
	if (box == '#rightcardbox') $(box).css('margin-right', (imageheight / 2 - totWidth / 2) + 'px');
}

function sock_up_poprooms() {
	$('.rooms-notloaded').hide();
	$('#divroom').show();
	socket.emit('roomlist', '');
}

function initModals() {
	$('#modal-roomlist').modal({
		dismissible: false,
		onOpenStart: function (modal, trigger) {
			sock_up_poprooms();
			$('#chatopen').removeClass('scale-in');
			$('#chatopen').hide();
		}
	});
	$('#modal-joingame').modal({
		dismissible: false,
		onOpenStart: function (modal, trigger) {
			$('#modal-credits').modal('close');
			$('#joingame').removeAttr('disabled');
		}
	});
	$('#modal-bid').modal({
		dismissible: false,
		onOpenEnd: function (modal, trigger) {
			$('.tabs').tabs('updateTabIndicator');
		},
		onOpenStart: function (modal, trigger) {
			resetRound();
			$('#modal-chat').modal('close');
			$('#modal-share').modal('close');
		}
	});
	$('#modal-trumpyesno').modal({
		dismissible: true
	});
	$('#modal-gameover').modal({
		dismissible: false,
		onOpenStart: function (modal, trigger) {
			$('#modal-chat').modal('close');
			$('#chatopen').hide();
		}
	});
	$('#modal-credits').modal({
		dismissible: true,
		onOpenStart: function (modal, trigger) {
			canvasLoad(true);
		},
		onCloseEnd: function (modal, trigger) {
			canvasLoad(false);
		}
	});
	$('#modal-chat').modal({
		dismissible: true,
		onOpenEnd: function (modal, trigger) {
			$("#chatmessage").focus();
		}
	});
	$('#modal-share').modal({
		dismissible: true
	});
}

function resetRound() {
	clearInterval(gVars.timer);
	for (var i = 0; i < 4; i++) {
		var t = playerFromNumber(i);
		timeout(0, elemfromidteam('#', 'time', t.player), t.team, false);
	}
	$('#bidlog').html('');
	$('#trumpsetok').attr('disabled', '');
	$('.trumpshow').hide();
	$('.boxes>div').removeClass('mvboxes');
	gVars.sound_turn.stop();
	gVars.allcards = [];
	gVars.trumpOpen = false;
}

$('#trumpOpt>li').click(function () {
	$('#trumpsetok').removeAttr('disabled');
});

$("#roomrefresh").click(function () {
	sock_up_poprooms();
});

$('#form-addroom').submit(function () {
	var usr = $('#room_NEW').val();
	var pass = $('#room_NEW_pass').val();
	var timestamp = Date.now();
	if (usr.trim() == "" || checkSpChars(usr)) {
		$('#room_NEW').val('');
		$('#room_NEW_pass').val('');
		return false;
	}
	if (pass.trim() == "") {
		$('#room_NEW_pass').val('');
		return false;
	}
	$('.rooms-notloaded').hide();
	$('#divroom').show();
	socket.emit('addroom', { 'name': usr, 'pass': pass, 'timestamp': timestamp });
	$('#room_NEW').val('');
	$('#room_NEW_pass').val('');
	$('#addroomdock').click();
	return false;
});

$('#form-chat').submit(function () {
	if ($("#chatmessage").val().trim() == "")
		return false;
	var msg = '<' + gVars.myteam + '>' + gVars.myname + ':&nbsp;</' + gVars.myteam + '>&nbsp;' + encodeHTML($("#chatmessage").val());
	$("#chatmessage").val('');
	socket.emit('chat', { 'id': gVars.curRoomID, 'msg': msg });
	return false;
});

$('#backtoroomlist').click(function () {
	$('#modal-joingame').modal('close');
	$('#modal-roomlist').modal('open');
	return false;
});

$('#joingame').click(function () {
	var usrN = $('#username').val();
	if (usrN.trim() == "" || checkSpChars(usrN)) {
		$('#username').val('');
		M.toast({ html: 'Name cannot be blank or have special characters', displayLength: 3000 });
		return false;
	}
	gVars.myname = usrN;
	gVars.myteam = $("#teamselect").val();
	M.toast({ html: 'Joining Game...', displayLength: 3000 });
	$('#joingame').attr('disabled', '');
	socket.emit('addplayer', { 'id': gVars.curRoomID, 'playername': gVars.myname, 'team': gVars.myteam });
	return false;
});

function roomenter_submit() {
	$('.roomenter').submit(function (event) {
		gVars.currentlogin = event.target;
		var roomID = $(event.target).find("input[name=roomID]").val();
		var passw = $(event.target).find("input[name=roomPASS]").val();
		$(event.target).find("button").prop('disabled', true);
		socket.emit('login', { 'id': roomID, 'passw': passw });
		return false;
	});

	$('.deleteroom').click(function (event) {
		gVars.currentlogin = event.target.parentNode;
		var roomID = $(event.target.parentNode).find("input[name=roomID]").val();
		var passw = $(event.target.parentNode).find("input[name=roomPASS]").val();
		$(event.target).attr('disabled', '');
		socket.emit('deleteroom', { 'id': roomID, 'passw': passw });
		return false;
	});
}

function joingame() {
	$('#chatopen').show();
	$('#chatopen').addClass('scale-in');
	playscreenTeamUpdate();
	if (gVars.myteam == 'green') {
		$('#playMove').removeClass('white');
		$('#playMove').addClass('green');
	}
	else {
		$('#playMove').removeClass('white');
		$('#playMove').addClass('purple');
	}
	for (var i = 0; i < 4; i++) {
		var t = playerFromNumber(i);
		timeout(0, elemfromidteam('#', 'time', t.player), t.team, true);
	}
	document.title = 'The 29 Game - [' + gVars.myname + ']';
	window.onbeforeunload = function () {
		return "Are you sure you want to leave the game?";
	}
	if (!gVars.isMobile) {
		var full = document.documentElement;
		if (full.requestFullscreen)
			full.requestFullscreen();
		else if (full.mozRequestFullScreen)
			full.mozRequestFullScreen();
		else if (full.webkitRequestFullscreen)
			full.webkitRequestFullscreen();
		else if (full.msRequestFullscreen)
			full.msRequestFullscreen();
	}
	gVars.matchRunning = true;
}

function teamselectrefresh() {
	if (gVars.purpleplayers.length > 0)
		text = 'Team Purple - (Players: ' + gVars.purpleplayers + ')';
	else
		text = 'Team Purple - No Players';
	$('#optpurple').html(text);
	if (gVars.purpleplayers.length == 2)
		$('#optpurple').prop('disabled', true);
	else
		$('#optpurple').prop('disabled', false);

	if (gVars.greenplayers.length > 0)
		text = 'Team Green - (Players: ' + gVars.greenplayers + ')';
	else
		text = 'Team Green - No Players';
	$('#optgreen').html(text);
	if (gVars.greenplayers.length == 2)
		$('#optgreen').prop('disabled', true);
	else
		$('#optgreen').prop('disabled', false);
	$('#teamselect').formSelect();
}

function elemfromidteam(selector, suffix, teamAndID) {
	var carr = ['green0', 'purple0', 'green1', 'purple1']; //order of play
	var direction = ['w', 'n', 'e', 's'];
	arrayRotate(direction, carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	//direction.rotate(carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	var indexPos = carr.indexOf(teamAndID);
	switch (direction[indexPos]) {
		case 'w': return selector + 'left' + suffix;
			break;
		case 'n': return selector + 'top' + suffix;
			break;
		case 'e': return selector + 'right' + suffix;
			break;
		case 's': return selector + 'bottom' + suffix;
			break;
	}
}

function playscreenTeamUpdate() {
	for (var i = 0; i < gVars.greenplayers.length; i++)
		$(elemfromidteam('#', 'name', 'green' + i) + '>div>h5').html(gVars.greenplayers[i]);
	for (var i = 0; i < gVars.purpleplayers.length; i++)
		$(elemfromidteam('#', 'name', 'purple' + i) + '>div>h5').html(gVars.purpleplayers[i]);
}

$('#bottomcardbox').click(function (event) {
	var clickedCard = event.target;
	if ($(clickedCard).attr('id') == 'bottomcardbox')
		return false;
	$('#bottomcardbox>*').removeClass('cardselected');
	$(clickedCard).addClass('cardselected');
	$('#playMove').removeAttr('disabled');
	gVars.currentCard = $(clickedCard).attr('card');
	return false;
});

$('#bidrange').on('input', function () {
	$('#bidupdate').html($('#bidrange').val());
});

function bidProcess(data) {
	$('#bidlog').append('<li class="collection-item flexcenter"><i class="material-icons">chevron_right</i>'
		+ data.l
		+ '</li>');

	if (data.bd == 'ST') {
		if (gVars.myteam + gVars.myUserID == data.bw) {
			$('#trumpset').show();
			$("#modal-bid>.modal-content").scrollTop($("#modal-bid>.modal-content")[0].scrollHeight);
		}
		else
			$('#trumpset').hide();
		return;
	}
	else if (data.bd == 'D') {
		gVars.bidDouble = 'D';
		$('#doubletext').html('Double');
		$('#biddoubleopt').html('<label><input name="groupD" type="radio" value="1" checked /><span>Pass</span></label>&nbsp;&nbsp;&nbsp;&nbsp;<label><input name="groupD" type="radio" value="2" /><span>Double</span></label>');
		var winner = playerFromNumber(numberFromPlayer(data.bw));
		if (gVars.myteam != winner.team) {
			$('#biddouble').show();
			$("#modal-bid>.modal-content").scrollTop($("#modal-bid>.modal-content")[0].scrollHeight);
		}
		else
			$('#biddouble').hide();
		return;
	}
	else if (data.bd == 'RD') {
		gVars.bidDouble = 'R';
		$('#doubletext').html('Redouble');
		$('#biddoubleopt').html('<label><input name="groupD" type="radio" value="1" checked /><span>Pass</span></label>&nbsp;&nbsp;&nbsp;&nbsp;<label><input name="groupD" type="radio" value="4" /><span>Redouble</span></label>');
		var winner = playerFromNumber(numberFromPlayer(data.bw));
		if (gVars.myteam == winner.team) {
			$('#biddouble').show();
			$("#modal-bid>.modal-content").scrollTop($("#modal-bid>.modal-content")[0].scrollHeight);
		}
		else
			$('#biddouble').hide();
		return;
	}
	else
		$('#biddouble').hide();

	var player = gVars.myteam + gVars.myUserID;
	gVars.currentBid = data.cb;

	if (data.pl == player) {
		if (data.bw == player || data.bw == '-100') {
			$('#bidrange').attr('min', parseInt(data.cb)).attr('value', parseInt(data.cb)).val(parseInt(data.cb));
			$('#bidupdate').html(parseInt(data.cb));
			gVars.raiseOrMatch = 'matched bid to&nbsp;';
		}
		else {
			$('#bidrange').attr('min', parseInt(data.cb) + 1).attr('value', parseInt(data.cb) + 1).val(parseInt(data.cb) + 1);
			$('#bidupdate').html(parseInt(data.cb) + 1);
			gVars.raiseOrMatch = 'raised bid to&nbsp;';
		}
		if (data.bw == '-100')
			gVars.raiseOrMatch = 'started bid at&nbsp;';
		$('#bidchange').show();
		$("#modal-bid>.modal-content").scrollTop($("#modal-bid>.modal-content")[0].scrollHeight);
		var event = new CustomEvent('mousedown', {});
		document.getElementById('bidrange').dispatchEvent(event);
	}
	else
		$('#bidchange').hide();
}

$('#bidraise').click(function () {
	$('#bidchange').hide();
	if (gVars.raiseOrMatch == 'matched bid to&nbsp;' && parseInt($('#bidrange').attr('min')) != parseInt($('#bidrange').val()))
		gVars.raiseOrMatch = 'raised bid to&nbsp;';
	socket.emit('bid', { 'id': gVars.curRoomID, 'ps': false, 'am': $('#bidrange').val(), 'pl': gVars.myteam + gVars.myUserID, 'l': '<' + gVars.myteam + '>' + gVars.myname + '</' + gVars.myteam + '>&nbsp;' + gVars.raiseOrMatch + '<red>' + $('#bidrange').val() + '</red>', 'o': { 'iO': '' } });
	return false;
});

$('#bidpass').click(function () {
	$('#bidchange').hide();
	socket.emit('bid', { 'id': gVars.curRoomID, 'ps': true, 'am': $('#bidrange').val(), 'pl': gVars.myteam + gVars.myUserID, 'l': '<' + gVars.myteam + '>' + gVars.myname + '</' + gVars.myteam + '>&nbsp;passed the bid', 'o': { 'iO': '' } });
	return false;
});

$('#biddoubleok').click(function () {
	$('#biddouble').hide();
	var m = parseInt($('input[name="groupD"]:checked').val());
	var t = gVars.bidDouble == 'D' ? 'double' : 'redouble';
	var textm = (m == 1) ? 'did not ' + t : ((m == 2) ? 'doubled' : 'redoubled');
	socket.emit('bid', { 'id': gVars.curRoomID, 'ps': '', 'am': '', 'pl': gVars.myteam + gVars.myUserID, 'l': '<' + gVars.myteam + '>' + gVars.myname + '</' + gVars.myteam + '>&nbsp;' + textm, 'o': { 'iO': gVars.bidDouble, 'm': m, 't': gVars.myteam } });
	return false;
});

$('#playMove').click(function () {
	$('#playMove').attr('disabled', '');
	socket.emit('play', { 'id': gVars.curRoomID, 'pl': gVars.myteam + gVars.myUserID, 'c': gVars.currentCard, 'fp': gVars.firstplay });
	//cardPlayed(gVars.myteam+gVars.myUserID,gVars.currentCard);
	return false;
});

$('#changeView').click(function () {
	if (gVars.showMode == 'sort')
		gVars.showMode = 'orig';
	else
		gVars.showMode = 'sort';
	changeMode(gVars.showMode);
	return false;
});

$('#trumpyes').click(function () {
	$('#bottomcardbox').addClass('carddisabled');
	$('#modal-trumpyesno').modal('close');
	socket.emit('trump', { 'id': gVars.curRoomID, 'pl': gVars.myteam + gVars.myUserID, 'op': 'open' });
	return false;
});

$('#trumpsetok').click(function () {
	$('#trumpset').hide();
	var tIndex = document.getElementById('trumpOpt').M_Tabs.index;
	var tSuit = tIndex == 0 ? 'H' : tIndex == 1 ? 'S' : tIndex == 2 ? 'D' : tIndex == 3 ? 'C' : '7';
	socket.emit('trump', { 'id': gVars.curRoomID, 'pl': gVars.myteam + gVars.myUserID, 's': tSuit, 'op': 'set', 'l': '<' + gVars.myteam + '>' + gVars.myname + '</' + gVars.myteam + '>&nbsp;set the Trump' });
	return false;
});

$('#trumpno').click(function () {
	$('#modal-trumpyesno').modal('close');
	return false;
});

$('#trumpcard').click(function () {
	$('#modal-trumpyesno').modal('open');
	return false;
});

$('#chatopen').click(function () {
	$('#modal-chat').modal('open');
	return false;
});

$('#credits').click(function () {
	$('#modal-credits').modal('open');
	return false;
});

$('#closeShare').click(function () {
	$('#modal-share').modal('close');
	return false;
});

$('#closeCredits').click(function () {
	$('#modal-credits').modal('close');
	return false;
});

$('#modal-chat>div.modal-footer>div').click(function (e) {
	if (!$(e.target).hasClass('chip'))
		return false;
	var msg = '<' + gVars.myteam + '>' + gVars.myname + ':&nbsp;</' + gVars.myteam + '>&nbsp;<red>' + encodeHTML($(e.target).html()) + '</red>';
	socket.emit('chat', { 'id': gVars.curRoomID, 'msg': msg });
	$('#modal-chat>div.modal-footer>div').addClass('carddisabled');
	setTimeout(function () { $('#modal-chat>div.modal-footer>div').removeClass('carddisabled') }, 3000);
	return false;
});

function cardDetail(card) {
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
	return { 'card': card, 'suit': suit, 'point': point, 'rank': rank };
}

function checkSuitEnable(arr, val) {
	return arr.some(function (arrVal) {
		return val === arrVal;
	});
}

function hasSuit(suit, incCard7) {
	for (var i = 0; i < $('#bottomcardbox>.playercards').length; i++) {
		var elem = $('#bottomcardbox>.playercards')[i];
		if (incCard7 && $(elem).hasClass('card7'))
			continue;
		var card = cardDetail($(elem).attr('card'));
		if (suit == card.suit)
			return true;
	}
	return false;
}

function onlycard7left() {
	var flag = false;
	var length = $('#bottomcardbox>.playercards').length;
	for (var i = 0; i < length; i++) {
		var elem = $('#bottomcardbox>.playercards')[i];
		if ($(elem).hasClass('card7')) {
			flag = true;
			break;
		}
	}
	return (length == 1) && flag;
}

function enableCards(suits) {
	for (var i = 0; i < $('#bottomcardbox>.playercards').length; i++) {
		var elem = $('#bottomcardbox>.playercards')[i];
		var card = cardDetail($(elem).attr('card'));
		$(elem).removeClass('cardselected');
		if (checkSuitEnable(suits, card.suit)) {
			$(elem).removeClass('carddisabled').addClass('movable');
		}
		else {
			$(elem).addClass('carddisabled').removeClass('movable');
		}
	}
}

function cardPlayed(player, card, deckcards) {
	if (player == '' || card == '' || deckcards == [])
		return;
	var unqIndex = gVars.myteam + gVars.myUserID;
	var cur = playerFromNumber(numberFromPlayer(player));
	$(elemfromidteam('#', 'table', player)).css('z-index', gVars.currentPlayerPos * 10);
	$(elemfromidteam('#', 'table', player) + '>img').attr('src', 'img/cards/' + card + '.PNG');
	$(elemfromidteam('#', 'table', player)).show();
	gVars.sound_play.play();
	generateStack(deckcards, elemfromidteam('#', 'cardbox', cur.player), unqIndex == cur.player ? 'nocolor' : cur.team);
}

function buildcardstack(data) {
	var unqIndex = gVars.myteam + gVars.myUserID;
	for (var i = 0; i < data.length; i++) {
		var player = playerFromNumber(i);
		generateStack(data[i], elemfromidteam('#', 'cardbox', player.player), unqIndex == player.player ? 'nocolor' : player.team);
	}
	$('#bottomcardbox').addClass("animcards");
	$('#topcardbox').addClass("animcards");
	$('#leftcardbox').addClass("animcards");
	$('#rightcardbox').addClass("animcards");
	M.toast({ html: 'Cards distributed - 4', displayLength: 2000 });
	$('#changeView').removeAttr('disabled');
}

function enableTrump(select) {
	if (!select)
		$('#trumpcard').addClass('carddisabled');
	else
		$('#trumpcard').removeClass('carddisabled');
}

function playProcess(data) {
	if (data.op.re == 'ro') {
		M.toast({ html: 'New Round', displayLength: 2000 });
		gVars.card7 = '';
	}
	else if (data.op.re == 'go') {
		gVars.matchRunning = false;
		M.toast({ html: 'Game Over', displayLength: 2000 });
		window.onbeforeunload = null;
	}

	enableTrump(false);
	gVars.sound_turn.stop();
	var player = gVars.myteam + gVars.myUserID;
	clearInterval(gVars.timer);
	for (var i = 0; i < 4; i++) {
		var t = playerFromNumber(i);
		timeout(0, elemfromidteam('#', 'time', t.player), t.team, false);
	}

	if (data.op.fp) {
		setTimeout(function () {
			if (data.op.re == 'go') {
				var winner = playerFromNumber(indexOfMax(data.op.rs)).team;
				$('#winmessage').html('<span class="' + winner + '-text">Team ' + winner.toUpperCase() + '</span> wins the game.');
				var text = '<table><thead><tr><th>Player Name</th><th>Rounds</th></tr></thead><tbody>';
				for (var i = 0; i < 4; i++) {
					//mark
					var xName = playerFromNumber(i);
					if (xName.team == 'green')
						xName.player = gVars.greenplayers[xName.id];
					else
						xName.player = gVars.purpleplayers[xName.id];
					text += '<tr><td><span class="' + xName.team + '-text">' + xName.player + '</span></td><td><span class="red-text">' + data.op.rs[i] + '</span></td></tr>';
				}
				$('#winmessage').append(text + '</tbody></table>');
				$('#modal-gameover').modal('open');
			}

			for (var i = 0; i < 4; i++) {
				var p = elemfromidteam('#', 'point', playerFromNumber(i).player);
				var r = elemfromidteam('#', 'round', playerFromNumber(i).player);
				var memp = $(p).html();
				var memr = $(r).html();
				$(p).html(data.op.pt[i]);
				$(r).html(data.op.rs[i]);
				if ($(p).html() != memp)
					zio(p);
				if ($(r).html() != memr)
					zio(r);
			}
			gVars.currentPlayerPos = 0;
			$('.centerplay').hide();
			$('.centerplay>img').attr('src', '');
			if (player == data.pl) {
				$('#bottomcardbox').removeClass('carddisabled');
				if (data.op.re == 'nl')
					M.toast({ html: 'Your turn', displayLength: 2000 });
			}
			if (data.op.re != 'go')
				startTimer(data, player);
		}, (data.lp == '') ? 0 : 1500);
	}
	else {
		if (player == data.pl) {
			$('#bottomcardbox').removeClass('carddisabled');
			if (data.op.re == 'nl')
				M.toast({ html: 'Your turn', displayLength: 2000 });
		}
		startTimer(data, player);
	}

	gVars.currentPlayerPos = gVars.currentPlayerPos + 1;
	cardPlayed(data.lp, data.lpc, data.lpac);

	if (player == data.pl) {
		if (data.op.fp) {
			gVars.firstplay = true;
			enableCards(['S', 'C', 'H', 'D']);
		}
		else {
			gVars.firstplay = false;
			var playSuit = cardDetail(data.op.fc);
			if (hasSuit(playSuit.suit, gVars.card7 != 'f' && !gVars.trumpOpen)) {
				enableCards([playSuit.suit]);
			}
			else {
				if (!gVars.trumpOpen)
					enableTrump(true);
				enableCards(['S', 'C', 'H', 'D']);
			}
		}
		if (gVars.card7 != 'f' && !(onlycard7left() || gVars.trumpOpen))
			$('.card7').addClass('carddisabled').removeClass('movable');
	}
	else {
		$('#bottomcardbox').addClass('carddisabled');
		$('#playMove').attr('disabled', '');
	}
}

function startTimer(data, player) {
	gVars.timerCount = 0;
	var telem = elemfromidteam('#', 'time', data.pl);
	//mark
	var xName = playerFromNumber(numberFromPlayer(data.pl));
	if (xName.team == 'green')
		xName.player = gVars.greenplayers[xName.id];
	else
		xName.player = gVars.purpleplayers[xName.id];

	$('.boxes>div').removeClass('mvboxes');
	$(elemfromidteam('.', '-box>div', data.pl)).addClass('mvboxes');
	if (player == data.pl)
		gVars.sound_turn.play();

	gVars.timer = setInterval(function () {
		gVars.timerCount = (gVars.timerCount + .5) % 100;
		if (gVars.timerCount == 99)
			if (player == data.pl)
				M.toast({ html: 'Please play a card', classes: 'red darken-1', displayLength: 3000 });
			else
				M.toast({ html: xName.player + ' has not played a card for a long time', classes: 'red darken-1', displayLength: 3000 });
		timeout(gVars.timerCount, telem, xName.team, false);
	}, 300);
}

function zio(elem) {
	$(elem).removeClass('zio');
	setTimeout(function () { $(elem).addClass('zio'); }, 50);
}

var gVars = {
	curRoomID: '',     // abc12395829472
	curRoomName: '',   // abc - only room name
	curRoomPass: '',   // pY7hjbas& - only room pass
	currentlogin: '',  // HTML element for login
	purpleplayers: '', // ['pPlayer1','pPlayer2']
	greenplayers: '',  // ['gPlayer1','gPlayer2']
	myname: '',        // Current username
	myteam: '',        // 'purple' or 'green'
	myUserID: '',      // 0 or 1 based on location in array
	currentCard: '',   // 3C, current card selected
	currentBid: '',     // 21, current bid value
	raiseOrMatch: '',   // bid raise or match
	bidDouble: '',     // 'double' or 'redouble'
	trumpOpen: '',     // true or false, trump is open or not
	currentPlayerPos: '', // 0,1,2,3 tracks cards on center table
	firstplay: '',     // if first play
	timerCount: '',    // counter timer 0-100
	timer: '',         // timer element
	trumpSetter: '',   // player who set trump (green0,purple1 etc.)
	sound_turn: '',    // sound for player turn
	sound_play: '',    // sound for player play
	isMobile: '',	    // if device is a mobile device
	matchRunning: '',  // true/false, if a match has started & is running
	sockMsgCount: '',  // socket msg received count
	card7: '',         // 7th card, '' if not used
	showMode: '',      // 'sort', 'original' : cards shown in deck

	set curRoomID(data) {
		curRoomID = data;
	},
	get curRoomID() {
		return curRoomID;
	},
	set curRoomName(data) {
		curRoomName = data;
	},
	get curRoomName() {
		return curRoomName;
	},
	set curRoomPass(data) {
		curRoomPass = data;
	},
	get curRoomPass() {
		return curRoomPass;
	},
	set currentlogin(data) {
		currentlogin = data;
	},
	get currentlogin() {
		return currentlogin;
	},
	set purpleplayers(data) {
		purpleplayers = data;
	},
	get purpleplayers() {
		return purpleplayers;
	},
	set greenplayers(data) {
		greenplayers = data;
	},
	get greenplayers() {
		return greenplayers;
	},
	set myname(data) {
		myname = data;
	},
	get myname() {
		return myname;
	},
	set myteam(data) {
		myteam = data;
	},
	get myteam() {
		return myteam;
	},
	set myUserID(data) {
		myUserID = data;
	},
	get myUserID() {
		return myUserID;
	},
	set currentCard(data) {
		currentCard = data;
	},
	get currentCard() {
		return currentCard;
	},
	set currentBid(data) {
		currentBid = data;
	},
	get currentBid() {
		return currentBid;
	},
	set raiseOrMatch(data) {
		raiseOrMatch = data;
	},
	get raiseOrMatch() {
		return raiseOrMatch;
	},
	set bidDouble(data) {
		bidDouble = data;
	},
	get bidDouble() {
		return bidDouble;
	},
	set trumpOpen(data) {
		trumpOpen = data;
	},
	get trumpOpen() {
		return trumpOpen;
	},
	set currentPlayerPos(data) {
		currentPlayerPos = data;
	},
	get currentPlayerPos() {
		return currentPlayerPos;
	},
	set firstplay(data) {
		firstplay = data;
	},
	get firstplay() {
		return firstplay;
	},
	set timerCount(data) {
		timerCount = data;
	},
	get timerCount() {
		return timerCount;
	},
	set timer(data) {
		timer = data;
	},
	get timer() {
		return timer;
	},
	set trumpSetter(data) {
		trumpSetter = data;
	},
	get trumpSetter() {
		return trumpSetter;
	},
	set sound_turn(data) {
		sound_turn = data;
	},
	get sound_turn() {
		return sound_turn;
	},
	set sound_play(data) {
		sound_play = data;
	},
	get sound_play() {
		return sound_play;
	},
	set isMobile(data) {
		isMobile = data;
	},
	get isMobile() {
		return isMobile;
	},
	set matchRunning(data) {
		matchRunning = data;
	},
	get matchRunning() {
		return matchRunning;
	},
	set sockMsgCount(data) {
		sockMsgCount = data;
	},
	get sockMsgCount() {
		return sockMsgCount;
	},
	set card7(data) {
		card7 = data;
	},
	get card7() {
		return card7;
	},
	set showMode(data) {
		showMode = data;
	},
	get showMode() {
		return showMode;
	}
};

function vh() {
	return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
}
function vw() {
	return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
}
function shiftzoom(large, small) {
	return ((vh() / vw()) < 1.1) ? (vw() / large) : (vh() / large);
}

//socket functions only
gVars.matchRunning = false;
var socket = io();

socket.on('roomlist', function (data) {
	gVars.currentlogin = '';
	$('#rooms-list').html('');
	for (var i = 0; i < data.number; i++) {
		var d = new Date(data.timestamps[i]);
		var timest = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '  ' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
		$('#rooms-list').append('<li><div class="collapsible-header"><i class="material-icons">home</i>' + data.names[i] + '&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp' + timest + '<span class="' + ((data.users[i] == 4) ? 'red' : 'green') + ' new badge" data-badge-caption="player(s)">' + data.users[i] + '</span></div><div class="collapsible-body"><form class="roomenter" action=""><label for="room_password">Password</label><input name="roomPASS" placeholder="Enter Room password" type="password" class="validate"><input name="roomID" type="hidden" value="' + data.ids[i] + '"><button type="submit" class="waves-effect waves-light btn">ENTER ROOM</button><a href="#" class="btn red waves-effect waves-light deleteroom"> Delete Room</a></form></div></li>');
	}
	roomenter_submit();
	$('#divroom').hide();
	$('.rooms-notloaded').show();
});

socket.on('login', function (data) {
	if (data.success) {
		gVars.curRoomName = data.roomN;
		gVars.curRoomPass = data.roomP;
		gVars.curRoomID = data.roomID;
		gVars.purpleplayers = data.tp;
		gVars.greenplayers = data.tg;
		$("#modal-roomlist").modal('close');
		$("#modal-joingame").modal('open');
		teamselectrefresh();
	}
	else {
		$(gVars.currentlogin).find("input[name=roomPASS]").val('');
		$(gVars.currentlogin).find("input[name=roomPASS]").attr("placeholder", "Wrong password. Try again");
		$(gVars.currentlogin).find("button").prop('disabled', false);
	}

});

socket.on('addplayer', function (data) {
	if (data.success) {
		gVars.purpleplayers = data.teampurple;
		gVars.greenplayers = data.teamgreen;
		gVars.myUserID = data.playerid;
		$('#playerwait').show();
		M.toast({ html: 'Game joined', displayLength: 3000 });
		$("#modal-joingame").modal('close');
		joingame();
	}
	else {
		$('#joingame').removeAttr('disabled');
		M.toast({ html: 'Error: Room may be full. Retry or try another room', displayLength: 3000 });
	}
});

socket.on('deleteroom', function (data) {
	if (data.success) {
		M.toast({ html: 'Room deleted', displayLength: 3000 });
		sock_up_poprooms();
	}
	else if (data.wrongpass == true) {
		$(gVars.currentlogin).find("input[name=roomPASS]").val('');
		$(gVars.currentlogin).find("input[name=roomPASS]").attr("placeholder", "Wrong password. Try again");
		$(gVars.currentlogin).find("a").removeAttr('disabled');
	}
	else {
		$(gVars.currentlogin).find("input[name=roomPASS]").val('');
		$(gVars.currentlogin).find("input[name=roomPASS]").attr("placeholder", "Error - room may have been deleted already");
		$(gVars.currentlogin).find("a").removeAttr('disabled');
	}
});

socket.on('prf', function (data) {
	gVars.purpleplayers = data.tp;
	gVars.greenplayers = data.tg;
	//teamselectrefresh();
	playscreenTeamUpdate();
});

socket.on('cst', function (data) {
	gVars.sockMsgCount = gVars.sockMsgCount + 1;
	$('#playerwait').hide();
	$('#trumpcard>img').attr('src', 'img/cards/BLUE_BACK.PNG');

	var i = 0;
	var cardcount = 0;
	var cardlist = new Array();
	while (i < data.c.length) {
		cardcount++;
		if (data.c.substring(i, i + 1) == '1') {
			cardlist.push(data.c.substring(i, i + 3));
			i += 3;
		}
		else {
			cardlist.push(data.c.substring(i, i + 2));
			i += 2;
		}
	}
	var cards = new Array();
	for (var i = 0; i < parseInt(data.m); i++)
		cards[i] = new Array();
	var cPerMember = cardcount / parseInt(data.m);
	for (var i = 0; i < parseInt(data.m); i++) {
		for (var j = 0; j < cPerMember; j++) {
			cards[i].push(cardlist[i * cPerMember + j]);
		}
	}

	if (data.d)
		setTimeout(function () {
			buildcardstack(cards);
		}, 1000);
	else
		buildcardstack(cards);
});

socket.on('bid', function (data) {
	gVars.sockMsgCount = gVars.sockMsgCount + 1;
	if (data.fb)
		setTimeout(function () {
			$("#modal-bid").modal('open');
			bidProcess(data);
		}, data.d ? 3500 : 2500);
	else
		bidProcess(data);

});

socket.on('bidover', function (data) {
	gVars.sockMsgCount = gVars.sockMsgCount + 1;
	$('#biddouble').hide();
	$('#bidlog').append('<li class="collection-item flexcenter"><i class="material-icons">chevron_right</i>' + data.l + '</li>');
	$("#modal-bid>.modal-content").scrollTop($("#modal-bid>.modal-content")[0].scrollHeight);
	var d = parseInt(data.bd) == 1 ? '' : ' x' + data.bd;
	//mark
	var playername = playerFromNumber(data.w);
	if (playername.team == 'green')
		playername.player = gVars.greenplayers[playername.id];
	else
		playername.player = gVars.purpleplayers[playername.id];
	setTimeout(function () {
		$("#modal-bid").modal('close');

		for (var i = 0; i < 4; i++) {
			var z = playerFromNumber(i);
			var b = elemfromidteam('#', 'bid', z.player);
			var memb = $(b).html();
			$(b).html(data.b[i] + ((z.team == data.bdt) ? d : ''));
			if ($(b).html() != memb)
				zio(b);
		}
		M.toast({ html: playername.player + ' of Team ' + playername.team.toUpperCase() + ' won the bid', displayLength: 2000 });
	}, 3000);
});

socket.on('play', function (data) {
	gVars.sockMsgCount = gVars.sockMsgCount + 1;
	if (data.op.fp && data.lp == '') //absolute first time
		setTimeout(function () {
			playProcess(data);
		}, data.op.re == 'nl' ? 3700 : 4700);
	else
		playProcess(data);
});

socket.on('trump', function (data) {
	gVars.sockMsgCount = gVars.sockMsgCount + 1;
	if (data.op == 'open') {
		if (data.pl == gVars.myteam + gVars.myUserID) {
			$('#bottomcardbox').removeClass('carddisabled');
			var tCard = cardDetail(data.c);
			if (hasSuit(tCard.suit, false))
				enableCards([tCard.suit]);
			else
				enableCards(['S', 'C', 'H', 'D']);
			M.toast({ html: 'You opened the Trump', classes: 'lime darken-3', displayLength: 3000 });
		}
		else {
			//mark
			var xName = playerFromNumber(numberFromPlayer(data.pl));
			if (xName.team == 'green')
				xName = gVars.greenplayers[xName.id];
			else
				xName = gVars.purpleplayers[xName.id];
			M.toast({ html: xName + ' opened the Trump', classes: 'lime darken-3', displayLength: 3000 });

		}
		gVars.trumpOpen = true;
		enableTrump(false);
		$('#trumpcard>img').attr('src', 'img/cards/' + data.c + '.PNG');
	}
	else if (data.op == 'set') {
		if (data.pl == gVars.myteam + gVars.myUserID) {
			if (data.c7 != 'f') {//7th card
				$(elemfromidteam('#', 'trump', data.pl)).html('<img alt="T" src="img/' + cardDetail(data.c).suit + '.png" style="margin-bottom:-0.09rem;max-height:1.1rem;max-width:1.1rem;border:1px solid #000">');
				gVars.card7 = data.c7;
				for (var i = 0; i < $('#bottomcardbox>.playercards').length; i++) {
					var elem = $('#bottomcardbox>.playercards')[i];
					if ($(elem).attr('card') == gVars.card7) {
						$(elem).addClass('card7');
						break;
					}
				}
				gVars.showMode = 'orig';
			}
			else
				$(elemfromidteam('#', 'trump', data.pl)).html('<img alt="T" src="img/' + cardDetail(data.c).suit + '.png" style="margin-bottom:-0.09rem;max-height:1.1rem;max-width:1.1rem;">');
		}
		else
			$(elemfromidteam('#', 'trump', data.pl)).html('T&nbsp;');
		$(elemfromidteam('#', 'trump', data.pl)).show();
		gVars.trumpSetter = data.pl;
		changeMode(gVars.showMode);
		//preload trump image
		var preloadLink = document.createElement('link');
		preloadLink.href = 'img/cards/' + data.c + '.PNG';
		preloadLink.rel = 'preload';
		preloadLink.as = 'image';
		document.head.appendChild(preloadLink);
		var imgSrc = document.createElement('img');
		imgSrc.src = 'img/cards/' + data.c + '.PNG';
		document.getElementById('imgload').appendChild(imgSrc);
	}
});

socket.on('marriage', function (data) {
	gVars.sockMsgCount = gVars.sockMsgCount + 1;
	var d = parseInt(data.bd) == 1 ? '' : ' x' + data.bd;
	var playername = playerFromNumber(numberFromPlayer(data.pl));
	if (playername.team == 'green')
		playername.player = gVars.greenplayers[playername.id];
	else
		playername.player = gVars.purpleplayers[playername.id];
	setTimeout(function () {
		M.toast({ html: playername.player + ' of Team ' + playername.team.toUpperCase() + '&nbsp;has a marriage!', classes: 'lime darken-3', displayLength: 4000 });

		for (var i = 0; i < 4; i++) {
			var z = playerFromNumber(i);
			var b = elemfromidteam('#', 'bid', z.player);
			var memb = $(b).html();
			$(b).html(data.b[i] + ((z.team == data.bdt) ? d : ''));
			if ($(b).html() != memb)
				zio(b);
		}
	}, data.d == 'play' ? 1400 : 500);
});

socket.on('reconnect_attempt', function (number) {
	$('#network>i').hide();
	$('#network>span').hide();
	$('#network>div').show();
	console.log('Reconnecting... (' + number + ')');
	//M.toast({html: 'Reconnecting... ('+number+')',displayLength:1000});
});

socket.on('reconnect', function () {
	$('#network>div').hide();
	$('#network>i').show();
	$('#network>span').show();
	console.log('Reconnected');
	//M.toast({html: 'Reconnected',displayLength:1500});
	if (gVars.matchRunning)
		socket.emit('recon', { 'id': gVars.curRoomID, 'pl': gVars.myname, 'LM': gVars.sockMsgCount });
});

socket.on('chat', function (data) {
	M.toast({ html: data.msg, classes: 'chatToast', displayLength: 4000 });
	$('#chatlog').append('<li class="collection-item flexcenter"><i class="material-icons">chevron_right</i>' + data.msg + '</li>');
	$("#modal-chat>.modal-content").scrollTop($("#modal-chat>.modal-content")[0].scrollHeight);
});

socket.on('pong', function (latency) {
	$('#network>span').html('&nbsp;' + latency + 'ms');
	var isChromium = !!window.chrome;
	if (latency > 380)
		isChromium ? $('#network>i').css('background-image', 'linear-gradient(to right,#d00 36%,rgba(255,255,255,.13) 36%)') : $('#network>i').css('color', '#d00');
	else if (latency > 120)
		isChromium ? $('#network>i').css('background-image', 'linear-gradient(to right,#dd0 64%,rgba(255,255,255,.13) 64%)') : $('#network>i').css('color', '#dd0');
	else
		isChromium ? $('#network>i').css('background-image', 'linear-gradient(to right,#0d0 99%,#0d0 100%)') : $('#network>i').css('color', '#0d0');
});

//document load
window.mobilecheck = function () {
	var check = false;
	(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
	return check;
};
var zoom = 1;
var animation = false;
function canvasLoad(start) {
	animation = start;
	const canvas = document.querySelector("canvas");
	const ctx = canvas.getContext("2d");
	const colors = [
		"#b4b2b5",
		"#dfd73f",
		"#6ed2dc",
		"#66cf5d",
		"#c542cb",
		"#d0535e",
		"#3733c9"
	];
	let w = 700, h = 300, rAF;

	function texts(color) {
		ctx.font = "10vh Bungee Outline";
		ctx.shadowBlur = 30;
		ctx.shadowColor = color;
		ctx.fillStyle = color;
		ctx.setTransform(1, -0.15, 0, 1, 0, -10);
		ctx.fillText("CARDS", w / 2, h / 2 - 5);

		ctx.fillStyle = "white";
		ctx.shadowBlur = 30;
		ctx.shadowColor = color;
		ctx.fillText("CARDS", w / 2, h / 2);

		ctx.font = "9vh Bungee Inline";
		ctx.shadowBlur = 30;
		ctx.shadowColor = color;
		ctx.fillStyle = "#fff";
		ctx.setTransform(1, -0.15, 0, 1, 0, -10);
		ctx.fillText(
			"29",
			w / 2,
			h / 2 + h / 10
		);

		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
	}

	function glitch() {
		if (animation)
			rAF = window.requestAnimationFrame(glitch);
		else {
			ctx.clearRect(0, 0, w, h);
			return;
		}

		ctx.fillStyle = "#1a191c";
		ctx.fillRect(0, 0, w, h);

		texts(colors[Math.floor(Math.random() * 7)]);
		ctx.shadowBlur = 0;
		ctx.shadowColor = "none";

		ctx.setTransform(1, 0, 0, 1, 0, 0);

		for (let i = 0; i < 400; i++) {
			ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.01})`;
			ctx.fillRect(
				Math.floor(Math.random() * innerWidth),
				Math.floor(Math.random() * innerHeight),
				Math.floor(Math.random() * 30) + 1,
				Math.floor(Math.random() * 30) + 1
			);

			ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
			ctx.fillRect(
				Math.floor(Math.random() * innerWidth),
				Math.floor(Math.random() * innerHeight),
				Math.floor(Math.random() * 30) + 1,
				Math.floor(Math.random() * 30) + 1
			);
		}
		ctx.setTransform(1, 0, 0, .8, .2, 0);
	}
	(animation) ? glitch() : ctx.clearRect(0, 0, canvas.width, canvas.height);
}

//audio
class sound {
	constructor(src, loop = false) {
		this.sound = new Audio(src);
		if (loop)
			if (typeof this.sound.loop == 'boolean')
				this.sound.loop = true;
			else
				this.sound.addEventListener('ended', function () {
					this.currentTime = 0;
					this.play();
				}, false);
		this.sound.setAttribute("preload", "auto");
		this.sound.setAttribute("controls", "none");
		this.sound.style.display = "none";
		document.body.appendChild(this.sound);
	}
	play() {
		this.sound.play();
	}
	stop() {
		this.sound.pause();
	}
}

$(function () {
	gVars.sound_turn = new sound('img/ting.mp3', true);
	gVars.sound_play = new sound('img/play.mp3');
	if (!window.chrome)//not chromium
		$('#network>i').removeClass('network-icon');
	if (navigator.share)
		$('#playerwait').click(function () {
			navigator.share({
				title: 'The 29 Game',
				text: 'Play a game of 29 with me!\nRoomname: ' + gVars.curRoomName + '\nPassword: ' + gVars.curRoomPass + '\nLink:',
				url: document.location.href
			}).catch(console.error);
			return false;
		});
	else {
		$('#playerwait').click(function () {
			$('#share-data').html('Play a game of 29 with me!<br>Roomname: ' + gVars.curRoomName + '<br>Password: ' + gVars.curRoomPass + '<br>Link: ' + '<a href="' + document.location.href + '" target="_blank">' + document.location.href + '</a>');
			$('#modal-share').modal('open');
			return false;
		});
	}
	initModals();
	$('.collapsible').collapsible();
	$('select').formSelect();
	$('.tabs').tabs();
	$('.range-field>span').css('height', '30px!important');
	$('.range-field>span').css('width', '30px!important');
	$('.trumpshow').hide();
	$('#trumpset').hide();
	gVars.sockMsgCount = 0;
	gVars.showMode = 'sort';
	gVars.timer = '';
	gVars.trumpOpen = false;
	gVars.card7 = '';
	gVars.currentPlayerPos = 0;
	gVars.isMobile = mobilecheck();
	//UI resize 
	$('body').css('zoom', shiftzoom(1920, 1080));
	if (gVars.isMobile) {
		$(window).on("orientationchange", function (event) {
			$(window).one('resize', function () {
				zoom = shiftzoom(1920, 1080);
				$('body').css('zoom', zoom);
				var x = (!(vh() - 360 * zoom > 540 * zoom)) ? Math.max(0, (vh() - 360 * zoom) / (zoom * 540)) : 1;
				$('#maintable').css('transform', 'scale(' + x + ')');
				var x = (!(vh() - 360 * zoom > 270 * zoom)) ? Math.max(0, (vh() - 360 * zoom) / (zoom * 270)) : 1;
				$('#trumpcard').css('transform', 'scale(' + x + ')');
				//event.orientation
			});
		});
		M.toast({ html: 'You can rotate your device to change the orientation!', displayLength: 2000 });
	}
	else {
		$(window).resize(function () {
			zoom = shiftzoom(1920, 1080);
			$('body').css('zoom', zoom);
			var x = (!(vh() - 360 * zoom > 540 * zoom)) ? Math.max(0, (vh() - 360 * zoom) / (zoom * 540)) : 1;
			$('#maintable').css('transform', 'scale(' + x + ')');
			var x = (!(vh() - 360 * zoom > 270 * zoom)) ? Math.max(0, (vh() - 360 * zoom) / (zoom * 270)) : 1;
			$('#trumpcard').css('transform', 'scale(' + x + ')');
		});
	}
	$('#imgload').hide();
	$('#modal-roomlist').modal('open');
	setTimeout(function () {
		$('.pload').remove();
	}, 900);
});