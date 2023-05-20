CREATE TABLE user (
    user_id VARCHAR(200) NOT NULL,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    password VARCHAR(200) NOT NULL, 
    PRIMARY KEY (user_id)
);

CREATE TABLE userDetail (
    detail_id VARCHAR(20) NOT NULL,
    user_id VARCHAR(20) NOT NULL, 
    nama_history VARCHAR(30) NOT NULL,
    tanggal_pengukuran TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    gender VARCHAR(12) NOT NULL, 
    link_gambar VARCHAR(100) NOT NULL, 
    PRIMARY KEY (detail_id), 
    FOREIGN KEY (user_id)  REFERENCES user(user_id) 
); 

CREATE TABLE userMeasurement(
    detail_id VARCHAR(20) NOT NULL, 
    waist_circumference INT NOT NULL, 
    hip_circumference INT NOT NULL, 
    chest_circumference INT NOT NULL,
    height INT NOT NULL, 
    result VARCHAR(5) NOT NULL, 
    PRIMARY KEY (detail_id), 
    FOREIGN KEY (detail_id)  REFERENCES userDetail(detail_id) 
);
