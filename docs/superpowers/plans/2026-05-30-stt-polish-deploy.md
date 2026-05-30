# stt-polish-svc Deploy Plan (gated GitOps)

> **For agentic workers:** This is the GitOps + infra finish. It is NOT swarm-able — it pushes to org repos, encrypts real API keys, runs ansible against the live homelab, and exposes a public endpoint. Drive it step-by-step with the human in the loop. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Deploy `stt-polish-svc` to homelab k3s via ArgoCD and expose it at `https://stt.kamilandrzejrybacki.dpdns.org`, with secrets via Sops/age.

**Pattern source:** chart ← `helm/charts/prefect-etl` + secret env ← `helm/charts/omniroute`; argocd app ← `argocd-apps/apps/omniroute.yaml`; secret ← `argocd-apps/secrets/bootstrap/sops-n8n-main.enc.yaml`; Caddy ← `ansible/.../roles/caddy/templates/Caddyfile.j2` (paperless k8s block).

**Fixed values:** org `kamilandrzejrybacki-inc`; namespace `stt-polish`; NodePort `30811` (verified free); image `ghcr.io/kamilandrzejrybacki-inc/stt-polish-svc:latest`; age recipient `age1dpvptjmewtq95mtdmlc85zl58cynjz0t2zwmdty5wakjjzcpcq3sc648sh`.

---

### Task A: Create the GitHub repo + push the service (GATE — perms)

- [ ] **Step 1 (human/gh):** create the org repo:
```bash
gh repo create kamilandrzejrybacki-inc/stt-polish-svc --private --description "Audio->article STT+polish service for Decap CMS"
```
- [ ] **Step 2:** push the service code built by the service plan:
```bash
cd /home/kamil-rybacki/Code/stt-polish-svc
git remote add origin https://github.com/kamilandrzejrybacki-inc/stt-polish-svc.git
git branch -M main && git push -u origin main
```
- [ ] **Step 3:** confirm the GHCR build workflow ran and `ghcr.io/kamilandrzejrybacki-inc/stt-polish-svc:latest` exists (Actions tab → green; or `gh run list`). If the package is private, ensure `ghcr-pull-secret` in the `stt-polish` namespace can read it (Task B Step 4).

---

### Task B: Helm chart

**Files (in `/home/kamil-rybacki/Code/helm`):**
- Create: `charts/stt-polish-svc/Chart.yaml`
- Create: `charts/stt-polish-svc/values.yaml`
- Create: `charts/stt-polish-svc/templates/deployment.yaml`
- Create: `charts/stt-polish-svc/templates/service.yaml`

- [ ] **Step 1: `Chart.yaml`**
```yaml
apiVersion: v2
name: stt-polish-svc
description: Audio -> article (STT + LLM polish) HTTP service for the Decap CMS widget.
type: application
version: 0.1.0
appVersion: "0.1.0"
```

- [ ] **Step 2: `values.yaml`**
```yaml
replicaCount: 1
image:
  repository: ghcr.io/kamilandrzejrybacki-inc/stt-polish-svc
  tag: "latest"
  pullPolicy: Always
existingSecret: stt-polish-secrets
port: 8000
service:
  type: NodePort
  nodePort: 30811
allowedOrigin: "https://kamilrybacki.github.io"
resources:
  requests: { cpu: 100m, memory: 256Mi }
  limits:   { cpu: "1",  memory: 512Mi }
```

- [ ] **Step 3: `templates/deployment.yaml`**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stt-polish-svc
  labels: { app: stt-polish-svc }
spec:
  revisionHistoryLimit: 1
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels: { app: stt-polish-svc }
  template:
    metadata:
      labels: { app: stt-polish-svc }
    spec:
      imagePullSecrets:
        - name: ghcr-pull-secret
      automountServiceAccountToken: false
      containers:
        - name: stt-polish-svc
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - containerPort: {{ .Values.port }}
              protocol: TCP
          env:
            - name: ALLOWED_ORIGIN
              value: {{ .Values.allowedOrigin | quote }}
            - name: ALLOWED_GITHUB_LOGIN
              valueFrom: { secretKeyRef: { name: {{ .Values.existingSecret }}, key: ALLOWED_GITHUB_LOGIN } }
            - name: OPENAI_API_KEY
              valueFrom: { secretKeyRef: { name: {{ .Values.existingSecret }}, key: OPENAI_API_KEY, optional: true } }
            - name: ANTHROPIC_API_KEY
              valueFrom: { secretKeyRef: { name: {{ .Values.existingSecret }}, key: ANTHROPIC_API_KEY, optional: true } }
            - name: ELEVENLABS_API_KEY
              valueFrom: { secretKeyRef: { name: {{ .Values.existingSecret }}, key: ELEVENLABS_API_KEY, optional: true } }
            - name: STT_PROVIDER_API_SCHEMA
              valueFrom: { secretKeyRef: { name: {{ .Values.existingSecret }}, key: STT_PROVIDER_API_SCHEMA, optional: true } }
            - name: STT_PROVIDER_BASE_URL
              valueFrom: { secretKeyRef: { name: {{ .Values.existingSecret }}, key: STT_PROVIDER_BASE_URL, optional: true } }
            - name: STT_MODEL
              valueFrom: { secretKeyRef: { name: {{ .Values.existingSecret }}, key: STT_MODEL, optional: true } }
            - name: POLISH_PROVIDER_API_SCHEMA
              valueFrom: { secretKeyRef: { name: {{ .Values.existingSecret }}, key: POLISH_PROVIDER_API_SCHEMA, optional: true } }
            - name: POLISH_MODEL
              valueFrom: { secretKeyRef: { name: {{ .Values.existingSecret }}, key: POLISH_MODEL, optional: true } }
          securityContext:
            runAsNonRoot: true
            runAsUser: 1000
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
            seccompProfile: { type: RuntimeDefault }
            capabilities: { drop: ["ALL"] }
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          livenessProbe:
            httpGet: { path: /healthz, port: {{ .Values.port }} }
            initialDelaySeconds: 15
            periodSeconds: 30
            failureThreshold: 5
            timeoutSeconds: 5
          readinessProbe:
            httpGet: { path: /readyz, port: {{ .Values.port }} }
            initialDelaySeconds: 10
            periodSeconds: 30
            failureThreshold: 3
            timeoutSeconds: 5
          volumeMounts:
            - { name: tmp, mountPath: /tmp }
      volumes:
        - name: tmp
          emptyDir: {}
```
Note: `/readyz` returns 503 until a provider key is present — fine once the secret syncs.

- [ ] **Step 4: `templates/service.yaml`**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: stt-polish-svc
  labels: { app: stt-polish-svc }
spec:
  type: {{ .Values.service.type }}
  selector: { app: stt-polish-svc }
  ports:
    - name: http
      port: {{ .Values.port }}
      targetPort: {{ .Values.port }}
      nodePort: {{ .Values.service.nodePort }}
      protocol: TCP
```

- [ ] **Step 5: lint + commit + push**
```bash
cd /home/kamil-rybacki/Code/helm
helm lint charts/stt-polish-svc
helm template charts/stt-polish-svc >/dev/null   # renders clean
git add charts/stt-polish-svc && git commit -q -m "feat: stt-polish-svc chart" && git push
```
- [ ] **Step 6:** ensure `ghcr-pull-secret` exists in the `stt-polish` namespace (created with the namespace). If absent after sync, copy it from a working namespace (e.g. `omniroute`):
```bash
kubectl get secret ghcr-pull-secret -n omniroute -o yaml | sed 's/namespace: omniroute/namespace: stt-polish/' | kubectl apply -n stt-polish -f -
```

---

### Task C: ArgoCD Application

**Files (in `/home/kamil-rybacki/Code/argocd-apps`):**
- Create: `apps/stt-polish-svc.yaml`

- [ ] **Step 1:**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: stt-polish-svc
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/kamilandrzejrybacki-inc/helm.git
    targetRevision: main
    path: charts/stt-polish-svc
  destination:
    server: https://kubernetes.default.svc
    namespace: stt-polish
  syncPolicy:
    automated: { prune: true, selfHeal: true }
    syncOptions: [ CreateNamespace=true ]
```
- [ ] **Step 2: commit + push** (the `argocd-apps` root app auto-discovers `apps/*.yaml`):
```bash
cd /home/kamil-rybacki/Code/argocd-apps
git add apps/stt-polish-svc.yaml && git commit -q -m "feat: stt-polish-svc argocd app" && git push
```

---

### Task D: Sops secret (GATE — real API keys)

**Files (in `/home/kamil-rybacki/Code/argocd-apps`):**
- Create: `secrets/bootstrap/sops-stt-polish-secrets.enc.yaml`

- [ ] **Step 1 (human provides real keys):** write the plaintext secret to a tmp file. Minimum for the default openai/openai backends: `OPENAI_API_KEY` + `ALLOWED_GITHUB_LOGIN`. Add others only if using those schemas.
```bash
cat > /tmp/stt-polish-secrets.yaml <<'EOF'
apiVersion: isindir.github.com/v1alpha3
kind: SopsSecret
metadata:
  name: stt-polish-secrets
  namespace: stt-polish
spec:
  secretTemplates:
    - name: stt-polish-secrets
      stringData:
        ALLOWED_GITHUB_LOGIN: kamilrybacki
        OPENAI_API_KEY: "REPLACE_WITH_REAL_OPENAI_PLATFORM_KEY"
        # ANTHROPIC_API_KEY: "..."   # only if POLISH_PROVIDER_API_SCHEMA=anthropic
        # POLISH_PROVIDER_API_SCHEMA: anthropic
EOF
```
- [ ] **Step 2: encrypt with sops/age and place in bootstrap**
```bash
cd /home/kamil-rybacki/Code/argocd-apps
export SOPS_AGE_RECIPIENTS=age1dpvptjmewtq95mtdmlc85zl58cynjz0t2zwmdty5wakjjzcpcq3sc648sh
sops --encrypt --encrypted-regex '^(data|stringData)$' /tmp/stt-polish-secrets.yaml \
  > secrets/bootstrap/sops-stt-polish-secrets.enc.yaml
shred -u /tmp/stt-polish-secrets.yaml    # remove plaintext
```
- [ ] **Step 3: verify it's encrypted (no plaintext key), commit + push**
```bash
grep -q 'ENC\[' secrets/bootstrap/sops-stt-polish-secrets.enc.yaml && echo "encrypted OK"
git add secrets/bootstrap/sops-stt-polish-secrets.enc.yaml
git commit -q -m "feat: stt-polish-svc sops secret" && git push
```
The `bootstrap-secrets` app applies it; the sops operator decrypts → `Secret/stt-polish-secrets` in `stt-polish`. **Never kubectl-patch it (reverted by GitOps).**

---

### Task E: Caddy route (ansible)

**Files (in `/home/kamil-rybacki/Code/ansible/security/secure-homelab-access`):**
- Modify: `group_vars/all.yml`
- Modify: `roles/caddy/templates/Caddyfile.j2`

- [ ] **Step 1: add vars** to `group_vars/all.yml` (near the other `subdomain_*`):
```yaml
subdomain_stt: "stt"
stt_nodeport: 30811
```
- [ ] **Step 2: add the Caddy block** to `roles/caddy/templates/Caddyfile.j2` (model on the paperless k8s block; NO `import authelia` — the service does its own GitHub-token auth):
```jinja2
# stt-polish-svc (audio -> article; k8s on lw-c1). Auth handled by the service
# (GitHub token), so no authelia import here.
{{ _scheme }}{{ subdomain_stt }}.{{ domain }} {
	import rate_limit
	import proxy_headers
{% if cloudflare_api_token | default('') and not cf_tunnel_name | default('') %}
	import cf_tls
{% endif %}
	reverse_proxy http://{{ k8s_node_ip }}:{{ stt_nodeport | default(30811) }}
}
```
- [ ] **Step 3: deploy Caddy** (wildcard `*.{{ domain }}` tunnel already routes the new subdomain — no DNS/cloudflared change needed):
```bash
cd /home/kamil-rybacki/Code/ansible
ansible-playbook -i inventory/hosts.ini security/secure-homelab-access/setup.yml --tags caddy
```
- [ ] **Step 4: commit ansible change**
```bash
git add security/secure-homelab-access/group_vars/all.yml security/secure-homelab-access/roles/caddy/templates/Caddyfile.j2
git commit -q -m "feat: expose stt.kamilandrzejrybacki.dpdns.org via Caddy"
git push
```

---

### Task F: Verify (the checks that matter)

- [ ] **Step 1: ArgoCD synced + pod healthy**
```bash
kubectl -n stt-polish get pods            # Running, READY 1/1
kubectl -n stt-polish get secret stt-polish-secrets   # exists (sops-decrypted)
```
- [ ] **Step 2: in-cluster health**
```bash
kubectl -n stt-polish port-forward svc/stt-polish-svc 8000:8000 &
curl -fsS localhost:8000/healthz   # {"status":"ok"}
curl -s -o /dev/null -w '%{http_code}\n' localhost:8000/readyz   # 200 once the key synced
kill %1
```
- [ ] **Step 3: public reachability**
```bash
curl -fsS https://stt.kamilandrzejrybacki.dpdns.org/healthz   # {"status":"ok"}
```
- [ ] **Step 4 (CRITICAL — protects your API credits): the endpoint rejects a non-allowlisted token.**
```bash
# No token -> 401
curl -s -o /dev/null -w '%{http_code}\n' -X POST \
  https://stt.kamilandrzejrybacki.dpdns.org/transcribe \
  -F 'audio=@/dev/null;filename=a.mp3;type=audio/mpeg'        # expect 401
# Bogus token -> 403 (GitHub /user rejects it, or login != allowlist)
curl -s -o /dev/null -w '%{http_code}\n' -X POST \
  -H 'Authorization: Bearer ghp_not_a_real_token' \
  https://stt.kamilandrzejrybacki.dpdns.org/transcribe \
  -F 'audio=@/dev/null;filename=a.mp3;type=audio/mpeg'        # expect 403
```
Both MUST be 401/403. If either reaches the providers, STOP — the auth gate is broken.
- [ ] **Step 5:** run the widget manual smoke test (Decap widget plan, Task 4) end-to-end.

---

## Self-Review notes
- Sops/age (not Vault), org `kamilandrzejrybacki-inc`, namespace `stt-polish`, NodePort 30811, wildcard Caddy tunnel — all confirmed during investigation. ✓
- Secret keys (`ALLOWED_GITHUB_LOGIN`, `OPENAI_API_KEY`, optional provider config) match the env names the service reads (`backends._env` prefixes) and the deployment `secretKeyRef` keys. ✓
- Gates clearly marked: repo creation (perms), real API keys (Task D), ansible run against live homelab (Task E), and the Step-4 auth rejection check before trusting the public endpoint.
- Caddy gotcha respected: route lives in the Jinja template only (no blockinfile).
