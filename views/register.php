<?php
    // show potential errors / feedback (from registration object)
    if (isset($registration)) {
        if ($registration->errors) {
            foreach ($registration->errors as $error) {
                echo "<p>" . $error . "</p>";
            }
        }
        if ($registration->messages) {
            foreach ($registration->messages as $message) {
                echo "<p>" . $message . "</p>";
            }
        }
    }
?>
<br>
<!-- register form -->
<form method="post" action="register.php" name="registerform">

    <!-- the user name input field uses a HTML5 pattern check -->
    <label for="login_input_username">Uživatelské jméno (pouze alfanumerické znaky):</label><br>
    <input id="login_input_username" class="login_input" type="text" pattern="[a-zA-Z0-9]{2,64}" name="user_name" required /><br><br>

    <!-- the email input field uses a HTML5 email type check -->
    <label for="login_input_email">E-mail:</label><br>
    <input id="login_input_email" class="login_input" type="email" name="user_email" required /><br><br>

    <label for="login_input_password_new">Heslo (min. 6 znaků):</label><br>
    <input id="login_input_password_new" class="login_input" type="password" name="user_password_new" pattern=".{6,}" required autocomplete="off" /><br><br>

    <label for="login_input_password_repeat">Heslo znovu:</label><br>
    <input id="login_input_password_repeat" class="login_input" type="password" name="user_password_repeat" pattern=".{6,}" required autocomplete="off" /><br><br>
    <input type="submit"  name="register" value="Zaregistrovat" />

</form>
<br>
<!-- backlink -->
<a href="login_page.php">Zpět na přihlašovací stránku</a>
