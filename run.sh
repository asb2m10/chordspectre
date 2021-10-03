#!/bin/bash

docker run -p 1234:1234 --rm -v $(pwd):/app -w /app -it --entrypoint "/bin/bash" node
