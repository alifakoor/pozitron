module.exports = {
	HOST: "localhost",
	PORT: 3307,
	USER: "root",
	PASS: 'M4350666880@z',
	DB: "zitron",
	dialect: "mysql",
	pool: {
		max: 5, // maximum number of connection in pool
		min: 0, // minimum number of connection in pool
		acquire: 15000, // maximum time, in milliseconds, that pool will try to get connection before throwing error
		idle: 10000 //maximum time, in milliseconds, that a connection can be idle before being released
	}
}
