import json, subprocess, time, sys
auth = json.load(open('/Users/matthewdi/Library/Application Support/com.vercel.cli/auth.json'))
tok = auth['token']
proj = json.load(open('.vercel/project.json'))
pid, tid = proj['projectId'], proj['orgId']
sha = sys.argv[1]
url = f"https://api.vercel.com/v6/deployments?teamId={tid}&projectId={pid}&target=production&limit=10"
for i in range(30):
    raw = subprocess.run(['curl','-s','-H',f'Authorization: Bearer {tok}',url],capture_output=True,text=True).stdout
    try:
        d = json.loads(raw, strict=False)
    except Exception as e:
        print(f"attempt {i+1}: parse error {e}", flush=True); time.sleep(10); continue
    row = [x for x in d.get('deployments',[]) if x.get('meta',{}).get('githubCommitSha','')==sha]
    if row:
        x = row[0]
        st = x['state']
        print(f"attempt {i+1}: {st} {x['uid']} {x.get('inspectorUrl','')}", flush=True)
        if st in ('READY','ERROR','CANCELED'):
            sys.exit(0 if st=='READY' else 1)
    else:
        print(f"attempt {i+1}: no row yet", flush=True)
    time.sleep(10)
print("timed out", flush=True)
sys.exit(2)
