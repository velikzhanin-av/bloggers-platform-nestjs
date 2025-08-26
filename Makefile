run_db:
		docker start mongo-blog-nest
		docker start postgres-blog-nest
		docker ps

stop_db:
		docker stop mongo-blog-nest
		docker stop postgres-blog-nest
		docker ps