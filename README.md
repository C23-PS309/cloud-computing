# End-point description
## The endpoint should consist some feature for MD as:

| subfolder | function | description |
|:---|:---:|:---|
| /dashboard/:id | GET | get all detail_id based on user_id |
| /history/:detail_id | GET | get all detail measurment rows based on detail_id |
| /history/gender/:id | POST | post the gender to database refering to user_id and create the detail_id |
| /image/upload/:detail_id | POST | post the image to storage refering to detail_id using multer |
| /image/update/:detail_id-:date | PATCH | updating image if there's a failure before send it to ML, using multer and based on detail_id and the date from image that uploaded before |
|/history/data/:detail_id-:date|PATCH|insert all the left history data (nama_history and link_gambar) based on detail and date from image link |
|/history/data/:detail_id|DELETE|deleting all data history based on detail_id|

-------------------------------------------------------

## The endpoint should consist some feature for ML as:

| subfolder | function | description |
|:---|:---:|:---|
|/image/:detail_id|GET|get the image link based on detail_id|
|/history/data/:detail_id|POST|post the measurement result refering to detail_id|
