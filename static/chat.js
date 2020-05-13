// Set starting value of counter to 0
if (!localStorage.getItem('counter'))
    localStorage.setItem('counter', 0);

document.addEventListener('DOMContentLoaded', () => {
    // Disable submit without input
    document.querySelector('#submit').disabled = true;
    document.querySelector('#comment').onkeyup = () => {
        if (document.querySelector('#comment').value.length > 0)
        document.querySelector('#submit').disabled = false;
        else
        document.querySelector('#submit').disabled = true;
    };
    
    //local storage counter
        let counter = localStorage.getItem('counter');
        if (counter != 0) {        
        // Add new item to task list
        for (i = 1; i <= counter; i++) {
            // Create new item for list
        const li = document.createElement('li');
        li.innerHTML = localStorage.getItem(i);
        document.querySelector('#chat').append(li);
        }}

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    // When connected, configure buttons
    socket.on('connect', () => {
    document.querySelector('#new-send').onsubmit = () => {

        
        let new_message = document.querySelector('#comment').value;
        
        socket.emit('submit message', {'new_message': new_message});
        
        // Clear input field
        document.querySelector('#comment').value = '';
        // Disable submit without input
        document.querySelector('#submit').disabled = true;        
        document.querySelector('#comment').onkeyup = () => {
        if (document.querySelector('#comment').value.length > 0)
        document.querySelector('#submit').disabled = false;
        else
        document.querySelector('#submit').disabled = true;
        };

        // Stop form from submitting
        return false;
    };
    
    });
        // When a new_message is announced, add to the unordered list
    socket.on('announce new_message', data => { 
        
        //local storage counter    
        let counter = localStorage.getItem('counter');
        counter++; 
        //local storage new counter & message
        localStorage.setItem('counter', counter);
        localStorage.setItem(counter, data.new_message);
        
        const li = document.createElement('li');
        li.innerHTML = data.new_message;
        document.querySelector('#chat').append(li);
        
        
    });
});