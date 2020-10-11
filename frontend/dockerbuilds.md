###Build dockerfile
```
$ docker build -t pstore.app.frontend .
```

###Docker run with default environment
```
$ docker run -d -p 443:443 --name pstore.app.frontend pstore.app.frontend
```

###Docker container
```
$ docker start/restart/stop container_id
```
