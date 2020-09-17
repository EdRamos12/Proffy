# 🔀 API Routes

### Routes prefix: ``/api/v2/``
### Example: ``http://localhost:3333/api/v2/profile``

## 🔑 Authentication

- ``GET`` /verify/: Verification method for the front-end, to stay the user logged in when visiting other pages.

- ``GET`` /logout/: Makes user's browser authentication cookie empty.

- ``POST`` /register/: Creates a new user from name, email and password, and sets default profile picture, as well with setting profile with null values.
	- Body
		```json
		{
			"name": "Hello World",
			"email": "valid@email",
			"password": "********"
		}
		```

- ``GET`` /confirmation/:token/: Makes user able to log in after validating their e-mail.

- ``POST`` /authenticate/: Sets user's cookie if successfully log in.
	- Body
		```json
		{
			"email": "valid@email",
			"password": "********"
		}
		```

- ``POST`` /forgot_password/: If e-mail is registered on the database, it will send an e-mail with a temporary token, so the user can change their password.

	- Body
		```json
		{
			"email": "valid@email"
		}
		```

- ``POST`` /reset_password/: User will send a valid token (from their e-mail) and a new password to log in (password can't be the same with the current one).

	- Body
		```json
		{
			"token": "valid token",
			"password": "********"
		}
		```


## 😀 Users

- ``PUT`` /profile/: User updates their info with the addition of image upload, for profile pictures. 
	- Body (multipart/form-data): 
		- whatsapp: phone number
		- bio: text
		- name: text
		- avatar: attached image (jpeg|jpg|png|gif|jfif)

- ``GET`` /profile/:id/ : Gets information from certain user from the tables `users` and `profile`.

- ``DELETE`` /user/delete/: Deletes user information from database.
	- Body
		```json
		{
			"password": "********"
		}
		```

## 📚 Classes

- ``PUT`` /classes/:class_id/: User can edit own classes, with multiple class schedules (recommended up to 7).

	- Body
		```json
		// Class id in query params
		{
			"subject": "Math", // Valid subject so front-end can search it
			"cost": 50,
			"schedule": [
				{
					"week_day": 0, // 0 to 6 (monday to saturday)
					"from": "0:00",
					"to": "23:59"
				}
			]
		}
		```

- ``DELETE`` /classes/:class_id/: User can delete own classes.

- ``GET`` /total_classes/: Returns total classes made from users.

- ``GET`` /classes/ (with no search for query params): List most recent classes with a pagination system.

	- Query:
		- page: number (if page is not passed, default value is passed as 1)

- ``GET`` /classes/ (with search for query params): List most recent classes with a pagination system.

	- Query:
		- page: number (if page is not passed, default value is passed as 1)
		- subject: text
		- time: time ("00:00")
		- week_day: number (from 0 'til 6)

- ``POST`` /classes/: Creates classes from user info, with multiple schedules.

	- Body
		```json
		{
			"subject": "Math", // Valid subject so front-end can search it
			"cost": 50,
			"schedule": [
				{
					"week_day": 0, // 0 to 6 (monday to saturday)
					"from": "0:00",
					"to": "23:59"
				}
			]
		}
		```

## 🔗 Connections

- ``GET`` /connections/: Get total connections made on the app.

- ``POST`` /connections/: Creates connections, entering a user_id from the teacher.

	- Body
		```json
		{
			"user_id": 1
		}
		```