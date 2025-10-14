---
layout: article.njk
title: "Containerized Integration"
date: 2023-12-06
category: CI
description: "How to easily spin up a mock environment for integration testing"
---

## I'm afraid I can't let you do that, Dev 🤖

There is a certain kind of dread that comes with the acknowledgment that You can't always cross the gap
between Your local pythonic incantations and the desired environment, where those enchantments are to be
set to be roaming free, setting and getting those `os.environ`s. "Being part of the Machine" is not only
a figurative thing that a societal contrarian might say, but - in terms of software development - it is
also a very literal thing. You design cogs of various sizes and shapes, that are to be put in the overarching
conglomerate of multi-lingual, multi-paradigm and multi-purpose mechanisms.

What is actually contrary to popular belief, the net is not about connecting people and/or machines at the upper echelons
of the enterprise-ish hierarchy. It's more often than not a convoluted web of rules and blockades,
that separate this connectivity from one environment to another - be it different teams of developers,
different services (often at their different stages) or in general the intra/internet gatekeeping conundrum.

This is, of course, done with good intent, so that the developers don't accidentally
set the production database to be the target of their unit tests, pushing around
valuable data about somebody's World of Warcraft character on the private server
run by a group of "real chill dudes", where You've recently managed to down
that one annoying boss with Your guild, **and** got the highest roll on [Crystalheart Pulse-Staff] 😌,
to the dismay of Your fellow restoration druids 🌲.

Those are the real casualties that would have been made without that one reasonable sysadmin
at Your software house, who's set up e.g. that VPN so all GitLab CI workers can't reach the K8s cluster,
where the actual services may be running. Additionally, he will also (rightfully) hunt You down
if You try to copy any credentials to those temporary nodes, to "cleverly" bypass those security measures.

I would like to stress here that I am not talking about any continuous deployment (CD) pipelines,
where the code is automatically deployed to the production environment and it mutates its state, in real time.
CD naturally assumes successful CI (continuous integration) and by integration, it means that the code
is already up to the security and coding standards of Your organization. In other words, it is **safe**.
The CI part is what I am really focusing on in this article, so - I am not GitOps hater or something like that 😅.

The thing is, some tasks require a bit more than just simple code linting tests and they must
touch upon another important aspect of integration with the existing environment - communication,
more often than not, in the form of authorized API requests
or, in general, calls made through specified protocols.

So we arrive at the "Schrödinger's code problem" i.e. the code that must talk with our services, but really
can't talk with our services at the same time. But what is to be tested here? Language i.e. form.
In other words, we only care if our code can communicate **at all** with the service,
not really if it retrieves a specific portion of the data. The rest can be mocked.
So basically, if You can't play with the real tools - You can at least play with the toys,
and that is what mock test environments are for. An approximation.

In this article, I will try to show You how I spin up those sandboxes for my integration tests,
using GitLab CI Services and Docker, with additional tips for unit testing Python code via containerized
`pytest` nested runners.

**IMPORTANT NOTE**: This article assumes that there is a GitLab CI runner available in Your organization,
that is capable of Docker-in-Docker (DinD) builds. I've included some links to tutorials on how to set up
such a runner, but I will not go into details on how to do that, as it is not the main focus of this article.
That is why I am including the 99% of code snippets here in this article and no repo to go with it,
because cloning it and running will simply not do. Maybe in the future, I will make an article about
setting such workers on Your home/private cluster, but that's a topic for another time 😛 (SOON™).

## Alive in a box - dead to the outside world 🐈‍⬛📦

To figure out how to create our pseudo-environment, we must first understand what goes on under the hood
when our job is being executed on the GitLab CI runner. In very short terms, the runner
pulls the Docker image specified in the `.gitlab-ci.yml` for a given job and spins up a container,
which has access to the project's files and the GitLab CI variables. The container then executes
the commands specified in the `script` section of the job. The container is then destroyed,
along with all the changes made to the filesystem, unless we explicitly tell the runner to persist
some files between the jobs as either artifacts or cache.

Take a look at the following example:

{% raw %}

```yaml
# .gitlab-ci.yml (excerpt) – simple job showing host vs nested container
stages: [test]

integration-sandbox:
  stage: test
  image: docker:25.0.0-cli
  services:
    - name: docker:dind
      command: ["--mtu=1460"]
  variables:
    DOCKER_HOST: tcp://docker:2375
    DOCKER_TLS_CERTDIR: "" # disable TLS for demo
  script:
    - echo "[host] docker version:" && docker version --format '{{ .Server.Version }}'
    - |
      echo "[host] starting nested container..."
      docker run --rm alpine:3.19 sh -c 'echo "[nested] hello from inside nested container"'
```

{% endraw %}

A quick side note - if You see me using the `\` operator in the code snippets, it is just a way to
break the line in the `.gitlab-ci.yml` file (or other manifests/shell scripts), so that it is more readable.
I like to separate the flags and arguments of the commands into separate lines, with indentations added to, for example,
flag values to see which keyword belongs to which flag. It is not necessary, but I find it
more readable than a single line with a bunch of flags and arguments, separated by spaces.

So, coming back to CI, we expect to be greeted by two messages, one from the host and one from the nested container.
However, when we run this job, we will only see the first message executed at the main container level,
but the second one will not be executed at all:

![Nested container behavior](/assets/images/nested_container_behavior.png)
*Figure 1. Parent vs nested container output (missing nested run due to daemon access failure).*

The main reason is the way in which the parent container attempts to communicate with the Docker daemon
that is located on the host. The original Docker daemon is listening on a Unix socket, which is located at
`/var/run/docker.sock` on the host machine.

The parent container, however, does not have access to this socket,
because it is not mounted to the container's filesystem. This is what line number 21 in the log printout above
is really about. The nested container tries to look for a way to communicate with its parent's daemon,
so it checks if the Docker socket is mounted into its filesystem.

If not (which is the case here), it then tries to communicate with an external Docker **service**,
specified under the `DOCKER_HOST` environment variable. **By default**, this variable (for GitLab runners)
is set to `tcp://docker:2375`, which translates to URL of: `http://docker:2375`.
And this is the reason why the nested container prints out the error message about the failed `TCP` lookup.

We can confirm this behavior by listing the sockets mounted to the nested container under `/var/run` path
and setting the `DOCKER_HOST` envvar to some bogus value like `tcp://docker-service:2375`:

```bash
# Inspect mounts and simulate failed daemon access inside a nested container
docker run --rm alpine:3.19 sh -c '
  echo "Mounts under /var/run:"; ls -l /var/run || true; \
  echo "DOCKER_HOST=$DOCKER_HOST"; \
  echo "Trying docker ps (expected failure if socket/service absent):"; \
  docker ps 2>&1 || true
'
```

Here we basically expect the overall effect to be the same as previously, but this time we will see
that there is basically nothing mounted under `/var/run` path and the `TCP` lookup will be performed for
the `docker-service` host, which will fail, as expected.

![Nested container no docker socket](/assets/images/nested_container_no_socket.png)
*Figure 2. No `/var/run/docker.sock` mount inside nested container; TCP lookup fails.*

And this is what we get, the `/var/run` directory is empty (red box in Pic. 2)
and the `TCP` lookup fails (yellow underline in Pic. 2). So now we have to decide what is really open to us
as a solution to open up the communication between the nested container and the host's Docker daemon.
The first thing that comes to mind is to simply delegate the creation of any new Docker containers
to an autonomous **Docker service**, that will be set up by the runner and reachable from the nested container.
This can be achieved by using the [`services` keyword in the `.gitlab-ci.yml` file].
Those services are basically Docker containers spawned beside the CI container itself, which
are accessible from the tests container due to the network being shared
between all of the sub-hosts present on the runner.

**BUT** there is a catch. Using Docker-in-Docker (DinD) approach requires an additional configuration of the runner itself,
that can be then used by the CI jobs as a shared runner by specifying the `tags` keyword in the `.gitlab-ci.yml` file.
In most cases, kind of runners are already present as a CI/CD tool for software development teams,
because, for example, building Docker images is a very common task among them, so we can already capitalize on that.
However, if there is no such runner available, we can always create one ourselves. There is a [plethora] [of] [tutorials]
on how to do that, so I will **assume that this kind of resource is already present in our organization**.

### Whale nesting 🐳🐳

So the game plan now is like so:

1. We will tell GitLab CI to use the runner with the predefined tags set up on it by the administrator.
2. We create a Docker service that will be used by the nested container to communicate with the host's Docker daemon.
We will name it `my-docker-service` and we will use the `docker:dind` image for that purpose.
3. We will set the `DOCKER_HOST` environment variable to `tcp://my-docker-service:2375` in the CI container.
4. We will run the command in the nested container and hope for the best. 🤞

One caveat is that if we want to use the 2375 port, we need to disable TLS verification, which can be done

<!-- Truncated: remainder of original MDX content would continue verbatim here if provided -->

by setting the `DOCKER_TLS_CERTDIR` variable to an empty string. We can also opt into per‑build network isolation (`FF_NETWORK_PER_BUILD=true`) so that the DinD service and our job container share a dedicated network namespace.

Putting those tweaks together, a more feature‑rich job might look like this:

```yaml
docker-env-playground:
  stage: test
  image: docker:25.0.0-cli
  services:
    - docker:dind
  variables:
    DOCKER_HOST: tcp://docker:2375
    DOCKER_TLS_CERTDIR: ""
    FF_NETWORK_PER_BUILD: "true"
  script:
    - docker info --format 'Storage: {{ .Driver }} | Cgroup: {{ .CgroupDriver }}'
    - docker run --rm alpine:3.19 sh -c 'echo nested $(uname -m)'
```

### Redis ping‑pong example

To demonstrate container→service communication we can launch a Redis service and from a nested container send a `PING`:

```yaml
redis-ping:
  stage: test
  image: docker:25.0.0-cli
  services:
    - name: redis:7-alpine
      alias: some-random-cache
    - docker:dind
  variables:
    DOCKER_HOST: tcp://docker:2375
    DOCKER_TLS_CERTDIR: ""
  script:
    - docker run --rm --network=host redis:7-alpine redis-cli -h some-random-cache PING
```

Expected output includes `PONG`, proving DNS name resolution for the service.

## Snake-in-a-box 🐍📦 (integration test scenario)

Let’s extend the idea: run pytest against a temporary Redis. File layout for a minimal example:

```text
repo/
├── connector.py
├── tests/
│   └── test_connector.py
├── requirements.txt
└── .env            # REDIS_HOST, REDIS_PORT, REDIS_DB
```

`connector.py` (very small wrapper):

```python
import os, redis

class RedisConnector:
    def __init__(self):
        self._client = redis.StrictRedis(
            host=os.getenv('REDIS_HOST','localhost'),
            port=int(os.getenv('REDIS_PORT','6379')),
            db=int(os.getenv('REDIS_DB','0')),
            decode_responses=True,
        )

    def ping(self) -> bool:
        return self._client.ping()
```

`tests/test_connector.py`:

```python
from connector import RedisConnector

def test_ping():
    assert RedisConnector().ping() is True
```

`requirements.txt`:

```text
redis==5.0.1
pytest==7.4.4
```

Corresponding CI job:

```yaml
integration-tests:
  stage: test
  image: python:3.10
  services:
    - name: redis:7-alpine
      alias: some-random-cache
  variables:
    REDIS_HOST: some-random-cache
    REDIS_PORT: "6379"
    REDIS_DB: "0"
  before_script:
    - pip install -r requirements.txt
  script:
    - pytest -q
```

This pattern keeps each service ephemeral: once the job finishes, the data disappears.

## Compose Yourself 📿

When orchestration logic (multiple services, healthchecks, environment fan‑out) gets verbose, introduce **Docker Compose** and run it inside the CI job. Example `docker-compose.yml` snippet tailored for the Redis + pytest case:

```yaml
version: "3.9"
services:
  redis:
    image: redis:7-alpine
    container_name: redis
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
  pytest-runner:
    image: python:3.10
    container_name: pytest-runner
    depends_on:
      redis:
        condition: service_healthy
    working_dir: /workspace
    volumes:
      - ./:/workspace:ro
    environment:
      REDIS_HOST: redis
      REDIS_PORT: "6379"
      REDIS_DB: "0"
    command: bash -lc "pip install -r requirements.txt && pytest -q"
```

CI job invoking compose:

```yaml
compose-integration:
  stage: test
  image: docker:25.0.0-cli
  services:
    - docker:dind
  variables:
    DOCKER_HOST: tcp://docker:2375
    DOCKER_TLS_CERTDIR: ""
  script:
    - apk add --no-cache py3-pip
    - pip install docker-compose
    - docker-compose up --abort-on-container-exit --exit-code-from pytest-runner
```

### Decomposing the composition ✂️

Key ideas:

1. `depends_on.condition: service_healthy` ensures tests wait for Redis.
2. Healthcheck uses native `redis-cli ping` for a fast readiness probe.
3. Read-only project mount prevents accidental writes from tests (`:ro`).
4. Environment variables are centralized in the compose file instead of repeated `--env` flags.
5. Single exit status is bubbled up via `--exit-code-from`.


### Hardening & scaling tips

- Add a second network and put only necessary services on the public one.
- Use secrets / config support (Compose v3+) instead of plain env for sensitive data.
- Enable test parallelism by parameterizing project name: `docker-compose -p ci_$CI_JOB_ID`.
- Cache Python deps: mount a writable volume for pip cache if build time dominates.
- For heavier stacks (e.g. Postgres + Redis + API), split into multiple compose profiles and activate subsets with `--profile`.

### When NOT to use DinD

If build performance or layer caching matters, prefer the GitLab **Kaniko** or **BuildKit** executors instead of DinD, then run integration containers referencing built images by tag/digest.

---

That wraps the full journey: ad‑hoc single container, service resolution, nested container strategy, direct CI orchestration, and finally Compose‑driven ephemeral integration environments.

**Takeaways**: Keep environments minimal, lean on healthchecks, centralize config, and graduate to Compose only when repetition starts to appear.

Happy container spelunking! 🐳

[Crystalheart Pulse-Staff]: https://www.wowhead.com/item=45886/crystalheart-pulse-staff
[`services` keyword in the `.gitlab-ci.yml` file]: https://docs.gitlab.com/ee/ci/services/
[plethora]: https://docs.gitlab.com/runner/
[of]: https://docs.gitlab.com/runner/install/
[tutorials]: https://docs.gitlab.com/runner/configuration/advanced-configuration.html
