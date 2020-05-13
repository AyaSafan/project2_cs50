document.addEventListener('DOMContentLoaded', () => {
    // Disable submit without input
    document.querySelector('#submit').disabled = true;    
    document.querySelectorAll('.form-control').forEach(input => {
            input.onkeyup = () => {
                var validate = true;
                document.querySelectorAll('.form-control').forEach(input => {            
                if (input.value.length == 0) validate = false;
            });
                if(validate){
            document.querySelector('#submit').disabled = false; 
                }else{
                 document.querySelector('#submit').disabled = true;   
                }
    }
    });
    
    
    


    document.querySelector('#new-user').onsubmit = () => {

        const user = document.querySelector('#user').value;
        const pwd = document.querySelector('#pwd').value;

            
        const request = new XMLHttpRequest();
        // Add data to send with request
        const data = new FormData();
        data.append('user', user);
        data.append('pwd', pwd);
        
        request.open('POST', '/loged');
        // Send request
        request.send(data);
            
        request.onload = () => {
            // Extract JSON data from request
            const data = JSON.parse(request.responseText);
            // Update the result div
            if (data.success) {
            
            localStorage.setItem("user", user);
            localStorage.setItem("pwd", pwd);
                
            window.location.href = '/channels'
                
            }
            else {
            document.querySelector('#result').innerHTML = 'Error! New Username already Taken Or Username and Password do not match.';
            
            }
        }
        
        // Disable submit without input
            document.querySelector('#submit').disabled = true;    
            document.querySelectorAll('.form-control').forEach(input => {
                    input.onkeyup = () => {
                        var validate = true;
                        document.querySelectorAll('.form-control').forEach(input => {            
                        if (input.value.length == 0) validate = false;
                    });
                        if(validate){
                    document.querySelector('#submit').disabled = false; 
                        }else{
                         document.querySelector('#submit').disabled = true;   
                        }
            }
            });
        
        
        return false;

        }       
        
});