build:
	sudo docker build -t football-api .

run:
	sudo docker run --name football-api -p 8080:3000 -d football-api

remove:
	sudo docker rm -f football-api

rebuild:
	sudo docker build -t football-api .
	sudo docker rm -f football-api
	sudo docker run --name football-api -p 8080:3000 -d football-api
