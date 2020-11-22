var consoleUtility = (function(){

    var isDev = true;
    //BEGIN :: function to log message in console
    var log = function(message){
        if(isDev){
            console.log(message);
        }
    }
    //END :: function to log message in console

    return {
        log : log
    }
})();