## Purpose

This is yet another collaboration software.

## Instruction

1. Git clone this repository
2. Run "npm install firebase-tools -g" to install firebase tools. 
3. Run "npm install" once to get necessary node modules.
4. Run "npm install" once in the functions directory as well.
5. Open the firebase console (from https://firebase.google.com) and add a project
6. From the dashboard of this project, add an app and choose "web" (</>).
7. From the setting of this app, choose "Config" (in Firebase SDK snippet)
8. Copy the config file, and paste into src/config.js file.  
9. Replace the word "skelton-us" in .firebaserc file with your Firebase project name.
10. Open the firebase console, and create a Cloud Firestore (make it "secure" for now). 

## Memo

Enable IAM (https://console.cloud.google.com/apis/library/iam.googleapis.com?project=???)
https://stackoverflow.com/questions/56616399/firebase-admin-auth-createcustomtoken-letting-the-admin-sdk-discover-a-servic

## Available Scripts

In the project directory, you can run:

### `npm run use_default'

Use "e-groups" project

### `npm run use_jp'

Use "e-group-jp" project

### `npm run use_staging'

Use "e-groups-staging" project

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

### `firebase deploy`

Deploys the app to the Firebase cloud. You need to run "npm run build" before the deployment.

### Firestore Rule test

Install firestore emulator

```
firebase setup:emulators:firestore
```

Run firestore emulator

```
firebase serve --only firestore
```

Run firestore test

```
npm run mocha
```



## build es6 to js

```
npm run babel
```


