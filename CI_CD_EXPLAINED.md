# CI/CD Pipeline Explained

## 🎯 What is CI/CD?

**CI** = Continuous Integration (automatically test code when pushed)  
**CD** = Continuous Deployment (automatically deploy if tests pass)

**Think of it like this:** Every time you push code to GitHub, GitHub automatically:
1. Runs your tests
2. Checks if everything compiles
3. Builds your app
4. (Optionally) Deploys it if everything passes

---

## 📄 File Structure

The file `.github/workflows/ci-cd.yml` is a **GitHub Actions workflow file**.

- **`.github/`** = GitHub-specific folder
- **`workflows/`** = Where GitHub Actions workflows live
- **`ci-cd.yml`** = YAML configuration file (YAML = Yet Another Markup Language, like JSON but easier to read)

---

## 🔍 Line-by-Line Breakdown

### **Line 1: `name: CI/CD Pipeline`**
- This is the name of your workflow
- Shows up in GitHub's Actions tab
- Just a label for humans

---

### **Lines 3-7: `on:` (When to Run)**

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

**Translation:**  
"Run this workflow when:"
- Someone pushes code to the `main` branch
- Someone creates a pull request targeting the `main` branch

**Why?**  
- Catching errors early before they reach production
- Testing code before merging

---

### **Line 9: `jobs:` (What to Do)**

This section lists all the automated tasks to run.

---

## 🛠️ Job 1: TypeScript Type Check

### **Lines 11-13:**
```yaml
typecheck:
  name: TypeScript Type Check
  runs-on: ubuntu-latest
```

**`runs-on: ubuntu-latest`** ← **This is the line you asked about!**

**What it means:**
- **`runs-on`** = "Run this job on a computer with this operating system"
- **`ubuntu-latest`** = "Use the latest version of Ubuntu Linux"

**Why Ubuntu?**
- Ubuntu is free, widely used, and well-supported on GitHub Actions
- GitHub provides free "virtual machines" (computers in the cloud) running Ubuntu
- Other options: `windows-latest`, `macos-latest`, but Ubuntu is the fastest/cheapest

**What happens:**
- GitHub spins up a fresh Ubuntu Linux computer
- This computer is clean (no files, fresh install)
- Your code runs on this computer
- After the job finishes, GitHub destroys this computer
- This happens **every time** you push code

**Think of it like:** You get a brand new computer every time, test your code on it, then it gets deleted.

---

### **Lines 15-35: Steps (What to Run)**

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4
```

**Translation:** "Download my code from GitHub to this Ubuntu computer"

**`actions/checkout@v4`** = A pre-built GitHub Action that downloads your repository

```yaml
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '20'
      cache: 'npm'
```

**Translation:** "Install Node.js version 20 and remember my npm packages (cache = save time)"

```yaml
  - name: Install dependencies
    run: npm ci
```

**Translation:** "Run `npm ci` command" (install packages)

**`npm ci`** = Clean install (removes node_modules and installs fresh, faster and more reliable than `npm install`)

```yaml
  - name: Type check root
    run: npm run typecheck
```

**Translation:** "Run the typecheck script from package.json" (checks if TypeScript compiles without errors)

---

## 🧪 Job 2: Backend Tests

### **Lines 38-41:**
```yaml
test-backend:
  name: Backend Tests
  runs-on: ubuntu-latest  ← Same line again!
  needs: typecheck
```

**Key difference:** `needs: typecheck`

**Translation:** "Don't start this job until `typecheck` job finishes successfully"

**Why?**  
- If TypeScript has errors, no point running tests
- Saves time and resources

---

### **Lines 59-65: Environment Variables**
```yaml
  - name: Run backend tests
    run: cd backend && npm test -- --coverage
    env:
      NODE_ENV: test
      MONGODB_URI: mongodb://localhost:27017/royaldansity_test
```

**`env:`** = Environment variables for this step

**Why?**  
- Tests need different settings than production
- Test database name (`royaldansity_test`) won't affect real data
- `NODE_ENV: test` tells your app it's in test mode

---

## 🎨 Job 3: Frontend Tests

### **Lines 67-87:**
Same concept as backend tests, but for React/frontend code.

---

## 🏗️ Job 4: Build Check

### **Lines 90-93:**
```yaml
build:
  name: Build Check
  runs-on: ubuntu-latest
  needs: [test-backend, test-frontend]
```

**Key:** `needs: [test-backend, test-frontend]`

**Translation:** "Wait for BOTH backend AND frontend tests to pass"

**Why build after tests?**  
- If tests fail, no need to build
- Building takes time, so only do it if everything works

---

## 📊 Visual Flow

```
Push Code to GitHub
       ↓
   TypeScript Check (Job 1)
       ↓
   ┌───────┴───────┐
   ↓               ↓
Backend Tests   Frontend Tests (Jobs 2 & 3 run in parallel)
   ↓               ↓
   └───────┬───────┘
           ↓
      Build Check (Job 4)
```

---

## 🎓 Key Concepts Summary

### **1. Virtual Machines (VMs)**
- Each job runs on a fresh Ubuntu computer in the cloud
- These computers are temporary (destroyed after job finishes)
- You get free minutes on GitHub Actions (2000 minutes/month for free accounts)

### **2. Jobs vs Steps**
- **Job** = Big task (e.g., "Test Backend")
- **Step** = Small action within a job (e.g., "Install dependencies")
- Jobs can run in parallel or sequentially (using `needs`)

### **3. Actions (`uses:`)**
- Pre-built scripts by GitHub/community
- `actions/checkout@v4` = Download code
- `actions/setup-node@v4` = Install Node.js
- Thousands available at [github.com/marketplace/actions](https://github.com/marketplace/actions)

### **4. Commands (`run:`)**
- These are shell commands
- Same as typing in terminal
- `cd backend && npm ci` = "go to backend folder, then run npm ci"

---

## 🚨 What Happens if Something Fails?

1. Job fails → Red X appears in GitHub
2. You get an email (if enabled)
3. Other jobs that `need` this job won't run
4. You can click on the failed job to see error logs
5. Fix the error, push again, and it runs again

---

## ✅ Current Status

**Your pipeline currently:**
- ✅ Checks TypeScript
- ⚠️ Tries to run tests (but you haven't written tests yet - that's OK!)
- ✅ Checks if code builds

**What you need to do:**
1. Write some tests (optional for now)
2. OR comment out the test jobs until you're ready

---

## 🔧 Quick Fixes

**If tests don't exist yet:**
You can either:
1. Create simple test files
2. Or comment out test jobs temporarily:

```yaml
  # test-backend:
  #   ... (comment entire job)
```

---

## 🎯 Next Steps

1. **Push this file** → GitHub will try to run it
2. **Go to GitHub** → Your repo → "Actions" tab → See it running!
3. **Watch it** → See each job run, see logs, see if it passes/fails

---

**Remember:** This is all **automatic** and **free** (within limits). Every push to `main` will trigger this pipeline!



