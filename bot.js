(() => {
	//
	// GLOBAL VARS AND CONFIGS
	//

	var lastMessage = 'a';
	var lastUsername = 'a';
	var giphyAPIKey='4x54DD8AFblVXRX87fNZzRZZhkRLAUSG';

	var lastMessageOnChat = false;
	var ignoreLastMsg = {};
	var elementConfig = {
		"chats": [1, 0, 5, 2, 0, 3, 0, 0, 0],
		"chat_icons": [0, 0, 1, 1, 1, 0],
		"chat_title": [0, 0, 1, 0, 0, 0],
		"chat_lastmsg": [0, 0, 1, 1, 0, 0],
		"chat_active": [0, 0],
		"selected_title": [1, 0, 5, 3, 0, 1, 1, 0, 0, 0]
	};


	function getJoke() {

		var val,
                src = 'https://avatars2.githubusercontent.com/u/13456224?s=400&u=f3200da4647ab51263d0e38a1a94b9b4ebcf12b4&v=4',
                img = document.createElement('img');

            img.src = src;
		// var req = new XMLHttpRequest();

		// req.onreadystatechange = function () {
		// 	if (4 == req.readyState && 200 == req.status) {
		// 		var reponse = JSON.parse(req.responseText);
		// 		console.log(reponse);
		// 	}
		// }
		// req.open('GET', 'http://api.giphy.com/v1/gifs/search?q=funny+cat&api_key=4x54DD8AFblVXRX87fNZzRZZhkRLAUSG');
		// req.send();
	}

	// const jokeList = [
	// 	`
	// 	Husband and Wife had a Fight.
	// 	Wife called Mom : He fought with me again,
	// 	I am coming to you.
	// 	Mom : No beta, he must pay for his mistake,
	// 	I am comming to stay with U!`,

	// 	`
	// 	Husband: Darling, years ago u had a figure like Coke bottle.
	// 	Wife: Yes darling I still do, only difference is earlier it was 300ml now it's 1.5 ltr.`,

	// 	`
	// 	God created the earth, 
	// 	God created the woods, 
	// 	God created you too, 
	// 	But then, even God makes mistakes sometimes!`,

	// 	`
	// 	What is a difference between a Kiss, a Car and a Monkey? 
	// 	A kiss is so dear, a car is too dear and a monkey is U dear.`
	// ]


	//
	// FUNCTIONS
	//

	// Get random value between a range
	function rand(high, low = 0) {
		return Math.floor(Math.random() * (high - low + 1) + low);
	}

	function getElement(id, parent) {
		if (!elementConfig[id]) {
			return false;
		}
		var elem = !parent ? document.body : parent;
		var elementArr = elementConfig[id];
		for (var x in elementArr) {
			var pos = elementArr[x];
			if (isNaN(pos * 1)) { //dont know why, but for some reason after the last position it loops once again and "pos" is loaded with a function WTF. I got tired finding why and did this
				continue;
			}
			if (!elem.childNodes[pos]) {
				return false;
			}
			elem = elem.childNodes[pos];
		}
		return elem;
	}

	function getLastMsg() {
		var messages = document.querySelectorAll('.msg');
		var pos = messages.length - 1;

		while (messages[pos] && (messages[pos].classList.contains('msg-system') || messages[pos].querySelector('.message-out'))) {
			pos--;
			if (pos <= -1) {
				return false;
			}
		}
		if (messages[pos] && messages[pos].querySelector('.selectable-text')) {
			return messages[pos].querySelector('.selectable-text').innerText;
		} else {
			return false;
		}
	}

	function getUnreadChats() {
		var unreadchats = [];
		var chats = getElement("chats");
		if (chats) {
			chats = chats.childNodes;
			for (var i in chats) {
				if (!(chats[i] instanceof Element)) {
					continue;
				}
				var icons = getElement("chat_icons", chats[i]).childNodes;
				if (!icons) {
					continue;
				}
				for (var j in icons) {
					if (icons[j] instanceof Element) {
						if (!(icons[j].childNodes[0].getAttribute('data-icon') == 'muted' || icons[j].childNodes[0].getAttribute('data-icon') == 'pinned')) {
							unreadchats.push(chats[i]);
							break;
						}
					}
				}
			}
		}
		return unreadchats;
	}

	function didYouSendLastMsg() {
		var messages = document.querySelectorAll('.msg');
		if (messages.length <= 0) {
			return false;
		}
		var pos = messages.length - 1;

		while (messages[pos] && messages[pos].classList.contains('msg-system')) {
			pos--;
			if (pos <= -1) {
				return -1;
			}
		}
		if (messages[pos].querySelector('.message-out')) {
			return true;
		}
		return false;
	}

	// Call the main function again
	const goAgain = (fn, sec) => {
		setTimeout(fn, sec * 666)
	}

	// Dispath an event (of click, por instance)
	const eventFire = (el, etype) => {
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent(etype, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		el.dispatchEvent(evt);
	}

	// Select a chat to show the main box
	const selectChat = (chat, cb) => {
		const title = getElement("chat_title", chat).title;
		eventFire(chat.firstChild.firstChild, 'mousedown');
		if (!cb) return;
		const loopFewTimes = () => {
			setTimeout(() => {
				const titleMain = getElement("selected_title").title;
				if (titleMain !== undefined && titleMain != title) {
					console.log('not yet');
					return loopFewTimes();
				}
				return cb();
			}, 300);
		}

		loopFewTimes();
	}

	// Send a message
	const sendMessage = (chat, message, cb) => {
		//avoid duplicate sending
		var title;

		if (chat) {
			title = getElement("chat_title", chat).title;
		} else {
			title = getElement("selected_title").title;
		}
		ignoreLastMsg[title] = message;

		messageBox = document.querySelectorAll("[contenteditable='true']")[0];

		//add text into input field
		// messageBox.innerHTML = message.replace(/  /gm, '');
		messageBox.innerHTML = message.replace(/  /gm, '');

		//Force refresh
		event = document.createEvent("UIEvents");
		event.initUIEvent("input", true, true, window, 1);
		messageBox.dispatchEvent(event);

		//Click at Send Button
		eventFire(document.querySelector('span[data-icon="send"]'), 'click');

		cb();
	}




	const start = (_chats, cnt = 0) => {
		// get next unread chat
		const chats = _chats || getUnreadChats();
		const chat = chats[cnt];

		var untreatedMessage;
		var processLastMsgOnChat = false;

		if (!lastMessageOnChat) {
			if (false === (lastMessageOnChat = getLastMsg())) {
				lastMessageOnChat = true; //to prevent the first "if" to go true everytime
			} else {
				untreatedMessage = lastMessageOnChat;
			}
		} else if (lastMessageOnChat != getLastMsg() && getLastMsg() !== false && !didYouSendLastMsg()) {
			lastMessageOnChat = untreatedMessage = getLastMsg();
			processLastMsgOnChat = true;
		}

		if (!processLastMsgOnChat && (chats.length == 0 || !chat)) {
			// console.log('nothing to do now... (1)', chats.length, chat);
			return goAgain(start, 3);
		}

		// get infos
		var title;
		if (!processLastMsgOnChat) {
			title = getElement("chat_title", chat).title + '';
			untreatedMessage = (getElement("chat_lastmsg", chat) || { innerText: '' }).innerText; //.last-msg returns null when some user is typing a message to me
		} else {
			title = getElement("selected_title").title;
		}
		// avoid sending duplicate messaegs
		if (ignoreLastMsg[title] && (ignoreLastMsg[title]) == untreatedMessage) {
			// console.log('nothing to do now... (2)', title, lastMsg);
			return goAgain(() => { start(chats, cnt + 1) }, 0.1);
		}

		// what to answer back?
		let sendText
		var botSent=false;
		
		var lines = untreatedMessage.split('\n');
		
		// getJoke();
		
		if(lines[0].endsWith(':')){
			username = lines[0].slice(0, -1);
			lines.splice(0, 1);
			var message = lines.join('\n').trim().toLowerCase();
		}else{
			return goAgain(start, 3);
		}
		
		// console.log ('untreated:',untreatedMessage);
		// console.log ('username:',username);
		// console.log ('message:',message);
		if (message == 'this message was deleted') {
			if (username == lastUsername) {
				sendText = 'Parece que ' + lastUsername + ' se arrependeu de ter enviado "' + lastMessage + '"'
			}
		}


		lastMessage = message;
		lastUsername = username;


		if (username == 'Brutus') {
			sendText = 'Brutus, o simpatico'
		} else if (username == 'GabrielGomes') {
			if (rand(5) == 1)
				sendText = '#JovemEmpreendedor'
		} else if (username == 'Soja') {
			if (rand(5) == 1)
				sendText = '#AutistaTbmEhGente'
		} else if (username == 'Dario') {
			if (rand(5) == 1)
				sendText = 'olha o macoero'
		} else if (username == 'Kaio') {
			if (rand(5) == 1)
				sendText = 'fica quieto ai kaio'
		} else if (username == 'Juan') {
			if (rand(5) == 1)
				sendText = 'olha o viadinho'
		} else {
			
			if (message == 'sim' || message == 's') {
				sendText = `não`
			}
			if (message == 'não' || message == 'n') {
				sendText = `sim`
			}
			if (message == 'mentira') {
				sendText = 'verdade'
			}
			if (message == 'verdade') {
				sendText = 'mentira'
			}
			if (message == 'kaio é idiota?') {
				sendText = 'com toda certeza'
			}
			if (message == 'good bot') {
				sendText = 'thanks man'
			}
			if (message == 'bad bot') {
				sendText = 'ah, vai se fuder vc tambem'
			}

			if (message == 'ping' || message == 'pong') {
				if (rand(3) == 1) {
					sendText = 'ping'
				} else {
					sendText = 'pong'
				}
			}

			if (message.includes('@help')) {
				sendText = `
				Cool ${username}! Some commands that you can send me:
				1. *@time*`
			}
			if (message == 'rola?') {
				sendText = 'rola!'
			}
			if (message == 'kkk') {

				sendText = '#schutzstaffel'
			}
			if (message == 'meu') {
				sendText = 'meu'
			}
			if (message.includes('aula')) {
				if (message.includes('ricardo') || message.includes('redes') || message.includes('IA') || message.includes('glauco')) {

					sendText = `"aula"`
				}
			}
			if (message.startsWith('para quando') || message.startsWith('pra quando') || message.startsWith('quando')) {
				sendText = 'um dia desses ai trouxa'
			}
			else if (message.startsWith('lab') || message.startsWith('onde') || message.startsWith('qual lab')) {
				sendText = 'lab ' + (Math.floor((Math.random() * 4) + 1)).toString();
			}
			else if(message.startsWith('@bot')){
				console.log('talking directly');
				// var src = 'https://avatars2.githubusercontent.com/u/13456224?s=400&u=f3200da4647ab51263d0e38a1a94b9b4ebcf12b4&v=4',
				// img = document.createElement('img');
				// img.src = src;

				sendText = 'diga';
			}else if (message.includes('deus')) {
				sendText = 'deus nem existe'
			}else if (message.indexOf('@time') > -1) {
				sendText = `*${new Date()}*`
			}else if (message.includes('@joke')) {
				sendText = username;
				// getJoke();

				// sendText = jokeList[rand(jokeList.length - 1)];

			}

		}

		// that's sad, there's not to send back...
		if (!sendText) {
			ignoreLastMsg[title] = untreatedMessage;
			console.log('ignored -> ', title, username, message);
			return goAgain(() => { start(chats, cnt + 1) }, 0.1);
		}

		console.log('PROCESS -> ', title, username, message);

		// select chat and send message
		if (!processLastMsgOnChat) {
			setTimeout(function () {
				selectChat(chat, () => {
					sendMessage(chat, sendText, () => {//.trim()
						goAgain(() => { start(chats, cnt + 1) }, 0.1);
					});
				})
			}, rand(100, 50))//added small delay in fear of being banned, not sure if needed
		} else {
			sendMessage(null, sendText, () => {//.trim()
				goAgain(() => { start(chats, cnt + 1) }, 0.1);
			});
		}
	}
	start();
})()