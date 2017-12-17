<?php
	// checking for minimum PHP version
	if (version_compare(PHP_VERSION, '5.3.7', '<')) {
	    exit("Sorry, Simple PHP Login does not run on a PHP version smaller than 5.3.7 !");
	} else if (version_compare(PHP_VERSION, '5.5.0', '<')) {
	    // if you are using PHP 5.3 or PHP 5.4 you have to include the password_api_compatibility_library.php
	    // (this library adds the PHP 5.5 password hashing functions to older versions of PHP)
	    require_once("libraries/password_compatibility_library.php");
	}

	// include the configs / constants for the database connection
	require_once("config/db.php");

	// load the registration class
	require_once("classes/Registration.php");

	// create the registration object. when this object is created, it will do all registration stuff automatically
	// so this single line handles the entire registration process.
	$registration = new Registration();
?>
<!doctype html>
<html>
    <head>
        <title>Registrace | Vysoká na zkoušku</title>
        <meta charset="utf-8">
        <link rel="stylesheet" type="text/css" href="styles.css">
    </head>
    <body>
        <div id="container">
            <div id="header">
                <?php include("header.php"); ?>
            </div>
            <div id="wrapper">
                <div id="navigation">
                    <?php include("menu.php"); ?>
                </div>
                <div id="content">
                    <?php
                        // show the register view (with the registration form, and messages/errors)
						include("views/register.php");
                    ?>
                    <br><br>
                </div>
            </div>
            <div id="footer">
                <?php include("footer.php"); ?>
            </div>
        </div>
    </body>
</html>




