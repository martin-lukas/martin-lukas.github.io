<?php
    // show potential errors / feedback (from login object)
    if (isset($login)) {
        if ($login->errors) {
            foreach ($login->errors as $error) {
                echo "<p>" . $error . "</p>";
            }
        }
        if ($login->messages) {
            foreach ($login->messages as $message) {
                echo "<p>" . $message . "</p>";
            }
        }
    }
?>
<br>
<!-- login form box -->
<form method="post" action="login_page.php" name="loginform">

    <label for="login_input_username">Uživatelské jméno:</label><br>
    <input id="login_input_username" class="login_input" type="text" name="user_name" required /><br><br>

    <label for="login_input_password">Heslo:</label><br>
    <input id="login_input_password" class="login_input" type="password" name="user_password" autocomplete="off" required /><br><br>

    <input type="submit"  name="login" value="Přihlásit se" />

</form>
<br>
<a href="register.php">Zaregistruj se</a>
