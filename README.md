# Hueten
Will be public at 1.0.0.  
## About
Hueten is a cross-platform (hopefully) desktop app to control your Hue smart lights.  
## Installation
First, install all packages:
```bash
$ npm install
```
Then, start the app.  
```bash
$ npm start
```
## Loading in debug
Set the log level you want (info, debug, warn, error, fatal) as an env variable with the name of LOG_LEVEL.  
On powershell:
```powershell
$env:LOG_LEVEL = "debug"
npm start
```
On posix-compliant shells:
```bash
LOG_LEVEL=debug npm start
```