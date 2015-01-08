TESTS =  $(shell ls -S `find test -type f -name "*.test.js" -print`)
REPORTER = tap
TIMEOUT = 3000
MOCHA_OPTS =
REGISTRY = --registry=http://registry.npm.taobao.org

start:
	@node build.js

run:
	@node build.js
