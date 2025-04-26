#!/bin/bash -eux
docker build . -t openai-plooxies:latest
docker run --rm \
	-e OPENAI_API_KEY=$OPENAI_API_KEY \
	-e DAILY_API_KEY=$DAILY_API_KEY \
	-p 8080:8080 \
	openai-plooxies:latest
