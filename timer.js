
async function awaitTimer() {
    console.log("starting");
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("end");
}

awaitTimer();