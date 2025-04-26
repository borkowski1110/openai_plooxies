#!/bin/bash -eux
docker build . -t openai-plooxies:latest
docker run --rm \
	-e OPENAI_API_KEY=$OPENAI_API_KEY \
	-e DAILY_API_KEY=$DAILY_API_KEY \
	openai-plooxies:latest \
	python src/plooxagent/api/daily_agent.py
