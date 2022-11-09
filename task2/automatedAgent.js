var langs =
[['Afrikaans',       ['af-ZA']],
 ['Bahasa Indonesia',['id-ID']],
 ['Bahasa Melayu',   ['ms-MY']],
 ['Català',          ['ca-ES']],
 ['Čeština',         ['cs-CZ']],
 ['Deutsch',         ['de-DE']],
 ['English',         ['en-AU', 'Australia'],
                     ['en-CA', 'Canada'],
                     ['en-IN', 'India'],
                     ['en-NZ', 'New Zealand'],
                     ['en-ZA', 'South Africa'],
                     ['en-GB', 'United Kingdom'],
                     ['en-US', 'United States']],
 ['Español',         ['es-AR', 'Argentina'],
                     ['es-BO', 'Bolivia'],
                     ['es-CL', 'Chile'],
                     ['es-CO', 'Colombia'],
                     ['es-CR', 'Costa Rica'],
                     ['es-EC', 'Ecuador'],
                     ['es-SV', 'El Salvador'],
                     ['es-ES', 'España'],
                     ['es-US', 'Estados Unidos'],
                     ['es-GT', 'Guatemala'],
                     ['es-HN', 'Honduras'],
                     ['es-MX', 'México'],
                     ['es-NI', 'Nicaragua'],
                     ['es-PA', 'Panamá'],
                     ['es-PY', 'Paraguay'],
                     ['es-PE', 'Perú'],
                     ['es-PR', 'Puerto Rico'],
                     ['es-DO', 'República Dominicana'],
                     ['es-UY', 'Uruguay'],
                     ['es-VE', 'Venezuela']],
 ['Euskara',         ['eu-ES']],
 ['Français',        ['fr-FR']],
 ['Galego',          ['gl-ES']],
 ['Hrvatski',        ['hr_HR']],
 ['IsiZulu',         ['zu-ZA']],
 ['Íslenska',        ['is-IS']],
 ['Italiano',        ['it-IT', 'Italia'],
                     ['it-CH', 'Svizzera']],
 ['Magyar',          ['hu-HU']],
 ['Nederlands',      ['nl-NL']],
 ['Norsk bokmål',    ['nb-NO']],
 ['Polski',          ['pl-PL']],
 ['Português',       ['pt-BR', 'Brasil'],
                     ['pt-PT', 'Portugal']],
 ['Română',          ['ro-RO']],
 ['Slovenčina',      ['sk-SK']],
 ['Suomi',           ['fi-FI']],
 ['Svenska',         ['sv-SE']],
 ['Türkçe',          ['tr-TR']],
 ['български',       ['bg-BG']],
 ['Pусский',         ['ru-RU']],
 ['Српски',          ['sr-RS']],
 ['한국어',            ['ko-KR']],
 ['中文',             ['cmn-Hans-CN', '普通话 (中国大陆)'],
                     ['cmn-Hans-HK', '普通话 (香港)'],
                     ['cmn-Hant-TW', '中文 (台灣)'],
                     ['yue-Hant-HK', '粵語 (香港)']],
 ['日本語',           ['ja-JP']],
 ['Lingua latīna',   ['la']]];

for (var i = 0; i < langs.length; i++) {
  select_language.options[i] = new Option(langs[i][0], i);
}
select_language.selectedIndex = 6;
updateCountry();
select_dialect.selectedIndex = 6;
showInfo('info_start');

function updateCountry() {
  for (var i = select_dialect.options.length - 1; i >= 0; i--) {
    select_dialect.remove(i);
  }
  var list = langs[select_language.selectedIndex];
  for (var i = 1; i < list.length; i++) {
    select_dialect.options.add(new Option(list[i][1], list[i][0]));
  }
  select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}

var create_email = false;
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  start_button.style.display = 'inline-block';
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
    showInfo('info_speak_now');
    start_img.src = 'mic-animate.gif';
  };

  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      start_img.src = 'mic.gif';
      showInfo('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      start_img.src = 'mic.gif';
      showInfo('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        showInfo('info_blocked');
      } else {
        showInfo('info_denied');
      }
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    start_img.src = 'mic.gif';
    if (!final_transcript) {
      showInfo('info_start');
      return;
    }
    showInfo('');
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(document.getElementById('final_span'));
      window.getSelection().addRange(range);
    }
    if (create_email) {
      create_email = false;
      createEmail();
    }
  };

  recognition.onresult = function(event) {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
        checkResponse(final_transcript);
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    final_transcript = capitalize(final_transcript);
    final_span.innerHTML = linebreak(final_transcript);
    interim_span.innerHTML = linebreak(interim_transcript);
    if (final_transcript || interim_transcript) {
      showButtons('inline-block');
    }
  };
}

function upgrade() {
  start_button.style.visibility = 'hidden';
  showInfo('info_upgrade');
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

function createEmail() {
  var n = final_transcript.indexOf('\n');
  if (n < 0 || n >= 80) {
    n = 40 + final_transcript.substring(40).indexOf(' ');
  }
  var subject = encodeURI(final_transcript.substring(0, n));
  var body = encodeURI(final_transcript.substring(n + 1));
  window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
}

// function copyButton() {
//   if (recognizing) {
//     recognizing = false;
//     recognition.stop();
//   }
//   copy_button.style.display = 'none';
//   copy_info.style.display = 'inline-block';
//   showInfo('');
// }

// function emailButton() {
//   if (recognizing) {
//     create_email = true;
//     recognizing = false;
//     recognition.stop();
//   } else {
//     createEmail();
//   }
//   email_button.style.display = 'none';
//   email_info.style.display = 'inline-block';
//   showInfo('');
// }

function startButton(event) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.lang = select_dialect.value;
  recognition.start();
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  start_img.src = 'mic-slash.gif';
  showInfo('info_allow');
  showButtons('none');
  start_timestamp = event.timeStamp;
}

function showInfo(s) {
  if (s) {
    for (var child = info.firstChild; child; child = child.nextSibling) {
      if (child.style) {
        child.style.display = child.id == s ? 'inline' : 'none';
      }
    }
    info.style.visibility = 'visible';
  } else {
    info.style.visibility = 'hidden';
  }
}

var current_style;
function showButtons(style) {
  if (style == current_style) {
    return;
  }
  current_style = style;
  // copy_button.style.display = style;
  // email_button.style.display = style;
  // copy_info.style.display = 'none';
  // email_info.style.display = 'none';
}

var status = [];
var wrongNum = 0;
var previousStatus = [];

const greeting = "Hi this is automated agent from CSC212. How can I help you today? Do you want to view your account information, look for technical support or know more about our product information?"
const accountInformation = "Do you want check your balance or pay your balance?"
const checkBalance = "I'll help you check your balance. Up to October 2022, your total balance is negative 200 dollars. Do you want to pay your balance? please answer yes or no."
const askCardNum = "Sure. I'll help you make the payment. Please provide the digits of the credit card"
const askExpirationDate = "What's the expiration date of your card?"
const askSecurityNum = "What's the security number of your card?"
const paymentSuccess = "payment success. Thanks for calling."
const technicalSupport = "please briefly describe your problem"
const didYouTryTurnOff = "have you tried turning it off? please answer yes or no"
const technicalAgent = "We will connect you to the next available technical agent"
const suggestTurnOff = "Try turning it off and on. Did it work? please answer yes or no"
const happyToHelp = "I’m glad I could help. Have a good day"
const availableProducts = "We currently have iphone 14, ipad mini and macbook pro. Which one you would purchase?"
const repeatPlease = "Sorry I didn't get you. Could you please repeat again?"
const connectToAgent = "It seems like I’m unable to help you, I will connect you to the next available agent, please wait."

function getResponseFromStatus(){
  if (wrongNum == 3) {
    return connectToAgent;
  }else{
    if (status.length == 0) {
      return greeting;
    } else if (status == [1]) {
      return accountInformation;
    } else if (status == [1,1]){
      return checkBalance;
    } else if (status == [1,2]) {
      return askCardNum;
    } else if (status == [1,2,1]){
      return askExpirationDate;
    } else if (status == [1,2,1,1]){
      return askSecurityNum;
    } else if (status ==[1,2,1,1,1]){
      return paymentSuccess;
    } else if(status == [2]){
      return technicalSupport;
    } else if(status == [2,1]){
      return didYouTryTurnOff;
    } else if(status == [2,1,1]){
      return technicalAgent;
    } else if(status == [2,1,2]){
      return suggestTurnOff;
    } else if(status == [2,1,2,1]){
      return happyToHelp;
    } else if(status == [3]){
      return availableProducts;
    } else if(status == [4]){
      wrongNum += 1;
      return repeatPlease;
    }
  }
}

function checkResponse(response){
  response = response.toLowerCase();
  if (status.length == 0) {
    checkAtGreetingStage(response);
  } else if (status == [1]) {
    checkAtAccountInfoStage(response);
  } else if (status == [1,1]) {
    checkAtCheckBalance(response);
  } else if (status == [1,2]){
    checkCardNum(response);
  } else if(status == [1,2,1]){
    checkExpirationDate(response);
  } else if(status == [1,2,1,1]){
    checkSecurityNum(response);
  } else if (status == [2]){
    status = [2, 1];
  } else if(status == [2,1]){
    checkWhetherTurnOff(response);
  } else if(status == [2,1,2]){
    responseTurnOffResult(response);
  } else if(status == [3]){
    checkProductName(response);
  } else if(status == [4]){
    status = previousStatus;
    checkResponse(response);
  }
}

function voicemessage() {
  var text = getResponseFromStatus();
  var msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.8;
  msg.pitch = 1.3;
  window.speechSynthesis.speak(msg);
}

function checkAtGreetingStage(response){
  if (response.includes("account")) {
    status = [1];
  } else if (response.includes("technical") || response.includes("support")) {
    status = [2];
  } else if (response.includes("product")) {
    status = [3];
  } else{
    previousStatus = status;
    status = [4];
  }
}

function checkAtAccountInfoStage(response) {
  if (response.includes("check")) {
    status = [1,1];
  }else if (response.includes("pay")) {
    status = [1,2];
  }else{
    previousStatus = status;
    status = [4];
  }
}

function checkAtCheckBalance(response) {
  if (response.includes("yes")) {
    status = [1,2];
  }else if (response.includes("no")) {
    status = [2,1,2,1];
  }else{
    previousStatus = status;
    status = [4];
  }
}

function checkCardNum(response){
  // after check if valid card number
  status = [1,2,1];
}

function checkExpirationDate(response){
  status = [1,2,1,1];
}

function checkSecurityNum(response){
  status = [1,2,1,1,1];
}

function checkWhetherTurnOff(response){
  if (response.includes("yes")) {
    status = [2,1,1];
  }else if (response.includes("no")) {
    status = [2,1,2]; 
  }else{
    previousStatus = status;
    status = [4];
  }
}

function responseTurnOffResult(response){
  if (response.includes("yes")) {
    status = [2,1,2,1];
  }else if (response.includes("no")) {
    status = [2,1,1]; 
  }else{
    previousStatus = status;
    status = [4];
  }
}

function checkProductName(response){
  console.log(response);
  if (response.includes("iphone") || response.includes("ipad") || response.includes("macbook")) {
    status = [1,2]
  }else{
    status = [3]
  }
}