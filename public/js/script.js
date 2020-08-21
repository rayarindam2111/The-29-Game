//DOM interactions
function arrayRotate(arr, count) {
	count -= arr.length * Math.floor(count / arr.length);
	arr.push.apply(arr, arr.splice(0, count));
}

const encodeHTML = (input) => {
	return $('<div/>').text(input).html();
}

function zeroPad(num, padlen) {
	var pad = new Array(1 + padlen).join('0');
	return (pad + num).slice(-pad.length);
}

/*
function encodeHTML(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
*/

function checkSpChars(t) {
	try {
		return !t.match('^[a-zA-Z0-9][a-zA-Z0-9-_ ]*$');
	} catch (e) {
		return !(t.indexOf('&') == -1 && t.indexOf('<') == -1 && t.indexOf('>') == -1 && t.indexOf(',') == -1 && t.indexOf('.') == -1);
	}
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
		default: return -1;
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
	if (arr.length < 2)
		return -1;
	else if (arr[0] > arr[1])
		return 0;
	else if (arr[1] > arr[0])
		return 1;
	else
		return -2;
}

/* start VoiceServer */
function voiceCallback(callID, direction) {
	var pl = callID.slice(gVars.curRoomID.length);
	var elem = elemfromidteam('.', 'Pcard', pl);
	$(elem).addClass('callAnim');
	$(elem + '>i').html(direction == 'out' ? 'call_made' : 'call_received');
	callID = null;
	direction = null;
	pl = null;
	setTimeout(function () {
		$(elem).removeClass('callAnim');
		$(elem + '>i').html($(elem).attr('data-mute') == 'off' ? 'mic' : 'mic_off');
	}, 4600);
}
/* end VoiceServer */

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

	var jQcards = $('#bottomcardbox>.playercards');
	var cs = [];
	for (var i = 0; i < jQcards.length; i++)
		cs.push($(jQcards[i]).attr('card'));

	for (var i = 0; i < sortingArray.length; i++) {
		var pos = cs.indexOf(sortingArray[i]);
		$(jQcards[pos]).css('left', i * gap).css('z-index', i + 10);
	}
}

function generateStack(cards, box, color) {
	var gap = 50;
	var imagewidth = 118;
	var imageheight = 180;
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

		$('.tooltipped').tooltip('destroy');
		$(box).html('');
		for (var i = 0; i < cards.length; i++)
			$(box).append('<div class="playercards tooltipped' + (gVars.card7 == cards[i] ? ' card7' : '') + '" data-position="top" data-tooltip="P: ' + cardDetail(cards[i]).point + '" style="left:' + (i * gap) + 'px;background-image:url(img/cards/' + cards[i] + '.PNG);z-index:' + (i + 10) + ';" card="' + cards[i] + '"></div>');
		var elems = document.querySelectorAll('.tooltipped');
		M.Tooltip.init(elems, { enterDelay: 0, exitDelay: 0, inDuration: 150, outDuration: 150 });
	}
	else {
		$(box).html('');
		for (var i = 0; i < cards.length; i++)
			$(box).append('<div class="playercards" style="left:' + (i * gap) + 'px;background-image:url(img/cards/' + color.toUpperCase() + '_BACK.PNG);z-index:' + (i + 10) + ';"></div>');
	}
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
		}
	});
	$('#modal-joingame').modal({
		dismissible: false,
		onOpenStart: function (modal, trigger) {
			gVars.myteam = '';
			$('#modal-leader').modal('close');
			$('#modal-credits').modal('close');
			$('#joingame').removeAttr('disabled');
		},
		onOpenEnd: function (modal, trigger) {
			$("#username").focus();
		}
	});
	$('#modal-bid').modal({
		dismissible: false,
		onOpenStart: function (modal, trigger) {
			resetRound();
			$('#modal-chat').modal('close');
			$('#modal-share').modal('close');
			$('#modal-leader').modal('close');
		}
	});
	$('#modal-trumpyesno').modal({
		dismissible: true
	});
	$('#modal-gameover').modal({
		dismissible: false,
		onOpenStart: function (modal, trigger) {
			$('#modal-leader').modal('close');
			$('#modal-chat').modal('close');
			$('#chatopen').removeClass('scale-in');
		}
	});
	$('#modal-credits').modal({
		dismissible: true
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
	$('#modal-leader').modal({
		dismissible: true,
		onOpenStart: function (modal, trigger) {
			socket.emit('hst', { idx: 0 });
			socket.emit('hst', { idx: 1 });
			socket.emit('hst', { idx: 2 });
			socket.emit('hst', { idx: 3 });
		},
		onOpenEnd: function (modal, trigger) {
			$('#modal-leader>div.modal-content>ul>li.indicator').css('right', '100%');
			//document.querySelector('#modal-leader>div>ul>li:nth-child(1)>a').dispatchEvent(new MouseEvent("click", { bubbles: true }));
		},
		onCloseEnd: function (modal, trigger) {
			$('.hstTab').html('<div class="hstLoad">Loading...</div>');
			$('#gameCounter').html('-');
		}
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
	var rname = $('#room_NEW').val().trim();
	var pass = $('#room_NEW_pass').val();
	var mode = $('#gModeSelect').val();
	var timestamp = Date.now();

	if (rname == "" || checkSpChars(rname) || rname.length > 10) {
		$('#room_NEW_pass').val('');
		$('#room_NEW').focus();
		return false;
	}
	if (pass.trim() == "") {
		$('#room_NEW_pass').val('').focus();
		return false;
	}

	$('.rooms-notloaded').hide();
	$('#divroom').show();
	socket.emit('addroom', { 'name': rname, 'pass': pass, 'timestamp': timestamp, 'mode': mode });
	$('#room_NEW').val('').removeClass('invalid').removeClass('valid');
	$('#room_NEW_pass').val('').removeClass('invalid').removeClass('valid');
	$('#room_NEW~span.character-counter').html('');
	$('#addroomdock').click();
	return false;
});

$('#form-chat').submit(function () {
	if ($("#chatmessage").val().trim() == "")
		return false;
	if ($("#chatmessage").val().trim() == 'reconnectVoice') //hack to reconnect voice
		setTimeout(function () { reconnectVoice(gVars.curRoomID, gVars.curRoomPass, gVars.myteam + gVars.myUserID); }, 2000);
	if ($("#chatmessage").val().trim() == 'reconnectGame') //hack to reconnect Game
		setTimeout(function () { socket.emit('recon', { 'id': gVars.curRoomID, 'pl': gVars.myname, 'LM': gVars.sockMsgCount, 'passw': gVars.curRoomPass }); }, 2000);
	var msg = '<' + gVars.myteam + '>' + gVars.myname + ':&nbsp;</' + gVars.myteam + '>&nbsp;' + encodeHTML($("#chatmessage").val());
	$("#chatmessage").val('');
	socket.emit('chat', { 'id': gVars.curRoomID, 'passw': gVars.curRoomPass, 'msg': msg });
	msg = null;
	return false;
});

$('#backtoroomlist').click(function () {
	$('#modal-joingame').modal('close');
	$('#modal-roomlist').modal('open');
	return false;
});

$('#joingame').click(function () {
	var check = true;
	var usrN = $('#username').val().trim();
	if (usrN == "" || checkSpChars(usrN) || usrN.length > 15) {
		$("#username").focus();
		check = false;
	}
	if (gVars.myteam == '') {
		$('#teamnotSelected').show();
		$('#modal-joingame>div.modal-content>div.row').css('border', '1px solid #F44336');
		check = false;
	}
	if (!check)
		return false;

	gVars.myname = usrN;
	M.toast({ html: 'Joining Game...', displayLength: 3000 });
	$('#joingame').attr('disabled', '');
	socket.emit('addplayer', { 'id': gVars.curRoomID, 'playername': gVars.myname, 'team': gVars.myteam, 'passw': gVars.curRoomPass });
	return false;
});

function validateInput(elem, maxLength, checkSpecial) {
	$(elem).on('input', function () {
		var val = $(this).val().trim();
		var check = val == "" || (checkSpecial && checkSpChars(val)) || (maxLength != -1 && val.length > maxLength);
		check ? $(this).removeClass('valid').addClass('invalid') : $(this).removeClass('invalid').addClass('valid');
		if (maxLength != -1)
			$(elem + '~span.character-counter').html(val.length + '/' + maxLength);
	});
}

function roomenter_submit() {
	$('.roomenter').submit(function (event) {
		gVars.currentlogin = event.target;
		var roomID = $(event.target).find("input[name=roomID]").val();
		var passw = $(event.target).find("input[name=roomPASS]").val();
		$(event.target).find("button").prop('disabled', true);
		gVars.curRoomPass = passw;
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

	$('#rooms-list>li>.collapsible-header').click(function (e) {
		if (e.target !== e.currentTarget) return;
		e = null;
		setTimeout(() => {
			$(this).parent().find('.roomenter>.input-field>input').focus();
		}, 300);
	});
}

/* start VoiceServer */ async /* end VoiceServer */ function joingame() {
	$('#timerGame>span').html(gVars.gameMode == 0 ? 'No Limit' : zeroPad(gVars.gameMode, 2) + ':00');
	$('.scale-out').addClass('scale-in');
	playscreenTeamUpdate();
	if (gVars.myteam == 'green') {
		$('#playMove').removeClass('white');
		$('#playMove').addClass('green');
		$('.top-box>div.lowpad').css('border-bottom', '4px solid #48994a');
		$('.bottom-box>div.lowpad').css('border-top', '4px solid #48994a');
		$('.left-box>div.lowpad').css('border-bottom', '4px solid #5e429b');
		$('.right-box>div.lowpad').css('border-top', '4px solid #5e429b');
	}
	else {
		$('#playMove').removeClass('white');
		$('#playMove').addClass('purple');
		$('.top-box>div.lowpad').css('border-bottom', '4px solid #5e429b');
		$('.bottom-box>div.lowpad').css('border-top', '4px solid #5e429b');
		$('.left-box>div.lowpad').css('border-bottom', '4px solid #48994a');
		$('.right-box>div.lowpad').css('border-top', '4px solid #48994a');
	}
	for (var i = 0; i < 4; i++) {
		var t = playerFromNumber(i);
		timeout(0, elemfromidteam('#', 'time', t.player), t.team, true);
	}
	document.title = 'The 29 Game - [' + gVars.myname + ']';
	window.onbeforeunload = function () {
		return "Are you sure you want to leave the game?";
	}

	gVars.matchRunning = true;

	/* start VoiceServer */
	for (var i = 0; i < $('.icon-player').length; i++) {
		var team = playerFromNumber(numberFromPlayer(idteamfromelem($($('.icon-player')[i]).attr('data-pos')))).team;
		$($('.icon-player')[i]).addClass(team == 'green' ? 'greengrad' : 'purplegrad');
	}

	await startVoice(gVars.curRoomID, gVars.curRoomPass, gVars.myteam + gVars.myUserID);
	/* end VoiceServer */

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
}

function teamselectrefresh() {
	$('#optgreen>div>div>label>input').prop('checked', false);
	$('#optpurple>div>div>label>input').prop('checked', false);
	if (gVars.purpleplayers.length > 0)
		text = '<strong>Players:</strong> ' + gVars.purpleplayers.join(', ');
	else
		text = '<strong>Players:</strong> -';
	$('#optpurple>div>div>p').html(text);
	if (gVars.purpleplayers.length == 2)
		$('#optpurple').addClass('dSelect');
	else
		$('#optpurple').removeClass('dSelect');

	if (gVars.greenplayers.length > 0)
		text = '<strong>Players:</strong> ' + gVars.greenplayers.join(', ');
	else
		text = '<strong>Players:</strong> -';
	$('#optgreen>div>div>p').html(text);
	if (gVars.greenplayers.length == 2)
		$('#optgreen').addClass('dSelect');
	else
		$('#optgreen').removeClass('dSelect');
}

/* start VoiceServer */
function idteamfromelem(elem) {
	var carr = ['green0', 'purple0', 'green1', 'purple1'];
	var direction = ['w', 'n', 'e', 's'];
	arrayRotate(direction, carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	var indexPos = direction.indexOf(elem);
	return carr[indexPos];
}
/* end VoiceServer */

function elemfromidteam(selector, suffix, teamAndID) {
	var carr = ['green0', 'purple0', 'green1', 'purple1']; //order of play
	var direction = ['w', 'n', 'e', 's'];
	arrayRotate(direction, carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	//direction.rotate(carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	var indexPos = carr.indexOf(teamAndID);
	switch (direction[indexPos]) {
		case 'w': return selector + 'left' + suffix;
		case 'n': return selector + 'top' + suffix;
		case 'e': return selector + 'right' + suffix;
		case 's': return selector + 'bottom' + suffix;
		default: return '-1';
	}
}

function playscreenTeamUpdate() {
	for (var i = 0; i < gVars.greenplayers.length; i++)
		$(elemfromidteam('#', 'name>div>h5', 'green' + i)).html(gVars.greenplayers[i]);
	for (var i = 0; i < gVars.purpleplayers.length; i++)
		$(elemfromidteam('#', 'name>div>h5', 'purple' + i)).html(gVars.purpleplayers[i]);
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

$('#ipColor').on('input', function () {
	$('.bodyBack').css('filter', 'hue-rotate(' + $('#ipColor').val() + 'deg)');
});

$('#ipColor').on('change', function () {
	socket.emit('color', { 'id': gVars.curRoomID, 'passw': gVars.curRoomPass, 'pl': gVars.myteam + gVars.myUserID, 'val': $('#ipColor').val() });
});

function bidProcess(data) {
	$('#bidlog').append('<li class="collection-item flexcenter"><i class="material-icons">chevron_right</i>' + data.l + '</li>');

	$('#trumpset').hide();
	$('#biddouble').hide();
	$('#bidchange').hide();

	if (data.bd == 'ST') {
		if (gVars.myteam + gVars.myUserID == data.bw) {
			$('#trumpset').show();
			$("#modal-bid>.modal-content").scrollTop($("#modal-bid>.modal-content")[0].scrollHeight);
		}
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
		return;
	}

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
	else {
		$("#modal-bid>.modal-content").scrollTop($("#modal-bid>.modal-content")[0].scrollHeight);
	}
}

$('#bidraise').click(function () {
	$('#bidchange').hide();
	if (gVars.raiseOrMatch == 'matched bid to&nbsp;' && parseInt($('#bidrange').attr('min')) != parseInt($('#bidrange').val()))
		gVars.raiseOrMatch = 'raised bid to&nbsp;';
	socket.emit('bid', { 'id': gVars.curRoomID, 'passw': gVars.curRoomPass, 'ps': false, 'am': $('#bidrange').val(), 'pl': gVars.myteam + gVars.myUserID, 'l': '<' + gVars.myteam + '>' + gVars.myname + '</' + gVars.myteam + '>&nbsp;' + gVars.raiseOrMatch + '<red>' + $('#bidrange').val() + '</red>', 'o': { 'iO': '' } });
	return false;
});

$('#bidpass').click(function () {
	$('#bidchange').hide();
	socket.emit('bid', { 'id': gVars.curRoomID, 'passw': gVars.curRoomPass, 'ps': true, 'am': $('#bidrange').val(), 'pl': gVars.myteam + gVars.myUserID, 'l': '<' + gVars.myteam + '>' + gVars.myname + '</' + gVars.myteam + '>&nbsp;passed the bid', 'o': { 'iO': '' } });
	return false;
});

$('#biddoubleok').click(function () {
	$('#biddouble').hide();
	var m = parseInt($('input[name="groupD"]:checked').val());
	var t = gVars.bidDouble == 'D' ? 'double' : 'redouble';
	var textm = (m == 1) ? 'did not ' + t : ((m == 2) ? 'doubled' : 'redoubled');
	socket.emit('bid', { 'id': gVars.curRoomID, 'passw': gVars.curRoomPass, 'ps': '', 'am': '', 'pl': gVars.myteam + gVars.myUserID, 'l': '<' + gVars.myteam + '>' + gVars.myname + '</' + gVars.myteam + '>&nbsp;' + textm, 'o': { 'iO': gVars.bidDouble, 'm': m, 't': gVars.myteam } });
	return false;
});

$('#playMove').click(function () {
	$('#playMove').attr('disabled', '');
	socket.emit('play', { 'id': gVars.curRoomID, 'passw': gVars.curRoomPass, 'pl': gVars.myteam + gVars.myUserID, 'c': gVars.currentCard, 'fp': gVars.firstplay });
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
	socket.emit('trump', { 'id': gVars.curRoomID, 'passw': gVars.curRoomPass, 'pl': gVars.myteam + gVars.myUserID, 'op': 'open', 's': '', 'l': '' });
	return false;
});

$('#trumpsetok').click(function () {
	$('#trumpset').hide();
	var tIndex = document.getElementById('trumpOpt').M_Tabs.index;
	var tSuit = tIndex == 0 ? 'H' : tIndex == 1 ? 'S' : tIndex == 2 ? 'D' : tIndex == 3 ? 'C' : '7';
	socket.emit('trump', { 'id': gVars.curRoomID, 'passw': gVars.curRoomPass, 'pl': gVars.myteam + gVars.myUserID, 'op': 'set', 's': tSuit, 'l': '<' + gVars.myteam + '>' + gVars.myname + '</' + gVars.myteam + '>&nbsp;set the Trump' });
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

$('#leaderopen').click(function () {
	$('#modal-leader').modal('open');
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

$('#closeLeader').click(function () {
	$('#modal-leader').modal('close');
	return false;
});

$('.tsCard').click(function (elem) {
	var c = $(elem.currentTarget);
	$('#teamnotSelected').hide();
	$('#modal-joingame>div.modal-content>div.row').css('border', '1px solid #4CAF50');
	if (c.attr('id') == 'optgreen') {
		$('#optgreen>div>div>label>input').prop('checked', true);
		$('#optpurple>div>div>label>input').prop('checked', false);
		gVars.myteam = 'green';
	}
	else {
		$('#optpurple>div>div>label>input').prop('checked', true);
		$('#optgreen>div>div>label>input').prop('checked', false);
		gVars.myteam = 'purple';
	}
	return false;
});

/* start VoiceServer */
$('.icon-player').click(function (elem) {
	var c = $(elem.currentTarget);
	if (c.attr('data-mute') == 'off') {
		changeMuteVoice(gVars.curRoomID, idteamfromelem(c.attr('data-pos')), true);
		c.attr('data-mute', 'on');
		c.children('i').html('mic_off');
	}
	else {
		changeMuteVoice(gVars.curRoomID, idteamfromelem(c.attr('data-pos')), false);
		c.attr('data-mute', 'off');
		c.children('i').html('mic');
	}
});
/* end VoiceServer */

$('#modal-gameover>div.modal-footer>a').click(function (e) {
	e.preventDefault();
	endVoice();
	window.location = './';
});

$('#modal-chat>div.modal-footer>div').click(function (e) {
	if (!$(e.target).hasClass('chip'))
		return false;
	var msg = '<' + gVars.myteam + '>' + gVars.myname + ':&nbsp;</' + gVars.myteam + '>&nbsp;<red>' + encodeHTML($(e.target).html()) + '</red>';
	socket.emit('chat', { 'id': gVars.curRoomID, 'passw': gVars.curRoomPass, 'msg': msg });
	$('#modal-chat>div.modal-footer>div').addClass('carddisabled');
	e = null;
	msg = null;
	setTimeout(function () { $('#modal-chat>div.modal-footer>div').removeClass('carddisabled') }, 3000);
	return false;
});

$('#modal-roomlist>.modal-cover').click(function () {
	$(this).addClass('slide-out');
	setTimeout(function () { $('#modal-roomlist>.modal-cover').hide().remove(); }, 400);
	return false;
});

$('#addroomdock').click(function (e) {
	if (e.target !== e.currentTarget) return;
	e = null;
	setTimeout(() => {
		$('#room_NEW').focus();
	}, 300);
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
	var jQcards = $('#bottomcardbox>.playercards');
	for (var i = 0; i < jQcards.length; i++) {
		if (incCard7 && $(jQcards[i]).hasClass('card7'))
			continue;
		var card = cardDetail($(jQcards[i]).attr('card'));
		if (suit == card.suit)
			return true;
	}
	return false;
}

function onlycard7left() {
	var flag = false;
	var jQcards = $('#bottomcardbox>.playercards');
	for (var i = 0; i < jQcards.length; i++) {
		if ($(jQcards[i]).hasClass('card7')) {
			flag = true;
			break;
		}
	}
	return (jQcards.length == 1) && flag;
}

function enableCards(suits) {
	var jQcards = $('#bottomcardbox>.playercards');
	for (var i = 0; i < jQcards.length; i++) {
		var card = cardDetail($(jQcards[i]).attr('card'));
		$(jQcards[i]).removeClass('cardselected');
		if (checkSuitEnable(suits, card.suit)) {
			$(jQcards[i]).removeClass('carddisabled').addClass('movable');
		}
		else {
			$(jQcards[i]).addClass('carddisabled').removeClass('movable');
		}
	}
}

function cardPlayed(player, card, deckcards) {
	if (player == '' || card == '' || deckcards == [])
		return;
	var unqIndex = gVars.myteam + gVars.myUserID;
	var cur = playerFromNumber(numberFromPlayer(player));
	$(elemfromidteam('#', 'table', player)).css('z-index', gVars.currentPlayerPos * 10);
	$(elemfromidteam('#', 'table>img', player)).attr('src', 'img/cards/' + card + '.PNG');
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

	M.toast({ html: 'Cards distributed - 4', displayLength: 3100 });
	$('#changeView').removeAttr('disabled');
}

function enableTrump(select) {
	if (!select)
		$('#trumpcard').addClass('carddisabled');
	else
		$('#trumpcard').removeClass('carddisabled');
}

function timeAbs(time) {
	var d = new Date(time);
	return zeroPad(d.getHours(), 2) + ':' + zeroPad(d.getMinutes(), 2) + ':' + zeroPad(d.getSeconds(), 2) + '  ' + zeroPad(d.getDate(), 2) + '/' + zeroPad((d.getMonth() + 1), 2) + '/' + zeroPad(d.getFullYear(), 4);
}

function timeDiff(diff) {
	var winHours = parseInt(diff / (1000 * 60 * 60));
	winHours = (winHours < 10) ? zeroPad(winHours, 2) : winHours.toString();
	var winMins = zeroPad(parseInt(diff / (1000 * 60)) % 60, 2);
	var winSecs = zeroPad(parseInt(diff / 1000) % 60, 2);
	return winHours + ':' + winMins + ':' + winSecs;
}

function playProcess(data) {
	let timeEnd = null;
	if (data.op.re == 'ro') {
		setTimeout(function () {
			M.toast({ html: 'New Round', displayLength: 2000 });
		}, 800);
		gVars.card7 = '';
	}
	else if (data.op.re == 'go') {
		gVars.matchRunning = false;
		timeEnd = Date.now();
		if (gVars.gameMode != 0) {
			gVars.sound_cdown.stop();
			clearInterval(gVars.remainTimer);
			//$('#timerGame>span').html('00:00');
			$('#timerGame').css('color', '#ff4242');
		}
		M.toast({ html: 'Game Over', displayLength: 2000 });
		window.onbeforeunload = null;
	}

	enableTrump(false);
	let player = gVars.myteam + gVars.myUserID;
	for (let i = 0; i < 4; i++) {
		let t = playerFromNumber(i);
		timeout(0, elemfromidteam('#', 'time', t.player), t.team, false);
	}

	if (data.op.fp) {
		function firstPlayDo() {
			if (data.op.re == 'go') {
				let pWin = indexOfMax(data.op.rs);
				let winText;
				if (pWin == 0 || pWin == 1) {
					let winner = playerFromNumber(pWin).team;
					winText = '<img src="img/' + winner.toLowerCase() + '.png"><span class="' + winner + '-text">&nbsp;Team ' + winner.toUpperCase() + '</span>&nbsp;wins the game';
				}
				else
					winText = '<img src="img/matchdraw.png">&nbsp;Game drawn';

				$('#winmessage').html('<div class="flexcenter fResult">' + winText + ' in&nbsp;<red>' + timeDiff(timeEnd - gVars.startTime) + '</red>.</div>');
				let text = '<table class="fResult striped centered"><thead><tr><th>Player</th><th>Points</th><th>Hands</th><th>Rounds</th></tr></thead><tbody>';
				for (let i = 0; i < 4; i++) {
					//mark
					let xName = playerFromNumber(i);
					if (xName.team == 'green')
						xName.player = gVars.greenplayers[xName.id];
					else
						xName.player = gVars.purpleplayers[xName.id];
					text += '<tr><td><span class="' + xName.team + '-text">' + xName.player + '</span></td><td><span class="' + xName.team + '-text">' + data.op.pw[i] + '</span></td><td><span class="' + xName.team + '-text">' + data.op.hw[i] + '</span></td><td><red>' + data.op.rs[i] + '</red></td></tr>';
				}
				text += '</tbody></table>';
				$('#winmessage').append(text);
				$('#modal-gameover>.modal-content>h3').html('Game Over : ' + gVars.curRoomName);
				$('#modal-gameover').modal('open');
			}

			for (let i = 0; i < 4; i++) {
				let p = elemfromidteam('#', 'point', playerFromNumber(i).player);
				let r = elemfromidteam('#', 'round', playerFromNumber(i).player);
				let memp = $(p).html();
				let memr = $(r).html();
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
		}

		(data.lp == '' || data.recon) ? firstPlayDo() : setTimeout(firstPlayDo, 2000);
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
			let playSuit = cardDetail(data.op.fc);
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
	try {
		gVars.timerCount = 0;
		$('.boxes>div').removeClass('mvboxes');
		$(elemfromidteam('.', '-box>div', data.pl)).addClass('mvboxes');
		if (player == data.pl)
			gVars.sound_turn.play();

		let telem = elemfromidteam('#', 'time', data.pl);
		//mark
		let xName = playerFromNumber(numberFromPlayer(data.pl));
		if (xName.team == 'green')
			xName.player = gVars.greenplayers[xName.id];
		else
			xName.player = gVars.purpleplayers[xName.id];

		setTim(player == data.pl, xName.player, xName.team, telem);
	} catch (e) {
		console.log('Error receiving play: ' + e.message);
	}
}

function startGameTimer(duration) {
	gVars.remainTimer = setInterval(function () {
		let timeString = zeroPad(parseInt(duration / 60), 2) + ':' + zeroPad(duration % 60, 2);
		$('#timerGame>span').html(timeString);
		if (duration <= 30) {
			$('#timerGame').css('color', duration % 2 ? '#fafafa' : '#ff4242');
			if (duration == 30)
				gVars.sound_cdown.play();
			if (duration == 0) {
				gVars.sound_cdown.stop();
				clearInterval(gVars.remainTimer);
			}
		}
		duration -= 1;
	}, 1000);
}

function setTim(currP, pName, pTeam, telem) {
	gVars.timer = setInterval(function () {
		gVars.timerCount = (gVars.timerCount + .5) % 100;
		if (gVars.timerCount == 99) {
			let htmlData = currP ? 'Please play a card' : pName + ' has not played a card for a long time';
			M.toast({ html: htmlData, classes: 'red darken-1', displayLength: 3000 });
		}
		timeout(gVars.timerCount, telem, pTeam, false);
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
	gameMode: '',      // gamemode: 0 for normal, else duration in min
	currentCard: '',   // 3C, current card selected
	currentBid: '',     // 21, current bid value
	raiseOrMatch: '',   // bid raise or match
	bidDouble: '',     // 'double' or 'redouble'
	trumpOpen: '',     // true or false, trump is open or not
	currentPlayerPos: '', // 0,1,2,3 tracks cards on center table
	firstplay: '',     // if first play
	timerCount: '',    // counter timer 0-100
	timer: '',         // timer element
	remainTimer: '',   // countdown timer for timed match
	trumpSetter: '',   // player who set trump (green0,purple1 etc.)
	sound_turn: '',    // sound for player turn
	sound_play: '',    // sound for player play
	sound_cdown: '',   // sound for countdown
	isMobile: '',	    // if device is a mobile device
	matchRunning: '',  // true/false, if a match has started & is running
	sockMsgCount: '',  // socket msg received count
	card7: '',         // 7th card, '' if not used
	showMode: '',      // 'sort', 'original' : cards shown in deck
	startTime: '',     // match start time obtained from Date.now()
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
		var timest = timeAbs(data.timestamps[i]);
		var mode = data.modes[i] == 0 ? 'Normal' : data.modes[i] + ' min';
		$('#rooms-list').append('<li><div class="collapsible-header"><i class="material-icons">home</i>' + data.names[i] + '<span class="transparent new badge" data-badge-caption=""><span class="' + ((data.users[i] == 4) ? 'red' : 'green') + ' new badge" data-badge-caption="">' + data.users[i] + ' player(s)</span><span class="transparent new badge" data-badge-caption="" style="min-width:0"></span><span class="blue new badge" data-badge-caption="">' + timest + '</span><span class="transparent new badge" data-badge-caption="" style="min-width:0"></span><span class="orange darken-2 new badge" data-badge-caption="">' + mode + '</span></span></div><div class="collapsible-body"><form class="roomenter" action=""><div class="input-field"><input name="roomPASS" placeholder="Enter Room password" type="password"><label for="room_password">Password</label></div><input name="roomID" type="hidden" value="' + data.ids[i] + '"><button type="submit" class="waves-effect waves-light btn">ENTER ROOM</button><a href="#" class="btn red waves-effect waves-light deleteroom"> Delete Room</a></form></div></li>');
	}
	M.updateTextFields();
	$('#rooms-list').collapsible('destroy').collapsible();
	roomenter_submit();
	$('#divroom').hide();
	$('.rooms-notloaded').show();
});

socket.on('login', function (data) {
	if (data.success) {
		gVars.curRoomName = data.roomN;
		gVars.curRoomID = data.roomID;
		gVars.purpleplayers = data.tp;
		gVars.greenplayers = data.tg;
		$("#modal-roomlist").modal('close');
		$("#modal-joingame").modal('open');
		teamselectrefresh();
	}
	else {
		gVars.curRoomPass = '';
		var glogin = $(gVars.currentlogin).find("input[name=roomPASS]");
		glogin.val('').attr("placeholder", "Error logging in. Try again").addClass('invalid').focus();
		data = null;
		setTimeout(function () { glogin.removeClass('invalid'); }, 2000);
		$(gVars.currentlogin).find("button").prop('disabled', false);
	}
});

socket.on('addplayer', function (data) {
	if (data.success) {
		gVars.purpleplayers = data.teampurple;
		gVars.greenplayers = data.teamgreen;
		gVars.myUserID = data.playerid;
		gVars.gameMode = data.mode;
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
		var glogin = $(gVars.currentlogin).find("input[name=roomPASS]");
		glogin.val('').attr("placeholder", "Error logging in. Try again").addClass('invalid').focus();
		data = null;
		setTimeout(function () { glogin.removeClass('invalid'); }, 2000);
		$(gVars.currentlogin).find("a").removeAttr('disabled');
	}
	else {
		var glogin = $(gVars.currentlogin).find("input[name=roomPASS]");
		glogin.val('').attr("placeholder", "Error - room may have been deleted already").addClass('invalid').focus();
		data = null;
		setTimeout(function () { glogin.removeClass('invalid'); }, 2000);
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

	if (gVars.startTime == '') { //absolute first time
		gVars.startTime = Date.now();
		if (gVars.gameMode != 0) {
			$('#timerGame').addClass('scale-in');
			startGameTimer(gVars.gameMode * 60);
		}
	}

	if (data.d) {
		i = null;
		cardcount = null;
		cardlist = null;
		cPerMember = null;
		data = null;
		setTimeout(function () {
			$('#trumpcard>img').attr('src', 'img/cards/BLUE_BACK.PNG');
			buildcardstack(cards);
			$('.playercards').addClass('zoomcards');
		}, 1500);
	}
	else {
		$('#trumpcard>img').attr('src', 'img/cards/BLUE_BACK.PNG');
		buildcardstack(cards);
		$('.playercards').addClass('zoomcards');
	}
});

socket.on('bid', function (data) {
	gVars.sockMsgCount = gVars.sockMsgCount + 1;
	if (data.fb)
		setTimeout(function () {
			var sortingArray = gVars.allcards.slice();
			sortingArray.sort(function (a, b) {
				var aCard = cardDetail(a);
				var bCard = cardDetail(b);
				var aVal = aCard.rank + (aCard.suit == 'H' ? 500 : aCard.suit == 'S' ? 400 : aCard.suit == 'D' ? 300 : 200);
				var bVal = bCard.rank + (bCard.suit == 'H' ? 500 : bCard.suit == 'S' ? 400 : bCard.suit == 'D' ? 300 : 200);
				return bVal - aVal;
			});
			$('#cardsinbid').html('');
			for (var i = 0; i < sortingArray.length; i++)
				$('#cardsinbid').append('<img src="img/cards/' + sortingArray[i] + '.PNG" alt="' + sortingArray[i] + '">');

			if (!M.Modal.getInstance($('#modal-gameover')).isOpen) {
				$("#modal-bid").modal('open');
				bidProcess(data);
			}

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
		M.toast({ html: playername.player + ' of Team ' + playername.team.toUpperCase() + ' won the bid', displayLength: 3200 });
	}, 2500);
});

socket.on('play', function (data) {
	gVars.sockMsgCount = gVars.sockMsgCount + 1;
	clearInterval(gVars.timer);
	gVars.sound_turn.stop();
	if (data.op.fp && data.lp == '' && !data.recon) //absolute first time
		setTimeout(function () {
			playProcess(data);
		}, data.op.re == 'nl' ? 3700 : 4000); //4000 was 4700
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
			M.toast({ html: 'You opened the Trump', classes: 'lime darken-3', displayLength: 2400 });
		}
		else {
			//mark
			var xName = playerFromNumber(numberFromPlayer(data.pl));
			if (xName.team == 'green')
				xName = gVars.greenplayers[xName.id];
			else
				xName = gVars.purpleplayers[xName.id];
			M.toast({ html: xName + ' opened the Trump', classes: 'lime darken-3', displayLength: 2400 });

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
				var jQcards = $('#bottomcardbox>.playercards');
				for (var i = 0; i < jQcards.length; i++) {
					if ($(jQcards[i]).attr('card') == gVars.card7) {
						$(jQcards[i]).addClass('card7');
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
		imgSrc.width = '160';
		imgSrc.height = '245';
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
		M.toast({ html: playername.player + ' of Team ' + playername.team.toUpperCase() + '&nbsp;has a marriage!', classes: 'lime darken-3', displayLength: 2500 });

		for (let i = 0; i < 4; i++) {
			let z = playerFromNumber(i);
			let b = elemfromidteam('#', 'bid', z.player);
			let memb = $(b).html();
			$(b).html(data.b[i] + ((z.team == data.bdt) ? d : ''));
			if ($(b).html() != memb)
				zio(b);
		}
	}, data.d == 'play' ? 1400 : 600);
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
	if (gVars.matchRunning) {
		socket.emit('recon', { 'id': gVars.curRoomID, 'pl': gVars.myname, 'LM': gVars.sockMsgCount, 'passw': gVars.curRoomPass });

		/* start VoiceServer */
		if (voiceChat.myPeer._disconnected)
			setTimeout(function () { reconnectVoice(gVars.curRoomID, gVars.curRoomPass, gVars.myteam + gVars.myUserID); }, 3000);
		/* end VoiceServer */
	}
});

socket.on('chat', function (data) {
	M.toast({ html: data.msg, classes: 'chatToast', displayLength: 4000 });
	$('#chatlog').append('<li class="collection-item flexcenter"><i class="material-icons">chevron_right</i>' + data.msg + '</li>');
	$("#modal-chat>.modal-content").scrollTop($("#modal-chat>.modal-content")[0].scrollHeight);
});

socket.on('color', function (data) {
	if (data.pl != gVars.myteam + gVars.myUserID) {
		$('#ipColor').val(data.val);
		$('.bodyBack').css('filter', 'hue-rotate(' + data.val + 'deg)');
	}
});

socket.on('pong', function (latency) {
	$('#network>i').removeClass('changeop');
	$('#network>span').html('&nbsp;' + latency + 'ms');
	var isChromium = !!window.chrome;
	if (latency > 380)
		isChromium ? $('#network>i').css('background-image', 'linear-gradient(to right,#d00 36%,rgba(255,255,255,.13) 36%)') : $('#network>i').css('color', '#d00');
	else if (latency > 120)
		isChromium ? $('#network>i').css('background-image', 'linear-gradient(to right,#dd0 64%,rgba(255,255,255,.13) 64%)') : $('#network>i').css('color', '#dd0');
	else
		isChromium ? $('#network>i').css('background-image', 'linear-gradient(to right,#0d0 99%,#0d0 100%)') : $('#network>i').css('color', '#0d0');
});

socket.on('hst', function (data) {
	const idx = data.idx;
	const lData = data.data;
	//history
	function gameHistory(index) {
		var text = '<ul class="collapsible" style="box-shadow:none;margin-top:0">';
		for (var i = 0; i < lData.length; i++) {
			var tabletext = '<table class="striped"><thead><tr><th>Player</th><th>Points</th><th>Hands</th><th>Rounds</th></tr></thead><tbody>';
			for (var j = 0; j < 4; j++) {
				var color = playerFromNumber(j).team;
				tabletext += '<tr><td><span class="' + color + '-text">' + lData[i].pn[j] + '</span></td><td><span class="' + color + '-text">' + lData[i].gp[j] + '</span></td><td><span class="' + color + '-text">' + lData[i].gh[j] + '</span></td><td><red>' + lData[i].gr[j] + '</red></td></tr>';
			}
			tabletext += '</tbody></table>';

			var pWin = indexOfMax(lData[i].gr);
			var winText;
			if (pWin == 0 || pWin == 1) {
				var winner = playerFromNumber(pWin).team;
				winText = '<span class="' + winner + '-text">Team ' + winner.toUpperCase() + '</span> won';
			}
			else
				winText = 'Game drawn';
			var mode = lData[i].gm == 0 ? 'Normal' : lData[i].gm + ' min';
			var oneItem = '<li><div class="collapsible-header"><i class="material-icons">' + ((index == 0) ? 'home' : 'timeline') + '</i>' + lData[i].rn + '<span class="transparent new badge" data-badge-caption=""><span class="new badge" data-badge-caption="">' + timeAbs(lData[i].rt) + '</span><span class="transparent new badge" data-badge-caption="" style="min-width:0"></span><span class="orange darken-2 new badge" data-badge-caption="">' + mode + '</span></span></div><div class="collapsible-body"><div class="hstWon">' + winText + ' in <red>' + timeDiff(lData[i].wt) + '</red>.</div><hr style="opacity:.2">' + tabletext + '</div></li>';
			text += oneItem;
		}
		text += '</ul>';
		if (lData.length == 0)
			text = '<div class="hstNotFound">No record found.</div>';
		$('#hstTab' + index).html(text);
		$('#hstTab' + index + '>ul').collapsible();
		if (index == 0)
			$('#gameCounter').html(data.c);
	}
	function playerHistory(index) {
		var text = '<table class="highlight striped centered"><thead><tr><th>Position</th><th>Player</th><th>' + (index == 1 ? 'Points' : 'Hands') + '</th><th>Date</th></tr></thead><tbody>';
		for (var i = 0; i < lData.length; i++) {
			text += '<tr><td class="flexcenter" style="justify-content:center"><i class="material-icons">' + ((i < 3) ? 'stars' : 'star') + '</i>&nbsp;' + (i + 1) + '</td><td>' + lData[i].pn + '</td><td><span class="red new badge" data-badge-caption="">' + (index == 1 ? lData[i].gp : lData[i].gh) + '</span></td><td><span class="new badge" data-badge-caption="">' + timeAbs(lData[i].rt) + '</span></td></tr>';
		}
		text += '</tbody></table>';
		if (lData.length == 0)
			text = '<div class="hstNotFound">No record found.</div>';
		$('#hstTab' + index).html(text);
	}

	switch (idx) {
		case 0: gameHistory(0); break;
		case 1: playerHistory(1); break;
		case 2: playerHistory(2); break;
		case 3: gameHistory(3); break;
	}
});

//document load
window.mobilecheck = function () {
	var check = false;
	(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
	return check;
};
var zoom = 1;

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
	console.log('%cThe 29 Game', 'color:green;font-weight:bold;font-size:2rem;');
	console.log('%c© Arindam Ray, 2020', 'color:red;font-weight:bold;font-size:1.5rem;');
	gVars.sound_turn = new sound('img/ting.mp3', true);
	gVars.sound_play = new sound('img/play.mp3');
	gVars.sound_cdown = new sound('img/cdown.mp3', true);
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
			$('#share-data').html('Play a game of 29 with me!<br>Roomname: ' + encodeHTML(gVars.curRoomName) + '<br>Password: ' + encodeHTML(gVars.curRoomPass) + '<br>Link: ' + '<a href="' + document.location.href + '" target="_blank">' + document.location.href + '</a>');
			$('#modal-share').modal('open');
			return false;
		});
	}
	initModals();
	$('.dropdown-trigger').dropdown();
	$('.collapsible').collapsible();
	$('select').formSelect();
	$('.tabs').tabs();
	$('.range-field>span').css('height', '30px!important');
	$('.range-field>span').css('width', '30px!important');
	$('.trumpshow').hide();
	$('#trumpset').hide();
	validateInput('#room_NEW', 10, true);
	validateInput('#room_NEW_pass', -1, false);
	validateInput('#username', 15, true);
	gVars.curRoomPass = '';
	gVars.startTime = '';
	gVars.myteam = '';
	gVars.sockMsgCount = 0;
	gVars.showMode = 'sort';
	gVars.timer = '';
	gVars.trumpOpen = false;
	gVars.card7 = '';
	gVars.currentPlayerPos = 0;
	gVars.isMobile = mobilecheck();
	M.Tooltip.init(document.querySelectorAll('.tooltipped'), { enterDelay: 0, exitDelay: 0, inDuration: 150, outDuration: 150 });
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
		$('#pload').animate({ opacity: 0 }, 200, function () {
			$('.pload').remove();
			if (gVars.isMobile)
				M.toast({ html: 'You can rotate your device to change the orientation!', displayLength: 2000 });
		});
	}, 950);
});