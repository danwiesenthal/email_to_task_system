# Connect your Email and your Task System
This repo holds a simple Google Script to connect your email and task systems.

For example, OmniFocus, Things, Asana, and Evernote all accept email input.
- You can find more about OmniFocus email input here:  https://support.omnigroup.com/omnifocus-mail-drop/
- Or Evernote email input here:  https://blog.evernote.com/blog/2012/04/20/quick-tip-friday-emailing-into-your-evernote-account/
- Or Asana email input here:  https://asana.com/guide/help/email/email-to-asana

These systems all have you forward email to a specific email address which they then process; this script makes that process easier and bidirectional.

# What does it do?
This script helps you connect your emails to a task system, so that you can quickly triage emails into archive (reference) or your task system for further action, and also easily return to the relevant email from your task system if needed.

This process is designed to work with an "inbox zero" approach, where your email inbox is frequently triaged and maintained close to zero.  (If you aren't already close to zero, you can still use this system, but you'll want to move all the emails currently in your inbox elsewhere, perhaps a folder/label called Old_Inbox, so they aren't affected by this script.)

Once configured, this script will scan your inbox every so often, and find emails that are flagged/starred.  It will then forward them to your task system.  Once it does that, it will unstar the message, mark the thread that it was in (including the message itself) as Important (to help train the ML systems), and archive the thread.  It will also apply a label to the thread, so you can quickly find all emails that have been processed with this script, should you want to.  

If you currently have flagged/starred messages in your inbox and you enable this script, those emails will be processed as tasks: marked important, have a 'Script_Processed' label applied, unstarred/unfledged, and moved to your archive.  If this isn't what you want, you might consider moving your flagged/starred messages elsewhere, unflagging/unstarring them, or applying a label to them and then removing their flag/star.

The email that is sent to your task system will be similar to the original email, but will additionally have a _message:_ link above the text content of the email; this is a "deep" link that is respected across macOS and iOS, and will open Mail.app to the particular message in question. This makes both directions of connection easy: to send emails to your task system, simply star them; to get from your task system back to the relevant email, simply tap the link.

# Instructions
## Preparation
Configuring your service:
- To configure this script to work for you, you simply need to find the email address to which you're supposed to forward your emails.  This comes from OmniFocus, Evernote, Asana, Things, etc.  Keep this handy.
- You also need to create a label (Gmail's version of a 'folder') that will be applied to processed emails. For example, the label Script_Processed/Tasks is a folder of labels called Script_Processed, inside of which is a label called Tasks. If you're happy with that as a default, then go ahead and create a label called Script_Processed, and inside of it create a label called Tasks (do this in the Gmail UI).

## Make a Script
- Follow the instructions here [https://developers.google.com/gmail/api/quickstart/apps-script] to create a Google Script.
- Instead of the default sample script, we'll use the script in this repo.
- Copy the contents of EmailToTaskSystems in this repo, and paste into the Google Script you just created.
- Update the script:
  - Where the script has YOUR_EMAIL_HERE, paste your task system email that you found in the Preparation steps above.
  - If you don't want to use the default Script_Processed/Tasks label, put your desired label in the script right below the email you just pasted.
  
## Turn on Gmail API
- In the Apps Script editor, click Resources > Advanced Google Services
- Locate Gmail API in the list, and click the corresponding toggle, setting it to 'on'
- Click the Google API Console link (or Google Cloud Platform API Something Something link; the text changes sometimes)
- Find the Gmail API (it may be auto suggested, or you may need to list all and then search/find Gmail API)
- Click Enable API (for the Gmail API)
- Return to the Apps Script editor and click OK on the Advanced Google Services dialog

## Run your Script for the first time
- In the Apps Script editor, click Run > main
- You'll likely get a "This app isn't verified" warning
- Click the Advanced link
- Click the Go to EmailToTaskSystems button
- Click the Allow button.  (You're allowing a script in your own Google Script space to access your own Google Gmail data; this verification flow is meant to protect people from security issues when using other people's apps, but you've made your own app/script, and authorized it for your own email.)

## Set a trigger to run regularly
- In the Apps Script editor, click Edit > Current project's triggers
- Click + Add Trigger
- Choose:
    - function: main
    - deployment: head
    - event source: time-driven
    - type of time based trigger: minutes
    - minute interval: every 10 minutes (or more frequently if you like, though this may cause Google to stop running the script for a few hours sometimes for using Gmail too much)
- Click Save
- Now your script will run every 10 minutes up in the cloud.  Yay!

# Usage
- When emails arrive in your inbox, read them and decide whether they require further action.  If they don't, archive them.  If they do, star them.  You're done.  Every time the script runs, those starred emails will disappear from your inbox, and appear in your task system.  Now you're using a task system for your tasks... as it should be.  If you need to get back to the email in question while you're doing a task, just click/tap the View Message in Mail link in the task's "note" field (for OmniFocus; other systems place it elsewhere).  If you want to find all the emails associated with tasks, look in your Script_Processed/Tasks label in your email.  Enjoy!
