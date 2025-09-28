# 🚀 Complete Deployment Checklist

## Step 1: MongoDB Atlas (Database) ✅
- [ ] Sign up at https://cloud.mongodb.com/
- [ ] Create FREE M0 cluster
- [ ] Set up Database Access (username/password)
- [ ] Set Network Access to 0.0.0.0/0
- [ ] Copy connection string

## Step 2: Railway (Backend API) ✅  
- [ ] Sign up at https://railway.app/
- [ ] Deploy from GitHub repo: student-mess-app
- [ ] Add ALL environment variables from RAILWAY_ENV_VARS.txt
- [ ] Replace DB_URI with your MongoDB Atlas connection string
- [ ] Deploy and get Railway URL

## Step 3: GitHub Pages (Frontend) ✅
- [ ] Go to https://github.com/Mohansaina/student-mess-app/settings/pages
- [ ] Set Source to "GitHub Actions"
- [ ] Wait for deployment (check Actions tab)
- [ ] Site will be live at: https://mohansaina.github.io/student-mess-app/

## Step 4: Final Configuration ✅
- [ ] Update FRONTEND_URL in Railway if needed
- [ ] Test the live website
- [ ] Register a new account to test functionality

## 🎯 Expected URLs:
- Frontend: https://mohansaina.github.io/student-mess-app/
- Backend: https://[your-project-name].up.railway.app/
- API Health: https://[your-project-name].up.railway.app/api/health

## 🆘 If Issues:
1. Check Railway logs for backend errors
2. Check GitHub Actions for frontend build errors
3. Verify all environment variables are set correctly
4. Test API endpoint directly in browser