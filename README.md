# Security-Assessment

Step-1)Execute the command "docker-compose up --build"

Step-2)If there are fetch error for npm pakages, then please do the below changes

create a daemon.json file in  "/etc/docker/daemon.json", the add the following
{
  "dns": ["192.168.2.1", "8.8.8.8"] // 192.168.2.1 is value of your dns
}
sudo service docker restart

Step-3)Now run the command again "docker-compose --build"

Step-4) Application can be accessed by browsing https://127.0.0.1/ 

-----------------------------------------------------------------------------------------------------------------------------

Following security controls are implemented :

1. HTTPS
	SSL Certificate added to control unencrypted communication.

2. Security Headers
Cache-control, X-Frame Options, Strict-transport-Security, Content-type, Content-Security-Policy

3. CSRF(Cross Site Security Forgery):
Implemented CSRF on all pages to verify requests

4. Email format Verification at server site.

5. Password Strength Validation: Added Alphanumeric password

6. Password hashed and salt in the database.

7. Added generic error message to avoid username enumeration on login, register and forgot password page.

8. Session cookie changes before and after password to avoid session fixation issue. After logout the session expires and gives an error you are not authorised to view this.

9. Added cookie attributes: httponly, secure and cookie expiration.

10. Added forgot-password and reset password functionality: Password reset link will be shared via email and the time expiration is set.

11. Brute Force implemented.

12. Authorization check is implemented for after login page i.e /home, this page cannot be accessed before login.

