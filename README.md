# End-point description
## The endpoint should consist some feature for MD as:

| subfolder | function | description |
|:---|:---:|:---|
| /register | POST | Post name, email and password |
| /login | POST | Post email and password |
| /dashboard/:id | GET | Get data about latest measurement from user |
| /history/:id | GET | Get data about all measurement history |
| /history/data/:detail_id | GET | Get detail data from a measurement history |
| /history/:id | POST | Post user data including image via multer get measurement |
| /history/data/:detail_id | PATCH | Update a history name |
| /history/data/:detail_id | DELETE | Delete a history data |
