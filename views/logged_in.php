<br>
<!-- if you need user information, just put them into the $_SESSION variable and output them here -->
<p>Vítejte <b><?php echo $_SESSION['user_name']; ?></b>. Nyní jste přihlášeni.</p>
<br><br>
<!-- because people were asking: "index.php?logout" is just my simplified form of "index.php?logout=true" -->
<a href="login_page.php?logout">Odhlásit se</a>
