NODE_MODULES_BIN := ./node_modules/.bin
NPM := npm
NODE := ./node.sh
TSC := $(NODE_MODULES_BIN)/tsc
TSLINT := $(NODE_MODULES_BIN)/tslint
NODEMON := $(NODE) $(NODE_MODULES_BIN)/nodemon
NODEMON_FLAGS := -e $(NODE) --inspect=9229
DOCKER_COMPOSE := docker-compose

SERVER_SRCS := $(wildcard server/*.ts) $(wildcard server/*/*.ts)
SERVER_OUTS := $(subst server/,dist/,$(SERVER_SRCS:.ts=.js))

.PHONY: all clean install install-prod build-server watch-server build build-docker

all: build

# Removes all files generated by the build (except node_modules)
clean:
	rm -rf dist

# Installs all dependencies
install: package.json
	$(NPM) install

# Installs only production dependencies
install-prod:
	$(NPM) install --production

# Target to install node_modules if depended upon by other targets
node_modules: package.json
	[ -e node_modules ] || $(NPM) install

# Builds the server code (using typescript)
build-server: $(addsuffix .js,$(SERVER_OUTS))

$(SERVER_OUTS:.js=%js): node_modules server/tsconfig.json $(SERVER_SRCS)
	$(TSC) --project server

watch-server: node_modules
	$(TSC) --project server --watch

start: $(SERVER_OUTS) node_modules
	$(NODE) .

start-watch:
	make watch-server &
	$(NODEMON) $(NODEMON_FLAGS) .

lint: $(SERVER_SRCS) node_modules
	$(TSLINT) --project server --format verbose

lint-fix: $(SERVER_SRCS) node_modules
	$(TSLINT) --project server --format verbose --fix

# Builds the entire app (excluding docker containers)
build: build-server

# Builds a production docker container
build-docker: build
	$(DOCKER_COMPOSE) build

# Starts a production docker container (listens on port 8080)
start-docker: build
	$(DOCKER_COMPOSE) up web

# Starts a docker container for development
# This listens for http on port 8080, and listens for node debug on
# port 9229 (--inspect protocol)
# This also starts the Typescript compiler (tsc) and watches all typescript
# files for changes. When the files are changed, they will be compiled and
# then the server will restart.
start-docker-dev: node_modules
	make watch-server &
	$(DOCKER_COMPOSE) -f docker-compose.dev.yml up web
