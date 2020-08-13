var timerVal = 90;
var refreshId = setInterval(() => {
    console.log(timerVal--);
    if (timerVal == 80) {
        clearInterval(refreshId);
        console.log("done");
    }
}, 1000);
