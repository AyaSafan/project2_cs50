const channel_temp = Handlebars.compile(document.querySelector('#result').innerHTML);
const template_btn = Handlebars.compile("<div class=\"container-fluid message light\"><button class=\"hide\">X</button><h6>{{ user }}</h6><p>{{ message }}</p><span class=\"time-left\">{{ time }}</span> </div>" );

const template = Handlebars.compile("<div class=\"container-fluid message\"><h6>{{ user }}</h6><p>{{ message }}</p><span class=\"time-left\">{{ time }}</span> </div>" );
// Renders contents of new page in main view.
function load_page() {
    const last_channel= localStorage.getItem("last_channel");
    document.querySelector('#feed').innerHTML = ""; 
    document.getElementById("form_msg").style.display = "block";
    document.querySelector('#channel_label').innerHTML = last_channel; 

    
    const request = new XMLHttpRequest();
    const data = new FormData();
    data.append('last_channel', last_channel);
   
        
        request.open('POST', '/get_messages');
        // Send request
        request.send(data);
        request.onload = () => {
            const list = JSON.parse(request.response);
        
           for (count in list){
                const msg=list[count];
                const sender= localStorage.getItem("user");
                if (sender == msg.user ){
                    const content = template_btn({'channel': msg.channel , 'message': msg.message , 'user': msg.user , 'time': msg.time});
                    document.querySelector('#feed').innerHTML += content;
                }
               else{
                   const content = template({'channel': msg.channel , 'message': msg.message , 'user': msg.user , 'time': msg.time});
                    document.querySelector('#feed').innerHTML += content;                   
               }
            }
            
        };
    
}

function manage_msg(){
    
    //choose channel
    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = () => {
            localStorage.setItem("last_channel",link.dataset.page)
            load_page();
            return false;
        };
    });
    
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    
     // connect to emit message
    socket.on('connect', () => {
    document.querySelector('#new-message').onsubmit = () => {
        
        const message = document.querySelector('#message_box').value;
        const time =  new Date().toLocaleString();
        const user = localStorage.getItem("user");
        const channel = localStorage.getItem("last_channel");
        socket.emit('emit message', {'channel': channel , 'message': message , 'user': user , 'time': time});
       
        // Clear input field
        document.querySelector('#message_box').value = '';
        
        // Disable send message without input
    document.querySelector('#send').disabled = true;
    document.querySelector('#message_box').onkeyup = () => {
    if (document.querySelector('#message_box').value.length > 0)
    document.querySelector('#send').disabled = false;
    else
    document.querySelector('#send').disabled = true;
    };
        
          return false; 

        };
    });    
    // When a new message is announced, add to all the users on channel
    socket.on('announce message', msg => {
            const last_channel= localStorage.getItem("last_channel");
            const sender= localStorage.getItem("user");
            if (last_channel == msg.channel){
            if (sender == msg.user ){
                    const content = template_btn({'channel': msg.channel , 'message': msg.message , 'user': msg.user , 'time': msg.time});
                    document.querySelector('#feed').innerHTML += content;
                }
               else{
                   const content = template({'channel': msg.channel , 'message': msg.message , 'user': msg.user , 'time': msg.time});
                    document.querySelector('#feed').innerHTML += content;                   
               } 
            }
        });
    
    // connect to delete message
    socket.on('connect', () => {
   // If hide button is clicked, delete the post.
            document.addEventListener('click', event => {
                const element = event.target;
                if (element.className === 'hide') {
                    const user= localStorage.getItem("user");
                    const channel= localStorage.getItem("last_channel");
                    const message = element.parentElement.querySelector("p").innerHTML;
                    const time = element.parentElement.querySelector("span").innerHTML;
                    
                    socket.emit('emit delete', {'channel': channel , 'message': message , 'user': user , 'time': time} ); 
                     
                }
            });
     
      });
    // When a message is deleted, delete to the all users on channel
    socket.on('announce delete', data => {
            const channel = data.channel;
            const message = data.message;
            const user = data.user;
            const time = data.time;
            const last_channel= localStorage.getItem("last_channel");
             if (last_channel == channel){
                document.querySelectorAll('.container-fluid.message ').forEach(function(msg) {
                    if(time == msg.querySelector("span").innerHTML && message == msg.querySelector("p").innerHTML && user == msg.querySelector("h6").innerHTML ){
                      msg.style.animationPlayState = 'running'; 
                      msg.addEventListener('animationend', () =>  {
                      msg.remove(); 
                          });
                    }

                });
            }
         
    });
}

document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById("form_msg").style.display = "none";
    
    //load last_channel
    const last_channel= localStorage.getItem("last_channel");
    if (last_channel != null){
        load_page();
    }
    
     // Disable create channel without input
    document.querySelector('#submit').disabled = true;
    document.querySelector('#channel').onkeyup = () => {
    if (document.querySelector('#channel').value.length > 0)
    document.querySelector('#submit').disabled = false;
    else
    document.querySelector('#submit').disabled = true;
    };
    
    // Disable send message without input
    document.querySelector('#send').disabled = true;
    document.querySelector('#message_box').onkeyup = () => {
    if (document.querySelector('#message_box').value.length > 0)
    document.querySelector('#send').disabled = false;
    else
    document.querySelector('#send').disabled = true;
    };
    
    // loging out
    document.querySelector('#logout').onsubmit = () => {
        localStorage.clear();
        window.location.href = '/logout' 
        return false;
        
        
    };
    
    
    
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);   
   
    // connect to emit channel
    socket.on('connect', () => {

    document.querySelector('#new-channel').onsubmit = () => {
        
        const channel = document.querySelector('#channel').value;
       /* const channel_creator= localStorage.getItem("user");
        socket.emit('emit channel', {'channel': channel, 'channel_creator':channel_creator});*/
           
        const request = new XMLHttpRequest();
        // Add data to send with request
        const data = new FormData();
        data.append('channel', channel);
        
        request.open('POST', '/new_channel');
        // Send request
        request.send(data);
            
        request.onload = () => {
            const data = JSON.parse(request.responseText);
            if (data.success) {
            socket.emit('emit channel', {'channel': channel});       
            }
            else{alert("Channel already exists. Choose a new name.");}
             
            }
        // Clear input field
        document.querySelector('#channel').value = '';
        
          return false; 

        };
    });    
    // When a new channel is announced, add to the nav
    socket.on('announce channel', data => {
            const content = channel_temp({'value': data.channel});
            document.querySelector('#channels').innerHTML += content; 
            document.querySelectorAll('.nav-link').forEach(link => {
            link.onclick = () => {
                localStorage.setItem("last_channel",link.dataset.page)
                load_page();                
                return false;
        };
    });
        
    });
  
    manage_msg();

});