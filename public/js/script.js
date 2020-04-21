//DOM interactions
function arrayRotate(arr, count) {
  count -= arr.length * Math.floor(count / arr.length);
  arr.push.apply(arr, arr.splice(0, count));
}

function playerFromNumber(number) {
	//0->green0
	//1->purple0
	//2->green1
	//3->purple1
	switch(parseInt(number))
	{
		case 0: return {'player':'green0','id':0,'team':'green'};
		case 1: return {'player':'purple0','id':0,'team':'purple'};
		case 2: return {'player':'green1','id':1,'team':'green'};
		case 3: return {'player':'purple1','id':1,'team':'purple'};
	}
}
	
function numberFromPlayer(player) {
	//green0->0
	//purple0->1
	//green1->2
	//purple1->3
	return player=='green0'?0:(player=='green1'?2:(player=='purple0'?1:(player=='purple1'?3:-1)));
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

function timeout(percent,$elem){
    var icircle = percent*360/100;   
    if (icircle<=180){
        $($elem).css('background-image','linear-gradient(' + (90+icircle) + 'deg, transparent 50%, rgb(56, 85, 95) 50%),linear-gradient(90deg, rgb(56, 85, 95) 50%, transparent 50%)');
    }
    else{
        $($elem).css('background-image','linear-gradient(' + (icircle-90) + 'deg, transparent 50%, rgb(153, 184, 206) 50%),linear-gradient(90deg, rgb(56, 85, 95) 50%, transparent 50%)');
    }
}

function generateStack(cards,box,color) {
	var gap = 50;
	var imagewidth = 118;
	var imageheight = 180;
	$(box).html('');
	gVars.allcards = cards;
	if(color=='nocolor'){
		cards.sort(function(a, b){
			var aCard = cardDetail(a);
			var bCard = cardDetail(b);
			
			var aVal = aCard.rank + (aCard.suit=='H'?500:aCard.suit=='S'?400:aCard.suit=='D'?300:200);
			var bVal = bCard.rank + (bCard.suit=='H'?500:bCard.suit=='S'?400:bCard.suit=='D'?300:200);
			
			return bVal - aVal});
			
		for(var i=0;i<cards.length;i++)
			$(box).append('<div class="playercards" style="left:' + (i*gap) + 'px;background-image:url(img/cards/' + cards[i] + '.PNG);z-index:' + (i+10) + ';" card="' + cards[i] + '"></div>');
	}
	else
		for(var i=0;i<cards.length;i++)
			$(box).append('<div class="playercards" style="left:' + (i*gap) + 'px;background-image:url(img/cards/' + color.toUpperCase() + '_BACK.PNG);z-index:' + (i+10) + ';"></div>');
	var totWidth = imagewidth + (cards.length-1)*gap;
	$(box).css('width', (totWidth) +'px');
	$(box).css('padding-left','5px');
	$(box).css('padding-right','5px');
	if(box=='#cardboxleft') $(box).css('margin-left', (imageheight/2 - totWidth/2) +'px');
	if(box=='#cardboxright') $(box).css('margin-right', (imageheight/2 - totWidth/2) +'px');
}

function sock_up_poprooms(){
	$('.rooms-notloaded').hide();
	$('#divroom').show();
	socket.emit('roomlist','');
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
		}		
	});	
	$('#modal-trumpyesno').modal({
		dismissible: true
	});	
	$('#modal-gameover').modal({
		dismissible: false,
		onOpenStart: function (modal, trigger) {
			$('#modal-chat').modal('close');
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
}

function resetRound(){
	clearInterval(gVars.timer);
	timeout(0,$(".active-border"));
	$('#bidlog').html('');
	$('#trumpsetok').attr('disabled','');
	$('.trumpshow').hide();
	$('.boxes>div').removeClass('mvboxes');
	gVars.allcards = [];
	gVars.trumpOpen = false;
}

$('#trumpOpt>li').click(function(){
	$('#trumpsetok').removeAttr('disabled');
});

$("#roomrefresh").click(function(){
	sock_up_poprooms();
});

$('#form-addroom').submit(function () {
		var usr = $('#room_NEW').val();
		var pass = $('#room_NEW_pass').val();
		var timestamp = Date.now();
		if($('#room_NEW').val().trim() == ""){
			$('#room_NEW').val('');
			$('#room_NEW_pass').val('');
			return false;
		}
		if($('#room_NEW_pass').val().trim() == ""){
			$('#room_NEW_pass').val('');
			return false;
		}	
		$('.rooms-notloaded').hide();
		$('#divroom').show();
		socket.emit('addroom', {'name':usr,'pass':pass,'timestamp':timestamp});
		$('#room_NEW').val('');
		$('#room_NEW_pass').val('');
		$('#addroomdock').click();
	return false;
});

$('#form-chat').submit(function () {
	if($("#chatmessage").val().trim()=="")
		return false;
	var msg = '<span class="' + gVars.myteam + '-text">' + gVars.myname + ':&nbsp;</span>&nbsp;' + $("#chatmessage").val();
	$("#chatmessage").val('');
	socket.emit('chat',{'id':gVars.curRoomID,'msg':msg});	
	return false;
});

$('#backtoroomlist').click(function(){
	$('#modal-joingame').modal('close');
	$('#modal-roomlist').modal('open');
	return false;
});

$('#joingame').click(function(){
	if($('#username').val().trim() == ""){
		$('#username').val('');
		M.toast({html: 'Name cannot be blank',displayLength:3000});
		return false;
	}
	gVars.myname = $('#username').val();
	gVars.myteam = $("#teamselect").val();
	M.toast({html: 'Joining Game...',displayLength:3000});
	socket.emit('addplayer',{'id':gVars.curRoomID,'playername':gVars.myname,'team':gVars.myteam});
	return false;
});

function roomenter_submit(){
	$('.roomenter').submit(function (event) {
		gVars.currentlogin = event.target;
		var roomID = $(event.target).find("input[name=roomID]").val();
		var passw = $(event.target).find("input[name=roomPASS]").val();
		$(event.target).find("button").prop('disabled',true);
		socket.emit('login',{'id':roomID,'passw':passw});
		return false;
	});
	
	$('.deleteroom').click(function(event){
		gVars.currentlogin = event.target.parentNode;
		var roomID = $(event.target.parentNode).find("input[name=roomID]").val();
		var passw = $(event.target.parentNode).find("input[name=roomPASS]").val();
		$(event.target).attr('disabled','');
		socket.emit('deleteroom',{'id':roomID,'passw':passw});
		return false;
	});
}

function joingame() {
	$('#chatopen').show();
	$('#chatopen').addClass('scale-in');
	playscreenTeamUpdate();
	if(gVars.myteam=='green'){	
		$('#playMove').removeClass('white');
		$('#playMove').addClass('green');
	}
	else {
		$('#playMove').removeClass('white');
		$('#playMove').addClass('purple');
	}
}

function teamselectrefresh(){
	if(gVars.purpleplayers.length>0)
		text = 'Team Purple - (Players: ' + gVars.purpleplayers + ')';
	else
		text = 'Team Purple - No Players';
	$('#optpurple').html(text);
	if(gVars.purpleplayers.length==2)
		$('#optpurple').prop('disabled',true);
	else
		$('#optpurple').prop('disabled',false);
	
	if(gVars.greenplayers.length>0)
		text = 'Team Green - (Players: ' + gVars.greenplayers + ')';
	else
		text = 'Team Green - No Players';
	$('#optgreen').html(text);
	if(gVars.greenplayers.length==2)
		$('#optgreen').prop('disabled',true);
	else
		$('#optgreen').prop('disabled',false);
	$('#teamselect').formSelect();
}

function playerelemfromidteam(teamAndID) {
	var carr = ['green0','purple0','green1','purple1']; //order of play
	var direction = ['w','n','e','s'];
	arrayRotate(direction,carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	//direction.rotate(carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	var indexPos = carr.indexOf(teamAndID);
	switch(direction[indexPos]) {
		case 'w':   return '#leftname';
					break;
		case 'n':	return '#topname';
					break;
		case 'e':	return '#rightname';
					break;
		case 's':	return '#bottomname';
					break;		
	}	
}

function tableelemfromidteam(teamAndID) {
	var carr = ['green0','purple0','green1','purple1']; //order of play
	var direction = ['w','n','e','s'];
	arrayRotate(direction,carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	//direction.rotate(carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	var indexPos = carr.indexOf(teamAndID);
	switch(direction[indexPos]) {
		case 'w':   return '#lefttable';
					break;
		case 'n':	return '#toptable';
					break;
		case 'e':	return '#righttable';
					break;
		case 's':	return '#bottomtable';
					break;		
	}	
}

function timeelemfromidteam(teamAndID) {
	var carr = ['green0','purple0','green1','purple1']; //order of play
	var direction = ['w','n','e','s'];
	arrayRotate(direction,carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	//direction.rotate(carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	var indexPos = carr.indexOf(teamAndID);
	switch(direction[indexPos]) {
		case 'w':   return '#timeleft';
					break;
		case 'n':	return '#timetop';
					break;
		case 'e':	return '#timeright';
					break;
		case 's':	return '#timebottom';
					break;		
	}	
}

function boxelemfromidteam(teamAndID) {
	var carr = ['green0','purple0','green1','purple1']; //order of play
	var direction = ['w','n','e','s'];
	arrayRotate(direction,carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	//direction.rotate(carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	var indexPos = carr.indexOf(teamAndID);
	switch(direction[indexPos]) {
		case 'w':   return '.box-left>div';
					break;
		case 'n':	return '.box-top>div';
					break;
		case 'e':	return '.box-right>div';
					break;
		case 's':	return '.box-bottom>div';
					break;		
	}	
}

function trumpelemfromidteam(teamAndID) {
	var carr = ['green0','purple0','green1','purple1']; //order of play
	var direction = ['w','n','e','s'];
	arrayRotate(direction,carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	//direction.rotate(carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	var indexPos = carr.indexOf(teamAndID);
	switch(direction[indexPos]) {
		case 'w':   return '#lefttrump';
					break;
		case 'n':	return '#toptrump';
					break;
		case 'e':	return '#righttrump';
					break;
		case 's':	return '#bottomtrump';
					break;		
	}	
}

function bidelemfromidteam(teamAndID) {
	var carr = ['green0','purple0','green1','purple1']; //order of play
	var direction = ['w','n','e','s'];
	arrayRotate(direction,carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	//direction.rotate(carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	var indexPos = carr.indexOf(teamAndID);
	switch(direction[indexPos]) {
		case 'w':   return '#leftbid';
					break;
		case 'n':	return '#topbid';
					break;
		case 'e':	return '#rightbid';
					break;
		case 's':	return '#bottombid';
					break;		
	}	
}

function pointelemfromidteam(teamAndID) {
	var carr = ['green0','purple0','green1','purple1']; //order of play
	var direction = ['w','n','e','s'];
	arrayRotate(direction,carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	//direction.rotate(carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	var indexPos = carr.indexOf(teamAndID);
	switch(direction[indexPos]) {
		case 'w':   return '#leftpoint';
					break;
		case 'n':	return '#toppoint';
					break;
		case 'e':	return '#rightpoint';
					break;
		case 's':	return '#bottompoint';
					break;		
	}	
}

function roundelemfromidteam(teamAndID) {
	var carr = ['green0','purple0','green1','purple1']; //order of play
	var direction = ['w','n','e','s'];
	arrayRotate(direction,carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	//direction.rotate(carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	var indexPos = carr.indexOf(teamAndID);
	switch(direction[indexPos]) {
		case 'w':   return '#leftround';
					break;
		case 'n':	return '#topround';
					break;
		case 'e':	return '#rightround';
					break;
		case 's':	return '#bottomround';
					break;		
	}	
}

function cardboxfromidteam(teamAndID) {
	var carr = ['green0','purple0','green1','purple1']; //order of play
	var direction = ['w','n','e','s'];
	arrayRotate(direction,carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	//direction.rotate(carr.indexOf('s') - carr.indexOf(gVars.myteam + gVars.myUserID));
	var indexPos = carr.indexOf(teamAndID);
	switch(direction[indexPos]) {
		case 'w':   return '#cardboxleft';
					break;
		case 'n':	return '#cardboxtop';
					break;
		case 'e':	return '#cardboxright';
					break;
		case 's':	return '#cardboxbottom';
					break;		
	}	
}

function playscreenTeamUpdate() {
	for(var i=0;i<gVars.greenplayers.length;i++)
		$(playerelemfromidteam('green'+i)+'>div>h5').html(gVars.greenplayers[i]);
	for(var i=0;i<gVars.purpleplayers.length;i++)
		$(playerelemfromidteam('purple'+i)+'>div>h5').html(gVars.purpleplayers[i]);
}

$('#cardboxbottom').click(function(event){
	var clickedCard = event.target;
	if($(clickedCard).attr('id')=='cardboxbottom')
		return false;
	$('#cardboxbottom>*').removeClass('cardselected');
	$(clickedCard).addClass('cardselected');
	$('#playMove').removeAttr('disabled');
	gVars.currentCard = $(clickedCard).attr('card');
	return false;
});

$('#bidrange').on('input', function () {
    $('#bidupdate').html($('#bidrange').val());
});

function bidProcess(data) {
	$('#bidlog').append('<li class="collection-item flexcenter"><i class="material-icons">chevron_right</i>' + data.log + '</li>');

	if(data.biddouble=='settrump'){
		if(gVars.myteam +gVars.myUserID == data.bidwinner){
			$('#trumpset').show();
			$("#modal-bid>.modal-content").scrollTop($("#modal-bid>.modal-content")[0].scrollHeight);
		}
		else
			$('#trumpset').hide();
		return;		
	}
	else if(data.biddouble=='double')
	{
		gVars.bidDouble = 'double';
		$('#doubletext').html('Double');
		$('#biddoubleopt').html('<label><input name="groupD" type="radio" value="1" checked /><span>Pass</span></label>&nbsp;&nbsp;&nbsp;&nbsp;<label><input name="groupD" type="radio" value="2" /><span>Double</span></label>');
		var winner = playerFromNumber(numberFromPlayer(data.bidwinner));
		if(gVars.myteam != winner.team){
			$('#biddouble').show();
			$("#modal-bid>.modal-content").scrollTop($("#modal-bid>.modal-content")[0].scrollHeight);
		}
		else
			$('#biddouble').hide();
		return;	
	}
	else if(data.biddouble=='redouble') {
		gVars.bidDouble = 'redouble';
		$('#doubletext').html('Redouble');
		$('#biddoubleopt').html('<label><input name="groupD" type="radio" value="1" checked /><span>Pass</span></label>&nbsp;&nbsp;&nbsp;&nbsp;<label><input name="groupD" type="radio" value="4" /><span>Redouble</span></label>');
		var winner = playerFromNumber(numberFromPlayer(data.bidwinner));
		if(gVars.myteam == winner.team){
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
	gVars.currentBid = data.currentbid;

	if(data.player==player){
		if(data.bidwinner==player||data.bidwinner=='-100'){
			$('#bidrange').attr('min',parseInt(data.currentbid)).attr('value',parseInt(data.currentbid)).val(parseInt(data.currentbid));
			$('#bidupdate').html(parseInt(data.currentbid));
			gVars.raiseOrMatch = 'matched bid to&nbsp;';
		}
		else {
			$('#bidrange').attr('min',parseInt(data.currentbid)+1).attr('value',parseInt(data.currentbid)+1).val(parseInt(data.currentbid)+1);
			$('#bidupdate').html(parseInt(data.currentbid)+1);
			gVars.raiseOrMatch = 'raised bid to&nbsp;';
		}
		if(data.bidwinner=='-100')
			gVars.raiseOrMatch = 'started bid at&nbsp;';
		$('#bidchange').show();
		$("#modal-bid>.modal-content").scrollTop($("#modal-bid>.modal-content")[0].scrollHeight);
		var event = new CustomEvent('mousedown', {});
		document.getElementById('bidrange').dispatchEvent(event);
	}
	else
		$('#bidchange').hide();
}

$('#bidraise').click(function(){
	socket.emit('bid',{'id':gVars.curRoomID,'passed':false,'amount':$('#bidrange').val(),'player':gVars.myteam+gVars.myUserID,'log':'<span class="' + gVars.myteam + '-text">' + gVars.myname + '</span>&nbsp;' + gVars.raiseOrMatch  + '<span class="red-text">'+$('#bidrange').val()+'</span>','over':{'isOver':false}});
	$('#bidchange').hide();
	return false;
});

$('#bidpass').click(function(){
	socket.emit('bid',{'id':gVars.curRoomID,'passed':true,'amount':$('#bidrange').val(),'player':gVars.myteam+gVars.myUserID,'log':'<span class="' + gVars.myteam + '-text">' + gVars.myname + '</span>&nbsp;passed the bid','over':{'isOver':false}});
	$('#bidchange').hide();
	return false;
});

$('#biddoubleok').click(function(){
	var m = parseInt($('input[name="groupD"]:checked').val());
	var textm = (m==1)?'did not '+gVars.bidDouble:((m==2)?'doubled':'redoubled');
	socket.emit('bid',{'id':gVars.curRoomID,'passed':'','amount':'','player':gVars.myteam+gVars.myUserID,'log':'<span class="' + gVars.myteam + '-text">' + gVars.myname + '</span>&nbsp;' + textm,'over':{'isOver':gVars.bidDouble+'end','multiplier':m,'team':gVars.myteam}});
	$('#biddouble').hide();
	return false;
});

$('#playMove').click(function(){
	socket.emit('play',{'id':gVars.curRoomID,'player':gVars.myteam+gVars.myUserID,'card':gVars.currentCard,'firstplay':gVars.firstplay});
	//cardPlayed(gVars.myteam+gVars.myUserID,gVars.currentCard);
	$('#playMove').attr('disabled','');
	return false;
});

$('#trumpyes').click(function(){
	socket.emit('trump',{'id':gVars.curRoomID,'player':gVars.myteam+gVars.myUserID,'operation':'open'});
	$('#cardboxbottom').addClass('carddisabled');
	$('#modal-trumpyesno').modal('close');
	return false;
});

$('#trumpsetok').click(function(){
	var tIndex = document.getElementById('trumpOpt').M_Tabs.index;
	var tSuit = tIndex==0?'H':tIndex==1?'S':tIndex==2?'D':'C';
	socket.emit('trump',{'id':gVars.curRoomID,'player':gVars.myteam+gVars.myUserID,'suit':tSuit,'operation':'set',log:'<span class="' + gVars.myteam + '-text">' + gVars.myname + '</span>&nbsp;set the Trump'});
	$('#trumpset').hide();
	return false;
});

$('#trumpno').click(function(){
	$('#modal-trumpyesno').modal('close');
	return false;
});

$('#trumpcard').click(function(){
	$('#modal-trumpyesno').modal('open');
	return false;
});

$('#chatopen').click(function(){
	$('#modal-chat').modal('open');
	return false;
});

$('#credits').click(function(){
	$('#modal-credits').modal('open');
	return false;
});

function cardDetail(card){
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

function checkSuitEnable(arr, val) {
  return arr.some(function(arrVal) {
    return val === arrVal;
  });
}

function hasSuit(suit){
	for(var i=0;i<$('#cardboxbottom>.playercards').length;i++){
		var elem = $('#cardboxbottom>.playercards')[i];
		var card = cardDetail($(elem).attr('card'));
		if(suit==card.suit)
			return true;
	}
	return false;
}

function enableCards(suits) {
	for(var i=0;i<$('#cardboxbottom>.playercards').length;i++){
		var elem = $('#cardboxbottom>.playercards')[i];
		var card = cardDetail($(elem).attr('card'));
		$(elem).removeClass('cardselected');
		if(checkSuitEnable(suits,card.suit)){
			$(elem).removeClass('carddisabled');
			$(elem).addClass('movable');
		}
		else{
			$(elem).addClass('carddisabled');
			$(elem).removeClass('movable');
		}
	}
}

function cardPlayed(player,card,deckcards){
	if(player==''||card==''||deckcards==[])
		return;
	var unqIndex = gVars.myteam + gVars.myUserID;
	var cur = playerFromNumber(numberFromPlayer(player));
	$(tableelemfromidteam(player)).css('z-index',gVars.currentPlayerPos*10);
	$(tableelemfromidteam(player)+'>img').attr('src','img/cards/'+card+'.PNG');
	$(tableelemfromidteam(player)).show();
	generateStack(deckcards,cardboxfromidteam(cur.player),unqIndex==cur.player?'nocolor':cur.team);	
}

function buildcardstack(data){
	var unqIndex = gVars.myteam + gVars.myUserID;
	for(var i=0;i<data.length;i++){
		var player = playerFromNumber(i);
		generateStack(data[i],cardboxfromidteam(player.player),unqIndex==player.player?'nocolor':player.team);
	}
	$('#cardboxbottom').addClass("animcards");
	$('#cardboxtop').addClass("animcards");
	$('#cardboxleft').addClass("animcards");
	$('#cardboxright').addClass("animcards");
	M.toast({html: 'Cards distributed - 4',displayLength:2000});
}

function enableTrump(select) {
	if(!select)
		$('#trumpcard').addClass('carddisabled');
	else
		$('#trumpcard').removeClass('carddisabled');
}

function playProcess(data){
	if(data.op.re=='ro'){
		M.toast({html: 'New Round',displayLength:2000});
	}
	else if(data.op.re=='go'){
		M.toast({html: 'Game Over',displayLength:2000});
	}

	enableTrump(false);
	var player = gVars.myteam + gVars.myUserID;
	clearInterval(gVars.timer);
	timeout(0,$(".active-border"));
	
	if(data.op.fp){
		setTimeout(function() {
			if(data.op.re=='go'){
				var winner = playerFromNumber(indexOfMax(data.op.rs)).team;
				$('#winmessage').html('<span class="'+winner+'-text">Team '+winner.toUpperCase()+'</span> wins the game.');
				var text = '<table><thead><tr><th>Player Name</th><th>Rounds</th></tr></thead><tbody>';
				for(var i=0;i<4;i++){
					var xName = playerFromNumber(i);
					if(xName.team == 'green')
						xName.player = gVars.greenplayers[xName.id];
					else
						xName.player = gVars.purpleplayers[xName.id];
					text += '<tr><td><span class="'+xName.team+'-text">'+xName.player+'</span></td><td><span class="red-text">' + data.op.rs[i]+'</span></td></tr>';
				}
				$('#winmessage').append(text+'</tbody></table>');
				$('#modal-gameover').modal('open');
			}
			
			for(var i=0;i<4;i++){
				$(pointelemfromidteam(playerFromNumber(i).player)).html(data.op.pt[i]);
				$(roundelemfromidteam(playerFromNumber(i).player)).html(data.op.rs[i]);
			}
			gVars.currentPlayerPos = 0;
			$('.centerplay').hide();
			$('.centerplay>img').attr('src','');
			if(player==data.pl){
				$('#cardboxbottom').removeClass('carddisabled');
				if(data.op.re=='nl')
					M.toast({html: 'Your turn',displayLength:2000});
			}
			if(data.op.re!='go')
				startTimer(data,player);
		}, (data.lp=='')?0:1500);
	}
	else{
		if(player==data.pl){
			$('#cardboxbottom').removeClass('carddisabled');
			if(data.op.re=='nl')
				M.toast({html: 'Your turn',displayLength:2000});
		}
		startTimer(data,player);
	}
	
	gVars.currentPlayerPos = gVars.currentPlayerPos + 1;
	cardPlayed(data.lp,data.lpc,data.lpac);
	
	if(player==data.pl){
		if(data.op.fp){
			gVars.firstplay = true;
			enableCards(['S','C','H','D']);
		}
		else {
			gVars.firstplay = false;
			var playSuit = cardDetail(data.op.fc);
			if(hasSuit(playSuit.suit)){
				enableCards([playSuit.suit]);
			}
			else {
				if(!gVars.trumpOpen) 
					enableTrump(true);
				enableCards(['S','C','H','D']);
			}
		}
	}
	else{
		$('#cardboxbottom').addClass('carddisabled');
		$('#playMove').attr('disabled','');
	}
}

function startTimer(data,player){	
	gVars.timerCount = 0;
	var telem = timeelemfromidteam(data.pl);
	var xName = playerFromNumber(numberFromPlayer(data.pl));
	if(xName.team == 'green')
		xName = gVars.greenplayers[xName.id];
	else
		xName = gVars.purpleplayers[xName.id];
	
	$('.boxes>div').removeClass('mvboxes');
	$(boxelemfromidteam(data.pl)).addClass('mvboxes');
	
	gVars.timer = setInterval(function(){ 
		gVars.timerCount = (gVars.timerCount+.25)%100;
		if(gVars.timerCount==99)
			if(player==data.pl)
				M.toast({html: 'Please play a card', displayLength:3000});
			else
				M.toast({html: xName + ' has not played a card for 1 minute', displayLength:3000});
		timeout(gVars.timerCount, telem); 
	}, 150);
}

var gVars =  {
	curRoomID : '',     // abc12395829472
	currentlogin : '',  // HTML element for login
	purpleplayers : '', // ['pPlayer1','pPlayer2']
	greenplayers : '',  // ['gPlayer1','gPlayer2']
	myname : '',        // Current username
	myteam : '',        // 'purple' or 'green'
	myUserID : '',      // 0 or 1 based on location in array
	currentCard : '',   // 3C, current card selected
	currentBid: '',     // 21, current bid value
	raiseOrMatch: '',   // bid raise or match
	bidDouble : '',     // 'double' or 'redouble'
	trumpOpen : '',  // true or false, trump is open or not
	trumpCard : '',     // '8D' , trump card
	currentPlayerPos : '', // 0,1,2,3 tracks cards on center table
	firstplay : '',     // if first play
	timerCount : '',    // counter timer 0-100
	timer : '',         // timer element
	trumpSetter : '',   // player who set trump (green0,purple1 etc.)
	
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
	set curRoomID(data) {
		curRoomID = data;
	},
	get curRoomID() {
		return curRoomID;
	},
	set currentlogin(data) {
		currentlogin = data;
	},
	get currentlogin() {
		return currentlogin;
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
	set trumpCard(data) {
		trumpCard = data;
	},
	get trumpCard() {
		return trumpCard;
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
	}
};

function vh() {
  return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
}
function vw() {
  return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
}
function shiftzoom(large,small){
	return ((vh()/vw())<1.1)?(vw()/large):(vh()/large);
}

//socket functions only
var socket = io();

socket.on('roomlist', function(data) {
	gVars.currentlogin = '';
	$('#rooms-list').html('');
    for(var i=0;i<data.number;i++){
		var d = new Date(data.timestamps[i]);
		var timest = d.getHours() + ':' +  d.getMinutes() + ':' +  d.getSeconds() + '  ' + d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
		$('#rooms-list').append('<li><div class="collapsible-header"><i class="material-icons">home</i>' + data.names[i] + '&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp' + timest + '<span class="' + ((data.users[i]==4)?'red':'green') + ' new badge" data-badge-caption="player(s)">'+ data.users[i] +'</span></div><div class="collapsible-body"><form class="roomenter" action=""><label for="room_password">Password</label><input name="roomPASS" placeholder="Enter Room password" type="password" class="validate"><input name="roomID" type="hidden" value="' + data.ids[i] + '"><button type="submit" class="waves-effect waves-light btn">ENTER ROOM</button><a href="#" class="btn red waves-effect waves-light deleteroom"> Delete Room</a></form></div></li>');
	}
	roomenter_submit();
	$('#divroom').hide();
	$('.rooms-notloaded').show();
});

socket.on('login', function(data) {
	if(data.success){
		gVars.curRoomID = data.roomID;
		gVars.purpleplayers = data.teampurple;
		gVars.greenplayers = data.teamgreen;
		$("#modal-roomlist").modal('close');
		$("#modal-joingame").modal('open');
		teamselectrefresh();
	}
	else {
		$(gVars.currentlogin).find("input[name=roomPASS]").val('');
		$(gVars.currentlogin).find("input[name=roomPASS]").attr("placeholder","Wrong password. Try again");
		$(gVars.currentlogin).find("button").prop('disabled',false);
	}
		
});

socket.on('addplayer', function(data) {
	if(data.success){
		gVars.purpleplayers = data.teampurple;
		gVars.greenplayers = data.teamgreen;
		gVars.myUserID = data.playerid;
		$('#playerwait').show();
		M.toast({html: 'Game joined',displayLength:3000});
		$("#modal-joingame").modal('close');
		joingame();
	}
	else {
		M.toast({html: 'Error: Room may be full. Retry or try another room',displayLength:3000});
	}
});

socket.on('deleteroom', function(data) {
	if(data.success){
		M.toast({html: 'Room deleted',displayLength:3000});
		sock_up_poprooms();
	}
	else if(data.wrongpass == true){
		$(gVars.currentlogin).find("input[name=roomPASS]").val('');
		$(gVars.currentlogin).find("input[name=roomPASS]").attr("placeholder","Wrong password. Try again");
		$(gVars.currentlogin).find("a").removeAttr('disabled');
	}
	else {
		M.toast({html: 'Error deleting room. Room may have been deleted already',displayLength:3000});
		$(gVars.currentlogin).find("a").removeAttr('disabled');
	}		
});

socket.on('playerrefresh', function(data) {
	gVars.purpleplayers = data.teampurple;
	gVars.greenplayers = data.teamgreen;
	//teamselectrefresh();
	playscreenTeamUpdate();	
});

socket.on('cardstack',function(data){
	$('#playerwait').hide();
	$('#trumpcard>img').attr('src','img/cards/BLUE_BACK.PNG');
	
	var i = 0;
	var cardcount = 0;
	var cardlist = new Array();
	while(i<data.cards.length){
		cardcount++;
		if(data.cards.substring(i,i+1)=='1'){
			cardlist.push(data.cards.substring(i,i+3));
			i += 3;
		}
		else{
			cardlist.push(data.cards.substring(i,i+2));
			i += 2;
		}
	}
	var cards = new Array();
	for(var i=0;i<parseInt(data.members);i++)
		cards[i] = new Array();
	var cPerMember = cardcount/parseInt(data.members);
	for(var i=0;i<parseInt(data.members);i++){
		for(var j=0;j<cPerMember;j++){
			cards[i].push(cardlist[i*cPerMember+j]);
		}
	}			
		
	if(data.delay)
		setTimeout(function() {
				buildcardstack(cards);
			}, 1000);
	else
		buildcardstack(cards);
});

socket.on('bid',function(data){
	if(data.firstbid)
		setTimeout(function() {
				$("#modal-bid").modal('open');
				bidProcess(data);		
			}, data.delay?3500:2500);
	else
		bidProcess(data);
				
});

socket.on('bidover',function(data){
	$('#biddouble').hide();
	$('#bidlog').append('<li class="collection-item flexcenter"><i class="material-icons">chevron_right</i>' + data.log + '</li>');
	$("#modal-bid>.modal-content").scrollTop($("#modal-bid>.modal-content")[0].scrollHeight);
	var d = parseInt(data.biddouble)==1?'':' x' + data.biddouble;
	var playername = playerFromNumber(data.winner);
	if(playername.team=='green')
		playername.player = gVars.greenplayers[playername.id];
	else
		playername.player = gVars.purpleplayers[playername.id];
	setTimeout(function() {
		$("#modal-bid").modal('close');
		for(var i=0;i<4;i++){
			var z = playerFromNumber(i);
			$(bidelemfromidteam(z.player)).html(data.bidvalues[i]+((z.team==data.biddoubleteam)?d:''));	
		}
		M.toast({html: playername.player + ' of Team ' + playername.team.toUpperCase() +' won the bid',displayLength:2000});
	}, 3000);
});

socket.on('play',function(data){
	if(data.op.fp && data.lp=='') //absolute first time
		setTimeout(function() {
			playProcess(data);		
		}, data.op.re=='nl'?3700:4700);
	else
		playProcess(data);
});

socket.on('trump',function(data){
	if(data.operation=='open'){
		if(data.player==gVars.myteam+gVars.myUserID){
			$('#cardboxbottom').removeClass('carddisabled');
			var tCard = cardDetail(data.card);
			if(hasSuit(tCard.suit))
				enableCards([tCard.suit]);
			else
				enableCards(['S','C','H','D']);
			M.toast({html: 'You opened the Trump',displayLength:3000});		
		}
		else{
			var xName = playerFromNumber(numberFromPlayer(data.player));
			if(xName.team == 'green')
				xName = gVars.greenplayers[xName.id];
			else
				xName = gVars.purpleplayers[xName.id];
			M.toast({html: xName + ' opened the Trump',displayLength:3000});
			
		}
		gVars.trumpOpen = true;
		gVars.trumpCard = data.card;
		enableTrump(false);
		$('#trumpcard>img').attr('src','img/cards/'+data.card+'.PNG');
	}
	else if(data.operation=='set'){
		$(trumpelemfromidteam(data.player)).show();
		gVars.trumpSetter = data.player;
		//preload trump image
		var preloadLink = document.createElement('link');
		preloadLink.href = 'img/cards/'+data.card+'.PNG';
		preloadLink.rel = 'preload';
		preloadLink.as = 'image';
		document.head.appendChild(preloadLink);
		var imgSrc = document.createElement('img');
		imgSrc.src = 'img/cards/'+data.card+'.PNG';
		document.getElementById('imgload').appendChild(imgSrc);
	}
});

socket.on('marriage',function(data){
	var d = parseInt(data.biddouble)==1?'':' x' + data.biddouble;
	var playername = playerFromNumber(numberFromPlayer(data.player));
	if(playername.team=='green')
		playername.player = gVars.greenplayers[playername.id];
	else
		playername.player = gVars.purpleplayers[playername.id];
	setTimeout(function() {
		M.toast({html: playername.player + ' of Team ' + playername.team.toUpperCase() +'&nbsp;has a marriage!', displayLength:4000});
		for(var i=0;i<4;i++){
			var z = playerFromNumber(i);
			$(bidelemfromidteam(z.player)).html(data.bidvalues[i]+((z.team==data.biddoubleteam)?d:''));	
		}
	}, data.delay=='play'?1400:500);
});

socket.on('chat',function(data){
	M.toast({html: data.msg,displayLength:2000});
	$('#chatlog').append('<li class="collection-item flexcenter"><i class="material-icons">chevron_right</i>' + data.msg + '</li>');
	$("#modal-chat>.modal-content").scrollTop($("#modal-chat>.modal-content")[0].scrollHeight);
});

//document load
window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
var zoom = 1;
var animation = false;
function canvasLoad(start){
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
	let w=700, h=300, rAF;

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
		if(animation) 
			rAF = window.requestAnimationFrame(glitch);
		else
		{
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
	(animation)?glitch():ctx.clearRect(0, 0, canvas.width, canvas.height);
}


$(function(){
	timeout(0,$(".active-border"));
    initModals();
	$('.collapsible').collapsible();
	$('select').formSelect();
	$('.tabs').tabs();
	$('.range-field>span').css('height','30px!important');
	$('.range-field>span').css('width','30px!important');
	$('.trumpshow').hide();
	$('#trumpset').hide();
	gVars.timer = '';
	gVars.trumpOpen = false;
	gVars.currentPlayerPos = 0;
	
	//UI resize 
	$('body').css('zoom',shiftzoom(1920,1080));
    if (mobilecheck()){
		$(window).on( "orientationchange", function( event ) {
			$(window).one('resize', function() {
				zoom = shiftzoom(1920,1080);
				$('body').css('zoom',zoom);
				var x = (!(vh()-360*zoom>540*zoom))?Math.max(0,(vh()-360*zoom)/(zoom*540)):1;
				$('#maintable').css('transform','scale('+x+')');
				var x = (!(vh()-360*zoom>270*zoom))?Math.max(0,(vh()-360*zoom)/(zoom*270)):1;
				$('#trumpcard').css('transform','scale('+x+')');
			   //event.orientation
			});
		});
	}
	else{
		$(window).resize(function() {
			zoom = shiftzoom(1920,1080);
			$('body').css('zoom',zoom);
			var x = (!(vh()-360*zoom>540*zoom))?Math.max(0,(vh()-360*zoom)/(zoom*540)):1;
			$('#maintable').css('transform','scale('+x+')');
			var x = (!(vh()-360*zoom>270*zoom))?Math.max(0,(vh()-360*zoom)/(zoom*270)):1;
			$('#trumpcard').css('transform','scale('+x+')');
		});
    }
	$('#imgload').hide();
	$("#preload").remove();
    $("#modal-roomlist").modal('open');
});