# Code Guardian
This project provides an API that fetches commit data from any public GitHub repository and stores it in a PostgreSQL database. It also integrates SonarQube to analyze the code quality of the repositories being fetched. The backend is built using Node.js with Express, while the commit fetching and repository analysis are handled by Python and SonarQube.


Step to install SonarQube

```bash
docker pull sonarqube
```

```bash
docker run -d --name sonarqube-db -e POSTGRES_USER=sonar -e POSTGRES_PASSWORD=sonar -e POSTGRES_DB=sonarqube postgres:alpine
```

Run SonarQube

```bash
docker run -d --name sonarqube -p 9000:9000 --link sonarqube-db:db -e SONAR_JDBC_URL=jdbc:postgresql://db:5432/sonarqube -e SONAR_JDBC_USERNAME=sonar -e SONAR_JDBC_PASSWORD=sonar sonarqube
```

install sonarqube scanner zip, unzip it to a path, add the location to the path environment variable

to check if the installation was succesful

```bash
sonar-scanner -h
```

to run in node terminal (if not globally, repos directory is compulsory)

```bash
npm install sonarqube-scanner -g
```
