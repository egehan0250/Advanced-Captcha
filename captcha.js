const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const captchaLength = 6;

function generateCaptchaText() {
  let captchaText = '';
  for (let i = 0; i < captchaLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    captchaText += characters.charAt(randomIndex);
  }
  return captchaText;
}


function createCaptchaImage(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');


  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  ctx.font = '40px sans-serif';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);


  ctx.strokeStyle = 'black';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, Math.random() * canvas.height);
    ctx.lineTo(canvas.width, Math.random() * canvas.height);
    ctx.stroke();
  }

  return canvas.toDataURL();
}

function updateCaptcha(status) {
  console.log(status);
if(status == 'standart'){
  const captchaText = generateCaptchaText();
  const captchaImage = createCaptchaImage(captchaText);

  const captchaImageElement = document.getElementById('captcha-image');
  captchaImageElement.innerHTML = `<img src="${captchaImage}">`;
  localStorage.setItem('captcha', captchaText);
} else if(status == 'stop'){
  const captchaText = "don't"
  const captchaImage = createCaptchaImage(captchaText);

  const captchaImageElement = document.getElementById('captcha-image');
  captchaImageElement.innerHTML = `<img src="${captchaImage}">`;
}

}

function checkCaptcha() {
    const userInput = document.getElementById('userInput').value;
    const captchaText = localStorage.getItem('captcha');
    if (userInput === captchaText) {
      captchaVerification(true);
    } else {
      captchaVerification(false);
    }
}


function ıncorrectCaptcha(status) {

  if(status == 'stop'){
    console.log('stop')
    document.getElementById('userInput').disabled = true;
    document.getElementById('userInput').value = '';
    var verifyButton = document.getElementById('verifyButton');
    verifyButton.disabled = true;
    verifyButton.style.backgroundColor = 'gray';
    verifyButton.style.cursor = 'not-allowed';
    verifyButton.classList.remove('buttonActive');
  
    updateCaptcha('stop');
  
    let countDownDate;
    if(localStorage.getItem('countDownDate') == null){
      countDownDate = new Date().getTime() + 300000;
      localStorage.setItem('countDownDate', countDownDate);
    } else {
      countDownDate = localStorage.getItem('countDownDate');
    }
    
    var x = setInterval(function() {
      var now = new Date().getTime();
      var distance = countDownDate - now;
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor(distance % (1000 * 60) / 1000);
  
      verificationStatus.textContent = `5 defa yanlış girdiniz. ${minutes} dakika ${seconds} saniye sonra tekrar deneyin.`;
      verificationStatus.style.color = 'red';
  
      if (distance < 0) {
        clearInterval(x);
        localStorage.removeItem('countDownDate');
        localStorage.removeItem('IncorrectTry');
        verificationStatus.textContent = 'Tekrar deneyin.';
        verificationStatus.style.color = 'yellow';
        document.getElementById('userInput').disabled = false;
        document.getElementById('userInput').value = '';
        verifyButton.disabled = false;
        verifyButton.style.backgroundColor = '#4CAF50';
        verifyButton.style.cursor = 'pointer';
        verifyButton.classList.add('buttonActive');
        updateCaptcha('standart'); 
      }
    }, 1000);
  } else if(status == 'stopVerification'){
    console.log('stopVerification')
    document.getElementById('userInput').disabled = true;
    document.getElementById('userInput').value = '';
    var verifyButton = document.getElementById('verifyButton');
    verifyButton.disabled = true;
    verifyButton.style.backgroundColor = 'gray';
    verifyButton.style.cursor = 'not-allowed';
    verifyButton.classList.remove('buttonActive');
  
    updateCaptcha('stop');
  
    let countDownDate;
    if(localStorage.getItem('countDownDate') == null){
      countDownDate = new Date().getTime() + 300000;
      localStorage.setItem('countDownDate', countDownDate);
    } else {
      countDownDate = localStorage.getItem('countDownDate');
    }
    
    var x = setInterval(function() {
      var now = new Date().getTime();
      var distance = countDownDate - now;
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor(distance % (1000 * 60) / 1000);
  
      verificationStatus.textContent = `Captcha Yanlış! 5 defa yanlış girdiniz. ${minutes} dakika ${seconds} saniye sonra tekrar deneyin.`;
      verificationStatus.style.color = 'red';
  
      if (distance < 0) {
        clearInterval(x);
        localStorage.removeItem('countDownDate');
        localStorage.removeItem('IncorrectTry');
        verificationStatus.textContent = 'Tekrar deneyin.';
        verificationStatus.style.color = 'yellow';
        document.getElementById('userInput').disabled = false;
        document.getElementById('userInput').value = '';
        verifyButton.disabled = false;
        verifyButton.style.backgroundColor = '#4CAF50';
        verifyButton.style.cursor = 'pointer';
        verifyButton.classList.add('buttonActive');
        updateCaptcha('standart'); 
      }
    }, 1000);
  }
}


function captchaVerification(status) {
  if(status == true){
    localStorage.removeItem('captcha');
    localStorage.removeItem('IncorrectTry');
    localStorage.removeItem('countDownDate');
    document.getElementById('userInput').disabled = true;
    document.getElementById('userInput').value = '';
    var verifyButton = document.getElementById('verifyButton');
    verifyButton.disabled = true;
    verifyButton.style.backgroundColor = 'gray';
    verifyButton.style.cursor = 'not-allowed';
    verifyButton.classList.remove('buttonActive');
    updateCaptcha('stop');
    verificationStatus.textContent = 'CAPTCHA doğru!';
    verificationStatus.style.color = 'green';
  } else if(status == false){
    var IncorrectTry = parseInt(localStorage.getItem('IncorrectTry'));
    if (isNaN(IncorrectTry)) {
      IncorrectTry = 0;
    }
    IncorrectTry++;
    localStorage.setItem('IncorrectTry', IncorrectTry);
    if(IncorrectTry >= 5){
      ıncorrectCaptcha('stopVerification');
  
    } else {
      verificationStatus.textContent = 'CAPTCHA yanlış! Tekrar deneyin.';
      verificationStatus.style.color = 'red';
      updateCaptcha('standart'); 
    }
  
  
  }
  }

var IncorrectTry = parseInt(localStorage.getItem('IncorrectTry'));
if (isNaN(IncorrectTry)) {
  IncorrectTry = 0;
}
if(IncorrectTry >= 5){
  ıncorrectCaptcha('stop');
} else {
  var verifyButton = document.getElementById('verifyButton');
  verifyButton.disabled = false;
  verifyButton.classList.add('buttonActive');
  updateCaptcha('standart'); 
}
